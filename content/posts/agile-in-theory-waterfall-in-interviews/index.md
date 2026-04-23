---
title: "Agile in Theory, Waterfall in Interviews"
seo_title: "System Design Interviews: Why They Fail and How to Prepare"
slug: "agile-in-theory-waterfall-in-interviews"
date: 2025-08-11
draft: false
description: "System design interviews often contradict real engineering. Learn what to test instead and how to demonstrate your thinking as a candidate."
featured_image: "featured.svg"
tags: ["interview", "hiring", "agile", "system-design", "career"]
categories: ["Career and Writing"]
pillar: strategy
pillar_role: essay
level: "Intermediate"
---
We say we value iteration.  
We say feedback is everything.  
We say agile is how good software gets built.

Then we walk into an interview…  
And ask someone to design Twitter at scale. All in one go.

No iteration. No product context. No user feedback.  
Just: “Design it. Now. All of it.”

It’s a weird contradiction.

* * *

System design interviews are supposed to test how well someone can architect real-world systems.
Real systems are rarely built in a single 45-minute burst of "final" architecture.

They are composed of [**Architectural Quanta**]({{< ref "/posts/architectural-quantum-modular-deployable-architecture" >}}) that evolve independently over time.
They respond to changing needs, product feedback, scale surprises, and team constraints.

Great architecture doesn't start with a solution; it starts with [**deriving the real drivers**]({{< ref "/posts/from-patterns-to-practice/deriving-your-drivers" >}}) behind the business problem.

So what are we really testing?

Often, we’re testing:

* Who’s memorized the “correct” boxes and arrows

* Who can perform confidently under artificial pressure

* Who’s seen the “Netflix architecture” diagram enough times to fake it

We say we value iteration and ambiguity.  
But we test for finality and certainty.

We say we want thoughtful builders.  
But we optimize for performers.

* * *

### So what should we test instead?

* **Can they ask clarifying questions?**  
That reveal product intent and ambiguity

* **Can they break the problem down?**  
In a way that makes trade-offs visible

* **Can they communicate their thinking?**  
Not just the end state, but how they got there

* **Do they show awareness of context?**  
Scale, users, constraints, and when assumptions break

A good engineer doesn’t start with the final diagram.  
They start with understanding.  
Then they build with the team one decision at a time.

{{< quote type="pull" >}}
  Ironically, the ‘ask questions, break it down, think in trade-offs’ approach isn’t radical, it’s what system design interviews were meant to test before they got reduced to architecture talent shows.
{{< /quote >}}

{{< figure
    src="agile-waterfall-interview-meme.jpg"
    alt="Meme featuring a character (often from Office Space) sarcastically asking to skip clarifying questions and directly draw a final system design diagram, highlighting the contradiction in typical tech interviews."
    width=600
 lazy="false" >}}

System design interviews won’t go away. And they _can_ be useful.  
But maybe it’s time we align how we interview with how we actually build.

We say we’re agile.  
Let’s interview that way, too.

* * *

**🎯 If you’re a candidate walking into one anyway…**  
You can’t change the format. But you _can_ shape how you show up:

* **Start with questions.** Shape the problem before solving it.

* **Think in trade-offs.** Show how you evaluate paths, not just where you land.

* **Keep it simple.** Clear beats clever.

* **Use first principles.** If you haven’t built at massive scale, show how you think.

* **Aim for a conversation.** Not a final answer.

If you're interested in how real systems evolve outside of the interview room, you might enjoy my guide on [**Architectural Quanta**]({{< ref "/posts/architectural-quantum-modular-deployable-architecture" >}})—the true units of independent change in a distributed world.

System design interviews may not reflect how we build.  
But how you think still matters.  
Make that visible.

* * *

{{< newsletter type="simple" >}}
