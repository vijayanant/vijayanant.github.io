---
title: "Polymorphism, Dynamic Dispatch, and Visitor"
slug: "polymorphism-dynamic-dispatch-and-visitor"
date: 2023-12-04T06:42:32.498Z
draft: false
featured_image: polymorphism-dynamic-dispatch-and-visitor-1.jpeg
tags: ["polymorphism", "visitor-pattern", "design-pattern", "oop"]
categories: ["Programming"]
description: "Exploring polymorphism, dynamic dispatch, and the Visitor pattern in object-oriented programming, focusing on designing extensible systems."
---
{{< figure src="polymorphism-dynamic-dispatch-and-visitor-1.jpeg" alt="Change neon light signage" caption="Photo by [Ross Findon](https://unsplash.com/@rossfindon) on [Unsplash](https://unsplash.com)" >}}

Let's revisit a classic example from our early days of object-oriented
programming: shapes and transformations. We will design a system that allows
applying scaling and rotation to lines, circles, and rectangles. However, this
time, we'll take it a step further and make it
[extensible](https://en.wikipedia.org/wiki/Extensibility). This means future
developers should be able to easily add new types of transformations without
modifying existing code.

What we need is a [polymorphic
function](https://en.wikipedia.org/wiki/Polymorphism_\(computer_science\))
that exhibits different behaviour based on the data we provide. Specifically,
a function that performs various transformations (rotate, scale, etc.) on the
shape/type (Line, Circle, Rectangle) of the object. Basically we want a
function

```cpp
apply(transformation, shape); 
```

The challenge is to design a model such that adding new transformation is
trivial.

## **Well, we have to start somewhere!**

We could try to simply mimic the above function as a polymorphic method in a
`Transformer` class, but we will soon realise the function will get messy with
`if-else` clauses or `switch` cases. Also adding new transformations entails
modifying the method which goes against [Open-closed
Principle](https://en.wikipedia.org/wiki/Open%E2%80%93closed_principle).

## **Function Overloading (Static Polymorphism)**

[Function overloading](https://en.wikipedia.org/wiki/Function_overloading) or
method overloading is the ability to create multiple functions of the same
name with different implementations. Overloading is resolved statically, that
is at compile time, depending only on the static types of the arguments
(different argument types, different number of arguments). For any particular
call, the compiler determines which overloaded function to use, and resolves
this

This seems like the way forward, don't you think? Multiple implementations
with same function name (transform) with different behaviour based on the
parameters we passed (transformations and shapes).

```java
public class Transformer {
  public Shape transform(Scale s, Rectangle r) {
     // Scale the given rectangle r by a factor represented by Scale s
  }
  
  public Shape transform(Rotation r, Circle c) {
     // Rotating a Circle doesn't make any sense !!
  } 
  
  ...
}
```

Using overloaded functions to achieve different behaviour for different shapes
and transformations would lead to an explosion of classes and methods, making
the code cumbersome and difficult to maintain. All we are doing is breaking
the switch statement in previous approach into their own functions. Each case
is its own function.

{{< newsletter type="simple" >}}

## **Method Overriding (Dynamic Polymorphism)**

[Method overriding](https://en.wikipedia.org/wiki/Method_overriding), in
object-oriented programming, allows a subclass or child class to provide a
specific implementation of a method that is already provided by one of its
superclasses or parent classes. The version of a method that is executed will
be determined by the object that is used to invoke it. Overriding allows
[Subtype polymorphism](https://en.wikipedia.org/wiki/Subtyping).

To make use of dynamic polymorphism, we have to group our objects into special
classes that shares a common interface.

At first, you might be tempted to create an interface like this:

```java
public interface Shape {
    Shape scale(double factor); // Scale the shape by a factor
    Shape rotate(double angle); // Rotate the shape by an angle (in radians)

}
```

This approach seems straightforward, but it suffers from a crucial flaw: with
this interface, adding a new transformation requires modifying all existing
shape classes to implement the new method. It violates the Open-Closed
Principle (OCP). OCP expects our software to be open for extension.

## **Behaviour as Objects (Combining both)**

Notice that adding a new transformation must be easy, lets model
transformations as objects. Supporting a new transformation in future is as
simple as creating a new class that implements the Transformation interface.

First the Shapes themselves:

```java
public interface Shape { }

public class Line implements Shape { }
public class Circle implements Shape { }
public class Rectangle implements Shape { }  
```

Then, we implement transformation for each shape.

```java
public interface Transformation {
  void apply(Line line);
  void apply(Circle circle);
  void apply(Rectangle rectangle);
  
  default void apply(Shape shape) {
    System.out.println("Unknown Shape... Cannot apply transformation!");

  }
}

public class Scale implements Transformation {
  private final double factor;

  public Scale(double factor) {
    this.factor = factor;
  }
  
  @Override
  public void apply(Line line) {
    System.out.println("Applying Scaling transformation to Line");
  }

  @Override
  public void apply(Circle circle) {
    System.out.println("Applying Scaling transformation to Circle");
  }

  @Override
  public void apply(Rectangle rectangle) {
    System.out.println("Applying Scaling transformation to Rectangle");
  }
}
```

Let's give this a run. But before that we need a simple client :

```java
Shape line      = new Line()
Shape circle    = new Circle();
Shape rectangle = new Rectangle()

Transformation transformation = new Scale(0.5);

List<shape> shapes = new ArrayList<>();
shapes.add(line);
shapes.add(circle);
shapes.add(rectangle);

for (Shape shape : shapes) {
    transformation.apply(shape);
}
```

Here is what you will get-

```text
Unknown Shape... Cannot apply transformation!
Unknown Shape... Cannot apply transformation!
Unknown Shape... Cannot apply transformation!
```

Oops! This isn't what we expected! What happened? To understand what happened,
we need to take a deeper look first.

## **Static and Dynamic Dispatch**

In [static dispatch](https://en.wikipedia.org/wiki/Static_dispatch) the
polymorphic function/method is fully resolved during compile time
(Overloading). In [dynamic
dispatch](https://en.wikipedia.org/wiki/Dynamic_dispatch), resolution happens
at run time. It is considered a prime characteristic of object-oriented
programming.

```java
for (Shape shape : shapes) {
    transformation.apply(shape);
}
```

During compilation, the type of  `transformation` and `shape` objects are not
known. Which of the 3 overloaded `apply` method is to be called? This is
resolved at runtime. Depending on the type of shape object method call is
'dispatched' to appropriate function.

This still doesn't explain the behaviour we observed.

```text
Unknown Shape... Cannot apply transformation!
```

## **Single Dispatch**

When the dispatching is done based on receiver alone (or first arg to the
function), it is called [Single
Dispatch](https://en.wiktionary.org/wiki/single_dispatch) system. Java, C,
C++, both use single dispatch. When a method is overridden, this is how the
correct object's method are called even when the type of the ref is of parent
type (_Subtype polymorphism_).

**Example:**

```java
objRef.method(arg1, arg2);
method(objRef, arg1, arg2);
```

In single dispatch system, only the type of `objRef` is considered while
dispatching. Type of `arg1` and `arg2` are not considered.

```java
transformation.apply(shape);
```

For the the above code to work, there needs to be two levels of dispatch -

  1. choosing which `transformation` to call (based on the receiver type)

  2. choosing which `apply(shape)` method to call (based on argument type)

In Java, only the type of receiving object (`transformation)` is considered.
Type of `shape` is the type of the reference which is `Shape`. Hence, the call
to the `apply` method is resolved to the default `apply` method from Shape
interface.

Well, that explains the weird behaviour, but what do we do now?

## **Multiple Dispatch**

[Multiple dispatch](https://en.wikipedia.org/wiki/Multiple_dispatch) is like
overloading but at runtime. Types of all the params are considered to dispatch
to correct function. Some languages support this (C#, Clojure, CommonLisp,
Julia). Few languages use libraries for the same. If your language doesn't
support this, you have to do another _redirection_  

## **Additional Redirection for Double Dispatch**

The idea is behind redirection is to remove one level of dynamic dispatch by
handling it ourself by making use of the `this` reference. Instead of passing
our `shapes` to `apply` method, we pass our `transformation` object to our
`shapes` which will redirect correctly to appropriate `apply` method.

First we add a method to our `Shape` interface for redirection. It is usually
named `accept`.

```java
public interface Shape {
  public void accept(Transformation t);
}
```

All our `Shape` classes will now implement this method.

```java
public class Line implements Shape  {
  
  @Override
  public void accept(Transformation t){
    t.apply(this);
  }
}
```

By passing `this`, we are essentially handing over the current `Line` object
to `t`. This ensures that the _visitor receives the specific_`Line` _instance
that needs to be transformed, not just a generic_`Shape` _object._

Also, because of this redirection, there is no need to overload the `apply`
method. We can safely name them differently according to the shape -
`applyToLine`, `applyToCircle`, `applyToRectangle`, etc.

Now we modify the client slightly to use our new `accept` method.

```java
for (Shape shape : shapes) {
  //transformation.apply(shape);
  shape.accept(transformation);
}
```

Lets give this a run -

```text
Applying Scaling transformation to Line
Applying Scaling transformation to Circle
Applying Scaling transformation to Rectangle
```

This is exactly what [Visitor design
pattern](https://en.wikipedia.org/wiki/Visitor_pattern) achieve - Double
Dispatch.

{{< newsletter type="simple" >}}

</shape>

