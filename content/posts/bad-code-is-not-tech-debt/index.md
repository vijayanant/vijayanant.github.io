---
title: "Bad Code Is Not Tech Debt"
slug: "bad-code-is-not-tech-debt"
date: 2022-12-28
draft: false
description: "Messy code isn't technical debt; it's just bad software. Discover Ward Cunningham's original definition and why the debt metaphor only works when the code is clean enough to refactor."
featured_image: "bad-code-is-not-tech-debt-1.jpg"
tags: ["technical-debt", "refactoring", "clean-code", "software-design"]
categories: ["Programming"]
---

{{< figure
    src="bad-code-is-not-tech-debt-1.jpg" alt="Until debt tear us apart printed red brick wall at daytime"
    caption="Photo by [Alice Pasqual](https://unsplash.com/@stri_khedonia) on [Unsplash](https://unsplash.com)"
    width=800
>}}

[Ward Cunningham](https://en.wikipedia.org/wiki/Ward_Cunningham), co-author of
the Agile Manifesto and a pioneer in design patterns and XP, came up with this
metaphor as a way of explaining (to non-technical stakeholders) why
refactoring was an essential part of software development. He conveys to them
that refactoring is as important as shipping software early to maintain their.
He used the **debt metaphor as a way of making an analogy to how venture
capital is used to get a business off the ground.**

{{<quote type="pull">}}
With borrowed money you can do something sooner than you might otherwise,
but then until you pay back that money you’ll be paying interest. I thought
borrowing money was a good idea, I thought that rushing software out the
door to get some experience with it was a good idea, but that of course, you
would eventually go back and as you learned things about that software you
would repay that loan by refactoring the program to reflect your experience
as you acquired it.

 – Ward Cunningham
{{</quote>}}

## It Is Not A Bad Thing

The idea that technical debt is inherently a bad thing is a corruption of
Cunningham’s original concept. He makes it clear when he says _“I thought
borrowing money was a good idea”._ He sees it as the trade-offs made between
rushing to capture the market vs the long-term viability of code.

{{< newsletter type="simple" >}}

_“Rushing software out the door to get experience with it is a good idea, but
you need to refactor the code to reflect your experience as understanding
increases."_

We have moved quickly to capture the market by taking on some debt. This is
surely a competitive advantage but it comes with a cost.

## Bad Code Is NOT Encouraged

There is a misunderstanding that it is OK to write bad code in order to push
software faster. The argument is - _we are going to come back and fix it later
anyway, so why spend time writing clean code now?_ This is not correct.
Cunningham talks of _experience gained_ as the software progresses, and we are
expected to _refactor_ our code to reflect that experience gained.

{{< quote type="pull">}}
I’m never in favour of writing code poorly, but I am in favour of writing
code to reflect your current understanding of a problem even if that
understanding is partial.

– Ward Cunningham
{{</quote>}}
He is asking us to write good-quality code even when we accrue debt. **Bad
code is bad at explaining the intent of the code.** It is not clear what was
the understanding when you wrote it. And when the time comes to refactor, it
is that much harder to change the code as you don’t understand why it is the
way it is.

The debt is supposed to be easier to pay back. Bad code makes repayment
harder. In fact, the debt metaphor works to our advantage only if we write
code that is clean enough to be understood and refactor easily when our
understanding of the problem improves.

{{< quote type="pull">}}
If you can’t refactor your software because it is poorly architected or poorly
written, you don’t have technical debt, you have bad software.
{{</quote>}}

Then, if bad code is not Tech Debt, what is?

## What is Tech Debt?

Our understanding of the problem evolves with time, and our code should
reflect our current understanding of the problem. We accrue technical debt as
the gap between our current level of understanding and the level of
understanding reflected by the code grows. When we gain experience and
understand more subtleties and nuances of the problem, we refactor our
existing code to match the latest model. We use that experience to **pay down
the principle** that we borrowed when we released code that we knew was not
going to reflect a changing reality.

{{< quote type="pull">}}
Technical Debt here is the accumulated distance between our understanding of
the problem domain and the understanding that the system reflects.
{{</quote>}}

If we fail to refactor the code, we are **paying interest on the debt** every
time we interact with the code; combining the two disparate models of
understanding increases cognitive overhead, leads to communications problems,
and the cost of adding features becomes higher and higher. Eventually, we
simply can’t.

## This Is Unfamiliar…

If all this sounds unfamiliar, or is different from what you have read before,
it is probably because Technical Debt has become conflated with another
concept -[system entropy](https://en.wikipedia.org/wiki/Entropy) (a measure of
the degree of disorder in a system). It’s easy to write code quickly and
ignore good practices and refactoring. Over time, all of these neglects
accumulate and we end up with code that looks more like a jungle than a clean
understandable guide to the behaviour of a system. Code that is hard to
understand is very different from code that has a different understanding of
the problem.

## An example May Help

Let us assume I am working on a feature that needs to send SMS. I check with
other teams if we already have a service/system that can send SMS. I am told
that you are working on a Notification System/Service that combines email,
SMS, and/or InApp notifications. It will be ready in 2 months. I am also told
that every system will have to use this notification system going forward.

But, I have to launch my feature in 2 weeks; I will not wait for your system
to be ready. I will use a simple SMS library/service to get things rolling.

I have now taken a debt. Once the Notification system is ready and is the de-
facto thing, the debt becomes obvious. Every time we deal with my service we
have to pay the interest in the form of dealing with that SMS library. Any
time we change the Notification, we have to deal with the SMS library. Our
mental model is that every system uses the same notification system, but our
code doesn’t follow that model.

Once I switch to using the notification system, I paid back the premium. No
more debt.

## Another Example, With Code Please?

OK, let us take another example with code. We have an `addEvent` method that
adds the scheduling event to a collection.

```java
public class Scheduler {
    public void addEvent(SchedulingEvent event) {
        events.add(event);
    }
    ...
}
```

We are asked to have it do another. Whenever we receive a scheduling event, we
need to save it and also send it to a peer system. How can we make this
change?

It’s very easy. We just add two lines to the code:

```java
public class Scheduler {
    public void addEvent(SchedulingEvent event) {
        events.add(event);
        peerNotifier.notify(event);
        store.save(event);
    }
    ...
}
```

We’re adding more responsibilities to a class that is concerned with a
different thing. Schedulers should be about scheduling, not logging,
displaying, saving, or sending information to peers. This is violating Single
Responsibility Principle. Many incorrectly think this is ‘taking on tech
debt’, a temporary fix/solution to get the feature out quickly. But we are
simply writing bad/messy code.

What would it be like if we refactored the original code to make it possible
to add our new feature in a pleasant way?

```java
class Scheduler {
    public void registerEventListener(SchedulingEventListener listener) {
        listeners.add(listener);
    }

    public void addEvent(SchedulingEvent event) {
        events.add(event);

        for(SchedulingEventListener listener : listeners) {
            listener.eventAdded(event)
        }
    }
    ...
}
```

In this version, We can easily register one listener that logs, another that
displays, and another that notifies peers - and in each of these cases, the
code in Scheduler does not have to change. We had to do a bit of work to
refactor the code to this state, but once we have, adding the feature is
trivial, and non-invasive.

## Tracking Tech Debt

Now that we have some understanding of tech debt and the need for refactoring,
let us think about tracking our debt.

Over time people have come up with many ways to track tech debt. One is
through **code comments.** You add code comments where appropriate to document
technical debt as it arises. Try to include why you are doing it the way you
are doing it and at least one potential solution. Such comments usually start
with `FIXME`, `TODO`, or `OPTIMIZE` tag. Again, remember, bad code is not tech
debt. Don’t fill your code base with FIXMEs and TODOs.

It is hard to pin down all tech debt to a location in the code. It is hard to
track if there’s nowhere to document it. A **DEBT.md** file provides that
location. DEBT.md is the canonical source of where and how the application
code can and should be improved. This should not be confused with how the
application can be improved.

Instead of maintaining a separate file for debt, some use an **issue tracker**
(Bugzilla or Jira) with a `debt` tag.

All of this may sound good in theory but have little practicality. Unless you
have a way of measuring the value/cost associated with it, there is no way you
can prioritise such a list and act upon it. And there is no good way to assign
such a value/cost to tech debt.

## When To Refactor

Since we cannot assign a cost, we cannot prioritise debts. Then, how do we
decide when and which of the debts we tackle? The answer is simple - just like
your product backlog, for example, the priority is ‘when you need it’.

One way to look at this problem (of picking a debt to work on) is to consider
the existing code to which we are thinking of adding a feature and ask
ourselves what the code should look like to make it easier for us to add this
feature. Most of the time this involves some generalisation, renaming and/or a
clarifying extraction. We can alter the structure a bit and make it ready for
the change. Sometimes this may involve a bigger change. It all depends on
whether the original design anticipated the current change or not.

Look at the example above, the `Scheduler` class did not anticipate such a
change. Or perhaps it was an overkill at that time to add the observer
pattern. Either way, we changed the code to make it easier to add a new
feature. We could say this refactoring effort is the cost. But we couldn’t
have known this before the feature was even thought of.

The message is clear, don’t use the debt metaphor to justify writing bad code;
you are simply degrading the internal quality. The argument that ‘new features
are needed urgently, and perhaps it is OK to let the code be messy’ isn’t well
founded. Bad code impacts quickly and slows down the new features that are
needed quickly. We usually end up releasing slower than expected and with
messy code which is harder to refactor taking up even more effort when the
time comes. Taking on debt to speed-up delivery only works if you write code
that is clean enough to be understood and refactored.

{{<quote type="pull" >}}
Consequence of Tech Debt is quick to market and refactoring effort later.
Consequence of bad code is apparent speed coupled with legacy code and code
rewrite later.
{{</ quote>}}

## Finally…

Technical Debt is a metaphor initially used to explain the management need for
code refactoring; it is not a development methodology or a design philosophy;
it neither tell you how to design or write code nor does it tell you when to
take debt. The debt metaphor helps us think about how to deal with design
problems and how to communicate that thinking.

{{< newsletter type="simple" >}}
