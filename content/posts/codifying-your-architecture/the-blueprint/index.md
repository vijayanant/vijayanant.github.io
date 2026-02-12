---
title: "The Directory is the Diagram"
slug: "the-directory-is-the-diagram"
subtitle: "Why Your File Tree Should Scream Your Intent"
date: 2026-01-10
draft: false
series: ["Codifying Your Architecture"]
series_order: 1
categories: ["Software Architecture"]
tags: ["modularity", "architecture-as-code", "package-by-component", "screaming-architecture", "code-structure"]
description: "Stop hiding your business logic in 'service' and 'repository' folders. Learn how to use 'Screaming Architecture' to make your file tree a direct reflection of your system's intent."                                                     
featured_image: "blueprint-featured.svg"
---

{{< figure src="blueprint-featured.svg" alt="Abstract architectural blueprint contrasting an entangled messy dependency graph with a structured, modular one." >}}

You open a new codebase or even your own project from long time ago. You look at the file tree in your editor. What do you see?

Open almost any project. You’ll see a sea of directories that describe the code’s technical role, not its business purpose. I've encountered this in almost every ecosystem; it's the default starting point for many frameworks, but it's a convention that fails to scale as a project grows. For example:

* In a **Java Spring** application, you might see packages like `com.example.web`, `com.example.service`, and `com.example.repository`.
* In a **Ruby on Rails** or **.NET MVC** app, you'll find top-level directories named `controllers`, `models`, and `views`.
* **React?** `components`, `hooks`, `api`. That's it.

In every case, the structure tells you about the code's technical role. It’s a controller. It’s a service. Or a UI component.

But what is the business capability? You can't tell. Managing ticket payments? Calculating user reputation? It’s all invisible, buried under a generic structure that the framework likely forced on you from day one.

{{< note type="info" title="Imposed vs. Encouraged" >}}
The degree of enforcement varies. Some frameworks, like Next.js with its file-based routing, technically *impose* a certain structure. In other ecosystems, like Spring Boot, it's less of a technical requirement and more a powerful **common practice** driven by documentation and tutorials. In either case, the result is the same: the business domain gets lost behind technical layers.
{{< /note >}}

This marks the start of a new series: **Codifying Your Architecture**.

The mission is to close the gap between the whiteboard and the IDE. I want to stop treating architecture as a set of lofty, abstract principles and start treating it as something tangible that you can actually see and enforce in your code. If my architecture doesn’t manifest as a physical constraint within my codebase, is it truly my architecture, or just a shared hallucination?

We’ve known the solution for decades. People like Robert Martin have been shouting about "Screaming Architecture" since 2011, urging us to close the "model-code gap" and write "architecture-haunted code." Yet, the central truth remains ignored: architecture that isn’t visible in the code is just a fantasy. In this post, I'll explore how to make your architecture **manifest through its structure**, how to enforce its boundaries directly in your codebase, and how this tangible approach closes the gap between whiteboard dreams and codebase reality.

## Ilities are Goals, Dependencies are Mechanisms

In my previous series, [**From Patterns to Practice**]({{< ref "/series/from-patterns-to-practice" >}}), I discussed architecture in terms of "ilities" (Quality Attributes like Scalability, Modularity, Reliability, and Maintainability). These "ilities" are the **goals**; they describe *why* I'm building it a certain way.

But a goal like "Scalability" doesn't just live in a Jira ticket or a PowerPoint slide. It lives in the code. If `Module A` is tightly coupled to `Module B` in a way that prevents independent deployment, you have inadvertently fused them into a single [**Architectural Quantum**]({{< ref "/posts/architectural-quantum-modular-deployable-architecture" >}}). By fusing them into a single quantum, you've just killed your scalability goal.

This brings me to the core reconciliation: **The "Ilities" are the *Goal*. The "Dependencies" are the *Mechanism*.**

