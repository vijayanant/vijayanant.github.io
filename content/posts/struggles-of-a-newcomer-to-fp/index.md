---
title: "Struggles Of A Newcomer To FP"
slug: "struggles-of-a-newcomer-to-fp"
date: 2022-06-09
draft: false
featured_image: "struggles-of-a-newcomer-to-fp-1.jpg"
tags: ["functional-programming", "haskell", "recursion", "refactoring"]
categories: ["Programming"]
description: "One of the challenges that I faced earlier on with FP is coming up with non-imperative solutions..."
---
{{< figure src="struggles-of-a-newcomer-to-fp-1.jpg" alt="woman in black long sleeve shirt covering her face with her hands" caption="Photo by [Elisa Ventur](https://unsplash.com/@elisa_ventur) on [Unsplash](https://unsplash.com)" >}}

One of the challenges that I faced earlier on with FP is coming up with non-
imperative solutions (I still do sometimes). I am sure many have faced similar
hardships. We, those who have trained ourselves to think imperatively, jump to
imperative solution first, then remember/realise we are lacking the
corresponding tools (loops, mutability, etc) in our new favourite language
(Haskell for example). Quite often this results in ugly recursive solution
that we think is functional.

Today we repeat that once again. We write a **recursive** algorithm and then
modify it to work with `fold` (and make it worse!). And then realise we missed
something basic and come up with a neat solution or two.

## Run Length Encoding

We choose [Run-Length Encoding](https://en.wikipedia.org/wiki/Run-length_encoding) (RLE) – a lossless data compression technique to implement.
RLE has been used in encoding analog TV signals, bitmap images, and in
possibly many more places. Simply put, RLE compresses a stream of data items
by encoding it as data item followed by count of consecutive repetitions of
that data. For example, `AABBBAAAAC` is encoded as `A2B3A4C`.

Here are some more examples:

```text
           Original                   Encoded
           AAAA                       A4
           AABBCC                     A2B2C2
           ABBC                       AB2C
           AB                         AB
           aaaAAAaBBb                 a3A3aBBb
           Vijay                      Vijay
           RunLengthEncoding          RunLengthEncoding
```

## Approach 1 - Basic Recursion

A quick look at the example gives us our first approach. We pass through the
sequence of data while keeping a running count of repetitions and when the
repetition breaks we replace the repetition with the encoding, reset the
count, and continue with the sequence. Seems straight forward, right?

The idea is simple, we start from the left, process each element (of the list)
one at a time, and accumulate the result (encoded list) in each step.

Here is a `Haskell` version.

```haskell
rle1 :: String -> String
rle1 [] = ""
rle1 (x:xs) = myenc1 "" x 1 xs

myenc1 :: String -> Char -> Int -> String -> String
myenc1 enc x n [] = enc ++ (x:(check n))
myenc1 enc x n  (y:ys) = case y == x of
      True ->  myenc1 enc x (n+1) ys
      False -> myenc1 (enc ++ (x:(check n))) y 1 ys

check :: Int -> String
check n | n > 1 = show n
        | otherwise = ""
```

Yes, we are going to have problem understanding what we did here in few
months. We basically have a function `myenc1` called recursively with the
current state of the program passed as arguments.

After marvelling (crying?) at the code for a while it hits us. We have turned
a list into another (possibly shorter) list. Isn’t this similar to folding
(reducing) a list? Can we simplify this code by using `fold`? Using higher
order functions like fold is supposed to make our code simple and ‘more
functional,’ right?

Let us give folds a shot.

## Approach 2 - Folds

Folding is very much what we are doing. We start from the left, process each
element one at a time, and accumulate the result. Even though conceptually we
can use `foldl'` here, we have to make some changes.

Firstly, the recursion is handled by fold itself. So, manual recursion calls
are no longer needed. Secondly, the fold function expects a binary function as
argument.

```haskell
foldl' :: Foldable t => (b -> a -> b) -> b -> t a -> b
```

Here is what we get –

```haskell
rle2 :: String -> String
rle2 [] = ""
rle2 (x:xs) = let (e, c, n) = foldl' myenc2 ("", x, 1) xs
    in e ++ (c: check n)

myenc2 :: (String, Char, Int) -> Char -> (String, Char, Int)
myenc2 (enc, current, count) x =
    case x == current of
      True -> (enc, current, count+1)
      False-> (enc ++ (current:check count), x, 1)
```

**Yuck** , this isn’t any better at all!!

## What is wrong?

At this point we are frustrated enough. This is the point at which we ask
ourself what went wrong? And this is when we have to take a step back and
rethink. Is there a better way? Can we rethink the solution?

## A Better Approach?

Instead of looking at each letter, we can look at a pattern or sub-sequence as
a whole. That is, `AAADDCCCCBB` can be seen a sequence of `A`’s,`D`’s,`C`’s,
and `B`’s in that order. If we can split the whole thing into a such a
grouping, we can treat each group separately.

```haskell
rle3 :: String -> String
rle3 [] = []
rle3 (x:xs) = x: showLen first ++ rle3 rest
  where (first, rest) = span (== x) xs
        showLen [] = []
        showLen s = show (1+length s)
```

This is much better compared to the initial solution. We no longer maintain
state between function calls. Let us take it to next level.

## Aha

What changed in our 3rd approach? Why is it better than the first two? One
thing for sure is we no longer have messy state management. What else? A major
enhancement is that we no longer deal with individual letters. We look at a
bunch of letter as a whole.

{{< quote type="pull" >}}
The beauty of programming is to solve smaller generic problems and combining
them to solve much larger problem.
{{< /quote >}}

We are onto something here! Let us look at the problem from this perspective.
Can we identify a smaller, generic problem that we can solve?

Yes, here is a smaller problem - given a bunch of repeating letters, like
“`AAAAAAAA`”, can we encode it as “`A8`”? The next problem, then, is given a
random string of letters, can I split it into multiple smaller strings of
repeating letters? The only part left now is how to string together these two
smaller solutions to get RLE.

In summary all we need to do is

1. Split a string like “AAABCCDD” into “AAA”, “B”, “CC”, and “DD”
2. Encode the smaller strings as “A3”, “B”, “C2”, and “D2”
3. Combine the result to get “A3BC2D2”

Here is how it will look -

```haskell
encode :: String -> String
encode [] = []
encode [x] = [x]
encode s = head s : (show . length) s

rle :: String -> String
rle = concat . map encode . group
```

The `group` function from `Data.List` does the first part, our `encode` does
the second part, `concat, again from` from `Data.List,` combines the result.
We then compose them together.

## So, What Does It Mean?

If we take a look at how our code/solution evolved, we notice a few things -

1) our code improved drastically once we removed state management,
2) in the final solution, most of the work is done by standard library functions
3) our code evolved from describing how to solve the problem to declaring how the
problem is to be solved

Aren’t these the first few things we hear about FP? Pure functions, a few but
well known abstractions, and most importantly declarative style of programming
where we write code that describes what will be done, not how it will be done.
As a beginner, sticking to these three guidelines/principles will help a lot.
Of course, there is much more to FP, but no need to hurry, it will come to you
naturally as you write more functional code.

There is another lesson here for us - using a language that promotes
functional style of programming (like Haskell, Scala, Clojure, etc.) does not
automatically guarantee simple and maintainable code. If not careful, even FP
cannot save us from ugly and unmaintainable code.

{{< newsletter type="simple" >}}
