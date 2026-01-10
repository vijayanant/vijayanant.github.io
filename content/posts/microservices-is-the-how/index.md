--- 
title: "Microservices is not the architecture, it is the 'How'"
subtitle: "It is the 'How', not the 'What'"
date: 2026-01-09
draft: true
categories: ["Software Architecture"]
tags: ["microservices", "architecture-philosophy", "constraints", "topology"]
description: "Stop telling people you have a microservices Architecture. Learn
the difference between the nature of your system, the constraints that protect
it, and the topology you choose to enforce them." 
featured_image: "artifact-trap.svg"
--- 

"What is your architecture?"

You will hear 9 out 10 people respond with "We use Microservices".

What does it tell you about their architectural choices? What does it tell you
about what they sacrificed or compromised?

## The Adjective

We don't say our architecture is "Events." We say it is **Event-Driven**.
We don't say our architecture is "A Bix Box." We say it is **Monolithic**.

Architecture is an adjective. It describes the nature of your system. If you
tell me you have a "Microservices Architecture," you have not told me anything
about about how the system actually behaves.

Is it decentralised? Eventually consistent? Reactive?

Most microservices I encounter are monolithic in nature. I have seen instances
where multiple 'pods' are running on single machine. Simply have 3 of those
servers for availability. Oh, don't forget, all three pods have to be deployed
whenever we change something in one of those microservices.

If all of your services can be deployed on a single server, (3 pods) and you have to deploy them together, you paying microservices tax without any benefits.

## Architecture is the pain you choose

We have all see the architecture slide deck that look more like a birthday wish list filled with words like *Resilient, Scalable, and Highly Available*.

But a wish list is not the architecture.

Architecture lives and dies by its constraints. It is the set of boundaries you choose do defend to ensure that the very nature of the system survives the pressure of the deadline. If you can't name what is forbidden or what you are sacrificing, you do not have a architecture. You have a wish list.

* **An Amateur**: "We want "High Availability."
* **An Expert**: "We will accept **Eventual Consistency** to ensure High Availability"

## Microservices Is Just The Enforcement

If Architecture is the set of constraints, the Microservices is merely a physical topology used to ensure them.
