--- 
title: "What Actually Worked for Me with AI-Assisted Development"
subtitle: "My AI Workflow"
slug: "ai-workflow"
date: 2026-02-02
draft: true
categories: ["Programming"]
tags: ["ai", "LLM", "agentic"]
description: "Why AI didn't replace my thinking but made it more central. A field report on using AI within a strict TDD loop without losing design intent."
featured_image: "workflow.jpg"
--- 

I’ve been using AI as part of my day-to-day development workflow for a while now. Not as a demo. Not as an experiment. Just… as work.

And if you read enough Twitter or LinkedIn, you’d think this inevitably leads to “agentic workflows”, parallel projects, and AI systems happily coding away while humans sip coffee and review dashboards.

That hasn’t been my experience.

What *has* happened is more interesting, more subtle, and a lot less flashy.

This is a short field report from someone who already cared about TDD, design, and intent *before* AI entered the picture.

---

## What I thought would happen

I assumed AI would mainly:

- save typing
- speed up implementation
- let me think while it worked

In other words, I expected time to open up between “deciding what to do” and “doing it”.

That didn’t quite happen.

---

## What actually happened

I work in a **strict TDD loop**. One test at a time. No speculative code. No big jumps.

In that setup, the AI writes code *very* fast. Almost instantly. The implementation of a single test is rarely the slow part.

What surprised me was this:

> The thinking didn’t move out of the loop.  
> It *tightened*.

I wasn’t sitting around waiting for the AI.  
I was constantly deciding:

- what the next test should be
- what behavior I really wanted
- whether a change preserved intent or quietly altered it

Often, that thinking took seconds, not minutes.

The AI wasn’t giving me “free time”.  
It was removing friction from execution so the thinking loop became more visible.

And honestly? I liked that.

Typing and boilerplate went away.  
Design and judgment didn’t.

---

## The trust problem nobody advertises

Then came the part no one really talks about.

The AI would sometimes:

- remove older tests
- rewrite carefully worded comments
- “clean up” things I had added deliberately

Nothing malicious. Often even well-intentioned.

But each time it happened, I had to stop and ask:
“Why did you change that?”

And over time, that does something subtle.
It erodes trust.

Not in the *tool*, exactly.  
But in how much freedom you’re willing to give it.

This is the moment where most people seem to say:
> “Fine, let’s add more agents / more autonomy / more parallelism.”

I almost went there.

---

## The mistake I almost made

The tempting conclusion is:
> “I’m the bottleneck. I need to get out of the way.”

But when I looked closely, that wasn’t true.

The real issue wasn’t *me*.  
It was that many of my rules were **implicit**.

I knew:

- old tests encode past intent
- comments explaining *why* matter
- some files should never be touched casually

The AI didn’t know that.  
And I hadn’t actually told it, in a way it couldn’t ignore.

So the problem wasn’t trust.  
It was **underspecified authority**.

---

## What actually helped

What worked was not more autonomy, but **clearer boundaries**.

A few examples:

- Making some files and comments explicitly read-only
- Treating tests as append-only history, not editable assets
- Writing down, once, what the AI may and may not touch
- Reviewing changes in slightly larger batches, but at semantic boundaries

In other words, I started formalising things I had previously enforced by instinct.

Not more process.  
Just fewer surprises.

Once those boundaries were visible, the AI stopped being “creative” in the wrong places, and I stopped hovering over every keystroke.

---

## About “agentic workflows”

I do understand the appeal.

Agents, swarms, parallel projects… they all promise one thing:
**throughput**.

But in a tight TDD loop, throughput isn’t the constraint.
Intent is.

In my experience, agents don’t remove the human from the system.
They just move the human to a different point in the loop.

And if you move them too far away from intent and invariants, you don’t get leverage.
You get drift.

That might be acceptable in some domains.
It isn’t in mine.

---

## The uncomfortable conclusion

AI didn’t replace my thinking.
It made it more central.

I now spend:

- less time typing
- less time on boilerplate
- more time deciding what *should exist*

That already feels like a win.

So no, I’m not running five projects in parallel.
I’m not letting agents refactor my codebase overnight.
And I’m not chasing full autonomy.

What I have instead is:

- a calmer workflow
- tighter feedback
- and a very fast, very literal collaborator

For now, that’s exactly what I want.

If anything, this experience reinforced something I already believed:

> Tools don’t remove responsibility.  
> They just make it harder to pretend you didn’t have it.
