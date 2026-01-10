---
title: "Wait for the Abstraction to Earn Its Place"
slug: "wait-for-the-abstraction-to-earn-its-place"
date: 2025-07-29
draft: false
description: "Duplication isn’t the enemy. Premature abstraction is."
featured_image: "wait-for-the-abstraction-to-earn-1.jpg"
tags: ["abstraction", "duplication", "refactoring", "dry-principle"]
categories: ["Programming"]
---
{{< figure src="wait-for-the-abstraction-to-earn-1.jpg" alt="turned on laptop computer" >}}

We’ve been taught to fear duplication.

"Don't Repeat Yourself."

It's etched into every clean code guide, every pull request nitpick.
Duplication is waste, right?

Well… not always.

Sometimes duplication is just **waiting for the right abstraction to show
up.**

Too often, we squash repeated code **prematurely** , and end up with a leaky,
rigid, half-wrong abstraction that doesn't actually fit anything well.

* * *

### Duplication isn’t the enemy. Misguided abstraction is

Here’s the trap:

You spot some duplication:

```python
def can_user_view_document(user, document):
    return document.owner_id == user.id or user.is_admin

def can_user_edit_document(user, document):
    return document.owner_id == user.id
```

So you DRY it up:

```python
def can_user_act_on_document(user, document, action):
    if user.is_admin:
        return True
    if action == "view":
        return document.owner_id == user.id
    if action == "edit":
        return document.owner_id == user.id
    return False  # unknown action

    # growing conditionals and nested logic
```

Seems harmless, right?

You might be thinking:  
_"If this gets messy, I’ll just refactor it later."_

But here’s what “later” usually looks like:

```python
def can_user_act_on_document(user, document, action, context=None):
    if user.is_admin:
        return True

    if action == "view":
        if document.shared_with and user.id in document.shared_with:
            return True
        if document.status == "published" and document.is_public:
            return True
        return document.owner_id == user.id

    if action == "edit":
        if document.workspace_id in user.collaborating_workspaces:
            return True
        if context and context.get("override"):
            log_override(user, document, action)
            return True
        return document.owner_id == user.id

    log_permission_denied(user, document, action)
    return False

```

That clean abstraction?  
It’s now a tangle of roles, edge cases, overrides, and fallback rules.

And because you abstracted early, _everything_ now flows through this one
brittle path.  
You didn’t avoid duplication. You **centralised fragility**.

And here’s the worst part:

Once this function becomes part of your shared library or service layer, it
becomes a _fixed interface_.

You can’t just “refactor it later.”  
Too many other components or entire teams depend on how it works.

So you stop improving it and start working around it.  
What started as a cleanup turned into a slow-burn trap.

* * *

### Abstractions should emerge, not be forced

Codebases evolve. So should your design.

If you hold off on abstracting too early, you let the duplication teach you
what the real differences are. You give the abstraction a chance to **reveal
itself**.

When you abstract too soon, you’re guessing. When you wait, you’re reflecting.

When you see duplication but don’t yet know the right abstraction, leave the
code as is. Clarity now is better than the wrong abstraction later. Good
abstractions don’t just reduce lines, they clarify intent.

### Use duplication as a design probe

Here’s a better way to think about it:

* **Duplication is a signal** that two things might be similar.

* But only **time and change** will prove whether they truly are.

Instead of reaching for a reusable function, try this:

* Let duplicated code live in two places for a while.

* Watch how each copy evolves as requirements change.

* Extract only when the shared shape becomes obvious.

This is how TDD works at its best. Design revealed through usage.

* * *

### What to watch for when you _do_ abstract

If and when the time comes to unify similar logic:

* Make sure your abstraction has a **single clear purpose**

* Avoid bundling unrelated logic behind conditionals

* Choose names that convey **intent** , not just reuse

* Ask: does this make the code **easier to change** later?

Because that's what abstraction is for. Not just cleanliness but for
**changeability**.

* * *

### In the end, duplication is easier to recover from

Bad abstractions are sticky. They spread. They become dependencies.

Duplication? You can always clean it up later.

{{< quote type="pull" >}}
**Premature abstractions often turn into leaky abstractions.**  
When you extract too early, you’re locking in the wrong shape; when real-
world needs don’t fit, that complexity starts leaking through. Instead of
hiding details, your abstraction exposes them.
{{< /quote >}}

So the next time you see similar code in two places, pause before you DRY it
up. You might be looking at **two ideas wearing the same coat** and not one
idea waiting to be shared.

Wait for the abstraction to earn its place.

Then, and only then, give it a name.  
Duplication can be fixed. Wrong abstraction? That’s a scar.

{{< newsletter type="simple" >}}
