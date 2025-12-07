# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Jekyll-based blog called "Project Dev Log" for The Platform Chronicles. The site is built using the Minima theme and automatically deployed to GitHub Pages via GitHub Actions.

## Development Commands

### Local Development
```bash
# Install dependencies
bundle install

# Build the site locally
bundle exec jekyll build

# Serve the site locally with live reload (typically at http://localhost:4000)
bundle exec jekyll serve

# Build with incremental regeneration (faster rebuilds)
bundle exec jekyll build --incremental
```

### Deployment
- Pushes to the `main` branch automatically trigger GitHub Actions deployment
- The workflow runs `bundle exec jekyll build --incremental --destination _site`

## Content Structure

### Posts
- Located in `_posts/` directory
- Naming convention: `YYYY-MM-DD-title.md`
- Front matter required:
  ```yaml
  ---
  layout: post
  title: "Post Title"
  date: YYYY-MM-DD
  tags: [tag1, tag2]
  ---
  ```

### Layouts
- Custom layouts in `_layouts/`
- `default.html` provides base template with tag display support
- The Minima theme provides the `post` layout

### Configuration
- `_config.yml` contains site-wide settings:
  - Title: "Project Dev Log"
  - Description: "Technical updates and experiments"
  - Theme: Minima
  - Plugins: jekyll-feed
  - Excludes: README.md, vendor/, Gemfile, Gemfile.lock (vendor/ exclusion is critical for GitHub Actions builds)

## Key Files
- `index.md` - Homepage
- `tags.md` - Tags page (currently empty)
- `Gemfile` - Uses `github-pages` gem for GitHub Pages compatibility
