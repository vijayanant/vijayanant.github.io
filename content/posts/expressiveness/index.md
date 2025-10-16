---
title: "Expressiveness"
slug: "expressiveness"
date: 2018-11-08T09:35:00.000Z
draft: false
featured_image: "expressiveness-1.jpg"
tags: ["expressiveness", "haskell", "type-system", "programming-language"]
categories: ["Programming"]
description: "Exploring the concept of expressiveness in programming languages, comparing Haskell, Java, and Python implementations of a Tree data structure."
---
{{< figure src="expressiveness-1.jpg" alt="Expressive" caption="Expressive" >}}

My goto answer when someone asks why I like
[Haskell](https://www.haskell.org/) so much these days is usually _“I like the
expressiveness and run time guarantees of Haskell”._ For those who are little
more interested, I would usually show the popular quick sort or merge sort
implementations. I wanted a slightly more complicated, yet commonly known,
example to demonstrate what I claimed.

Define a simple `Tree` type. Instead of constructing the tree one-element-at-
a-time, we provide a convenient function `fromList` which takes a list and
adds its elements to tree. We also provide a way to turn the `Tree` back to a
list by providing `inorder` function to [traverse the tree in-
order](https://en.wikipedia.org/wiki/Tree_traversal)

The tree construction happens like this: we split the list in to three parts -
middle element, left-sublist and right-sublist. Then, we recursively construct
left and right sub-tree with the two split parts of the list. The middle
element is used at the current node. Why we do it this way? If you pass a
sorted list, this will construct a binary search tree. In-order traversal on
that tree should return the original sorted list back!

```haskell
data Tree a = Empty | Node (Tree a) a (Tree a)
  deriving (Show)

fromList :: [a] -> Tree a
fromList xs 
  | null xs = Empty
  | otherwise = Node (fromList x1) x (fromList x2)
    where (x1, x:x2) = splitAt (length xs `div` 2) xs

inorder :: Tree a -> [a]
inorder Empty = []
inorder (Node l x r) = inorder l ++ [x] ++ inorder
```

You can find the
[Java](https://gist.github.com/vijayanant/d557b72bea0eda2b3490ba8e059fb486#file-tree-java) and
[Python](https://gist.github.com/vijayanant/d557b72bea0eda2b3490ba8e059fb486#file-tree-py) version on [Gist](https://gist.github.com/).

It got me thinking whether expressiveness is something we can compare between
any two programming languages or paradigms.

{{< newsletter type="simple" >}}

## Conciseness

One thing that is very visible among the three implementations is the size of
the programs. Is that a good measure of expressiveness of a language? I don’t
think so. If being concise is what makes a language expressive, [obfuscated
C](https://www.ioccc.org/) programs would be everywhere and even encouraged.

We also have
[APL](https://en.wikipedia.org/wiki/APL_\(programming_language\)), a unique
mathematically-inclined programming language designed for conciseness. To
anyone unfamiliar with the syntax of the language, APL looks like a series of
nonsensical graphical symbols, letters, and numbers. However, to an APL
programmer, each graphical symbol or set of symbols stands in for a
mathematical function.

Trying to be concise took away expressiveness in the case of C but is the
strength of APL.

## Type System

Type systems restrict possible valid programs in a language. This, in some
sense, should make the statically checked, strongly typed languages less
expressive than the dynamically checked, weakly typed languages as there are
less valid programs that can be constructed. Some programs are invalid in
strongly typed languages but are valid in weakly typed languages.

But, both
[Haskell](https://en.wikipedia.org/wiki/Haskell_\(programming_language\)) and
[Lisp](https://en.wikipedia.org/wiki/Lisp_\(programming_language\)) are
considered highly expressive languages. Haskell is strongly typed and
statically checked where as Lisp is weakly typed (compared to Haskell) and
dynamically checked language.

## Programming Paradigm

I don’t consider [programming
paradigm]({{< ref "posts/taming-complexity-a-guide-to-imperative" >}}) to be a property of a programming language, it
is rather something that a language promotes. This is evident in Python which
provides many constructs to supports procedural, object oriented, and
functional style of programming.

However, it is definitely possible that some problems and/or their solutions
are better expressed in one style than in other.

## Time

How quickly can you express your ideas in a language can also be a measure of
expressiveness. Dynamically typed languages, like Python, Ruby, etc., are
considered to excel at this. However, proponents of modern statically typed
languages like Haskell claim that its [type
inferencing](https://en.wikipedia.org/wiki/Type_inference) mechanism nullifies
this advantage by being quick to write programs and providing static type
safety.

## Conclusion

It might be safe to consider expressiveness of a language to be some
combination of each of the above factors. But that adds more fuel to the
confusion. What is the right balance? How do we compare two languages with
different _weights_ associated with each the above factors?

We can also go by the definition where expressiveness is simple measure of all
the things that can be expressed in that language. Most general purpose
programming languages are [Turing
Complete](https://en.wikipedia.org/wiki/Turing_completeness), that is they can
express anything _computable_.

I think each programming language defines what expressiveness means for that
language.

For Lisp and family, being able to express almost anything with its macro
system is its expressive power. For Haskell and family, it is its type system
which allows expressing abstract concepts clearly with added type safety. For
Python and other dynamic languages, expressiveness is a measure of how quickly
you can express the abstraction.

{{< summary >}}
In general, we can say, expressiveness is the ability of a language to express
the solution to a problem

* closer to the original problem formulation,
* in a clear, natural, intuitive, and concise way,
* in terms of other solved (sub)problems.
{{< /summary >}}