We cannot [**Achieve Modularity**]({{< ref "/posts/modular-by-design/achieving-modularity" >}}) (the Goal) without Encapsulation and controlled Dependencies (the Mechanisms). If we care about Maintainability, we must ensure that a change in one part of the system doesn't unexpectedly break another. The only way to guarantee that is by meticulously distinguishing between [**Good Coupling and Bad Coupling**]({{< ref "/posts/modular-by-design/good-coupling-bad-coupling-and-cohesion" >}}).

Strip away the lofty principles, and you're left with one reality: architecture is about defining and enforcing **dependencies and boundaries**. Your dependency graph is the physical reality of your architectural choices, acting as the guardrails that ensure the "ilities" you promised on the whiteboard actually survive in the IDE.

{{< note type="info" title="The Many Faces of Architecture" >}}
Software Architecture is a vast discipline encompassing infrastructure, data consistency, security protocols, and even team organization. However, when we focus on architecture within the codebase, dependencies are the primary way your design choices manifest. The compiler doesn't understand abstract scalability goals; it only understands which modules are allowed to interact with each other.
{{< /note >}}

## Building the Structure

To build a structure that reveals its intent, you stop organizing by technical layers and start organizing by business capability. I'll use **Java** for this example to demonstrate how standard language features can enforce architectural intent, but the concepts apply to any language.

**Before (Package by Layer):**

```text
src/main/java/com/citypulse/
├── controllers/
│   ├── TicketController.java
│   ├── PaymentController.java
│   └── UserController.java
├── services/
│   ├── TicketService.java
│   ├── PaymentService.java
│   └── UserService.java
└── repositories/
    ├── TicketRepository.java
    ├── PaymentRepository.java
    └── UserRepository.java
```

**After (Package by Component / Screaming Architecture):**

```text
src/main/java/com/citypulse/
├── ticketing/
│   ├── TicketService.java         <-- PUBLIC: The only entry point
│   ├── web/                       
│   │   └── TicketController.java  <-- Internal: Adapter (driving)
│   ├── domain/
│   │   ├── Ticket.java            <-- Internal: Domain Logic
│   │   └── TicketRepository.java  <-- Internal: Interface (port)
│   └── persistence/
│       └── JpaTicketRepository.java <-- Internal: Adapter (driven)
├── payments/
│   ├── PaymentService.java
│   ├── web/
│   ├── domain/
│   └── persistence/
└── users/
    ├── UserService.java
    ├── web/
    ├── domain/
    └── persistence/
```

In this structure, the `ticketing` package acts as a distinct module.

{{< figure src="package-by-component.svg" alt="A diagram comparing a directory structure organized by technical layers versus one organized by business components." caption="A visual comparison of the two primary code organization strategies." >}}

{{< note type="warning" title="The 'Shared' Gravity Well" >}}
Experienced developers know that as soon as you start creating components, someone will ask: *"Where does the DateHelper go?"*

The temptation is to create a `common/` or `shared/` directory. Be extremely careful. `shared` is where modularity goes to die. Every time you add a class to a shared module, you create a "gravity well" that couples every other component together. If two modules need the same three helper functions, I often prefer **Duplication over Coupling**. Copy the code. Keep the boundaries clean.
{{< /note >}}

{{< note type="info" title="Is This Over-Engineered?" >}}
You might look at the nested directories (`web`, `domain`, `persistence`) for a simple feature and think: "This is too much." For a CRUD app, you are right. But we are designing for *evolvability*.

By explicitly separating `web` (HTTP concerns) from `domain` (Business Logic), we ensure that a change to our API framework doesn't ripple into our business rules. We accept a little extra directory nesting today to prevent a "Big Ball of Mud" tomorrow.
{{< /note >}}

## Is This Just Renaming Directories?

At this point, a natural question arises, perhaps with a mocking tone: "So, architecture is just about directory names? `TicketingController`, `TicketingRepository`, and `TicketingModel` instead of `Controller`, `Repository`, and `Model`?"

