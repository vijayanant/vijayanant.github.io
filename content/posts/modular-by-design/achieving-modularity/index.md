---
title: "Achieving Modularity"
slug: "achieving-modularity"
date: 2025-10-12
draft: false
series: ["Modular by Design"]
series_order: 1
description: "Stop just talking about modularity and start achieving it. This guide introduces effective technique for designing truly modular software."
tags: ["modularity", "software-design", "architecture", "information-hiding"]
categories: ["Software Architecture"]
featured_image: "modularity.jpg"
---

{{< figure
    src="modularity.jpg"
    caption="Photo by [imagine Buddy](https://unsplash.com/@imaginebuddy?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)  on [Unsplash](https://unsplash.com/photos/a-person-placing-a-block-into-a-pile-of-wooden-blocks-bTMTggEt5s4?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)"
>}}

As software developers, we're all taught that modularity is a cardinal virtue. We nod along in meetings, we write it in our design docs, and we praise it in code reviews. We know *why* it's good: it helps us manage complexity, work in parallel, and make changes without breaking everything.

But there's a gap between knowing that modularity is good and knowing how to *achieve* it. This series is dedicated to bridging that gap, guiding you towards becoming **"Modular by Design."**

What does it mean to be "Modular by Design"? It's an architectural philosophy and practice where a software system is intentionally structured as a collection of loosely coupled, highly cohesive modules. This deliberate decomposition is driven by the strategic goal of managing complexity, enabling independent evolution, enhancing maintainability, and fostering adaptability in the face of continuous change. It is the conscious act of crafting a system's boundaries to ensure its long-term health and resilience.

{{< note type="info" title="Modularity as an Architectural Philosophy" >}}
Software architecture is fundamentally about making strategic decisions that impact a system's quality attributes—such as maintainability, evolvability, and scalability. Modularity, through its principles of decomposition, coupling, and cohesion, directly dictates how well these attributes are achieved. Therefore, designing for modularity is not merely a code-level concern; it is a core architectural philosophy that shapes a system's fundamental structure and its ability to meet long-term strategic goals.
{{< /note >}}

When you're staring at a blank editor or a complex business requirement, what is the actual, practical criterion you should use to divide a system into modules to achieve this? This post won't just tell you *what* modularity is. It will teach you a powerful, time-tested technique for *how* to build it. The answer lies in a powerful technique that revolutionized software design. In a seminal 1972 paper, David Parnas introduced a new criterion for modularization called **Information Hiding**.

## The Fork in the Road: Two Ways to Decompose

Imagine we're building a simple e-commerce system. A core task is processing a new order. How do we break this task down into modules? We immediately face a fork in the road, presenting two very different approaches to decomposition.

### Approach 1: The Flowchart Method (Functional Decomposition)

The most intuitive approach, and the one many of us reach for first, is to model the software on the business process. We map out the steps and turn each step into a module. This is appealing because it's easy to explain and it directly mirrors how a non-technical stakeholder might describe the system. It looks like a flowchart.

1. Validate the order data.
2. Calculate the total price, including taxes and discounts.
3. Process the payment through a payment provider.
4. Update the stock inventory.
5. Arrange for shipping with a carrier.

This leads to a modular structure that looks like this: `ValidateOrder`, `CalculateTotal`, `ProcessPayment`, `UpdateInventory`, `ShipOrder`.

This seems logical. It's easy to explain. But it hides a subtle trap. What happens when something changes?

### Approach 2: The Secret Method (Information Hiding)

Parnas argued for a different criterion. Instead of focusing on the steps in a process, he said we should focus on the **secrets**. A module should be designed to hide a "difficult design decision or a design decision which is likely to change."

Let's re-examine our e-commerce system by asking a simple, powerful question: **What are the 'secrets' here?** What are the design decisions that we think are most likely to change in the future?

* The specific rules for calculating sales tax (they vary by region and change often).
* The details of our current discount strategy (e.g., "10% off for new customers").
* The specific API and keys for our payment provider (e.g., Razorpay vs. PayU).
* The way we track product inventory (e.g., is it a simple database counter or a complex, distributed system?).
* The specific API for our shipping carrier (e.g., Delhivery vs. Blue Dart).

Using "information hiding" as our guide, we arrive at a completely different set of modules:

* `Pricing`: Its secret is the complete logic for price calculation, including all tax and discount rules.
* `PaymentGateway`: Its secret is the choice of payment provider and all the details of interacting with it.
* `Inventory`: Its secret is the data structure and logic for how stock levels are managed.
* `Shipping`: Its secret is the choice of shipping carrier and the logic for scheduling a shipment.

{{< figure
    src="functional-vs-information-hiding.svg"
    caption="Comparison of Functional Decomposition and Information Hiding"
    width=600
>}}

## Why the Second Approach Wins

At first glance, both designs seem plausible. But the superiority of the "Information Hiding" approach becomes clear as soon as we imagine a real-world change request.

