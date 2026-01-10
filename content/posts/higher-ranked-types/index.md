---
title: "Monomorphism, Polymorphism, and Higher Ranked Types."
slug: "monomorphism-polymorphism-and-higher-ranked-types"
date: 2019-01-24
draft: false
featured_image: "higher-ranked-types-1.jpg"
tags: ["haskell", "type-system", "polymorphism", "rankntypes"]
categories: ["Programming"]
description: "An explanation of Monomorphism, Polymorphism, and Higher Ranked Types in Haskell."
---
{{< figure src="higher-ranked-types-1.jpg" alt="white stage" caption="Photo by [Joshua Golde](https://unsplash.com/@joshgmit) on [Unsplash](https://unsplash.com)" >}}

Let’s get started with a _monomorphic_ function -

```haskell
incr :: Int -> Int
incr = (+1)
```

The function `incr` works on values of type `Int` and nothing else. We can
make our function _polymorphic_ by using type parameters in place of concrete
types -

```haskell
incr' :: Num a => a -> a
incr' = (+1)
```

The modified function `incr'` can work with any type that has a `Num`
instance. Now let us move on and look at a simple _higher order_ function -

```haskell
foo :: (a -> a) -> a -> a
foo g x = g x

intval  = foo (+1) 1       -- 2
listval = foo (++[1]) [1]  -- [1, 1]
```

The first argument to `foo` is a function of type `a -> a` bound to `g`. Is
the function `g` polymorphic here? The answer is **No!** The `a` type is being
used polymorphically here, however, `a` is bound to whatever is the type of
`x` when `g` is applied to `x` i.e., `g` is monomorphic!

You don’t believe me? Try this

```haskell
badfoo :: Show a => (a -> a) -> String
badfoo g = (show (g 1000)) ++ (g "? what!")
```

Or this function -

```haskell
badbar :: Show a => (a -> a) -> IO ()
badbar g = do
    print $ g 100
    print $ g "why?"
```

The compiler will not be happy with this code. If `g` were polymorphic, we
could apply it to both numeric and string values!

## Polymorphic Functions

We make our functions polymorphic by using type parameters instead of fixing
the types. When the function is s applied to a value, the type parameter(s)
are bound to actual type(s). We say the function is _instantiated_ with the
given types. The actual types (of type variables) are set to the types of
values passed to the function.

Actual type of a polymorphic function is decided where the function is used,
not where the function is defined, i.e., the user of the function decides the
type.

Same applies to higher order functions. If the types of the argument function
are parameterised, the actual types are decided when the argument function is
used.

Coming back to `badfoo` function, the type of the argument function is `(a ->
a)`. The type for type variable `a` in `(a -> a)` is bound when this function
is applied to a value (when we call `g 1`). This means, for the reminder of
this function body, `g` is monomorphic.

What we wanted, though, is for `g` to be polymorphic. We want the type of `g`
to be bound when user calls `badfoo` - not when `g` is used within `badfoo`.

## Rank

Whenever we want to pass a polymorphic function `g` as an argument to another
function `f`, we want the type of `g` to be decided not within the body of `f`
but at the caller site - one level up so to say. We say, `f` is ranked one
level higher than `g`.

All monomorphic functions are **Rank 0**. All polymorphic functions are Rank

1. A rank-2 polymorphic function takes as an argument a rank-1 polymorphic
function. A rank-3 functions takes as an argument a rank-2 polymorphic
function, and so on.

2. 2. If a higher order function takes as argument a rank (N-1) function, then it
is said to be **Rank-N** polymorphic function.

{{< quote type="pull" >}}
If a higher order function takes as argument a rank (N-1) function, then it
is said to be **Rank-N** polymorphic function.
{{< /quote >}}

## RankNTypes GHC Extension

Haskell is based on the [Hindley-Milner type
system](https://en.wikipedia.org/wiki/Hindley%E2%80%93Milner_type_system) -
and while it allows us to write polymorphic functions, it doesn’t allow us to
write functions which take polymorphic functions as arguments.

Higher Ranked Types are provided in GHC as a language extension. It can be
enabled via the `RankNTypes` extension. Practically speaking, enabling higher-
ranked types lets us introduce new variable scopes inside of type signatures.

Here’s the implementation we want:

```haskell
{-# LANGUAGE RankNTypes #-}
goodfoo :: (forall a. Show a => a -> a) -> String
goodfoo g = (show (g 1)) ++ (g "Works!")
```

Higher Ranked Types make polymorphic Haskell functions _first class_.

{{< newsletter type="simple" >}}