Fair question. If you just move files around without changing your mindset, it *is* meaningless. We haven't architected anything. We have just rearranged the furniture. The directory structure is the **physical manifestation** of your architecture, designed for human cognition. But the real architecture lives in the **logical constraints** that structure enables you to enforce.

One is for your team to understand the domain; the other is for your build tool to protect it.
{{< note type="log" title="Architect's Log: The 'Where Does This Go?' Friction" >}}
I have fought this battle in a dozen codebases. The hardest part isn't the file move; it's the muscle memory. Developers are addicted to "Buckets of Types" (like a `controllers/` directory) because they don't have to think about the *domain* to file a new class. It's lazy, and it’s the exact reason why six months into a project, nobody knows where anything actually lives.

When you switch to Package by Component, you force a difficult question at the moment of creation: *"What business capability does this code serve?"* This friction is a feature, not a bug. It forces architectural thinking into the daily coding loop.
{{< /note >}}

Here's the deeper reality of what this enables:

### 1. It’s About Encapsulation

In a traditional "Package by Layer" approach (e.g., `src/controllers`, `src/services`, `src/repositories`), almost everything has to be public or exported. This means a `PaymentService` can casually bypass the `TicketingService`'s business logic and directly grab data from `TicketRepository` if `TicketRepository` is also public. That's architectural rot, leading to a "distributed monolith" in microservices contexts or an entangled mess in a monolith.

In a "Package by Component" or "Screaming Architecture" approach, you group `TicketController`, `TicketService`, and `TicketRepository` within a `Ticketing/` directory. Now, `TicketRepository` can be made package-private or internal. The rest of the application can only interact with the well-defined public interface of the `Ticketing` component (e.g., exposed by `TicketService`).

This is the practical implementation of [**Strong Module Isolation**]({{< ref "/posts/modular-by-design/modularity-through-the-ages" >}}) where we physically prevent other parts of the app from coupling to internal details by enforcing encapsulation directly in the code.

Crucially, in Java, within each component's root package (`com.citypulse.ticketing`), you would make **only the `TicketService.java` class `public`**.

Other classes like `Ticket`, `TicketRepository` (interface), `TicketController`, and `JpaTicketRepository` can be made **package-private** (default visibility). This means no other package outside `com.citypulse.ticketing` can accidentally import the `Ticket` domain object or call `JpaTicketRepository` directly. They *must* go through the defined public API (`TicketService`).

{{< figure src="component-encapsulation.svg" alt="A diagram showing PaymentService being allowed to access TicketService but blocked from accessing TicketRepository." caption="Visualizing strict encapsulation: The 'TicketRepository' is physically invisible to the 'Payments' module." >}}

{{< note type="tip" title="Advanced: Java Modules (JPMS)" >}}
For even stricter enforcement, you can use the Java Platform Module System (JPMS). By creating a `module-info.java` for each component, you can explicitly `export` only the packages you want to be public. This enforces boundaries at the compiler level, though it comes with increased build configuration complexity.
{{</ note >}}

### 2. It’s About Dependency Direction

Architecture is defined by what depends on what.

If your directory structure looks like `src/ticketing` and `src/payments`, you can finally draw a line in the sand. Ticketing can use Payments. Payments cannot use Ticketing. Simple. Tools can enforce this, and the "knot" never forms in the first place.

{{< figure src="dependency-rules.svg" alt="A diagram comparing a healthy acyclic dependency graph versus a toxic cyclic dependency graph (Order -> User -> Payment -> Order)." caption="Healthy architecture flows in one direction. Cycles (like the 'Loyalty Cycle') create knots that make independent evolution impossible." >}}

### 3. The "Extraction" Test

This serves as a practical stress test for the strength of my architectural boundaries.

