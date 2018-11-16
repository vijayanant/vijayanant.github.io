+++
title       = "Dependent Types To Eliminate Runtime Checks"
date        = 2018-10-26
type        = "post"
categories  = ["Types", "Programming"]
tags        = ["fp", "Haskell", "Dependent Types"]
description = """
One of the main advantages of static typing is to catch errors before we deploy
code to production. Dependent Types allow us to eliminate some checks that are
usually done at run time. I take a simple example to show how dependent types
can be used in that regard in day-to-day programming.
"""
draft       = false
+++

One of the main advantages of [static type checking]
(https://en.wikipedia.org/wiki/Type_system#Static_type_checking) is to catch
errors before we deploy code to production.  [Dependent Types]
(https://en.wikipedia.org/wiki/Dependent_type) allow us to eliminate some checks
that are usually done at run time. I take a simple example to show how dependent
types can be used in that regard in day-to-day programming.

## Give Me The Money!

Let us start with an example. We will define a simple type for representing
money and a function to add money.

```Haskell
data Money = Money Rational
```

Now we can add them together as 

```Haskell
add :: Money -> Money -> Money
add (Money m1) (Money m2)  = Money (m1 + m2)

money1 = Money (50 % 100)
money2 = Money (25 % 100)

total = add money1 money2
```

## Everything OK There?

There is something we have missed here. The currency. Money is represented in
some _currency_ (like US Dollar) and we cannot add money in different
currencies. For example, you cannot add 2 US dollars and 2 British Pounds.

Lets include currency information in our `Money` type. A simple approach is to
keep a string representing the currency ("GBP", "USD", etc.) along with the
amount.

```Haskell
data Money = Money String Rational

twoDollars :: Money
twoDollars = Money "USD" 2
```

##  Houston, We've Got a Problem
The constraint that only `Money` values with same `currency` can be added makes
our `add` function [partial](https://en.wikipedia.org/wiki/Partial_function).

```Haskell
add:: Money -> Money -> Money
add   (Money c1 m1) (Money c2 m2) =
      case c1 == c2 of
          True  ->  Money c1 (m2 + m2)
      --  False ->  ??  -- the function is not defined for this value 
```

Partial functions are bad. They pass type check and fail at runtime. The
application crashes when inputs for which the function is not defined are
passed. Our `add` function above fails if it is ever called with two `Money`
values with different currency.

```Haskell
λ> :t add fiftyPence twoDollars
add fiftyPence twoDollars :: Money

λ> add fiftyPence twoDollars
*** Exception: /Users/vj/workspace/Haskell/Money.hs:(23,7)-(24,37): Non-exhaustive patterns in case
```

## Improvise, Adapt, Overcome
A simple way to overcome this problem is to extend the function to return a
specific value (an _error_ value) for all those inputs for which the function is
not defined.

Wrapping the return type with `Maybe` or `Either e` are common approaches to
extending the function. A special value of `Nothing::Maybe Money` (or `Left
"Incompatible Currency"::Either String Money`) can be returned for all the
inputs where `add` is originally not defined.

A simple addition function now has to deal with error cases. If we decide to
indicate an error using `Maybe Money` or `Either Error Money` as return type,
the calling function also has to deal with such a value appropriately (may be by
returning an error to its caller!).

```Haskell
add :: Money -> Money -> Maybe Money
add   (Money c1 m1) (Money c2 m2) = 
      case c1 == c2 of
          True  -> Just (Money c1 (m2 + m2))
          False -> Nothing
```

## Independence? Freedom? What?
Using dependent types we can avoid the runtime check by making it possible for
the compiler to do that check for us. Since the compiler prohibits calling our
`add` function with incompatible money values, we are not only freed from
runtime check, we also don't have to worry about error handling.

This is in contrast to extending the function. Here we _restrict the domain of
the function_ to contain only those values for which the function is defined.

> Dependent Types are advanced concepts. But we don't have to know all the
> theory and concepts behind it as many good people have made it so simple for
> us to use it. But I recommend you all to read and know more to use them in
> more interesting ways.

```Haskell
{-# LANGUAGE KindSignatures, DataKinds #-}

import GHC.TypeLits (Symbol)
import Data.Ratio ((%))

data Money (currency :: Symbol) = Money Rational

fiftyPence :: Money "GBP"
fiftyPence = Money (50 % 100)

twoDollars :: Money "USD"
twoDollars = Money 2

add :: Money c -> Money c -> Money c
add (Money m1) (Money m2) = Money (m1 + m2)
```

Notice how the implementation of `add` function is same as the one before
introducing `currency` parameter. It has no if/case expressions and no `Maybe`
return type. It is a compilation error to add `Money` values with different
currency. 

```Haskell
λ> :t add fiftyPence fiftyPence
add fiftyPence fiftyPence :: Money "GBP"

λ> :t add fiftyPence twoDollars

<interactive>:1:16: error:
    • Couldn't match type ‘"USD"’ with ‘"GBP"’
      Expected type: Money "GBP"
        Actual type: Money "USD"
    • In the second argument of ‘add’, namely ‘twoDollars’
      In the expression: add fiftyPence twoDollars
```

We use _language extensions_ in GHC for using dependent types. I will try to
explain their usage in simple terms.

## Be Kind To Others

Notice the type of `fiftyPence` -

```Haskell 
fiftyPence :: Money "GBP"
```

`Money` is a _type constructor_, as we know, type constructors only accepts
other types as parameters (`Maybe Int`, `[Int]` etc.). But, `"GBP"` looks like a
String value! How is this possible? 

Firstly, `"GBP"` in `fiftyPence :: Money "GBP"` is not a value but a type with
__kind__ `Symbol`. You can see that in the data definition of Money. `currency`
type parameter is of kind `Symbol`.

```Haskell
data Money (currency :: Symbol) = Money Rational
```

`Symbol` is a convenient Kind provided by GHC in the `GHC.TypeLits` module which
is the kind for type-level strings. It lets us use string literals like "GBP" as
a type.

>You know that we can manually specify a variable's type. Similarly, we can also
>manually specify a type variable's kind using the *__KindSignatures__*
>extension.

## Congratulations! You have Been Promoted

OK, So, `KindSignatures` extension lets me specify that `currency` has kind
`Symbol`, but how does `"GBP"` and `"USD"` become types of of kind `Symbol`?

```Haskell
fiftyPence :: Money "GBP"
fiftyPence = Money (50 % 100)

twoDollars :: Money "USD"
twoDollars = Money 2
```

This is all thanks to another GHC extension we have used - *__DataKinds__.* When
this extension is enabled, the type constructors are _promoted_ to Kinds and value
constructors are promoted to type constructors.

In our case, the kind `Symbol` is already provided by GHC. All we need is for
GHC to promote and recognize `"GBP"` as type.

```Haskell
λ> :k Money "GBP"

<interactive>:1:7: error:
    Illegal type: ‘"GBP"’ Perhaps you intended to use DataKinds

λ> :set -XDataKinds
λ> :k Money "GBP"
Money "GBP" :: *

λ> :k Money Int

<interactive>:1:7: error:
    • Expected kind ‘Symbol’, but ‘Int’ has kind ‘*’
    • In the first argument of ‘Money’, namely ‘Int’
      In the type ‘Money Int’
```

> The promoted types, `"GBP"` and `"USD"` in the above example, have no
> inhabitants.

>Also, promoted types are prefixed with a quote (`'"GBP"` and `'"USD"`) but they
>can almost always be ignored as the context of their usage makes it clear which
>one we meant - the type "GBP" or the string value "GBP".

## The Beginning
There is much more to depended types than what we have seen here. This is to
show readers that dependent types can be useful in day-to-day programming as
well.
