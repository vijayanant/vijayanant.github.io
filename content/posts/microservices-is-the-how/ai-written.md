---
title: "Microservices is the 'How', not the 'What'"
subtitle: "A categorical correction for software architects."
date: 2026-01-09
draft: true
categories: ["Software Architecture"]
tags: ["microservices", "architecture-philosophy", "constraints", "topology"]
description: "Stop telling people you have a 'Microservices Architecture.' Learn the difference between the nature of your system, the constraints that protect it, and the topology you choose to enforce them."
featured_image: "artifact-trap.svg"
---

"What is your architecture?"

I’ve asked this question in hundreds of interviews and design reviews. Nine
times out of ten, the answer is the same: "We use Microservices."

It’s a confident answer. It sounds like progress. But it’s a categorical error. Microservices is not an architecture; it is a physical implementation choice. It is the "How," not the "What."

When we confuse the two, we stop being architects and start being artifact collectors. We focus on the IP addresses between our services while completely ignoring the logical knots that are strangling them.

## The Adjective Problem

We don't say our architecture is "Events." We say it is **Event-Driven**.
We don't say our architecture is "A Big Box." We say it is **Monolithic**.

Architecture is an adjective. It describes the **nature** of your system. If you tell me you have a "Microservices Architecture," you haven’t told me anything about how the system actually behaves. You’ve just described your hosting bill.

Is it decentralized? Eventually consistent? Reactive?

Most "Microservices" I encounter are actually monolithic in nature—they share a single database, use synchronous calls for everything, and require coordinated deployments. They’ve used the most expensive mechanism available to implement the very thing they were trying to escape.

## Architecture is a Choice of Pain

We’ve all seen the "letter to Santa" version of architecture. It’s a slide deck filled with words like *Resilient*, *Scalable*, and *Highly Available*.

But a wish list is not an architecture.

Architecture lives and dies by its **constraints**. It is the set of boundaries you choose to defend to ensure the system’s nature survives the pressure of a deadline. If you can’t name what you are **forbidding** or what you are **sacrificing**, you haven't architected anything.

* **The Amateur:** "We want High Availability."
* **The Architect:** "We will accept **Eventual Consistency** to ensure **High Availability** during network partitions."

Real architecture is the choice of which pain you are willing to accept to protect a specific goal.

## Microservices is just Enforcement

If architecture is the set of constraints, then Microservices is merely a physical **topology** used to enforce them.

Network boundaries are a "Border Patrol" for your domains. It is a very expensive, high-latency way to force a constraint. If you can't enforce a boundary in a single repository—using simple tools like language modifiers or directory structures—moving to 50 repositories won't save you.

In fact, it usually makes things worse. Most teams use Microservices as a form of **distributed procrastination**.

It’s an attractive trap. You don't want to do the hard work of designing logical boundaries, so you hope that physically separating the code will magically create them. You swap a difficult design problem for a difficult infrastructure problem and call it "Modernization." But separation is not decoupling. All you've done is taken your messy code and added network latency to it.

## The Burden of Proof

We need to stop treating Microservices as the default. It is a radical implementation choice that carries a massive "complexity tax."

Before you earn the right to the "How" (Microservices), you must prove you have defined the "What" (The Constraints). Can you enforce your boundaries in a monolith? Can you handle partial failure in a single process?

If you can't design the cage, don't buy the beast.
