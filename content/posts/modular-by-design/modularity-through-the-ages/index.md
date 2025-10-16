---
series: ["Modular by Design"]
series_order: 3
title: "Modularity Through The Ages"
slug: "modularity-through-the-ages"
date: 2024-02-29T08:17:52.645Z
draft: false
featured_image: "modularity-through-the-ages-1.jpg"
tags: ["modularity", "microservice", "monolith", "history"]
categories: ["Software Architecture"]
description: "A look at the history of software architecture, from RPCs to microservices, and the timeless importance of modularity, coupling, and cohesion."
featured_image: "modularity-through-the-ages-1.jpg"
---
{{< figure src="modularity-through-the-ages-1.jpg" alt="child playing with lego blocks" caption="Photo by [Aedrian](https://unsplash.com/@aedrian) on [Unsplash](https://unsplash.com)" >}}

In the last post, we explored the timeless push and pull between coupling and cohesion. We established them as the key metrics for a healthy, modular system. But this struggle is not new. In fact, it is one of the central, driving forces in the history of software architecture.

To truly master these principles, we must see them not as abstract theory, but as the fundamental problem that generations of developers have tried to solve. In this post, we'll put our current challenges in context by taking a journey through the ages of software design, exploring how the constant pursuit of modularity has shaped our industry.

We have to start somewhere; let’s start at the beginning by asking the
fundamental question - **What do we want our software to achieve?**

The bare minimum is business functionality. The thing is, businesses go
through changes, some more than others. Our software need to change at the
same rate. Making changes to our software is a lot harder than it seems. The
'code’ that makes up the software is to be understood by humans before
changing. Making code easier to understand and easier to change, thus, is
fundamental to software development.

**What makes software hard to change?** Sometimes changes made in one area of
the codebase can have unintended consequences elsewhere. There is often the
need to make other coordinated changes in other parts of the codebase. It is
so much better if the related changes were local and not in an seemingly
unrelated part.

We want related code to be close together and no unintended consequences
elsewhere. This is [Coupling and Cohesion]({{< ref "posts/modular-by-design/good-coupling-bad-coupling-and-cohesion/" >}}) in action. This is the basis for good **modular design**.
Coupling describes how modules in software depend on each other, while
cohesion tells you how closely related functions are within a module. Our aim,
as software developers, is to achieve **low coupling** (independent modules)
and **high cohesion** (focused functions).

## Modules

A module is a collection of related code. It could be a function, a class**,**
a**** library, a package, a process, a thread, etc. In effect, anything that
has a well defined functionality is a module. Your browser’s sandbox is a
module. Containers, virtual machines, and OS Kernels are also modules.

{{< newsletter type="simple" >}}

Modules on their own are of little use. What can a single function or an
object achieve? They need to somehow communicate with other modules. You have
APIs, system calls, sockets, RPCs, file systems, databases, message passing
systems, etc. This defines their **interface**.

What does it mean for a module to have low coupling? **Coupling is a measure
of interdependence between modules**. For example, if module A depends on
internal details of other module B to work, then, whenever module B changes
your module A also has to undergo changes accordingly. We say the two modules
are highly coupled. There will always be some coupling since they need to
communicate to work together; the aim is to minimise the interdependence.

## Module Isolation

True low coupling goes beyond just interfaces. We need to actively isolate
modules, minimising dependencies and preventing unintended interactions. This
creates self-contained units with well-defined boundaries, akin to Lego
blocks. You can combine, replace, or upgrade individual modules without
impacting the entire system.

The initial developers carefully designed their modules and painstakingly come
up with a module structure and directed (dictated?) which modules depend on
which other module. All it takes to break this carefully crafted module
dependency is a simple ``import`` statement.

When the entire app is a single bundle, aka a **monolithic build** , how do
you avoid such un-intended consequences? Especially when there are multiple
teams working on the app? One way is to isolate your modules such that others
are _forced_ to only rely on its interface. That calls for a **strong module
isolation** where one cannot bypass the provided interface even intentionally.

Strong isolation, however, is usually thought of as a security measure and not
to avoid intentional short-cuts from a developer in a hurry. Whatever the case
maybe, we had a solid understanding of how to build modular application that
are easy to understand and easy to change.

Then, from here on, where we had good modular design, **why did we change**?

## Time For Some History

