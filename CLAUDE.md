# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Jekyll-based blog called "Project Dev Log" for The Platform Chronicles. The site uses a custom dark theme optimized for technical content and is automatically deployed to GitHub Pages via GitHub Actions.

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
- Custom layouts in `_layouts/`:
  - `default.html` - Base template with header, navigation, and footer
  - `post.html` - Post template with metadata, tags, and back navigation
- Custom CSS in `assets/css/style.css` - Dark theme with GitHub-inspired colors

### Configuration
- `_config.yml` contains site-wide settings:
  - Title: "Project Dev Log"
  - Description: "Technical updates and experiments"
  - Plugins: jekyll-feed
  - Excludes: README.md, vendor/, Gemfile, Gemfile.lock (vendor/ exclusion is critical for GitHub Actions builds)

## Key Files
- `index.html` - Homepage with post listing
- `tags.md` - Tags page (currently empty)
- `assets/css/style.css` - Custom dark theme stylesheet
- `Gemfile` - Uses `github-pages` gem for GitHub Pages compatibility

## Design Features
- Dark theme with GitHub-inspired color palette
- Responsive layout optimized for technical content
- Code syntax highlighting with monospace fonts
- Post cards with hover effects on homepage
- Tags displayed with styled badges
- Navigation between posts and home page
- Mobile-responsive design
