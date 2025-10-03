---
date: 2025-09-26
description: "Learn the fundamental front matter fields, how to organize posts into series, and add featured images to your articles."
tags: ["blogging", "hugo", "front matter", "series", "featured image"]
categories: ["how-to", "blogging"]
series: "Mastering Your Blog"
series_order: 1
featured_image: "featured.jpg"
---

Welcome to the first post in our "Mastering Your Blog" series! This article will guide you through the essential elements of creating content for your new Hugo-powered blog.

## Understanding Front Matter

Every post starts with **front matter**, a block of YAML (or TOML/JSON) at the top of your Markdown file, enclosed by `---` delimiters. This metadata tells Hugo how to process and display your content.

```yaml
---
title: "My Awesome Blog Post"
date: 2025-10-01
description: "A concise summary for SEO and list pages."
tags: ["hugo", "blogging", "tutorial"]
categories: ["web development"]
series: "Mastering Your Blog"
series_order: 1
featured_image: "featured.jpg"
---
```

### Key Fields:

*   `title`: The main title of your post.
*   `date`: The publication date. Hugo uses this for sorting.
*   `description`: A short summary used for list pages and SEO meta descriptions.
*   `tags`: A list of keywords to categorize your content. Useful for related posts.
*   `categories`: Broader classifications for your content.

## Organizing Content into Series

To group your posts into a sequential series, like chapters in a book, use the `series` and `series_order` fields in your front matter.

*   `series`: The name of your series (e.g., "Mastering Your Blog"). All posts with the same `series` name will be grouped together.
*   `series_order`: The numerical order of the post within that series. Hugo uses this to sort posts in the series navigation.

{{< note type="tip" title="Series Navigation" >}}
When a post is part of a series, a navigation block will automatically appear on the right sidebar (or at the top on mobile) showing all posts in that series. At the end of a series post, you'll be prompted to go to the next post or explore the series hub.
{{< /note >}}

## Adding Featured Images

Every post can have a **featured image** that appears on list pages (like `/posts/` or `/series/`). We use Hugo's **Page Bundles** for this.

1.  **Create a Post Folder:** Instead of `my-post.md`, create a folder `my-post/`.
2.  **Place `index.md`:** Put your Markdown content inside as `my-post/index.md`.
3.  **Add Image:** Place your featured image (e.g., `featured.jpg`) directly inside the `my-post/` folder.
4.  **Reference in Front Matter:** Use `featured_image: "featured.jpg"` (relative to the post's folder).

{{< note type="info" title="Using `hugo new`" >}}
To easily create a Page Bundle, use `hugo new posts/your-new-post-title`. This will automatically create the folder and `index.md` with pre-filled front matter.
{{< /note >}}

This concludes our first lesson. In the next post, we'll dive into making your content richer with code blocks and custom notes!
