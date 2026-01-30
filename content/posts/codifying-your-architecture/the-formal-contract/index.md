---
title: "The Formal Contract"
slug: "the-formal-contract"
subtitle: "Turning Directories into Fortresses with Access Modifiers"
date: 2026-01-25
draft: false
series: ["Codifying Your Architecture"]
series_order: 2
categories: ["Software Architecture"]
tags: ["encapsulation", "information-hiding", "modularity", "clean-code", "java", "python"]
description: "A clean directory structure is just a facade if anyone can import anything. Learn how to use visibility rules and explicit contracts to turn your folder tree into a fortress."
featured_image: "contract-featured.svg"
---

{{< figure src="contract-featured.svg" alt="A stylized illustration of a scroll (the contract) being locked with a digital shield, representing code-level enforcement." >}}

In the [previous post]({{< ref "/posts/codifying-your-architecture/the-blueprint" >}}), we talked about the "Screaming Architecture". The idea is that your directory structure should shout your business intent. We rearranged the furniture, moved classes into domain-centric buckets, and felt a brief moment of zen.

Then, reality hit.

You’re in the middle of a high-pressure sprint. You need to check if a ticket exists before processing a payment. Your IDE’s auto-import feature, in its infinite and helpful wisdom, suggests `com.citypulse.ticketing.TicketRepository`. You hit `Enter`. The code compiles. The test passes.

And just like that, you’ve committed architectural treason.

You’ve bypassed the `TicketService` (where the business rules live) and coupled the `Payments` module directly to the internal data access details of `Ticketing`. Your "clean" directory structure is now just a facade. The boundaries are there for the humans, but the code is still a free-for-all.

## The Myth of the "Public" Class

The original sin of modern development is **Public by Default**.

In most IDEs, when you create a new class, it’s automatically marked as `public`. We do this because it’s easy. It prevents "visibility friction." But every `public` class is a leak in your ship. If every class is public, your architecture doesn’t actually have boundaries; it just has suggestions.

True modularity requires **Information Hiding**. It’s not just about grouping related things; it’s about *hiding* the things that nobody else should touch. Your module should be a "Black Box" with a single, clearly defined "Control Panel" (the Public API). Everything else—the wiring, the gears, the dirty implementation details—should be invisible to the outside world.

{{< note type="log" title="Architect's Log: The 'Public' Convenience Trap" >}}
I have heard every excuse for making classes public. "It makes testing easier." "We might need it later." "It’s just a utility class."

Stop it. Every time you make an internal detail public, you are handing a loaded gun to a future developer (possibly yourself in six months). They *will* use it. They *will* couple their feature to it. And when you want to refactor that internal detail, you'll realize you can't, because half the codebase is now depending on it. If it doesn't *need* to be public to fulfill the business contract, it must be hidden. No exceptions.
{{< /note >}}

## Locking the Gates

Here is how we turn that `ticketing` directory into a fortress using standard language tools.

### 1. Java: The Power of the Package-Private

Java developers often forget that `public`, `protected`, and `private` aren't the only options. There is a fourth, often ignored visibility level: **Package-Private** (the default when no modifier is specified).

In our `ticketing` module, we only want the `TicketService` to be the entry point.

**The Public API:**

{{< tabs >}}
{{< tab "Java" >}}

```java
package com.citypulse.ticketing;

import com.citypulse.payments.PaymentService;

/**
 * The ONLY public class in the package. 
 * This is the 'Control Panel'.
 */
public class TicketService {
    private final TicketRepository repository = new TicketRepository();

    public void bookTicket(String ticketId) {
        // Business logic happens here...
        repository.save(ticketId);
    }
}
```

{{< /tab >}}
{{< /tabs >}}

**The Hidden Internal:**

{{< tabs >}}
{{< tab "Java" >}}

```java
package com.citypulse.ticketing;

/**
 * Notice: NO 'public' keyword. 
 * This class is now invisible to the 'payments' package.
 */
class TicketRepository { 
    void save(String ticketId) {
        // SQL details hidden away...
    }
}
```

{{< /tab >}}
{{< /tabs >}}

If a developer in the `payments` package tries to import `TicketRepository`, the compiler will throw a fit. The architecture is no longer a diagram; it's a physical impossibility.