In early 1980s the most common processors were 16-bit processors with a 64K
address space. There is only so much that one could fit into such a machine.
**Remote Procedure Calls**
([RPCs](https://en.wikipedia.org/wiki/Remote_procedure_call)) was the first
major systems distribution technology. The basic idea was to make remote calls
_transparent_ to developers. The promise was that if developers didn’t have to
care whether the procedure calls or methods they were invoking were local or
remote, then they could build larger systems, crossing machine boundaries,
that could avoid the processing and memory scalability issues that affected
systems of the time.

RPCs paved the path for DCE and CORBA, but as technology improved, developers
learned that **distributed communication doesn't always translate to better
performance**. Frequent communication between distributed components, known as
"chattiness," can create significant network overhead, outweighing the
benefits.

To address this challenge, the Facade pattern emerged as described in the Gang
of Four (GoF) book. This design pattern simplifies communication by encapsulating a complex system's inner workings behind a single, well-defined interface, thereby **reducing coupling** between the client and the complex subsystem. This reduces "chattiness" and improves overall performance.

The Facade pattern ultimately influenced the development of Enterprise Java
Beans (**[EJBs](https://en.wikipedia.org/wiki/Jakarta_Enterprise_Beans)**).
Interoperability was a major concern with EJBs. The next iteration, to solve
the problems of EJBs was the Service Oriented Architecture
(**[SOA](https://en.wikipedia.org/wiki/Service-oriented_architecture)**). SOA
originally began as a ”do the simplest thing that could possibly work" effort
called Simple Object Access Protocol
(**[SOAP](https://en.wikipedia.org/wiki/SOAP)**) - a way of invoking object
methods over HTTP.

Instead of just calling a function, things got fancy very quickly. SOA soon
got bogged down with extra stuff like error handling, transactions, security,
digital signatures, etc.
(**[WS-*](https://en.wikipedia.org/wiki/List_of_web_service_specifications)**).
It became too complicated for its own good.

A Ph.D. [dissertation in 2000 by Roy Fielding](https://ics.uci.edu/~fielding/pubs/dissertation/fielding_dissertation.pdf) set the foundational principles for **[REST](https://en.wikipedia.org/wiki/REST)**, articulating a new architectural style that would profoundly influence how we build web services. Instead of layering procedural
semantics onto the HTTP transport, REST uses the inherent semantics of HTTP
verbs for create, read, update, and delete operations. Additionally, it
defines a mechanism for identifying resources utilising URIs.

Another unintended consequence of this progressive transition from RPCs to
REST services is increased complexity in maintaining and running multiple
runtime environments. Even though services were developed individually in
isolation, they were supposed work with and tested alongside other services.
When changes were made to multiple services, their testing and release took
forever as multiple environments were needed and it took much time and effort.

Realisation hits the developers again.**Programs and their runtime
environments should be entirely self-contained.** All these observations are
then brought under a single set of principles called **“Microservices.”**

## Monoliths And Microservices

{{< note type="log" title="A Note on Terminology" >}}
There is a lot of talk recently on how we should move back to building monoliths. The catchphrase is **“Modular Monoliths.”** I don’t subscribe to this phrasing; there is no new architecture called a modular monolith. A monolith was always supposed to be modular to begin with.
{{< /note >}}

The technological landscape may have shifted from RPCs, CORBA, EJBs, SOA to
Microservices, but the underlying principle remains unchanged: modularity.
Whether we're bundling application as a single unit or spreading services
across distributed network of machines, **the key to maintainability and
scalability lies in well-defined modules with minimal dependencies.** Strong
code cohesion, low coupling, and clear contracts are the timeless steps to a
healthy system, regardless of its deployment structure.

However, the pursuit of microservices often leads to a common anti-pattern: the **"distributed monolith."** This occurs when a system is physically deployed as multiple services, but these services remain tightly coupled at a logical level. They might share a single database, have synchronous dependencies, or require coordinated deployments. The result is a system that carries the operational overhead of distributed systems without gaining the benefits of independent deployability and evolvability. It's a stark reminder that simply splitting code into separate processes does not automatically confer modularity; the underlying principles of information hiding, loose coupling, and high cohesion must still be rigorously applied to *any* architectural style.

Build (and Deployment) is where the difference between the human aspect (the
code) and the machine aspect (the build/binary/software) is visible. We
organise and mange them differently. The code is written by and is to be
understood by humans. It deals with repositories, repositories, projects, modules and
dependencies. The runtime or deployment deals with what production
environments look like and how deployable run in them.

In a monolithic setup one or more repositories build one deployable artefact.
When the industry moved away from from this monolithic approach to
microservices, we, like before when we were given RPCs, took it to the
extreme. We split the codebase and the deployable alike. **We split code
according to runtime concerns, and/or the deployable in line with project
concerns.** We threw module dependencies out the window. The dependency graphs
are basically non existent. We coupled our project and deployment models, our
repositories and our services, the way we organise our code and the way our
services are run. **The way teams are organised is dictating our code
structure.** **Project/code structure is dictating our deployment structure.**
As a result modules that were supposed to be cohesive unit were broken down,
the dependent modules were separated into a ‘independent’ deployable
unit/service.

## Modularity And Architectures

Throughout the evolution of software architecture, one principle has remained
constant: the importance of modular code. Irrespective which architectural
pattern you are currently working/dealing with, unless you have modular code,
you are going to feel the pain. Monoliths are monoliths not because they lack
modularity but instead they are single bundle. Yes, monoliths did connect and
work with multiple data sources. No, entire application need not crash because
one DB failed. They knew how to handle error gracefully. Active-Passive,
Active-Active failover and DR mechanisms did exist. There were challenges and
problems, of course. But these were not the important ones.

And no, the prominent aspect of microservices is not that it lets you split up
your application into multiple smaller chunks. More than anything the
usefulness of microservices is that it not only encapsulates (in a sense) data
and the code that works with it, it also isolates them in a service boundary.

{{< summary title="Key Takeaways from History" >}}
*   **Timeless Problem:** The core challenge of software development has always been managing complexity and change through modularity.
*   **Evolving Solutions:** Architectural styles (RPC, SOA, Microservices) are different attempts to solve this timeless problem, each with its own trade-offs.
*   **Principles Endure:** While technologies change rapidly, the underlying principles of strong module isolation, low coupling, and high cohesion remain constant.
*   **Beware the Hype:** New architectural trends often promise solutions, but without careful design based on core principles, they can introduce more pain than benefit.
{{< /summary >}}

Brand new microservices (or Hexagonal, or Hub-and-Spokes, or..) architecture
is bound to cause more pain than bring benefits if you are not careful while
designing your module/service/component.

This history teaches us that while technologies and buzzwords change, the principles of modular design are timeless. To see this in action, our journey continues with a deep dive into two classic, contrasting architectural styles. In the next post, we will analyze Remote Procedure Calls (RPCs) through the lens of modularity we've developed so far.

{{< newsletter type="simple" >}}
