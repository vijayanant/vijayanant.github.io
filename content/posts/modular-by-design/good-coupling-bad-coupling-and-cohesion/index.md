---
series: ["Modular by Design"]
series_order: 2
title: "Good Coupling, Bad Coupling, and Cohesion"
slug: "good-coupling-bad-coupling-and-cohesion"
date: 2023-11-18
draft: false
description: "Spaghetti Pasta is Good, Spaghetti Code is Bad!"
featured_image: "good-coupling-bad-coupling-and-cohesion-1.jpg"
tags: ["coupling", "cohesion", "modularity"]
categories: ["Software Architecture"]
---
{{< figure src="good-coupling-bad-coupling-and-cohesion-1.jpg" alt="brass-colored chain machine" caption="Photo by [Jay Heike](https://unsplash.com/@jayrheike) on [Unsplash](https://unsplash.com)" >}}

In the last post, we discovered a powerful technique for achieving modularity: hiding secrets. We learned to draw boundaries based on what we predict will change. But this raises a critical question: how do we know if we've drawn the boundaries in the right place? A bad boundary can be worse than no boundary at all.

To judge our work, we need to develop a critical eye by learning a new language. This language has three key terms—loose coupling, tight coupling, and cohesion—and they play a role very similar to the three titular characters in the movie _‘[The Good, the Bad and the Ugly](https://en.wikipedia.org/wiki/The_Good,_the_Bad_and_the_Ugly)’_. Each has its own distinct characteristics, and understanding them is the key to crafting a maintainable, reusable, and ultimately successful software system. These metrics are fundamental to building systems that are truly **"Modular by Design."**

## **The Good: Loose Coupling and High Cohesion**

In software design, good coupling translates to loose coupling, where modules
are independent and changes in one module have minimal impact on others. This
promotes modularity, making code easier to understand, maintain, and test.

High cohesion, on the other hand, refers to modules that focus on a single
well-defined purpose, with elements within the module working together
seamlessly. This enhances code readability, understandability, and
maintainability, as the module's purpose is clear and its components are
cohesive.

{{< newsletter type="simple" >}}

## **The Bad: Tight Coupling and Low Cohesion**

Tight coupling, the antithesis of loose coupling, occurs when modules are
tightly interwoven, making changes in one module ripple through the entire
system. This can lead to a tangled mess of code that is difficult to
understand, maintain, and test.

Low cohesion, the opposite of high cohesion, arises when modules lack a clear
purpose and contain elements that serve multiple unrelated tasks. This can
make code confusing, difficult to modify, and prone to errors.

## **The Ugly: The Consequences of Ignoring Coupling and Cohesion**

The consequences of ignoring coupling and cohesion can be severe, leading to
software that is difficult to maintain, extend, and test. Tightly coupled and
poorly cohesive code can become a tangled web of dependencies, making it
challenging to isolate and fix problems.

Moreover, low cohesion can lead to God classes, modules that contain a vast
array of unrelated functionalities, making them cumbersome to understand and
modify. These monolithic structures can stifle code reusability and hinder the
overall development process.

## **Striving for Balance: The Ideal Coupling and Cohesion**

The goal of good software design is to strike a balance between coupling and
cohesion, aiming for loose coupling and high cohesion. This balance promotes
modularity, readability, and maintainability, making code easier to
understand, modify, and test.

By adhering to principles of loose coupling and high cohesion, developers can
create software that is adaptable, reusable, and ultimately more successful in
meeting its intended purpose.

## **The Anatomy of Good Coupling**

Loose coupling is the hallmark of well-structured software, and the **Information Hiding** technique we learned in the previous post is the primary tool we use to achieve it. When we hide a module's "secret" behind a stable interface, we are actively breaking the dependencies that lead to tight coupling. In such a case, modules are independent entities, interacting through those well-defined interfaces. Changes in one module have minimal impact on others, which strengthens module boundaries and enhances maintainability.

Loose coupling promotes code reusability, as modules can be easily integrated
into different applications without extensive modifications. It also
facilitates testing, as modules can be isolated and tested independently,
reducing the complexity of the testing process.

**Examples of Good Coupling Practices:**

  * **Favour dependency injection:** Instead of hardcoding dependencies within a module, rely on dependency injection to provide dependencies at runtime. This promotes loose coupling and makes modules more adaptable. Concrete code examples illustrating this will be provided in a dedicated "spoke" article.

  * **Utilise abstraction layers:** Abstract layers act as intermediaries between modules, decoupling them and preventing direct dependencies. This promotes loose coupling and enhances flexibility.

  * **Encapsulate data within modules:** Modules should encapsulate their data, preventing external access and modification. This reduces coupling and promotes modularity.

## **The Pitfalls of Bad Coupling**

Tight coupling is the nemesis of maintainable code. In this scenario, modules
are inextricably intertwined, with changes in one module rippling through the
entire system. This leads to a tangled mess of code that is difficult to
understand, modify, and test.

Tight coupling can hinder code reusability, as modules become entangled and
cannot be easily integrated into different applications. It also complicates
testing, as changes in one module require extensive testing throughout the
system.

**Examples of Bad Coupling Practices:**

  * **Directly accessing internal data of another module:** This creates a tight dependency, making it difficult to modify one module without affecting the other.

  * **Passing large data structures between modules:** This increases coupling, as changes in the data structure can necessitate modifications in multiple modules.

  * **Using global variables:** Global variables introduce tight coupling, as any module can access and modify them, making it challenging to track dependencies and changes.

## **The Essence of High Cohesion**

If loose coupling is about the relationship *between* modules, high cohesion is about the character *of* a single module. It's the principle that the elements inside a module should be closely related and focused on a single, well-defined purpose.

But why does this matter? The true power of high cohesion is that it gives a module a **single reason to change**.

This connects directly to the "Information Hiding" principle from our first post. A module designed to hide one "secret" (e.g., the details of a payment provider, the rules for tax calculation) will naturally have high cohesion. All the code inside it—the data structures, the functions, the logic—is there to support that one secret. When the business needs to change that secret, you know exactly which module to edit. You don't have to hunt through the codebase, because the module is a cohesive, self-contained unit.

**Examples of High Cohesion Practices:**

  * **Create modules with a single purpose:** Each module should focus on a specific task or responsibility, promoting cohesion and reducing scattering of functionalities.

  * **Group related functions together:** Functions that perform related tasks should be grouped within the same module, enhancing cohesion and making code more organised.

  * **Avoid God classes:** God classes, modules that contain a vast array of unrelated functionalities, should be avoided. Divide them into smaller, more cohesive modules.

## **The Consequences of Low Cohesion**

Low cohesion arises when modules lack a clear purpose and contain elements
that serve multiple unrelated tasks. This can make code confusing, difficult
to modify, and prone to errors.

Modules with low cohesion can lead to duplication of code, as the same
functionality may be scattered across different parts of the module. This
makes code maintenance challenging and increases the risk of errors.

**Examples of Low Cohesion Practices:**

  * **Mixing unrelated functionalities within a module:** This reduces cohesion and makes the module's purpose unclear.

  * **Including unrelated data within a module:** Data that is not directly related to the module's purpose should be moved to a more appropriate location.

  * **Creating overly large modules:** Large modules can become difficult to manage and maintain, making it challenging to understand and modify their functionalities.

## **Striking the Right Balance**

The ultimate goal of software design is to achieve a balance between coupling
and cohesion, aiming for loose coupling and high cohesion.

Remember, loosely coupled code is not the same as zero-coupled code. There is
always some degree of coupling between modules in a system. This is because
modules always need to communicate with each other in some way, and this
communication always creates some level of dependency.

The goal of loose coupling is to minimise this dependency as much as possible.
This is done by using well-defined interfaces and standardised protocols to
communicate between modules. This makes it easier to change or replace modules
without affecting other modules. Even if modules communicate through well-
defined interfaces, they still need to share some data with each other. This
data can create a dependency between the them.

{{< summary title="Key Takeaways" >}}
*   **Cohesion:** How well the elements *inside* a single module belong together. **High cohesion** is our goal.
*   **Coupling:** The degree of interdependence *between* modules. **Loose coupling** is our goal.
*   **The Goal:** A module should have a single, well-defined reason to change (High Cohesion) and should depend on as few other modules as possible (Loose Coupling).
*   **The Litmus Test:** A change to a single business policy should ideally require a change to only a single module. If not, you may have low cohesion or tight coupling.
*   **Validation through Testing:** Robust testing strategies (unit, integration, contract) are essential for continuously validating and enforcing modular boundaries. (A deeper dive into this topic will be explored in a separate post.)
{{< /summary >}}

Striving for high cohesion and loose coupling isn't just a technical exercise; it's how we validate our design decisions and ensure the module boundaries we create are sound. It is the art of building a system from parts that are both self-contained and gracefully interconnected.

This timeless struggle between coupling and cohesion is not a new problem. In fact, it is one of the central, driving forces in the history of software architecture. To truly master these concepts, we must look to the past and see how generations of developers have wrestled with these same forces. In our next post, we'll take a journey through the ages to do just that.

{{< newsletter type="simple" >}}
