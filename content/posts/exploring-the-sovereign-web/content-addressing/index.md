---
title: "The Anatomy of a Permanent Web"
subtitle: "Beyond the URL"
date: 2026-01-30
series: ["Exploring the Sovereign Web"]
series_order: 1
draft: false
description: "Why the way we link to things on the web is broken, and how addressing content by 'what' it is, rather than 'where' it is, builds a foundation for a permanent, verifiable internet."
tags: ["distributed-systems", "content-addressing", "zero-trust", "decentralised-web", "cryptography", "privacy"]
categories: ["Software Architecture"]
featured_image: "library-card-catalog.jpg"
---

{{< figure src="library-card-catalog.jpg" caption="Photo by [Daniel Forsman](https://unsplash.com/@danielforsman?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/photos/a-hand-pulls-a-card-from-the-librarys-card-catalog-Ph4ZJrwf4x8?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)" >}}

{{< note type="info" title="Why I'm writing this" >}}
I’m exploring this space because I’m working on something that touches these ideas. I’m keeping the details private for now, but the goal here isn’t to announce a product.

This is me learning in public. Mapping the landscape. Getting clear about the foundations before building on top of them.

This post starts with integrity and verifiability. Privacy, identity, and authority come next.
{{< /note >}}

I’ve spent the last few weeks diving into the guts of distributed systems, and I recently hit an *aha* moment that changed how I see the web. It started as a technical curiosity and slowly turned into a more uncomfortable realization: a lot of what we rely on online is far more fragile than we like to admit.

The shift itself is simple to state. It’s the move from URLs to hashes. But once you sit with it for a while, it forces you to rethink what we actually mean when we say something on the internet is *real*, *available*, or *trustworthy*.

## The flaw in the foundation: where vs what

The web we use today is built on **location addressing**. When you want to see a photo or read a document, you tell your browser *where* to go: `server.com/files/my_plan.pdf`

You are pointing to a specific server, owned by a specific company, sitting in a specific data center.

This model quietly forces us into a system of **institutional trust**. You are not actually asking for the file itself. You are asking a gatekeeper to give it to you. If that gatekeeper moves the file, changes its rules, or disappears entirely, the link dies.

The data might still exist on a thousand hard drives around the world, but your address is useless because it was tied to a place, not the thing. We have effectively built a global library where the only way to find a book is by knowing exactly which shelf it was on years ago.

{{< figure src="location-vs-content.svg" title="Location Addressing vs Content Addressing" caption="Moving from pointing at a server (Location) to pointing at the data itself (Content)" >}}

## Flipping the model

**Content addressing** turns this inside out. Instead of asking “Where is this data?”, we ask “What is this data?”

The mechanism is a **cryptographic hash function**, such as SHA-256. Feed any sequence of bytes into it and you get back a fixed-length fingerprint. Two properties matter here.

First, it’s deterministic. The same input always produces the same output. Second, it exhibits the **avalanche effect**. Change a single bit and the resulting hash looks completely unrelated to the original.

Because the hash is derived directly from the bytes, it becomes the data’s universal name. To share a document, you don’t give someone a URL. You give them the hash and effectively ask the network:

> Who has the bytes that match this fingerprint?

This replaces institutional trust with **structural trust**. You can receive the data from a friend, a stranger, or a server you’ve never heard of. It does not matter. You hash what you receive yourself. If the fingerprint matches, the math proves the data is correct.

{{< newsletter >}}

The web shifts from trusting organizations to trusting the physics of information.

## From files to graphs

Real systems don’t hash giant files as a single blob. That would be wildly inefficient. Change one byte in a 1 GB file and you would have to redistribute the entire thing.

Instead, production systems build a **directed acyclic graph (DAG)**.

### Canonicalization: same meaning, same bytes

Before hashing anything, you have to solve an annoying but critical problem: the same data can be represented in different ways. UTF-8 vs UTF-16. Tabs vs spaces. Different key ordering in a JSON object.

**Canonicalization** strips away this environmental noise and produces a deterministic byte sequence. If two systems agree on the meaning, they must agree on the bytes. Without this step, content addressing falls apart quietly and painfully.

Consider these two JSON objects. Semantically, they are identical, as they contain the exact same data. But because the keys are ordered differently, their raw bytes are different:

```json
// Input A
{ "name": "Alice", "role": "admin" }
// SHA-256: 5c65980e9c48d0e18518ecee46e295c007428fc49741271e090ef17970ddd684

// Input B
{ "role": "admin", "name": "Alice" }
// SHA-256: 402b9ee5cac7ccba93d8825ef9d7f97358e59d99c689b5c8fe8ed86da7add3a8
```

