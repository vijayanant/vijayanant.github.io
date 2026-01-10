---
title: "Teaching the AI to Code (and Accidentally Becoming Better Engineers)"
slug: "teaching-the-ai-to-code-and-accidentally-becoming-better-engineers"
date: 2025-07-24
draft: false
description: "The best practices we used to skip are suddenly back, not for us, but for the AI"
featured_image: "teaching-the-ai-to-code-and-accidentally-1.jpg"
tags: ["ai", "llm", "best-practice"]
categories: ["AI in Engineering"]
---
Remember all those engineering best practices we were taught…  
but quietly skipped?

Write clear user stories.  
Name things well.  
Break down problems.  
Document decisions.  
Structure your design.

We knew these were good habits.  
But real deadlines, MVP crunches, and scrappy startups had other plans.

So a lot of that got lost.

{{< figure
    src="teaching-the-ai-to-code-and-accidentally-1.jpg"
    width=600
>}}

Now, with AI in the mix, we’re doing it all again.  
**Not for ourselves but to help the AI understand what we're asking.**

It turns out: if you want a language model to generate anything useful inside
a real codebase, you have to give it the full context.

* Use cases
* Architecture overviews
* Similar implementations
* Design intent
* Naming conventions
* Integration patterns

Basically: you have to **engineer** the problem, before the AI can engineer a
solution.

A developer recently shared two workflows while using an AI assistant.
([LinkedIn post](https://www.linkedin.com/posts/harshad-nawathe-76762618_ever-notice-how-ai-assistant-demos-often-activity-7353642093703049217-q4rW/))

One was a fun roleplay: an “Architect” persona proposing a design, challenged
by a “Devil’s Advocate,” then refined in a loop.

The other?

A long, structured, context-first deep dive:

* Deconstruct the problem
* Feed in docs, patterns, and similar code
* Build shared understanding
* Then — only then — generate code, in phases

{{< figure
    src="teaching-the-ai-to-code-and-accidentally-2.jpg"
    width=600
>}}

Guess which one worked?

Not the clever roleplay.  
The boring one.  
The one that looked like real software design.

And that’s the kicker:

The AI didn’t need clever prompts.  
It needed the engineering discipline we used to have.

{{< quote type="pull" >}}
We're not doing best practices because a manager told us to.  
We're doing them because the AI falls apart without them.
{{< /quote >}}

The AI isn't leveling us up.  
It's just reminding us what the level always was.

We say we’re coding with AI.

But most days, it feels more like we’re **coaching** it.

And in doing that maybe we’re finally coaching ourselves again, too.

{{< newsletter type="simple" >}}
