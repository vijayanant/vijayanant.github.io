---
title: "The Anatomy of a Block: Implementing Content Addressing in Rust"
seo_title: "Building Akshara: Implementing CIDv1 and DAG-CBOR in Rust"
subtitle: "Beyond the URL: Coding verifiable, content-addressed primitives"
date: 2026-06-15
series: ["Building Akshara"]
series_order: 1
draft: true
description: "How to build Akshara's content-addressed Block in Rust. Enforce canonical CBOR, prevent block-swapping, and solve E2EE deduplication."
tags: ["rust", "serialization", "content-addressing", "cbor", "cryptography", "systems-design"]
categories: ["Software Engineering"]
featured_image: "featured.jpg"
pillar: system
pillar_role: deep_dive
---

{{< figure src="featured.jpg" alt="A translucent geometric block illuminated from within" lazy="false" >}}

In the theoretical explorations of the [**sovereign web series**]({{< ref "/series/exploring-the-sovereign-web" >}}), I mapped out a model for an offline-first, cryptographically secured network. But ideas are cheap. The real challenge starts when I try to translate those ideals into Rust code. This series of posts is my log of building [**Akshara**](https://github.com/vijayanant/akshara/): a sovereign, zero-trust identity and state engine.

In this first post, I will take the theoretical ideas of content addressing, which I talked about in [**The Anatomy of a Permanent Web**]({{< ref "/posts/exploring-the-sovereign-web/content-addressing/" >}}), and show how I built them as a tamper-proof Block primitive in Rust.

When I wrote the theory posts, the main idea seemed elegant: **decouple truth from location**. Instead of asking a server *where* a file lives, ask the network for the data matching a specific hash. Easy, right? But the moment I started writing Rust, the theoretical simplicity dissolved. Making the Rust compiler happy was the least of my worries (who knew?). Standard serialization formats produced different bytes for the same data, basic encryption left me open to block-swapping, and standard random nonces broke deduplication entirely. I had to learn how to wrap raw data in a strict, secure construct: the **Block**.

---

## What is a Block in Akshara?

In Akshara, the **Block** is the atomic unit. It is a cryptographic envelope holding a raw **chunk** of content. Everything (document content, indexes, permissions, and history) is stored as a block.

Under the hood, it's designed as an **encrypted-then-signed envelope**:

* **The Relay (Server) View:** The server only sees the outer envelope, the parent links, the encrypted payload, and the signature. It can verify that the envelope's signature is valid, but it cannot read the content or link the signing key to your real-world identity.
* **The Client View:** The client downloads the envelope, verifies the signature, and decrypts the payload using the shared `GraphKey`.

{{< note type="info" title="Anonymity & Shadow Identities" >}}
To prevent a relay server from tracking a user's activity across different document histories, Akshara doesn't sign blocks with a single global key. Instead, it signs blocks using dynamic, context-isolated [**Shadow Identities**](https://github.com/vijayanant/akshara/blob/master/docs/specs/identity/derivation.md#42-branch-1-executive-credential), which are cryptographic keys derived specifically for each individual document boundary.
{{< /note >}}

Splitting content into these small blocks yields three major wins: identical data can be deduplicated, the client only syncs the blocks that actually change or are requested by the app, and the app doesn't have to read the entire content into memory to access a specific part (a capability enabled by Akshara's [document schema specification](https://github.com/vijayanant/akshara/blob/master/docs/specs/graph-model/schemas.md#3-core-resource-schemas), which I will unpack in a future post).

{{< figure src="system-overview.svg" alt="Akshara System Overview Diagram" caption="The zero-trust topology: raw content is chunked, encrypted, and signed into secure envelopes on the client before being synced to a blind relay server" width="800" >}}

## 1. Addressing the Permanent Web: CIDv1 in Rust

In a content-addressed system, there is no server path. Instead, the system uses a [**Content Identifier (CID)**](https://github.com/vijayanant/akshara/blob/master/docs/specs/representation/identifiers.md#3-physical-implementation-cidv1). Initially, I thought about just slinging around raw `[u8; 32]` arrays or strings for identifiers. In Rust, that's a one-way ticket to debugging hell. You lose all type safety and end up writing the same validation checks in ten different places. I wanted the compiler to do the heavy lifting, so I wrapped the third-party `cid::Cid` type in a custom, type-safe `Address` struct.

I didn’t want to hardcode SHA-256 into the protocol and regret it five years from now, so I went with **CIDv1**. This format packs both the hash digest and the algorithm code together, meaning I can change the hash algorithm down the line without rewriting the rest of the codebase.

In the CIDv1 standard, every address is self-describing. The first few bytes of a CID represent a **Multicodec**, which is a prefix that tells the system *how* to parse the binary payload at the destination (for example, whether the bytes represent raw bytes, JSON, or Protobuf). By using custom codecs, Akshara self-describes its own primitives at the address level. I defined two custom multicodec numbers for the engine:

* `CODEC_AKSHARA_BLOCK` (`0x57`): Identifies an encrypted data block.
* `CODEC_AKSHARA_MANIFEST` (`0x58`): Identifies a signed, public graph snapshot (the entry point of a history).

{{< note type="log" title="Engineer's Log: Preventing Protocol Type Confusion" >}}
Codes `0x57` and `0x58` are custom protocol allocations reserved for Akshara. Originally, I used standard multicodecs (like `0x71` for DAG-CBOR) for both structures, but I quickly realized this left a security loophole: because they shared the same codec, a malicious relay could perform a type-confusion attack by feeding a client an encrypted data block when they were requesting a signed, administrative graph manifest snapshot. Enforcing these distinct custom codecs (`0x57` and `0x58`) at the bit-level ensures the boundaries of the primitives are secure at the protocol edge.
{{< /note >}}

Here is how I implemented this in [`aadhaara/src/base/address.rs`](https://github.com/vijayanant/akshara/blob/master/aadhaara/src/base/address.rs):

```rust
pub const CODEC_AKSHARA_BLOCK: u64 = 0x57;
pub const CODEC_AKSHARA_MANIFEST: u64 = 0x58;

#[derive(Clone, Copy, PartialEq, Eq, Hash, Debug, Serialize, Deserialize)]
#[serde(transparent)]
pub struct Address(Cid);

impl TryFrom<&[u8]> for Address {
    type Error = AksharaError;
    fn try_from(bytes: &[u8]) -> Result<Self, Self::Error> {
        let mut cursor = std::io::Cursor::new(bytes);
        let cid = Cid::read_bytes(&mut cursor)
            .map_err(|_| AksharaError::Integrity(IntegrityError::MalformedId))?;

        // THE FORTRESS RULE: Entire buffer must be consumed to prevent truncation attacks
        if cursor.position() != bytes.len() as u64 {
            return Err(AksharaError::Integrity(IntegrityError::MalformedId));
        }

        // AKSHARA MANDATE: Enforce CIDv1 for algorithm agility
        if cid.version() != cid::Version::V1 {
            return Err(AksharaError::Integrity(IntegrityError::MalformedId));
        }

        Ok(Self(cid))
    }
}
```

{{< note type="log" title="Engineer's Log: The Truncation Pitfall" >}}
I originally wrote a naive `TryFrom` that just read the CID bytes using `Cid::read_bytes` and returned it. But during implementation, I learned that this left a security loophole: if the input buffer had extra trailing bytes (junk or malicious payload), the parser would successfully decode the CID and ignore the rest. This would allow an attacker to append unauthorized data to an envelope. Enforcing `cursor.position() == bytes.len()` ensures the entire byte slice is valid and consumed.
{{< /note >}}

I then defined `BlockId` and `ManifestId` as wrapper types around this `Address` type so that the compiler can guarantee a manifest address is never used where a block address is expected.

```rust
#[derive(Clone, Copy, PartialEq, Eq, Hash, Debug, Serialize, Deserialize)]
pub struct BlockId(Address);

impl BlockId {
    /// Creates a new BlockId from a SHA2-256 digest
    pub fn from_sha256(digest: &[u8]) -> Self {
        let hash = Code::Sha2_256.digest(digest);
        let cid = Cid::new_v1(CODEC_AKSHARA_BLOCK, hash);
        BlockId(Address(cid))
    }
}
```

---

## 2. The Canonical Ritual: Defeating Serialization Malleability

When I first started serializing blocks, I thought standard CBOR or even JSON would be fine. But I soon learned that standard serialization is a minefield for content-addressing. If two systems order keys differently, they produce different hashes for the same logical data. Even worse, binary formats like CBOR can represent the same integer (like `5`) in different byte widths. This malleability is a massive security risk, opening the door to signature forgery and ID-spoofing.

I ended up adopting [**DAG-CBOR**](https://github.com/vijayanant/akshara/blob/master/docs/specs/representation/encoding.md#2-the-standard-dag-cbor) which enforces strict key sorting and minimal integer widths and implement what I call the **Canonical Ritual** in [`aadhaara/src/base/encoding.rs`](https://github.com/vijayanant/akshara/blob/master/aadhaara/src/base/encoding.rs) (a class of serialization malleability issues I wrote about in [**The Ghost Bit Paradox**]({{< ref "/posts/the-ghost-bit-paradox/" >}})):

```rust
/// Performs strict canonical DAG-CBOR serialization.
pub fn to_canonical_bytes<T: Serialize>(value: &T) -> Result<Vec<u8>, AksharaError> {
    serde_ipld_dagcbor::to_vec(value)
        .map_err(|e| AksharaError::InternalError(format!("DAG-CBOR serialization failed: {}", e)))
}

/// Performs strict canonical DAG-CBOR deserialization with bit-identity validation.
pub fn from_canonical_bytes<T: DeserializeOwned + Serialize>(
    bytes: &[u8],
) -> Result<T, AksharaError> {
    let val: T = serde_ipld_dagcbor::from_slice(bytes).map_err(|e| {
        AksharaError::InternalError(format!("DAG-CBOR deserialization failed: {}", e))
    })?;

    // THE CANONICAL RITUAL: Re-encode and compare bits.
    // If the input bytes do not exactly match the canonical re-serialization,
    // the byte stream is rejected as malformed.
    let canonical_bytes = to_canonical_bytes(&val)?;
    if bytes != canonical_bytes {
        return Err(AksharaError::Integrity(
            crate::base::error::IntegrityError::MalformedId
        ));
    }

    Ok(val)
}
```

{{< note type="log" title="Engineer's Log: The Deserialization Trap" >}}
This "re-serialize and check bit-identity" check was a painful lesson. I spent hours debugging failing tests before realizing that if you use conditional Serde attributes like `#[serde(default)]` (or `#[serde(skip_serializing_if = "Option::is_none")]`), the re-serialized bytes will omit fields and fail the identity check.
{{< /note >}}

{{< figure src="canonical-ritual.svg" alt="The Canonical Ritual Flowchart" caption="The flow of bit-identity checking: comparing incoming byte streams with their re-serialized counterparts to reject malleable encodings" width="800" >}}

---

## 3. The Deduplication Ritual: Balancing Secrecy with Efficiency

Local-first syncing relies on deduplication, but cryptography relies on randomness.

Initially, I did the standard thing: I used standard random nonces. But I quickly learned that this broke our sync efficiency: encrypting the same payload twice generated different ciphertexts and CIDs, making server-side deduplication impossible.

To resolve this, I switched to **Deterministic Nonce Derivation**: deriving a static 24-byte nonce by hashing the plaintext with the document graph's symmetric master key (the `GraphKey`) using HMAC-SHA256. Identical plaintext now yields identical ciphertext, enabling clean server-side deduplication.

```rust
// Inside Block implementation in aadhaara/src/graph/block.rs
fn derive_nonce(key: &GraphKey, plaintext: &[u8], ad: &[u8]) -> Result<[u8; 24], AksharaError> {
    let mut hmac = Hmac::<Sha256>::new_from_slice(key.as_bytes())
        .map_err(|e| AksharaError::InternalError(format!("HMAC init failed: {}", e)))?;
    hmac.update(plaintext);
    hmac.update(ad); // Mix in Associated Data to prevent Poly1305 key-nonce reuse
    let hmac_result = hmac.finalize().into_bytes();
    
    let mut nonce = [0u8; 24];
    nonce.copy_from_slice(&hmac_result[..24]);
    Ok(nonce)
}
```

{{< note type="log" title="Engineer's Log: The Nonce Reuse Trap" >}}
Apparently, reusing a key-nonce pair across different contexts is a fatal mistake in AEAD ciphers like XChaCha20-Poly1305. If the same plaintext (e.g., `b"hello"`) appears in two different parts of the graph under the same key, the Poly1305 authenticator state leaks, allowing a malicious relay to recover the authentication key and forge valid blocks.

To neutralize this, I updated the derivation to mix the AD hash directly into the nonce formula (`nonce = HMAC(GraphKey, plaintext || AD)`). Now, if the structural context changes, the nonce shifts, keeping the authenticator secure.
{{< /note >}}

### Key Separation: A Shortcut for Now

Reusing the document graph's symmetric key (the `GraphKey`) for both HMAC (nonce derivation) and XChaCha20 (encryption) violates the **Key Separation Principle**, which states that a cryptographic key should only do one job.

Ideally, I should have run a Key Derivation Function (KDF) to split the master key into distinct operational sub-keys for every block. However, to keep the early prototype simple, I chose to reuse the key directly. This is a shortcut I am accepting for now, though I hope to find a way to resolve this overhead later.

---

## 4. Deconstructing the Block Struct

Here is how these pieces combine to form an actual `Block` struct in [`aadhaara/src/graph/block.rs`](https://github.com/vijayanant/akshara/blob/master/aadhaara/src/graph/block.rs):

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Block {
    pub(crate) id: BlockId,
    pub(crate) author: SigningPublicKey,
    pub(crate) signature: Signature,
    pub(crate) content: BlockContent,
    pub(crate) block_type: BlockType,
    pub(crate) parents: Vec<BlockId>,
}
```

### Preventing Block-Swapping Attacks with Associated Data (AD)

To prevent a malicious relay from taking a valid block out of context, the ciphertext is bound to its structural metadata. We calculate this Associated Data by hashing the block's core properties together, passing it directly to the encryption cipher:

```rust
impl Block {
    fn compute_ad(
        graph_id: &GraphId,
        author: &SigningPublicKey,
        block_type: &BlockType,
        parents: &[BlockId],
    ) -> Vec<u8> {
        let mut hasher = Sha256::new();
        hasher.update(b"AKSHARA_V1_BLOCK_AD");
        hasher.update(graph_id.as_bytes());
        hasher.update(author.as_bytes());
        hasher.update(block_type.as_str().as_bytes());
        for p in parents {
            hasher.update(p.as_ref());
        }
        hasher.finalize().to_vec()
    }
}
```

If a relay attempts to move this encrypted block to a different path or attach it to different parents, the decryption will fail at the destination because the calculated Associated Data will not match the AEAD integrity tag.

### Hashing the Envelope: Computing the Block ID

The `BlockId` is the content address of the block. It must hash the envelope (ciphertext, nonce, metadata type, causal links, and the author's public key) to guarantee immutability and prevent authorship-swapping at the relay layer:

```rust
pub fn compute_id(
    content: &BlockContent,
    block_type: &BlockType,
    parents: &[BlockId],
    author: &SigningPublicKey,
) -> BlockId {
    let mut hasher = Sha256::new();
    hasher.update(b"AKSHARA_V1_BLOCK");
    hasher.update(content.as_bytes()); // Ciphertext bytes
    hasher.update(content.nonce());
    hasher.update(block_type.as_str().as_bytes());
    hasher.update(author.as_bytes());

    for parent in parents {
        hasher.update(parent.as_ref());
    }

    BlockId::from_sha256(&hasher.finalize())
}
```

### Verifying Block Integrity

When a client downloads a block from a blind relay, it runs a two-step validation:

1. **Fingerprint Match:** Verify that the calculated ID matches the block's `id`.
2. **Origin Proof:** Verify that the Ed25519 signature verifies against the calculated `id` and the author's public key.

```rust
pub fn verify_integrity(&self) -> Result<(), AksharaError> {
    // Telemetry and tracing spans omitted for clarity
    let calculated_id = Self::compute_id(&self.content, &self.block_type, &self.parents, &self.author);
    if self.id != calculated_id {
        return Err(AksharaError::Integrity(IntegrityError::BlockIdMismatch(self.id)));
    }

    self.author
        .verify(self.id.as_ref(), &self.signature)
        .map_err(|e| AksharaError::Crypto(CryptoError::InvalidSignature(e.to_string())))?;

    Ok(())
}
```

---

## 5. Growing the DAG: The Manifest Checkpoint

If a document is split into dozens of encrypted, content-addressed blocks, the client needs a way to locate them. How does the client track which blocks make up the document, and where does the traversal begin?

This is the role of the [**Manifest**](https://github.com/vijayanant/akshara/blob/master/docs/specs/graph-model/snapshots.md#4-manifest-structure).

If blocks are raw Git-like blobs, the Manifest is a Git-like commit: a signed, unencrypted metadata block that serves as the public entry point for a graph.

Instead of storing content, the Manifest holds a single `content_root` CID (pointing to the root of the document's Merkle DAG) and a list of `parents` CIDs (referencing preceding manifest versions).

When a collaborator wants to open a document:

1. They fetch the latest **Manifest** from the relay.
2. They verify the author's signature on the manifest to ensure legitimacy.
3. They read the `content_root` address, download that block, decrypt it using the symmetric `GraphKey` to locate the directory structure (the [**Merkle Index**](https://github.com/vijayanant/akshara/blob/master/docs/specs/graph-model/indices.md#3-structural-definition)), and recursively fetch the child data blocks.

{{< note type="log" title="Engineer's Log: The Lockbox Key Exchange" >}}
How does a collaborator get the `GraphKey` in the first place? In a zero-trust network, we cannot store decryption keys on the relay server. Instead, Akshara uses **Lockboxes**, an asymmetric key exchange protocol using ephemeral X25519 pre-keys to securely transfer the symmetric `GraphKey` (stored on the relay and indexed by the recipient's public key). I will unpack this asynchronous key-sharing engine in a future post.
{{< /note >}}

Here is the implementation from [`aadhaara/src/graph/manifest.rs`](https://github.com/vijayanant/akshara/blob/master/aadhaara/src/graph/manifest.rs):

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ManifestHeader {
    pub(crate) graph_id: GraphId,
    pub(crate) content_root: BlockId,
    pub(crate) parents: Vec<ManifestId>,
    pub(crate) identity_anchor: ManifestId,
    pub(crate) schema_anchor: Address,
    pub(crate) signer_path_hash: [u8; 32],
    pub(crate) authority_proof: Option<crate::base::crypto::BlockContent>,
    pub(crate) created_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Manifest {
    pub(crate) id: ManifestId,
    pub(crate) header: ManifestHeader,
    pub(crate) author: SigningPublicKey,
    pub(crate) signature: Signature,
}
```

{{< figure src="manifest-dag.svg" alt="Manifest and Block DAG Resolution" caption="How a signed, public Manifest snapshot resolves path mapping down the traversable index block to find private data block CIDs" width="800" >}}

---

## 6. Visualizing the Anatomy

The diagram below maps the lifecycle of block construction (from CBOR canonicalization and HMAC nonce derivation, through to AEAD encryption and Ed25519 signing):

{{< figure src="block-structure.svg" alt="The Anatomy of an Akshara Block" caption="The diagram mapping the lifecycle of block construction (from CBOR canonicalization and HMAC nonce derivation, through to AEAD encryption and Ed25519 signing)" width="800" >}}

---

## 7. Trade-offs and Engineering Realities

Building these blocks forced me to face some uncomfortable trade-offs:

1. **The Re-Serialization Tax:** Enforcing bit-identity by deserializing and immediately re-serializing bytes adds CPU overhead on every read. While DAG-CBOR defines canonical rules, standard parser libraries are permissive in their decoding—they will happily ingest out-of-order keys or duplicate fields without throwing an error. Re-serialization is a quick, prototype-stage safeguard to guarantee that what we parse is exactly what we write. It is a performance penalty I am accepting for now, but I will eventually have to look for other options to enforce strict canonical checks on the raw bytes without this overhead. Interestingly, if the system is deployed in a closed environment where every node is restricted to the official SDK, this check is redundant and can be safely bypassed, but for an open, zero-trust protocol, it remains a necessity.

2. **Causal Link Bloat:** Because each block points to its parents, the metadata envelope grows as history grows. For small, frequent edits, the causal metadata can easily outgrow the actual content payload. I will need to design historical pruning and snapshotting systems later to keep this under control.
3. **Logical Deletion Only:** Deleting a block currently just detaches the pointer in the manifest. The raw blocks still sit in the local SQLite cache. Writing a garbage collector to safely sweep the database without breaking the causal history is a puzzle I am still trying to solve.

In the next post, I will build on this atomic structure to solve identity: moving from static keys to dynamic **Graphs of Authority**.

In the meantime, if you want to skip ahead and dig into the Rust implementation, the complete source code is open and available in the [Akshara GitHub Repository](https://github.com/vijayanant/akshara). For a deep dive into the formal protocol design, you can also explore the [Identity Key Derivation Specification](https://github.com/vijayanant/akshara/blob/master/docs/specs/identity/derivation.md#4-identity-key-structure) and the [Lockbox Protocol Specification](https://github.com/vijayanant/akshara/blob/master/docs/specs/sharing/lockboxes.md#3-lockbox-payload-format).

{{< newsletter type="simple" >}}