**Scenario:** Your `Ticketing` domain has grown too large or complex for its current home (whether that's a Monolith or an existing Microservice) and needs to be split into its own independently deployable unit.

* **Layered/Framework Architecture:** You have to hunt through `controllers/`, `services/`, `models/`, and `utils/`, untangling thousands of cross-references. This "surgery" is so risky and expensive that teams often decide to just live with the bloat, leading to the "Big Ball of Mud."
* **Screaming Architecture (Package by Component):** You drag the `Ticketing/` directory out of the project. You fix a handful of compile errors where the component's well-defined public interface was called. You are done.

The structure facilitates this future evolution because the architectural boundary is already clear and enforced.

{{< note type="log" title="Architect's Log: The 10% Solution" >}}
Let's be realistic: dragging a directory out of a project is only the first 10% of extracting a microservice. You are only solving for **Connascence of Name** (imports).

The real pain lives in the other 90%: Connascence of Data (shared database tables) and Connascence of Timing (synchronous call chains). A clean directory structure isn't a magic wand that creates microservices; it is simply the *prerequisite* that makes tackling the harder 90% survivable.
{{< /note >}}

{{< note type="warning" title="The 'Microservices' Trap" >}}
It is common to think, *"We use Microservices, so we don't need this; our boundaries are the network calls."*

Be careful. Service boundaries are rarely perfect on day one. A "User Service" often grows to encompass "Auth," "Profiles," and "Preferences." If the *internal* code of that service isn't modular, you can't split it later when it inevitably becomes a bottleneck. You end up with a "Distributed Monolith": services that are too big to maintain but too entangled to split.
{{< /note >}}

## Enforcing the Boundaries

If the directory structure is the map, then automated tools are the border patrol. Without them, your boundaries are just suggestions. People will cross them. They’ll smuggle in a "quick" import from another module just to meet a deadline. Eventually, your "sovereign" components become a single, messy territory again.

You need guards at the gate. You need a system that checks every single "crossing" (import) and turns back anyone without the proper clearance. That’s what automation provides: a border that actually exists.

I will cover **Architectural Fitness Functions** in depth later in this series, but for now, we can implement a basic check to ensure our "Blueprint" is respected.

Tools like [ArchUnit](https://www.archunit.org/) for Java allow you to write unit tests that assert architectural rules. For instance, you can assert that `ticketing` and `payments` remain decoupled:

```java
@AnalyzeClasses(packages = "com.citypulse")
public class ArchitectureTest {

    @ArchTest
    static final ArchRule componentIsolation =
        slices().matching("com.citypulse.(*)..")
            .should().beFreeOfCycles();
            
    @ArchTest
    static final ArchRule webShouldNotAccessPersistence =
        noClasses().that().resideInAPackage("..web..")
            .should().dependOnClassesThat().resideInAPackage("..persistence..");
}
```

This simple test acts as a ratchet. If a developer on the `Payments` team tries to import a class from `Ticketing` to save time, the build breaks. The architecture is no longer just a diagram on a wiki; it is a compilation error.

{{< note type="info" title="The Cost of Upfront Design" >}}
This approach is not a silver bullet. It requires more upfront thought to identify the core business components. I once spent a week over-engineering boundaries for a "Notifications" module that turned out to be three lines of code; but when the domain finally stabilized, having those (initially wrong) boundaries made the cleanup trivial.
{{< /note >}}

## The Blueprint is Just the Beginning

Architecture starts with the shape of your code. By grouping files by business purpose, you turn the directory structure into a tangible first line of defense against chaos. This clarity isn't about being neat, it's about paying the architectural cost upfront to avoid the bankruptcy of a "Big Ball of Mud" later.

But directories alone are just a blueprint, not a fortress. In our next post, **"The Formal Contract,"** we’ll lock down these boundaries using the compiler itself, turning good intentions into enforceable guarantees.

{{< newsletter type="simple" >}}

---
*The code examples for this series are available on GitHub: [vijayanant/codifying-architecture-examples](https://github.com/vijayanant/codifying-architecture-examples)*
