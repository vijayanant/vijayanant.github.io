---
title: "Authority and State Consistency"
subtitle: "Coordination in a decentralized graph"
date: 2026-02-11
series: ["Exploring the Sovereign Web"]
series_order: 5
draft: true
description: "Decentralized systems lose the global clock and the central registry. This post explores the logic of delegation chains, authority forks, and the two-stage process of revocation."
tags: ["authority", "distributed-state", "cryptography", "distributed-systems", "sovereign-web"]
categories: ["Software Architecture"]
---


In my previous notes, I covered data integrity (hashes), actor identification (keys), and data privacy (encryption). I had built a secure vault, but when I tried to model how a team would actually *manage* that vault over time, I hit a fundamental architectural wall.

I realized that I had built a system with **Integrity** but no **Governance**.

In every system I have ever built, authority was a database column. The server acted as the central arbiter. Because the server owned the database and the system clock, it could provide a **Total Ordering** of events. If a revocation is recorded at 10:01, any subsequent write is rejected. The server is the "First."

When the server is reduced to a blind relay, we lose the global clock and the central registry. Authority must shift from an ordinal model to a **Causal Model**. We no longer ask which operation was first; we ask if the operation can prove its own provenance.

## From ACLs to Delegation Chains

In a centralized system, access control is a **Registry problem**. You check a table to see if a user has the `write` bit enabled. A decentralized system has no global registry. Authority must be self-contained and verifiable at the edge.

This requires **State Provenance**. To grant access, the owner does not update a database; they issue a signed certificate. This certificate acts as a cryptographic "Hall Pass." When that user delegates to a third party, they sign a second certificate.

To verify a state change, the client walks this **Delegation Chain** back to the document’s root key. Authority becomes a verified trail of cryptographic proofs rather than a row in a database table.

{{< figure src="delegation-chain.svg" title="The Delegation Chain" caption="Authority flows through a sequence of signed certificates. Each link proves the right to delegate to the next." >}}

## Logic Conflict: Authority Forks

Moving authority into a chain of proofs reveals a fundamental logic error. Without a central clock to provide ordering, **Authority can be double-spent.**

Consider a state fork: an owner signs a certificate authorizing Alice, and simultaneously—working offline—signs a message revoking her. Both messages are cryptographically valid. Both are signed by the root key.

Without a "Global Now," the system has no mathematical way to decide which state is true. It is like having two identical keys that turn the same lock in opposite directions.

This is the limit of signatures. They verify the actor, but they do not resolve the state. A sovereign system must implement a **Conflict Resolution Policy** (such as "highest sequence number" or "quorum voting") before the first block is ever signed.

{{< newsletter >}}

## The Propagation Latency Gap

In a distributed system, revocation is not an atomic event; it is a **Propagation problem**.

If I revoke a user's access, that state change must travel through the network. Until the revocation reaches all nodes, that user exists in a window of ignorance. They can continue to perform work or authorize new actors.

This forces an architectural choice between **Strict Consistency** and **Operational Availability**. Discarding work performed during this window protects the chain but penalizes the honest user. Accepting it allows "authorized ghosts" to remain active until the network converges.

## The Two Stages of Revocation

Revocation in a sovereign system is often misunderstood as a single operation. In practice, it requires two distinct actions to be effective:

1. **Reject the Voice:** Update the delegation log to ignore future signatures from the revoked actor. This prevents new writes.
2. **Rotate the Secret:** Generate a new content key and re-encrypt the state for the remaining members.

If you don't do both, your "Revocation" is just a request for them to stop participating while the door remains wide open. The revoked actor loses the ability to write, but they retain the symmetric key needed to decrypt every new update from the relay.

## Terminating the Chain: The Recovery Problem

Removing the central arbiter removes the "God Mode" for state recovery. In a centralized system, an administrator can reset keys or fix a broken delegation chain.

In a purely cryptographic chain, losing the root key is terminal. If the owner disappears or the key is deleted, the authority chain is permanently frozen. It is a locked house with the key inside. No new members can be added and no rules can be changed.

**State Recovery** must be an architectural primitive. Designing for "Healing" using tools like threshold secret sharing or social recovery is necessary to ensure the system doesn't become a frozen monument the moment a single device is lost.

{{< newsletter >}}

## Where this leaves me

Integrity, Identity, and Privacy were algorithmic hurdles. They were solved with bits and ciphers.

**Authority** is different. It is where the logic of the software meets the physics of disagreement, latency, and loss. The challenge is not verifying a signature; it is maintaining a consistent state across a network with no center and no clock.

It is the moment the software stops being a static vault and starts being a living, distributed system.

***

*This post continues a series of research notes exploring the foundations of long-lived distributed systems. Next up: The Sync Paradox (How we actually agree on "Now").*
