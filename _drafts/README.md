# Drafts Folder

This folder contains blog posts that are works in progress.

## How to Use Drafts

### Creating a Draft

Create posts here without dates in the filename:

```
_drafts/concurrent-orders-sqlite.md
_drafts/kubernetes-setup.md
```

### Previewing Drafts Locally

To see drafts while developing locally:

```bash
bundle exec jekyll serve --drafts
```

Drafts will appear with today's date in the local preview.

### Publishing a Draft

When ready to publish, move the file to `_posts/` with a date:

```bash
mv _drafts/concurrent-orders-sqlite.md _posts/2025-01-20-concurrent-orders-sqlite.md
```

Or use the `published` front matter flag:

```yaml
---
layout: post
title: "My Draft Post"
published: false  # Set to true when ready to publish
---
```

## Notes

- Drafts are **not** committed to production builds
- Only appear when using `--drafts` flag locally
- Great for working on posts over time before publishing
