---
title: "SOLID fp"
slug: "solid-fp"
date: 2023-09-09
draft: false
description: "Exploring how the SOLID principles, often discussed in OOP, apply to Functional Programming, focusing on functions, composition, and higher-order functions."
featured_image: "solid-fp-1.png"
tags: ["solid", "functional-programming", "design-principle"]
categories: ["Programming"]
---
{{< figure
    src="solid-fp-1.png"
    caption="Aperiodic Tile: a single shape that can be used to cover a surface completely without ever creating a repeating pattern."
    width=750
>}}

{{< summary title="Why SOLID in FP?" >}}
The way we build our softwares have changed over the years. But the core
qualities of good software are still the same - Modular, extensible, reusable,
composable, etc. And we all have heard of the software principles. Five of the
major principles of software design, popularly knows as SOLID principles, are
mostly talked about in the OOP space and not much in the FP space. Why so?
{{< /summary >}}

**SRP** , together with **ISP** promotes interfaces with fewer methods, and if
taken to the extreme, we end up with interfaces with single method. This is
not really as extreme as you might be thinking - [role interfaces](https://martinfowler.com/bliki/RoleInterface.html) and the
[functional interfaces](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/function/package-summary.html) (or Single Abstract Method) are exactly this.

What is the difference, then, between an Interface with a single abstract
method and a function? Well, it is the state of-course. A function, by
definition, doesn’t hold any state. An object that implements a SAM interface,
however, will have its own state.

How different are they really? Not much. Closures are all too common in FP.
Some languages makes them explicit and some don’t.

In functional programming, the fundamental unit of abstraction is the
function. A function has a single input and a single output; functions
naturally have a single responsibility. Since functions and closure are
fundamental to FP, these principles are not considered something to be done
differently.

The **OCP** is achieved with some form of inheritance mechanism in OOP. Usuaully
inheritance with the goal of reuse rather than [subtyping](http://en.wikipedia.org/wiki/Subtype_polymorphism) (implementation
inheritance). Even thought inheritance is commonly used in examples, the core
of the principle is about not modifying the existing code but to write new
code to extend the feature/behaviour.

Subtyping to achieve openness is from the Bertrand Meyer’s view. Robert C.
Martin adopts a ‘openness through polymorphism’ view. Extensibility is
supported through substitution rather than modification.

In a functional language, functions can be substituted at will and as such,
there is no need to ‘design’ for extensibility. In FP this is achieved by the
way of function composition. You also have higher order functions to modify
the behaviour. Function composition is, again, fundamental to FP.

**LSP** is about sub-type polymorphism. An object of inherited class is of
parent type because they share the same interface. Since the behaviour can be
incompatible with the parent type, LSP asks us to make sure the behaviour too
is compatible with the parent type (semantic portability). Subclasses must not
strengthen preconditions and must not weaken postconditions.

This is not specific to OOP, this is more of an expectation from polymorphic
code. Generic types are common place in both OOP and functional languages.
Functional languages favour [parametric
polymorphism](http://en.wikipedia.org/wiki/Parametric_polymorphism) with
[bounded quantification](http://en.wikipedia.org/wiki/Bounded_quantification)
thereby avoiding some of the pitfalls of inheritance.

**DIP** is about abstraction. In OOP this means making the members of your
class abstract types and injecting the concrete types. Function composition
and higher-order functions are the way to go in FP allowing to swap the
implementation of concrete details when needed.

So, why SOLID principles are not talked about in FP as much as in OOP? We do
talk about the same principles, just that we are always talking about
functions, function composition, higher order functions, parametric
polymorphism and don’t call them SOLID principles. The principles themselves
apply to all softwares; whether one follows OO or functional style.

And here is an old koan to conclude:

{{< quote type="pull" >}}

The venerable master Qc Na was walking with his student, Anton. Hoping to
prompt the master into a discussion, Anton said "Master, I have heard that
objects are a very good thing - is this true?" Qc Na looked pityingly at his
student and replied, "Foolish pupil - objects are merely a poor man's
closures."

Chastised, Anton took his leave from his master and returned to his cell,
intent on studying closures. He carefully read the entire "Lambda: The
Ultimate..." series of papers and its cousins, and implemented a small Scheme
interpreter with a closure-based object system. He learned much, and looked
forward to informing his master of his progress.

On his next walk with Qc Na, Anton attempted to impress his master by saying
"Master, I have diligently studied the matter, and now understand that objects
are truly a poor man's closures." Qc Na responded by hitting Anton with his
stick, saying "When will you learn? Closures are a poor man's object." At that
moment, Anton became enlightened.

\- [Anton van Straaten](http://people.csail.mit.edu/gregs/ll1-discuss-archive-html/msg03277.html)
{{< /quote >}}

{{< newsletter type="simple" >}}
