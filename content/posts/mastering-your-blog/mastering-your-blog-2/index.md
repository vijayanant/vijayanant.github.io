---
title: "Rich Content: Code Blocks, Notes & Summaries"
slug: "rich-content-code-blocks-notes-summaries"
date: 2024-09-27
description: "Elevate your technical content with beautifully highlighted code, custom notes, and concise summaries."
tags: ["hugo", "blogging", "writing", "shortcode", "content-strategy"]
categories: ["Career and Writing"]
series: ["Mastering Your Blog"]
series_order: 2
featured_image: "featured.jpg"
draft: true
---

Welcome back to "Mastering Your Blog"! In this post, we'll explore how to make your technical content more engaging and readable using advanced formatting features.

## Beautiful Code Blocks

Your blog is configured to automatically highlight code blocks, add line numbers, and provide a convenient "Copy to Clipboard" button. Just wrap your code in triple backticks, specifying the language.

```python
def calculate_fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        print(a)
        a, b = b, a + b

calculate_fibonacci(10)
```

{{< note type="tip" title="Customizing Code Highlighting" >}}
You can change the code highlighting theme (currently 'dracula') and other settings in your `config.toml` file under the `[markup.highlight]` section.
{{< /note >}}

## Custom Notes and Callouts

Use the `{{</* note */>}}` shortcode to draw attention to important information, tips, warnings, or even your personal insights. It supports different types for visual distinction.

Here's how to use them:

```
{{</* note type="info" title="Important Fact" */>}}
This is a general piece of information.
{{</* /note */>}}
```

```
{{</* note type="tip" */>}}
Here's a helpful tip for you!
{{</* /note */>}}
```

```
{{</* note type="warning" title="Caution!" */>}}
Proceed with caution.
{{</* /note */>}}
```

```
{{</* note type="danger" */>}}
This action is irreversible.
{{</* /note */>}}
```

```
{{</* note type="log" title="Architect's Log" */>}}
My personal thoughts on this topic.
{{</* /note */>}}
```

Here's how they render:

{{< note type="info" title="Important Fact" >}}
This is a general piece of information.
{{< /note >}}

{{< note type="tip" >}}
Here's a helpful tip for you!
{{< /note >}}

{{< note type="warning" title="Caution!" >}}
Proceed with caution.
{{< /note >}}

{{< note type="danger" >}}
This action is irreversible.
{{< /note >}}

{{< note type="log" title="Architect's Log" >}}
My personal thoughts on this topic.
{{< /note >}}

## Concise Summaries

For key takeaways or summaries, use the `{{</* summary */>}}` shortcode. It's perfect for reinforcing main lessons.

Here's how to use it:

```
{{</* summary title="Key Takeaways" */>}}
*   Code blocks are awesome.
*   Notes improve readability.
*   Summaries reinforce learning.
{{</* /summary */>}}
```

Here's how it renders:

{{< summary title="Key Takeaways" >}}

* Code blocks are awesome.
* Notes improve readability.
* Summaries reinforce learning.
{{< /summary >}}

In our next post, we'll cover how to keep your readers engaged with related content and a newsletter!

{{< newsletter >}}
