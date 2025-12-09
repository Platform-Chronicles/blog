---
layout: post
title: "How This Blog Works: Jekyll, GitHub Actions, and GitHub Pages"
date: 2025-01-10
tags: [off-story, jekyll, github-actions]
---

This blog is built with Jekyll, automatically deployed via GitHub Actions, and hosted on GitHub Pages. Here's how it all fits together.

## The Stack

- **Jekyll** - Static site generator (Ruby)
- **GitHub Actions** - CI/CD pipeline
- **GitHub Pages** - Free hosting
- **Markdown** - Content format

## Repository Structure

```
blog/
├── _posts/              # Blog posts (Markdown)
├── _layouts/            # Page templates
├── _config.yml          # Jekyll configuration
├── .github/
│   └── workflows/
│       └── jekyll.yml   # Auto-deploy workflow
└── Gemfile              # Ruby dependencies
```

## Writing a Post

Create a new file in `_posts/` following the naming convention:

```
YYYY-MM-DD-title-slug.md
```

Add front matter at the top:

```yaml
---
layout: post
title: "Your Post Title"
date: 2025-01-10
tags: [tag1, tag2]
---

# Your content here
```

Write in Markdown. Commit and push.

## Automatic Deployment

When you push to `main`, GitHub Actions automatically:

1. Checks out the repository
2. Sets up Ruby and dependencies
3. Builds the Jekyll site
4. Deploys to GitHub Pages

The workflow file (`.github/workflows/jekyll.yml`):

```yaml
name: Deploy Jekyll site to Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Build with Jekyll
        uses: actions/jekyll-build-pages@v1

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## Local Development

To preview posts locally before publishing:

```bash
# Install dependencies
bundle install

# Start local server
bundle exec jekyll serve

# View at http://localhost:4000
```

Jekyll watches for file changes and automatically rebuilds.

## Why This Setup?

**Simple:** Just write Markdown, commit, and it's live.

**Fast:** Static sites load instantly. No database queries.

**Free:** GitHub Pages hosting costs nothing.

**Version controlled:** Every post, every change is in Git.

**No maintenance:** No server updates, no security patches, no uptime monitoring.

## The Workflow

1. Write post in Markdown
2. Preview locally with `jekyll serve`
3. Commit to Git
4. Push to GitHub
5. GitHub Actions builds and deploys
6. Live in ~2 minutes

That's it. No deploy commands, no SSH, no FTP. Just Git.

## Limitations

Jekyll is static, so:
- No comments (could add Disqus/utterances if needed)
- No search (could add client-side search)
- No dynamic content (fine for a blog)

For this project, these aren't limitations - they're features. The blog focuses on content, not complexity.

## Repository

This blog's source: [github.com/Platform-Chronicles/blog](https://github.com/Platform-Chronicles/blog)

---

*This is a meta-post about the blogging infrastructure itself, separate from the main Platform Chronicles narrative.*
