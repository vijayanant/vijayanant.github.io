---
title: "TDD: What Most Articles Miss"
slug: "tdd-what-most-articles-miss"
subtitle: "Uncovering the Design Discipline You Didn't Know You Were Missing"
date: 2023-05-21
draft: false
description: "Uncovering the Design Discipline You Didn't Know You Were Missing"
featured_image: "tdd-what-most-articles-miss-1.jpg"
tags: ["tdd", "testing", "software-design", "agile"]
categories: ["Programming"]
---
{{< figure src="tdd-what-most-articles-miss-1.jpg" alt="person writing on paper at lap" caption="Photo by [Jason Coudriet](https://unsplash.com/@jcoudriet) on [Unsplash](https://unsplash.com)" >}}

## Beyond the Ritual

You've probably heard about Test-Driven Development (TDD) – the “Red, Green,
Refactor” cycle, writing tests before code, that whole drill. As popularised
by pioneers like **[Kent Beck](https://substack.com/@kentbeck)** in his
book [Test-Driven Development: By Example](https://www.amazon.in/Test-Driven-Development-Kent-Beck/dp/0321146530), it's often presented as a
disciplined way to ensure code quality, catch bugs early, prevent regressions,
and even boost test coverage. And yes, it does all those things.

{{< note type="info" >}}
But if that's all you take away, you're missing the real power. TDD isn't just
a testing technique. It's fundamentally a **design discipline** that deepens
your understanding of the **problem and business domain** as it shapes your
code from the ground up.
{{< /note >}}

This post isn't about the basics you find everywhere. We're **uncovering** the
critical, often unmentioned parts of TDD that transform it from a mere ritual
into a powerful design tool.

## The “Unit”: Reclaiming Its True Meaning

Many TDD resources define a “unit” as a class or a function. That's a common
misunderstanding of the true TDD practice. While the resulting codebase _will_
contain small, testable methods and classes, the “unit” that _drives_ your
development in TDD is, as Kent Beck emphasised, the **smallest slice of
desired behaviour.** This represents a granular interaction or outcome,
designed to directly guide the design and implementation of your next piece of
code.

Think of it in this way: instead of starting by defining a class `UserService`
with a method `createUser()`, you'd start by defining a test for the
behaviour:

```python
when_a_new_user_signs_up_then_they_should_have_a_default_role() {
  ...
}
```

This test defines an _outcome_ from the user's perspective.

This behaviour-first approach forces you to think about the public API and
interactions needed to achieve that feature. As you write the test, you're
acting as the first consumer of your future code. This naturally guides the
**emergence of your design**. You're not implementing a predefined
architecture. Instead, the necessary classes, interfaces, and methods (the
true internal “units”) reveal themselves and get created only as they're
needed to make that specific feature test pass.

## Code Evolves, So Should Tests

Here's another “missing part”: your tests are not static. They are living,
evolving artefacts, just like your production code. Many view tests as fixed
validations, but in TDD, your test suite is a dynamic component that changes
alongside your design.

When you evolve your code's public interfaces to support new features or
requirements (e.g., adding a mandatory parameter to a constructor or a new
required field), older tests relying on the previous interface will indeed
fail. These failures might even present as compilation errors. This kind of
test evolution, reflecting interface changes, is particularly common in early
development cycles, as design and code structure are incrementally taking
shape. In a well-established, stable codebase, significant breaking changes to
external interfaces should become rare. Such breaks are never a TDD failure;
rather, they are powerful signals from your tests. They highlight exactly
where your code's external contract has changed, indicating precisely where
your assumptions and existing tests need to be updated to align with the new
functionality and design.

Conversely, ideally, refactoring should improve code's internal structure
without breaking existing tests. If tests frequently fail during such
refactoring, it often signals that the tests themselves are too tightly
coupled to implementation details, highlighting a need to refactor the tests
to be more resilient and behaviour-centric.

The “Refactor” step in TDD applies equally to your test code. You constantly
refine tests for clarity, remove duplication, and adjust them to mirror your
improved production code. If an internal functionality is refactored away or
becomes irrelevant, its corresponding test might be removed. This ensures your
test suite remains clean, focused, and a reliable safety net for your evolving
design.

## The Design-Driven Rhythm

The core TDD rhythm remains Red-Green-Refactor. But with a design-first
mindset, each step becomes a deliberate act of shaping your system:

### Red: Design the API, Define the Behaviour

This is your design phase. You write a failing test for the _next smallest
piece of behaviour_. This act forces you to consider:

* **How will this new functionality be used?** (Defining the public interface/API from a consumer's perspective.)
* **What inputs does it need?**
* **What output or side effect is expected?** This process immediately drives clarity around required interactions, pushing towards clean, testable interfaces. The failing test confirms the behavior doesn't exist yet. This validates both your test and your design intent.

### Green: Implement Minimal Functionality

Here, your sole focus is to make the new test pass. Write _just enough_ code.
Don't worry about perfection, elegance, or long-term design yet. This keeps
you focused on the specific behaviour. You might even “hardcode” a return
value if that's the simplest way to get to green. The goal is rapid feedback.
This confirms the test is correctly written and that minimal code delivers the
desired Behaviour.

### Refactor: Improve Design, Sustain Quality

Once all tests are green (including the new one), you have a safety net. This
is where you transform the provisional “green” code into a robust, well-
designed solution. As [Robert C. Martin](http://www.cleancoder.com/products)
eloquently advocates in [Clean Code](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882), and further informed by
[Martin Fowler](https://www.martinfowler.com/)'s
[Refactoring: Improving the Design of Existing Code](https://www.amazon.in/Refactoring-Improving-Existing-Addison-wesley-Signature/dp/0134757599), this phase
involves:

* **Improving production code:** Removing duplication, extracting responsibilities, simplifying logic, choosing better names. These are all design improvements.
* **Improving test code:** Refactoring tests for clarity, removing setup duplication, making them more resilient to future changes. A clean test suite is vital for a healthy TDD practice. This continuous cycle ensures your codebase remains clean, maintainable, and adaptable. Critically, your tests guarantee no regressions are introduced during these design improvements.

## The Payoff of Test-Driven Design

When you truly embrace TDD as a design discipline, the payoff transcends mere
bug prevention. It fundamentally alters how you build software, leading to:

### **Organic, Adaptable Architecture**

By designing from behaviour and letting internal “units” emerge, your
architecture isn't rigid or defined upfront. It grows organically, constantly
adapting to new requirements and a deeper understanding of the problem and
business domain. This iterative evolution prevents the costly rework
associated with fixed, big-design-up-front approaches.

### **Cohesive and Loosely Coupled Code**

The practice of writing tests first, especially for behaviour, naturally
guides you towards designing public interfaces that are clean and easy to use.
This discipline promotes highly cohesive components with minimal dependencies,
making your codebase inherently more modular, resilient to change, and a
pleasure to navigate.

### **Developer Confidence for Fearless Change**

With a test suite that functions as a living, executable specification of your
system's behaviour and evolving design, you gain unparalleled confidence. This
safety net empowers you to refactor aggressively, introduce new features, and
even explore significant architectural shifts without the constant fear of
breaking existing functionality.

### **Tests as Living Design Documentation**

Your comprehensive test suite becomes the most accurate, up-to-date
documentation of your system's behaviour and its intended design. Unlike
static documents that quickly fall out of sync, these executable tests always
reflect the true state of the code, providing an invaluable resource for
anyone working on the project.

### **Proactive Quality Assurance**

The mandatory “Refactor” step, coupled with the immediate feedback from your
robust test suite, ensures that design flaws and code smells are identified
and addressed continuously. This proactive vigilance prevents the erosion of
code quality and the unintentional accumulation of issues, leading to a much
healthier and more maintainable codebase over the long term.

## Embrace the Discipline

{{< summary >}}

* If you've approached TDD as just a testing technique, it's time to shift your
perspective. The true power lies in embracing it as a comprehensive **design
discipline**. It's a journey from simply following a ritual to truly
understanding and leveraging the profound influence tests have on the
architecture and quality of your software.

* By reimagining the “unit” as behaviour, understanding that your tests are
dynamic and evolve with your design, and leveraging each step of the Red-
Green-Refactor cycle to explicitly drive design, you unlock a far more
effective and rewarding way to build software. It's about letting your design
emerge organically, building confidence with every passing test, and creating
a codebase that is a joy to evolve.

* Don't just _do_ TDD. Learn to _think_ TDD. The payoff for your software, and
your development process, will be immense.
{{< /summary >}}

{{< newsletter type="simple" >}}
