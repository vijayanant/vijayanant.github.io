---
title: "Design Principles and Design Patterns"
slug: "design-principles-and-design-patterns"
date: 2023-04-06T07:52:17.871Z
draft: false
featured_image: "design-principles-and-design-patterns-1.png"
description: "Design principles are high-level guidelines for designing software, while design patterns are specific solutions to recurring design problems. This post explores their complementary relationship."
tags: ["design-pattern", "design-principle", "solid", "software-design"]
categories: ["Programming"]
---
{{< figure src="design-principles-and-design-patterns-1.png" alt="Design Principles and Design Patterns" >}}

Design principles and design patterns are related but serve different
purposes.

_**Design principles**_  are high-level guidelines for designing software that
helps developers create code that is maintainable, extensible, and adaptable.
These principles are not specific to any programming language or technology
and can be applied to any software development project. Design principles
provide a foundation for good software design and help developers create code
that is easier to maintain and change over time.

_**Design patterns**_ , on the other hand, are specific solutions to recurring
design problems in software development. They are practical, reusable
solutions that can be applied to specific programming languages or
technologies. Design patterns are based on design principles but provide
specific implementations that can be used to solve specific problems. They can
also help developers avoid common pitfalls in software development and ensure
that their code is efficient, scalable, and easy to understand.

The relationship between design patterns and design principles is
complimentary. Design principles provide high-level guidelines and best
practices for designing software. Design patterns provide concrete
implementations to specific design problems while adhering to the design
principles

In fact, many design patterns provide solutions that adhere to multiple
principles. While it is ideal for a design pattern to adhere to all the design
principles, it is not always possible to achieve this. Design principles are
not absolute rules that must be followed in all cases. Some design principles
may be more important than others depending on the specific problem being
solved, and some principles may even conflict with each other. There may be
situations where adhering to a design principle is not practical or even
desirable, and in such cases, a design pattern that addresses the specific
problem at hand may be a better choice.

Let us see some examples:

### Single Responsibility Principle (SRP)

The SRP states that a class should have only one responsibility or reason to
change. This means that a class should only be responsible for one thing, and
if that thing changes, the class should be the only one that needs to change.
The goal is to keep classes focused and maintainable and reduce the risk of
unintended consequences when making changes.

  * The Observer Pattern: The Observer pattern is a behavioural design pattern that defines a one-to-many dependency between objects, where a change in one object (the subject) causes all its dependents (observers) to be notified and updated automatically. This pattern adheres to the SRP by separating the responsibilities of the subject and the observers. The subject’s responsibility is to manage the state and notify the observers, while the observers' responsibility is to respond to the notifications and update themselves.

  * The Command Pattern: The Command pattern is a behavioural design pattern that encapsulates a request as an object, thereby allowing for the separation of the requester (client) from the executor (receiver) of the request. This pattern adheres to the SRP by separating the responsibility of the client from the responsibility of the receiver. The client’s responsibility is to create and invoke the command objects, while the receiver’s responsibility is to execute the commands.

### Open/Closed Principle (OCP)

The OCP states that software entities should be open for extension but closed
for modification. This means that you should be able to add new functionality
to a system without changing the existing code. The goal is to reduce the risk
of introducing new bugs when making changes and allow for greater flexibility
and adaptability in the system.

  * The Strategy Pattern: The Strategy pattern is a behavioural design pattern that defines a family of algorithms, encapsulates each one, and makes them interchangeable. This pattern adheres to the OCP by allowing the behaviour of an object to be modified without changing its class. The behaviour of an object can be modified by changing the strategy object that the object uses.

  * The Decorator Pattern: The Decorator pattern is a structural design pattern that allows behaviour to be added to an individual object, either statically or dynamically, without affecting the behaviour of other objects from the same class. This pattern adheres to the OCP by allowing functionality to be added to an object without changing its interface or the behaviour of other objects.

### Liskov Substitution Principle (LSP)

