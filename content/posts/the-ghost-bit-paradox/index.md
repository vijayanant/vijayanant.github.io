---
title: "The Ghost Bit Paradox"
subtitle: "Why Semantic Integrity Survives Lenient Encodings"
date: 2026-02-19
draft: false
description: "Fuzz testing a Merkle-DAG manifest revealed instances where binary corruption did not invalidate high-level integrity checks. This post analyzes the role of decoder lenience in CBOR serialization."
tags: ["distributed-system", "decentralized-web", "cryptography", "cbor", "rust", "fuzzing", "serialization"]
categories: ["Programming"]
featured_image: "investigation.jpg"
---

{{< figure src="investigation.jpg" alt="A vintage typewriter on a white table with a sheet of paper that has the word INVESTIGATION typed on it." caption="Photo by [Markus Winkler](https://unsplash.com/@markuswinkler?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/photos/green-and-white-typewriter-on-blue-textile-cS2eQHB7wE4?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)" >}}

While working on a prototype based on my [**Exploring the Sovereign Web**]({{< ref "/series/exploring-the-sovereign-web/" >}}) series, I encountered a technical paradox involving binary serialization and integrity verification.

I implemented a bit-flip fuzzer to stress the verification logic of the manifests. The process was straightforward: take a cryptographically signed **Manifest** (a snapshot of the Merkle-DAG), serialize it to raw binary bytes using **DAG-CBOR**, and then randomly flip exactly one bit in that stream.

The goal was to test the high-level integrity gatekeeper. Any change to the bitstream should alter the resulting hash and cause the signature verification to fail.

```rust
fn test_byzantine_manifest_corruption() {
    let mut rng = OsRng;
    let master = SecretIdentity::generate(&mut rng);
    // ...
    // 1. Create a signed snapshot
    let manifest = Manifest::new(/* ... */);
    let manifest_bytes = serde_cbor::to_vec(&manifest).unwrap();

    for _ in 0..100 {
        let mut fuzzed_bytes = manifest_bytes.clone();
        fuzzed_bytes[rng.gen_range(0..fuzzed_bytes.len())] ^= 0x01; // Corrupt 1 bit

        let res: Result<Manifest, _> = serde_cbor::from_slice(&fuzzed_bytes);

        if let Ok(fuzzed_manifest) = res {
            // Auditor check: re-calculate hash and verify signature
            let audit_res = fuzzed_manifest.verify_integrity();
            assert!(audit_res.is_err()); // <--- PANIC: The Auditor stayed silent!
        }
    }
}
```

But then, it happened. The fuzzer flipped a bit, and the Auditor stayed silent. **The integrity check passed.**

## A Breach in the Math?

In a system built on SHA-256 and Ed25519, a single bit flip in the input *will* change the result. The fact that the check passed suggested that the bit flip was somehow being "erased" before it ever reached the hashing logic.

My first thought was a bug in the `verify_integrity` logic. But the code was surgically simple:

```rust
pub fn verify_integrity(&self) -> Result<(), Error> {
    // 1. Re-calculate the ID from the fields
    let calculated_id = Self::compute_id(&self.header, &self.author);
    if self.id != calculated_id {
        return Err(IntegrityError::ManifestIdMismatch(self.id));
    }

    // 2. Verify the signature over that ID
    self.author.verify(self.id.as_ref(), &self.signature)?;

    Ok(())
}
```

If the audit passed, it meant the fields inside the manifest were identical to the original. But I had physically changed a bit in the bytes.

Where did that corrupted bit go?

## Hunting the Ghost Bit

I wrote a standalone reproduction script to isolate the phenomenon. I serialized a simple Rust struct to CBOR, flipped every single bit in the byte stream one by one, and tried to deserialize it back.

```rust
#[derive(Serialize, Deserialize, PartialEq, Eq)]
struct Simple {
    id: u64,
    meta: String,
    list: Vec<u32>,
}

fn main() {
    let original = Simple {
        id: 123456789,
        meta: "This is some sacred metadata that must not change".to_string(),
        list: vec![1, 2, 3, 4, 5],
    };

    let original_bytes = serde_cbor::to_vec(&original).unwrap();
    let iterations = original_bytes.len() * 8;

    for bit_index in 0..iterations {
        let mut fuzzed_bytes = original_bytes.clone();
        fuzzed_bytes[bit_index / 8] ^= 1 << (bit_index % 8);

        // Does the decoder 'fix' the bit flip silently?
        if let Ok(fuzzed_struct) = serde_cbor::from_slice::<Simple>(&fuzzed_bytes) {
            if fuzzed_struct == original {
                println!("GHOST BIT detected at bit index {}!", bit_index);
            }
        }
    }
}
```

The result was startling: out of 608 total bits, **4 bits were "Ghost Bits."** I could flip them, the decoder would accept the corrupted bytes, and the resulting Rust struct remained identical to the original.

### Stumbling across Malleability

As I analyzed these specific bit-indices, I realized I had stumbled into a well-known property of serialization formats: **Malleability**. This behavior emerged from the combination of non-canonical encoding, lenient decoding, and schema expectations.

The bit flip wasn't a failure of the math, but a property of how the decoder handles binary types. CBOR encodes data using **Major Types** (Type Tags). For example, `0x69` represents a "Text String of length 9." By flipping bit 5 of that byte, the value changes to `0x49`, which the CBOR spec defines as a **Byte String of length 9.**