Because the cryptographic hash is derived from the *bytes* and not the *meaning*, these two inputs produce completely different fingerprints. A canonicalization step (like sorting keys alphabetically) ensures they both hash to the same value.

### Blocks and manifests

Once the bytes are canonical, the data is split into smaller **blocks**, often a couple of megabytes each. Each block is hashed independently.

A **manifest** then lists the hashes of all blocks that make up the document. That manifest is hashed as well, producing a single **root hash** that represents the entire structure.

{{< figure src="merkle-dag.svg" title="The Merkle DAG" caption="A simplified view of how a file is broken into blocks, with a Manifest acting as the map." >}}

The graph is directed because hashes point to their children. It is acyclic because you cannot know a hash until its contents are finalized. Loops are mathematically impossible.

### Why Merkle linking matters

This recursive hashing creates what is often called a Merkle structure. The payoff shows up during updates.

Edit one sentence in a large document and you only change one block. That block gets a new hash, which produces a new manifest and a new root hash. Everything else stays the same.

{{< figure src="merkle-update.svg" title="Efficient Updates via Deduplication" caption="When Block B changes to Block B', we reuse Block A. Only the new path is created." >}}

Synchronizing the update means transferring a few kilobytes instead of a gigabyte. At scale, this efficiency is the difference between a clever idea and a usable system.

This is the same principle that makes Git so fast; when you commit a change, Git doesn't copy your whole project; it only creates new objects for the files that changed and reuses the rest of the Merkle tree.

## The hard parts nobody gets for free

If content addressing is so powerful, why aren’t we all using it already? Because centralized systems quietly solve problems that become very visible once you remove the boss node.

### Discovery

In a URL-based world, discovery is trivial. The server *is* the location.

With content addressing, a hash tells you nothing about where the bytes live. You need a discovery layer, often built on **distributed hash tables (DHTs)**, where nodes collectively maintain a partial map of who is hosting what.

This trades a simple lookup for a global coordination problem. It works, but it’s operationally and conceptually expensive.

### Immutability and garbage collection

Hashes never change. Editing a file creates a new version rather than overwriting the old one. Over time, this leaves behind a trail of obsolete data.

Cleaning this up requires **reachability-based garbage collection**. The system walks the graph starting from the versions you still care about and marks everything it can reach. Anything left unmarked is safe to delete.

This is one of those areas where naïve implementations fail quietly and then catastrophically.

### Mutable pointers

Humans still want stable names like “profile picture” or “project alpha”. Content hashes cannot provide that.

Most systems solve this with a separate layer of **mutable pointers** backed by cryptographic signatures. The content stays immutable. The pointer moves. The signature proves who was allowed to move it.

### Algorithm agility

No cryptographic primitive lasts forever. SHA-1 was once considered safe. It no longer is.

Hard-coding addresses to a single algorithm is a long-term trap. Modern systems (like **IPFS**) use **multihashes**, which encode not just the fingerprint but also the algorithm used to produce it. This allows systems to evolve without invalidating everything that came before.

This is why the hashes in the diagrams above start with `Qm`. That prefix isn't random; it is a code (Base58 for `12 20`) that explicitly tells the system: *"This is a SHA-256 hash."* If we switch to BLAKE3 or SHA-3 in the future, the prefix changes, and the software knows exactly how to validate the new address without breaking the old ones. This allows systems to evolve without invalidating everything that came before.

## Integrity is not privacy

Content addressing gives you integrity. It tells you the data you received is exactly the data you asked for.

It does *not* give you privacy.

Unless the data is encrypted before hashing, any node storing it can still read its contents. The warehouse becomes dumb, but not blind.

This distinction matters. Verifiability and privacy are separate problems. Solving one does not automatically solve the other. I’m deliberately starting with integrity because it is the prerequisite for everything that follows.

{{< newsletter >}}

## Decoupling truth from location

The deeper insight here is not really about storage or networking. It’s about how systems establish truth.

Our current web ties validity to institutions. If the host disappears, the information becomes unverifiable. That creates single points of failure, both technical and social.

Content addressing replaces institutional trust with structural trust. Truth is no longer bound to a location. It is embedded in the data itself.

Servers stop being arbiters of correctness and become commodity providers of storage and bandwidth. Data becomes portable by default. Verification becomes local.

That shift does not solve every problem, but it changes which problems matter.

I’m starting here because integrity is the first layer you have to get right. Privacy, identity, and authority build on top of it. Those are the layers I’m exploring next.
