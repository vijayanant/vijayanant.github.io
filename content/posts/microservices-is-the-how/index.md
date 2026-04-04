---
title: "Microservices is not the architecture, it is the 'How'"
seo_title: "Microservices vs. Architecture: The Topological Category Error"
subtitle: "Topology is not Design."
date: 2026-01-09
draft: true
categories: ["Software Architecture"]
tags: ["microservices", "architecture-philosophy", "constraints", "topology"]
description: "Stop confusing hosting topologies with architectural design. Learn the difference between the nature of your system, the constraints that protect it, and the topology you choose to enforce them."
featured_image: "artifact-trap.svg"
pillar: system
pillar_role: foundational
level: "Advanced"
---

"What is your architecture?"

I’ve asked this question in hundreds of interviews and design reviews. Nine times out of ten, the answer is the same: "We use Microservices."

This is a category error. If I ask what the *nature* of your house is and you tell me "it's made of bricks," you haven't answered the question. Bricks are the mechanism; the architecture is the layout, the flow, and the constraints that make it a home. 

When we tell people we have a "Microservices Architecture," we are behaving like artifact collectors rather than designers. We are focusing on the physical topology while ignoring the logical reasoning that was supposed to justify it.

## The Unified Model: Intent, Rules, and enforcement

To build a system deliberately, we must move through three distinct layers of decision-making. Most teams skip the first two and jump straight to the third.

### 1. The Nature (The Intent)
This is the set of adjectives that describe how your system *must* behave to survive its environment. Is it **Decentralized**? **Reactive**? **Eventually Consistent**? 

If you haven't defined the nature, you have no North Star. You are just moving boxes around a screen.

### 2. The Architecture (The Constraints)
Architecture is the coordinated set of **constraints** that protect the system’s nature. It is the defensive boundary. If your system must be "Highly Available" during a network partition, your architecture must include the constraint: *"No synchronous cross-boundary calls."*

**Architecture is not a wish list of 'ilities.' It is an explicit choice of which pain you are willing to accept.** If you can’t name the constraint—the path that is now forbidden—you haven't architected anything.

### 3. The Topology (The Enforcement)
This is the physical mechanism used to ensure the constraints are followed. **Microservices is a topology.** It is a "Border Patrol" for your domains. It is the most expensive way to enforce a boundary, using the network to physically prevent code from touching things it shouldn't.

## The "Microservice Tax"

Microservices are not inherently "better" than a monolith. In fact, they are technically worse for many "ilities":
*   **Simplicity:** Decreased.
*   **Consistency:** Decreased (from ACID to Eventual).
*   **Performance:** Decreased (Network latency).
*   **Observability:** Much harder.

You don't pick microservices because you want these things; you pick them because your **Architectural Constraints** have made every other enforcement mechanism (like language-level visibility or directory rules) fail at scale. 

**Microservices must be earned.**

If you telling me you have a "Microservices Architecture," but your services share a single database and use synchronous `REST` calls for every transaction, you have built a **Distributed Monolith**. You are paying the complexity tax of the topology without enforcing the constraints of the architecture. You have the mechanism, but you lost the intent.

## The Burden of Proof

Before you reach for the "How" (Microservices), you must prove you have designed the "What" (The Constraints). Can you enforce your boundaries in a single repository? Have you used [**The Formal Contract**]({{< ref "/posts/codifying-your-architecture/the-formal-contract" >}}) to hide your domain secrets?

If you can't design the cage in a single process, don't buy the beast of a distributed system. Architecture that isn't visible in the code is just a shared hallucination.

#### Technical Nudge

Tomorrow, take one "Microservice" in your system and look at its dependencies. If it cannot function, deploy, or fail without three other services being healthy, you haven't used topology to enforce a boundary—you've used it to hide a knot. 

Try documenting the **forbidden paths** in your system. What should a service *never* be allowed to do? Once you name the constraints, you might find that you don't need a new service; you just need better discipline in the one you have.

{{< newsletter type="simple" >}}
