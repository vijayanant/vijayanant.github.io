---
title: "Deriving Your Real Architectural Drivers"
slug: "deriving-your-real-architectural-drivers"
subtitle: "Great architecture doesn't start with a solution. It starts with a deep, honest understanding of the problem"
date: 2025-10-08T09:01:00-07:00
draft: false
series: ["From Patterns to Practice"]
series_order: 2
categories: ["Software Architecture"]
tags: ["decision-making", "architectural-style", "trade-off", "adr"]
description: "Learn how to translate vague business goals into concrete, measurable architectural drivers using Quality Attribute Scenarios (QAS) to identify and address critical risks."
featured_image: "driving.jpg"
---

{{< figure src="framework_roadmap.svg" alt="Framework Roadmap" >}}

## Introduction: The Danger of Vague Goals

In our last post, you were put in the shoes of the architect at CityPulse, caught in a classic conflict between speed and scale. It's tempting to jump right into a debate about solutions—Monolith vs. Microservices!—but you know that's putting the cart before the horse.

Why? Because the terms "speed" and "scalability" are still too vague. They are labels for a problem, not a description of it. To make a professional decision, you can't compare solutions against generic concepts; you must evaluate them against the specific, concrete risks within your business domain. Before you can open the toolbox, you have to map the territory.

This post is about that critical, and often-skipped, next step: conducting a "just enough" analysis of the business problem to derive the *real* architectural drivers you need to design for.

## From Risk to Requirement: A Practical Method

So, how do you get from a vague fear to a concrete requirement? You start by mapping the critical business workflow to find the points of highest risk. For CityPulse, the entire business risk is concentrated in the ticket purchasing flow during a flash sale.

{{< note type="log" title="Architect's Log" >}}
This is a crucial realization. Most systems don't need to scale everywhere. They need to scale where the business-critical load is concentrated. Identifying this specific, narrow point of pressure is half the battle. We're not solving a generic 'scalability' problem; we're solving a very specific 'transactional throughput' problem.
{{< /note >}}

So how do you turn a vague goal like "scalability" into a concrete engineering target? You need a tool to structure your thinking. The best tool for this is the **Quality Attribute Scenario (QAS)**.

*(For a complete reference on the most common QAs and a deeper look at the QAS Canvas, check out our full deep-dive guide here.)*

{{< figure
    src="02-qas-canvas.svg"
    alt="A diagram showing the five parts of the QAS Canvas: Source, Stimulus, Environment, Response, and Response Measure."
    caption="Figure 1: The QAS Canvas provides a simple structure to translate vague goals into testable requirements."
    width="300"
>}}

It's a simple story format that forces you to be specific. As the architect, you'd walk through it like this:

"First, who is the **Source** of the problem? It's a large number of concurrent users. What is the **Stimulus** they're creating? They are all attempting to purchase tickets at once. What is the **Environment**? The system is under a flash sale, which is otherwise a normal operating condition. What **Response** do we need? The system must process the purchases successfully. And finally, what is the **Response Measure**—the number that defines success? Let's say we need to handle 1,000 purchases per second."

By following that simple narrative structure, you've created a concrete, testable requirement:

*"A large number of concurrent users (Source) attempt to purchase tickets (Stimulus) during a flash sale (Environment). The system must process at least 1,000 purchases per second (Response Measure)."*

You can apply this same thinking to the other drivers, turning vague goals into a professional specification.

{{< note type="log" title="Architect's Log" >}}
A word of caution: while these numbers look precise, they are often just well-informed guesses. Will it really be 10,000 users, or 20,000? Is a 1.5-second page load really the magic number, or is 1.7 acceptable? Don't get trapped by the precision of your own metrics. The goal of a QAS isn't to predict the future perfectly; it's to create a reasonable, shared target that is an order of magnitude better than a vague feeling.
{{< /note >}}

{{< summary title="Key Takeaways" >}}

* Don't start with solutions. Start by analyzing the specific business problem and its critical workflows.
* Identify the points of highest risk in those workflows. This is where your architectural focus should be.
* Use the QAS framework (Source, Stimulus, Environment, Response, Measure) to translate vague goals into specific, measurable drivers.
{{< /summary >}}

## Now You Know the Real Problem

This changes everything. You're no longer debating vague concepts. You now have a precise, measurable, and prioritized set of engineering targets derived directly from the business risks. You've translated the story into a specification.

You know you need a system that can handle high transactional throughput on a small part of its workflow, with high reliability, while ensuring the rest of the site remains performant—and it all has to be built in three months.

Now, and only now, are you ready to make your first, most fundamental architectural decision. You need to choose the **Architectural Style** that will define the entire structure of your system. In our next post, we will analyze the three primary candidate styles—the Monolith, Microservices, and the Event-Driven approach—and see how they stack up against these specific, measurable drivers.

## Further Reading

* [**Software Architecture in Practice, 3rd Edition**](https://www.informit.com/store/software-architecture-in-practice-9780132942773) by Len Bass, Paul Clements, and Rick Kazman. This is the canonical source for Quality Attribute Scenarios.
* [**"Documenting Quality Attributes"**](https://resources.sei.cmu.edu/asset_files/technicalnote/2003_001_001_14246.pdf) - a detailed look at Quality Attribute Scenarios from the Software Engineering Institute (SEI).