The LSP states that subtypes must be substitutable for their base types. This
means that if you have a variable of a certain type, you should be able to
substitute any subtype of that type without affecting the behaviour of the
system. The goal is to ensure that code is reusable and maintainable and
reduce the risk of introducing bugs when making changes.

  * The Factory Method Pattern: The Factory Method pattern is a creational design pattern that defines an interface for creating objects, but allows subclasses to decide which class to instantiate. This pattern adheres to the LSP by ensuring that the objects created by the factory can be used interchangeably, regardless of their concrete types.

  * The Template Method Pattern: The Template Method pattern is a behavioural design pattern that defines the skeleton of an algorithm in a superclass, but lets subclasses override specific steps of the algorithm without changing its structure. This pattern adheres to the LSP by ensuring that the subclasses can be used in place of the superclass without changing the correctness of the algorithm.

### Interface Segregation Principle (ISP)

The ISP states that clients should not be forced to depend on interfaces they
do not use. This means that if a client only needs a subset of the
functionality provided by an interface, it should only depend on that subset.
The goal is to reduce coupling between components and make it easier to change
or replace components without affecting the behaviour of the system.

  * The Adapter Pattern: The Adapter pattern is a structural design pattern that allows incompatible classes to work together by converting the interface of one class into another interface that the client expects. This pattern adheres to the ISP by ensuring that the adapter only provides the methods that are relevant to the client, and not the entire interface of the adapted class.

  * The Observer Pattern: The Observer pattern is a behavioural design pattern that defines a one-to-many dependency between objects, such that when the object changes state, all its dependents are notified and updated automatically. This pattern adheres to the ISP by ensuring that the Observer interface only includes the methods required by the observers to receive notifications from the subject, and not any additional methods that may not be relevant or used.

### Dependency Inversion Principle (DIP)

The DIP states that high-level modules should not depend on low-level modules.
Instead, both should depend on abstractions. This means that the details of
how a system works should be hidden behind abstractions, and changes to the
implementation should not affect the behaviour of the system. The goal is to
make systems more modular and easier to maintain.

  * The Dependency Injection Pattern: The Dependency Injection pattern is a design pattern that allows the creation of dependent objects to be inverted and delegated to a separate component, thereby decoupling the client from the implementation details of the dependent objects. This pattern adheres to the DIP by ensuring that the client depends only on abstractions, and not on concrete implementations, thus allowing for flexibility and easy substitution of dependencies.

  * The Strategy Pattern: The Strategy pattern is a behavioural design pattern that defines a family of algorithms, encapsulates each one, and makes them interchangeable at runtime. This pattern adheres to the DIP by ensuring that the algorithms are defined as interfaces or abstract classes, which can be easily extended or modified without affecting the client code.

## The Other Way Around

It is also possible for a single design pattern to cater to more than one
design principle. Many design patterns are designed to address multiple design
principles simultaneously.

  * The Strategy pattern is often used to address the Open/Closed Principle (OCP) and the Single Responsibility Principle (SRP) at the same time. The OCP states that software entities should be open for extension but closed for modification, while the SRP states that a class should have only one reason to change. The Strategy pattern allows the behaviour of an object to be modified at runtime without modifying the object itself, thus adhering to the OCP. It also separates the implementation of the algorithm from the object that uses it, adhering to the SRP.

  * The Factory Method pattern can address the SRP, the OCP, and the Dependency Inversion Principle (DIP) at the same time. The Factory Method pattern separates the creation of objects from their use, allowing for greater flexibility in object creation and adherence to the SRP. It also allows for the creation of objects at runtime, adhering to the OCP. Finally, by using abstractions to create objects, it adheres to the DIP.

While it is important to understand the concepts behind each design pattern,
it is also important to choose the right pattern for the specific problem you
are trying to solve. Not all patterns will apply to every situation, and it is
important to consider the trade-offs and benefits of each pattern before
choosing the one that is best suited for your needs.

{{< summary >}}
In conclusion, the five major design principles in object-oriented programming
and design patterns are essential for creating maintainable, extensible, and
adaptable code. By following these principles and patterns, developers can
reduce the risk of introducing bugs when making changes, and make systems more
modular and easier to maintain, and create code that is easier to test and
reuse.
{{< /summary >}}

{{< newsletter type="simple" >}}
