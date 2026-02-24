---
title: "Sharing After Secrecy"
subtitle: "Keys, Access, and Time"
date: 2026-02-06
series: ["Exploring the Sovereign Web"]
series_order: 4
draft: false
description: "Once you build a perfect vault, you realize you've built a tomb. Exploring the four architectures of sharing and the paradox of un-sharing in a decentralized world."
tags: ["sharing", "access-control", "cryptography", "zero-trust", "decentralized-web"]
categories: ["Software Architecture"]
featured_image: "message-in-a-bottle-at-seashore.jpg"
---

{{< figure src="message-in-a-bottle-at-seashore.jpg" caption="Photo by [Jayne Harris](https://unsplash.com/@jayneharr33?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/photos/a-bottle-floating-in-a-body-of-water-SkVpd5YhUug?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)" >}}

In the previous explorations, [**integrity**]({{< ref "/posts/exploring-the-sovereign-web/content-addressing/" >}}) let us verify data without trusting where it lived. [**Identity**]({{< ref "/posts/exploring-the-sovereign-web/cryptographic-identity/" >}}) let us understand who could speak for that data. [**Privacy**]({{< ref "/posts/exploring-the-sovereign-web/privacy-at-rest/" >}}) let us hide meaning from the infrastructure that stored it.

And then encryption worked a little *too* well.

We built a perfect **Fortress**, implementing blind storage that not even the server can read. But in our quest for safety, we realized we had forgotten to build a gate. We are secure, but we are also isolated.

{{< figure src="the-fortress.svg" title="The Privacy Paradox" caption="A perfect fortress is useless if you haven't built a gate to let your collaborators in." >}}

To make this data useful, we have to figure out how to **lower the drawbridge** for Alice without letting the whole world in. I had to figure out a way to smuggle the key through the very same untrusted channels I just built the walls to protect.

## The first naive instinct

My first instinct was almost embarrassingly simple: just send the key to the other person.

The idea felt obvious for a moment, until I followed it to its consequences.

If the key could be intercepted once, secrecy was gone forever. If it could be replayed, access could outlive my intent. And if sharing meant permanently handing over the same secret that protected my own copy, then sharing wasn’t collaboration; it was surrender.

This was the moment the problem stopped feeling mathematical. Encryption had been clean and contained. Sharing was suddenly social, messy, and bound to time.

I went looking for how real systems handled this, half-expecting there to be a clean, universal answer. There wasn’t.

## Four ways systems attempt to share secrets

Across different distributed and end-to-end encrypted systems, a few recurring patterns began to emerge. These are not perfect solutions, but rather different ways of coping with the tension between secrecy and collaboration over time.

### 1. The Turnstile (Centralized ACL)

*Used by: Slack, Notion, Google Docs.*

Access is mediated by a service that decides **who receives the decryption material**. The server may not read the underlying data, but it becomes a gatekeeper for capability distribution. Trust isn’t removed here; it’s relocated.

In practice, this is the invisible model behind most of the software we use every day. As an explorer, this model feels like living in a high-security apartment building where you aren’t allowed to have a key to your own front door. You have to ask the landlord to let you in every time. It’s effortless, but there is zero privacy. The landlord can see everything, and if they get hacked, every tenant is exposed.

### 2. The Broadcast (Mathematical Gating)

*Used by: Satellite TV, Blu-ray Discs.*

How do you share a movie with 10 million subscribers without sending 10 million individual messages? This is the world of **Broadcast Encryption**. Users are assigned a unique combination of keys from a massive matrix. The broadcaster sends out a "Lock Block": a mathematical puzzle embedded in the stream.

If you have a valid subscription, your unique subset of keys allows you to solve the puzzle and derive the content key. If your subscription expires, the broadcaster simply changes the puzzle so your specific key matrix no longer fits. It is a brilliant model for one-to-many distribution, but it fails for collaboration because it requires a central authority to issue the original keys.

### 3. The Courier (Pairwise Lockboxes)

*Used by: PGP, Sovereign Tools.*

This is the "Digital Envelope" model. If I want to share a document with you, I take the document's symmetric key and wrap it in a tiny encrypted box, a **Lockbox**, that only your specific Public Encryption Key can open. If I share with five people, I create five separate lockboxes.

This enables **direct, peer-to-peer cryptographic delegation**. I don’t need a central server to manage a group; I only need to know your Public Identity. However, there is a **Scaling Penalty**. If I want to share a file with 10,000 people, I have to upload and manage 10,000 individual lockboxes.
 The "map" of the keys eventually becomes heavier than the data itself.

### 4. The Tree (Recursive Wrapping)

*Used by: Signal Groups, IETF MLS.*

Access flows through hierarchies of derived or delegated keys. Granting or revoking access reshapes the structure rather than redistributing the original secret. This is the model used by modern protocols like **MLS (Messaging Layer Security)**.