{{< figure src="ide-compiler-error.png" alt="A screenshot of an IDE showing a red squiggly line under an illegal import with a compiler error." caption="The compiler is your most loyal border patrol agent." >}}

### 2. Python: The `__all__` Convention

Python doesn't have strict access modifiers like Java. It relies on a "we are all consenting adults" philosophy, which is often code for "we are all going to couple this to everything."

However, you can still put up a "Do Not Enter" sign: explicit exports using `__init__.py`.

**`citypulse/ticketing/__init__.py`**

{{< tabs >}}
{{< tab "Python" >}}

```python
from .service import TicketService

# Only TicketService is exported. 
# Internal classes like _TicketRepository remain 'hidden' by convention.
__all__ = ["TicketService"]
```

{{< /tab >}}
{{< /tabs >}}

While Python won't stop a determined developer from importing `citypulse.ticketing.persistence._TicketRepository`, the `__all__` declaration (and the leading underscore convention) acts as a clear "DO NOT ENTER" sign. In a world of professional engineers, ignoring these signs is a choice to be reckless.

## The Payoff

Why bother? Why not just let people import what they need?

1. **Reduced Cognitive Load:** When I look at the `ticketing` module from the outside, I only see *one* class. I don't need to understand the repository, the JPA mappings, or the internal validators. I just need to know how to call the service.
2. **Safe Refactoring:** Because the `TicketRepository` is hidden, I can completely rewrite it. I can switch from SQL to NoSQL, rename every method, or split it into three classes. As long as I don't change the `TicketService`'s public methods, **nothing else in the system breaks.**

{{< note type="warning" title="The Sub-Package Leak" >}}
A common trap in Java is creating sub-packages like `com.citypulse.ticketing.internal`. **In Java, sub-packages are separate packages.** A package-private class in `ticketing` is invisible to `ticketing.internal`. This often frustrates developers into making everything `public`.

Don't fall for it. Keep your component's internal logic in a flat package structure where possible, or use the **Java Platform Module System (JPMS)** if you need deep, multi-package encapsulation.
{{< /note >}}

## The Trade-off

The biggest pushback against strict encapsulation is testing. "If the repository is package-private, how do I unit test it?"

The answer is simple: **Put your tests in the same package.**

In both Java (Maven/Gradle) and many other ecosystems, your test code usually mirrors the source package structure. If your test class lives in `com.citypulse.ticketing` (under the `src/test/java` directory), it has full access to package-private classes.

Strict encapsulation doesn't make testing harder; it makes your tests **better**. It forces you to make a choice. Ideally, you test the **Component** through its public API (`TicketService`). That's your contract.

But sometimes, a repository has complex SQL that *needs* its own test. Because your test class lives in the same package, it has a "Backstage Pass." It can see the package-private repository, but the rest of the application cannot. You get the best of both worlds: granular testing where needed, without polluting the global namespace.

{{< note type="warning" title="The Leak You Can't See" >}}
We have locked down *who* can call your code, but we haven't locked down *what* they exchange.

If your public `TicketService` returns a raw Database Entity (like a Hibernate `@Entity`), you are technically obeying the visibility rules, but you are still leaking implementation details. You are forcing the caller to know about your database schema. We will tackle these "Logic Leaks" later in the series.
{{< /note >}}

## The Blueprint is Now a Contract

By using access modifiers, we’ve moved from "I hope the team follows the structure" to "The code won't compile unless they do." We have codified the architecture.

But even this has limits. Language-level visibility can't prevent **Cyclic Dependencies** (e.g., Ticketing calling Payments, which calls Ticketing). It can't prevent "Shared" modules from becoming "Junk Drawers."

For that, we need something stronger. We need a tool that can analyze the entire dependency graph and fail the build if our high-level rules are violated.

In our next post, **"The Invisible Border Patrol,"** we’ll introduce **ArchUnit** and show how to write "Fitness Functions" that guard your architecture while you sleep.

{{< newsletter type="simple" >}}

---
*The code examples for this series are available on GitHub: [vijayanant/codifying-architecture-examples](https://github.com/vijayanant/codifying-architecture-examples)*

{{< note type="info" title="Question for the Reader" >}}
Look at your current project. How many classes are `public` simply because that's what the IDE generated? What would happen if you tried to make half of them `internal` or `package-private` tomorrow?

{{< /note >}}
