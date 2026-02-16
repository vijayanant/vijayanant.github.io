---
title: "Where is my Admin Panel?"
subtitle: "Authority and State Consistency"
date: 2026-02-16
series: ["Exploring the Sovereign Web"]
series_order: 5
draft: true
description: "A blind relay cannot enforce permissions. Removing the 'God Mode' of an admin panel creates a physics problem for state that signatures alone cannot solve."
tags: ["authority", "distributed-state", "cryptography", "distributed-systems", "decentralized-web"]
categories: ["Software Architecture"]
featured_image: "control_panel.jpg"
---

{{< figure src="control_panel.jpg" caption="Photo by [Karan Suthar](https://unsplash.com/@karan_suthar_?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/photos/a-close-up-of-a-control-panel-with-buttons-and-switches-3gX0VUxKekU?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)" >}}

So far, I looked at how we [**secure bytes**]({{< ref "/posts/exploring-the-sovereign-web/content-addressing/" >}}), [**verify identities**]({{< ref "/posts/exploring-the-sovereign-web/cryptographic-identity/" >}}), [**seal the vault**]({{< ref "/posts/exploring-the-sovereign-web/privacy-at-rest/" >}}), and [**share secrets**]({{< ref "/posts/exploring-the-sovereign-web/sharing/" >}}). I had reached a point where the storage was secure and the actors were verified. But when I tried to model how a group would actually use this vault, I realized I had no way to define who was in charge.

I had built a system with integrity, but I had no mechanism for **Authority**.

In a traditional application, authority is a database problem. Access control lives in a central registry (an ACL). When a user tries to save a file, the server checks the registry. If the user has the `write` bit enabled, the server accepts the change. The server is the judge because it is the only one that can see the registry.

But in a decentralized architecture where the server is a blind relay, it cannot see the data and it cannot see the rules. This makes the standard ACL model physically impossible. If the server cannot judge the write, the authority must be verifiable at the edge.

One alternative is the **Token-based model** (such as JWTs). In this architecture, a central server issues a signed credential that the user possesses. This shifts verification to the edge, but the root of trust remains centralized. If the issuing server is unavailable, new credentials cannot be created. If the server’s private key is compromised, every token in the system is invalidated.

To achieve true decentralization, we must remove the central issuer. Authority is not granted by a service; it is delegated by the owner of the data.

## From Registry to Delegation

To remove the central registry, the right to act must be self-contained.

Instead of checking a list on a server, a user must possess a **Capability**: a signed proof of their authority. To let Alice edit a document, I sign a certificate that says: *"I authorize Alice to sign updates to this document."*

When Alice wants to authorize Bob, she signs a second certificate. This isn’t just theory; modern protocols like **UCANs (User Controlled Authorization Networks)** and **Biscuit Tokens** are already implementing this "Logic at the Edge" by treating authority as a chain of delegations rather than a central database lookup.

To verify a change, my device doesn't ask a server for permission; it walks a **Delegation Chain** back to the document’s root key. Authority stops being a row in a table and becomes a trail of verified provenance.

{{< figure src="delegation-chain.svg" title="The Delegation Chain" caption="Authority flows through a sequence of signed certificates. Each link proves the right to delegate to the next." >}}

## The Double-Spend of Authority

Moving authority into a chain of signatures reveals a logic break. In a centralized system, the server provides a **Total Ordering** of events. It owns the clock. It ensures that if I revoke Alice’s access at 10:00, her 10:01 update is rejected.

In a distributed system, we lose the global clock. Authority can be "double-spent."

Consider a state fork. Working offline, I sign a certificate authorizing Alice. Simultaneously, also offline, I sign a certificate revoking her. When these two messages eventually reach the relay, the network sees two valid but contradictory states. Both are cryptographically perfect. Both are signed by the root key.

The math can verify the signatures, but it cannot resolve the contradiction. It has no way to know which one I intended to be "last."

{{< figure src="authority-fork.svg" title="The Authority Fork" caption="Two contradictory operations are signed while offline. Without a central clock, the network sees a valid state fork that cannot be resolved by math alone." >}}

This highlights a fundamental limit: signatures prove *who* spoke, but they cannot prove *when*. To resolve a state fork, we must choose a strategy for reconciliation:

* **Causal Ordering:** Using Lamport Clocks to establish a logical sequence.
* **Deterministic Policies:** "Oldest key wins" or "Lowest hash wins" to force a winner.
* **Consensus Protocols:** Using Paxos or RAFT to find global agreement.
* **Conflict-free Data (CRDTs):** Designing the data so that matching states eventually converge.

Whichever path we take, we are trading mathematical certainty for architectural coordination. We have to decide how the system handles disagreement before the first block is signed.

{{< newsletter >}}

## The Revocation Gap

The loss of the central clock also changes the **mechanics of revocation**. In a centralized world, revocation is an atomic update. In a distributed world, revocation is a **Propagation problem**.

If I revoke Alice’s access, that information must travel through the network. Until that message arrives at every node, Alice exists in a window of ignorance. She can continue to authorize new actors or perform work.

{{< figure src="window-of-ignorance.svg" title="The Window of Ignorance" caption="Revocation is not atomic in a distributed system. It is a race against information latency." >}}

This forces a choice between consistency and availability. If we discard all work performed during this propagation delay, we protect the chain but penalize the honest user. If we accept it, we allow "authorized ghosts" to remain active until the network converges. This is an architectural trade-off that cannot be avoided.

## Writing vs Reading

I also stumbled on a practical gap between **Signatures** and **Keys**.

By updating the delegation chain to ignore Alice’s future signatures, I can successfully block her from *writing* to the document. But Alice still possesses the **Content Key**. Because she was once a member of the team, she has the symmetric key we used to encrypt the data.

Even if she can no longer participate, she can continue to download every new update from the relay and read them in secret.

{{< figure src="revocation-stages.svg" title="Terminating Access" caption="True revocation requires two distinct operations: invalidating the signature (Authority) and rotating the symmetric key (Privacy)." >}}

## The Time Barrier: Forward Secrecy

Revocation in a decentralized system is not about erasing the past; it is about drawing a line in time. Because old blocks are immutable and already signed, a revoked actor can always see the history they were once part of. If she possesses a specific **Commit Hash** and the corresponding **Symmetric Key**, she has that data forever. We cannot "un-read" a secret that has already been shared.

True revocation requires two distinct operations to secure the **Future**:

1. **Invalidate the Signature (Authority):** The delegation log is updated to ignore future operations from the revoked actor. This prevents them from creating new state transitions.
2. **Rotate the Secret (Privacy):** A new symmetric key is generated and shared only with the remaining members.

Any "app-level" restriction (such as hiding a document from a UI) is merely a facade. Without cryptographic rotation, the revoked actor can continue to download and decrypt every new update from the relay in secret. By rotating the key, we achieve **Forward Secrecy**: the actor retains their history, but they become blind to every update that follows.

{{< figure src="forward-secrecy.svg" title="Forward Secrecy" caption="Rotating the symmetric key draws a line in time. The revoked actor can read history, but not the future." >}}

{{< newsletter >}}

## The Dead-End Failure

Finally, there is the problem of terminal loss. Centralized systems assume a "God Mode" for recovery. If an admin is lost, the database owner can reset the keys. Authority is repairable because a higher power exists.

When you remove the center, you remove the safety net. If the root key is lost or the original owner disappears, the authority chain is permanently frozen. The state becomes immutable. No one can add members, rotate keys, or change rules. It is a locked house with the key inside.

This reinforces why the recovery mechanisms we discussed in [**The Shape of Cryptographic Identity**]({{< ref "/posts/exploring-the-sovereign-web/cryptographic-identity/" >}}), such as social recovery and threshold secret sharing, are architectural necessities. They aren't just for user convenience; they are the only way to ensure the system survives the loss of a single device. Without a path for authority to heal, the document is only as durable as its most fragile key.

## Where this leaves me

Earlier in this journey, my notes were focused on the math of storage and encryption. Integrity, Identity, and Privacy were solved with bits and ciphers.

But **Authority** is a coordination problem. It is the moment the software hits the reality of network lag, lost keys, and human disagreement. The hardest challenges are not about verifying signatures; they are about keeping everyone on the same page when there is no boss and no shared clock.

We trade the comfort of a central Admin Panel for the durability of a system that no one, not even the host, can take away. It is the moment the software stops being a static archive and starts dealing with the messy reality of distributed state.

***

*This post continues a series of research notes exploring the foundations of long-lived distributed systems. Next up: **The Sync Paradox (How we actually agree on "Now").***