Elegant in theory, but operationally complex. To bridge the gap between privacy and scale, modern protocols use a tree structure to manage group keys. Imagine a binary tree where every user is a leaf. Every node in the tree is an "Intermediate Key" encrypted by the keys below it. The "Group Key" is the root of the tree. When someone joins or leaves, the system only needs to update the "path" from that user's leaf to the root.

{{< figure src="the-frontier-map.svg" title="The Frontier of Access" caption="Mapping the landscape of sharing. The 'Sovereign Frontier' lies in the intersection of Decentralized authority and Asynchronous coordination." >}}

When we map these models, a pattern emerges. Most of our current web lives in the top-left (Google Docs: Asynchronous but Centralized) or bottom-left (Broadcast TV: Centralized and Synchronous). Even our best secure messengers often lean toward the bottom-right, requiring handshakes to manage decentralized keys in a live session.

The empty space in the top-right is the **Decentralized Asynchronous Space**: the place where we can share data without a central boss and without both parties being online at the same time.

Elegant in theory, but heavy in practice. A reminder that scale always asks us to pay somewhere.

## Analyzing the Dimensions of Access

As I mapped these models, I realized they aren’t just technical choices; they are positions on a map of four critical dimensions.

| System | Control | Audience | Timing | Persistence |
| :--- | :--- | :--- | :--- | :--- |
| **Broadcast TV** | Centralized | Group | Asynchronous | Permanent |
| **Signal Chat** | Decentralized | Pairwise* | Asynchronous | Ratcheted |
| **Git / PGP** | Decentralized | Pairwise | Asynchronous | Permanent |

Understanding where you sit on this map tells you exactly what trade-offs you are making. Different **kinds of software** naturally gravitate toward different sharing physics:

- **Broadcast systems** optimize for one-to-many distribution where receivers are mostly passive.
- **Chat systems** (like Signal) optimize for small, dynamic groups where membership and time constantly shift.
- **Collaborative documents** need fine-grained, long-lived coordination that survives edits, forks, and history.
- **Personal archives** care less about scale and more about permanence and control.

And that’s when the deeper pattern became visible. The architecture isn’t just an implementation detail; it quietly decides what the software *can become*. Which suggests an uncomfortable but useful question to ask **before writing any code**:

> *What kind of sharing is this system truly trying to support?*

{{< newsletter >}}

## Revocation

Just when sharing started to feel understandable, another problem surfaced: **taking access away**.

Sharing is easy. Un-sharing is where systems reveal their true assumptions.

{{< figure src="social-revocation.svg" title="Revocation is Social, not Technical" caption="Once User B copies the key to User C or a backup, User A's 'Revoke' button becomes an empty gesture." >}}

{{< figure src="revocation-timeline.svg" title="The Revocation Barrier" caption="Revocation is a time-bound problem. You can't take back what was known, but you can block what is next." >}}

If someone once had the key (or plaintext), what does revocation really mean? Do we rotate secrets and re-encrypt history? Accept that some doors, once opened, never fully close? Rely on social or legal boundaries instead of technical ones?

Revocation transforms sharing from a static secrecy problem into a **time-bound capability problem**. Access is no longer just *who*, but *who and until when*.

To "un-share" a document, I am forced to perform a **Re-Keying Storm**: I must generate a brand new Symmetric Key, re-encrypt the entire document, and create new Lockboxes for every other member of the team *except* you. We accept that we cannot erase the past from your memory, but we can lock you out of the future.

And time, unlike math, refuses to stay tidy.

## The Asynchronous Penalty

To build a system that is decentralized and asynchronous, I hit one final hurdle: **The Identity Registry**.

If I want to share a file with you while you are offline, I need to know your Public Encryption Key. If I ask a central server, I have reintroduced a point of metadata exposure. If I keep it in a local address book, I can’t find new people.

Even "Serverless" systems often need a **Dumb Helper**, which acts as a relay or directory that doesn't understand the keys but holds them in a global "Yellow Pages" so we can find each other in the dark. Whether it is a **DHT (Distributed Hash Table)** in IPFS or a **Relay** in the Nostr protocol, we minimize the server's power (it can't read the mail) but acknowledge its utility (it holds the mailbox).

{{< newsletter >}}

## Intent follows Architecture

My journey through these models taught me that there is no "One True Way" to share.

A chat app needs the **Ephemerality** of the Ratchet. A secret archive needs the **Permanence** of the Courier. A mass broadcast needs the **Scale** of the Puzzle. The challenge isn’t picking the "best" encryption; it’s matching the math to the **social intent** of the user. Architecture follows the social contract, not the other way around.

The math was never the hard part.

And that realization feels less like an answer… and more like the next boundary.
