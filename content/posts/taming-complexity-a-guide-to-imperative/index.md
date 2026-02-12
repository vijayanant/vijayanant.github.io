---
title: "Taming Complexity: A Guide to Imperative, Object-Oriented, and Functional Programming"
slug: "taming-complexity-a-guide-to-imperative-object-oriented-and-functional-programming"
date: 2017-09-15
draft: false
featured_image: "taming-complexity-a-guide-to-imperative-1.jpg"
tags: ["programming-paradigm", "functional-programming", "oop", "complexity"]
categories: ["Programming"]
description: "Complexity is the root of most software failures. Explore how Imperative, Object-Oriented, and Functional paradigms offer different philosophies for managing state and control flow."
---
{{< figure
    src="taming-complexity-a-guide-to-imperative-1.jpg" alt="time lapse photo of cars passing by during nighttime"
    caption="Photo by [wxshutterbug](https://unsplash.com/@wxshutterbug) on [Unsplash](https://unsplash.com)"
    width=600
>}}

In the realm of software development, complexity is the root cause of majority
of problems. Unreliable programs often exhibit intricate structures and are
known to be notoriously complex. A complex system is challenging to comprehend
and maintain. The harder a system is to understand, the more likely we are to
introduce more complexity. As complexity spirals, the likelihood of
introducing further complications increases exponentially. A convoluted
codebase not only presents testing hurdles but also diminishes the
effectiveness of those tests.

### Programming Paradigms to the Rescue

Programmers have devised various programming paradigms, each with its unique
approach to tackling complexity. These paradigms serve as distinct schools of
thought, offering perspectives on how to structure and manage code. Let's
delve into three prevalent paradigms in general-purpose programming:

* The Imperative Paradigm
* The Object-Oriented Paradigm
* The Functional Paradigm

### The Imperative Paradigm: A Step-by-Step Approach

In [imperative
programming](https://en.wikipedia.org/wiki/Imperative_programming), the
programs consists of an explicit sequence of instructions/commands that update
shared state. Control flow is explicit: commands detail how the computation
takes place, step by step. Each step affects the global state of the system.

Since each step can essentially updates the (global, shared) state, any part
of the program can update the state. It is up to the programmer to keep track
of how and where the state is being updated and tailor the control flow such
that the only desired updates happen and in a particular order. As the number
possible program state increases so does the number of places the state is
updated. It becomes harder to keep the program in consistent state. It will
soon become a complex cogwheel system with too many moving parts.

```c
result = []
i = 0
start:
  numEmployees = length(employees)
  if i >= numEmployees goto finished
  e = employees[i]
  rating = e.rating
  if rating <= 7 goto nextOne
  upperCaseName = toUpper(e.name)
  addToList(result, upperCaseName)
nextOne:
  i = i + 1
  goto start
finished:
  return sort(result)
```

**Structured programming** , a concept sometimes considered a separate
paradigm, offers a way to manage complexity within the imperative paradigm by
employing procedures and control flow constructs.

```javascript
result = [];
for (i = 0; i < length(employees); i++) {
  e = employees[i];
  if(e.rating > 7) {
    addToList(result,toUpper(e.name));
  }
}
return sort(result);
```

### The Object-Oriented Paradigm: Encapsulate to Organise

[Object Oriented Programming](https://en.wikipedia.org/wiki/Object-oriented_programming) is based on passing messages between objects. Objects
respond to messages by performing appropriate operations. These operations are
generally called methods.

By encapsulating data and the operations that can manipulate that data within
a single entity (the object), we effectively compartmentalise the system's
moving parts into smaller, more manageable groups. There are still moving
parts, a lot of them, but they are grouped in a way which allows programmer to
handle each group (class of objects) in isolation.

In pure OO style, the control structures like the conditionals and loops
become messages themselves.

```smalltalk
result := List new.
employees each: [:e |
  e rating greaterThan: 7 ifTrue: [result add (e name upper)]]
result sort.
^result
```

Notice that, even though we can now deal with state updates in isolation,
objects need to collaborate among themselves to be useful. That happens by the
way of message passing. As the number of objects (classes of objects)
increases the communication between them also increases and needs to be dealt
with carefully.

### **The Functional Paradigm: A World Without Side Effects**

[Functional Programming](https://en.wikipedia.org/wiki/Functional_programming)
is based on the mathematical concept of a function. In mathematics there is no
notion of updating a variable or state. Functional programming, thus, removes
the whole 'update the shared state' business. Functions are the building
blocks in FP. Functions take arguments and compute a result based on the
inputs provided. Control flow is achieved by combining functions through a
technique known as function composition.

```haskell
sort (map (toUpperCase . name) (filter (\e -> rating e > 7) employees))
```

This code snippet demonstrates how functional programming paradigms can
achieve the same outcome as the previous examples, but in a more declarative
way.

### Paradigm Shift

{{< summary >}}

* In essence, programming paradigms stem from diverse philosophies concerning
how the world operates. They represent distinct perspectives on how to
effectively model the real world while constructing programs.

* The **imperative** models are based on how computers works. We think in terms
of variables that hold values and procedures that manipulate the values
referred to by those variable.

* The **object-oriented** paradigm models everything as an object. These objects
can then interact with each other and thereby update their internal state when
something in the system changes. This corresponds to how we often perceive the
world.

* The**functional** paradigms take a different approach, modelling system
behaviour using pure functions entirely. This aligns with the mathematical
concept that values are immutable, and all system changes are essentially the
application of functions.
{{< /summary >}}

{{< newsletter type="simple" >}}