In a strict system, the decoder should have seen a "Byte String" where the schema expected a "Text String" and returned an error. But the decoder (`serde_cbor`) was being lenient. It observed that the bytes were valid UTF-8 and matched the expected length, so it implicitly coerced the Byte String back to the Text String the Rust struct expected.

Because the resulting struct was identical to the original, the hash re-calculation passed. The "Ghost Bit" was simply a **non-semantic bit-flip**: a structural artifact that was normalized by the decoder before it reached the application logic.

{{< figure src="ghost-bit-malleability.svg" alt="A diagram showing a bit-flip in a CBOR bitstream being normalized by a decoder into a single semantic object model." title="The Anatomy of a Non-Semantic Bit-Flip" caption="Malleability allows transport noise to bypass object-level integrity checks if the decoder is lenient." >}}

## Objects vs. Bytes

This discrepancy reveals a fundamental architectural choice in the design of distributed systems: at what layer do you anchor your truth? The real question is whether identity belongs to the serialized representation or to the abstract data model it encodes.

{{< figure src="integrity-anchor-models.svg" alt="A side-by-side comparison of Binary Integrity (bit-level hashing) and Semantic Integrity (object-level hashing)." title="Integrity Anchor Models" caption="Anchoring truth in the raw bitstream (Binary Representation) vs. anchoring it in the interpreted data model (Semantic Model)." >}}

The "Ghost Bit" phenomenon demonstrates that the choice between hashing **deserialized objects** or **raw bitstreams** is a trade-off between resilience and strictness.

{{< note type="log" title="A Gap in the Shield" >}}
This is where I realized that malleability isn't just an encoding quirk. If transport-level mutations normalize before hashing, any protocol-level filter that inspects raw bytes is effectively blind to the change.
{{< /note >}}

### 1. Semantic Integrity (Hashing the Data Model)

In this model, the system re-computes the hash based on the **logical fields** of the data (such as the Identifier, its References, and Metadata).

* **The Advantage:** **Representational Independence**. Because the hash is derived from the model, the identity of the data is decoupled from the encoding. This is powerful for long-lived systems where serialization formats might evolve (e.g., migrating from CBOR to a newer standard) without invalidating the entire history of hashes.
* **The Trade-off:** **Encoding Tolerance**. As the fuzzer discovered, this model is blind to non-semantic corruption. The decoder acts as a silent filter, normalizing "ghost bits" and presenting a perfect object to the validation layer. Security testing in this model must be model-aware, verifying that the audit only passes if the **Semantic Identifier** remains unchanged.

### 2. Binary Integrity (Hashing the Bitstream)

This is the model used by systems like Git or IPFS. The hash is computed directly from the raw bytes before any decoding occurs.

* **The Advantage:** **Absolute Determinism**. Every single bit in the transport layer is sacred. A single bit-flip, even in a redundant type tag, instantly invalidates the hash. It eliminates the "Ghost Bit" paradox by turning every bit into a semantic bit. This allows for lightweight **Merkle Proofs** where nodes can verify parts of a large structure without needing to decode the entire object.
* **The Requirement:** **Strict Canonicalization**. This model demands that the system guarantees a one-to-one mapping between an object and its bytes. Any lenience in the decoder becomes a potential security vulnerability, as it creates a gap between the verified bitstream and the application state.

{{< note type="log" title="The C14N Rabbit Hole" >}}
Digging into canonicalization (C14N) made me realize how difficult this is to guarantee in practice. Even basic JSON fails this test because object key order is undefined and floating-point representations vary across different architectures.
{{< /note >}}

{{< newsletter >}}

## Resolving the Paradox

The "Ghost Bits" I found were a direct result of **Encoding Malleability** in the transport layer. Because the decoder was lenient, it resolved the type-tag collision (Text String vs. Byte String) before the data reached the integrity check.

To make the fuzzer effective within a semantic integrity model, I had to update the test to distinguish between structural noise and actual data corruption. Instead of assuming every bit flip results in a hard error, the test now verifies that the audit only passes if the **Semantic Identifier** remains identical to the original.

```rust
if let Ok(fuzzed_manifest) = res {
    let audit_res = fuzzed_manifest.verify_integrity();
    
    // If the audit passed, the internal ID must match the original.
    // If the ID is different but the audit passed, that is a real failure.
    if audit_res.is_ok() {
        // If the audit passed, the internal ID must match the original.
        // This confirms the data model remained unchanged despite the bit-flip.
        assert_eq!(fuzzed_manifest.id(), manifest.id());
    }
}
```

This refinement ensures the fuzzer continues to catch real data model corruption while acknowledging the malleability of the underlying encoding.

{{< newsletter >}}

The "Ghost Bit Paradox" highlights a critical dependency: in any binary protocol, the decoder is a part of the security boundary. Whether you choose the strict determinism of binary hashing or the representational flexibility of semantic hashing, you must define exactly where your validation layer ends and your encoding layer begins.

In a world of lenient decoders, the truth is found in the model, not the bitstream.

***

*I am documenting my journey into the foundations of the Sovereign Web. You can follow the technical notes in the [**full series here**]({{< ref "/posts/exploring-the-sovereign-web/content-addressing/" >}}).*