**Scenario:** The business decides to add a new payment option, PayU, alongside the existing Razorpay integration.

* In the **Functional Decomposition** system, the logic for payment processing is likely spread out. The `ProcessPayment` module will obviously need to change. But what about `ValidateOrder`? It might need to know about different validation rules for PayPal. What about `CalculateTotal`? It might need to handle different currencies. You quickly find yourself hunting through multiple modules to implement a single business change.

* In the **Information Hiding** system, the answer is simple: you only touch the `PaymentGateway` module. The "secret" of which payment provider is being used is perfectly encapsulated. The rest of the system doesn't know or care; it just interacts with a stable, abstract interface that says "process this payment."

This is the magic of information hiding. It creates boundaries that are resilient to change, leading to a system that is easier to maintain, understand, and evolve. As Ted Kaminsky notes, reusability is a happy *consequence* of this approach. The `PaymentGateway` module is now highly reusable precisely because it's not entangled with the rest of the system's logic.

{{< note type="info" title="A Note on Messy Realities" >}}
You might be thinking that in a real system, these boundaries aren't so clean. For example, doesn't the `Pricing` module need to know about shipping costs from the `Shipping` module? Yes, it often does. The key isn't to eliminate all dependencies, but to make them explicit and stable. In this case, the `Pricing` module would depend on the *interface* of the `Shipping` module (e.g., a `getShippingCost()` function), not its internal implementation. The "secret" of the `Shipping` module (whether it uses FedEx or UPS) is still safely hidden.
{{< /note >}}

{{< note type="warning" title="There Are No Silver Bullets" >}}
Information Hiding is a powerful tool, not a magic wand. Like any design principle, it has trade-offs. It can sometimes introduce a small amount of performance overhead due to the indirection of calling through an interface rather than a direct implementation. It can also mean that a seemingly simple change might require you to modify a module's public interface, which can be more work upfront than a "quick fix."

However, these are usually short-term costs that pay for themselves many times over in long-term maintainability and flexibility.
{{< /note >}}

### From Technique to Architecture

It's easy to see Information Hiding as just a low-level coding technique—a way to organize your classes and functions. But it's something much more profound.

Every time you draw a module boundary, you are making a prediction about the future. You are betting on which parts of your system will change and which will stay stable. The collection of these secrets, the things you choose to hide, forms the strategic backbone of your software's architecture. It defines the 'fault lines' along which your system can easily change and evolve.

This is the essence of architectural thinking. It's not about choosing a framework or drawing UML diagrams. It's the art of deciding what matters, what is stable, and what is volatile. Mastering the small-scale technique of hiding one secret is the first step to mastering the large-scale art of designing a resilient and adaptable architecture.

## Actionable Advice for Achieving Modularity

This isn't just theory. You can apply this thinking today.

* **Ask in your next code review:** When someone proposes a new module or class, ask: "What is its secret? What difficult or changeable decision is it hiding?" If the answer is "nothing," it might not be a good module.

* **Use the "Change Test" heuristic:** When designing, think of a likely business change (like a new pricing rule or shipping option). If that change would require you to edit multiple modules, your boundaries may be in the wrong place. A change to a single business policy should ideally require a change to only a single module.

* **Analyze Your Dependencies:** Look at the `import` statements at the top of your file. Each one is a potential source of coupling. Ask yourself: Are you depending on a stable abstraction or a volatile implementation detail of another module? A good dependency is on something that is *less likely to change* than the module you are working on.

* **Start Small:** You don't need to re-architect your entire application. Apply this thinking to the very next feature you build. Encapsulate one "secret" and see how it feels.

For those looking to dive deeper into advanced techniques for identifying secrets and predicting change, including specific heuristics, design patterns, and analytical approaches like Domain-Driven Design, a dedicated "spoke" article will explore these topics in detail.

## Conclusion: The First Step to Being "Modular by Design"

We often think of modularity as an abstract architectural goal. But as we've seen, it can be the result of a concrete, practical technique. By shifting our focus from the *steps in a process* to the *secrets that are likely to change*, we can start building systems that are truly modular.

Now that we have a powerful technique for creating module boundaries, a new question arises: how do we know if we've drawn the lines in the right place? How do we measure the quality of our modules?

In the next post in this series, we'll explore the critical concepts of **coupling and cohesion**, which provide the metrics we need to evaluate our modular design and ensure we're building a system that is built to last.

## Further Reading

* [**On the Criteria To Be Used in Decomposing Systems into Modules**](https://dl.acm.org/doi/10.1145/361598.361623) by David L. Parnas. The seminal 1972 paper that formally introduced the concept of Information Hiding. A foundational text for modern software design.

* [**Software Architecture in Practice**](https://www.oreilly.com/library/view/software-architecture-in/9780136885979/) by Len Bass, Paul Clements, and Rick Kazman. A foundational text in software architecture that extensively discusses modularity as a core architectural concern and its impact on quality attributes.
