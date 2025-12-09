---
layout: post
title: "The ForkFlow Monolith: A Restaurant Management System"
date: 2025-01-16
tags: [chronicles, prologue, fastapi, sqlite, python]
series: "Platform Chronicles"
chapter: prologue
---

"It's ready. Come see."

Diego's message came through on a Tuesday afternoon. Lena had been expecting it - he'd been working on the system for weeks - but seeing those words still gave her a flutter of anticipation. She closed the reservation spreadsheet she'd been wrestling with and headed to Diego's office.

He had his laptop open, browser already positioned to show the ForkFlow interface. "I want to walk you through how everything works," he said, gesturing for her to sit. "Let me show you a typical service."

## The Demo

Diego pulled up the order entry screen. "Okay, imagine you're Maria taking an order at lunch. Table 7 wants two paellas and a salad."

He navigated through the menu interface, clicking items as he narrated. "She selects the dishes, enters 'Table 7' as the customer name, hits submit. The order goes straight into the system with a timestamp and unique ID."

"Can she modify it if the customer changes their mind?" Lena asked.

"Right now, no - you'd need to cancel and create a new order. I kept it simple for v1."

Lena nodded. That would work for now. She'd rather have something that worked well with minor limitations than something complex that broke.

Diego switched tabs to show the kitchen display. "Now watch this." He refreshed the order entry screen, submitted it, then turned back to the kitchen view. Table 7's order appeared instantly with a "PENDING" status.

"The kitchen display shows all active orders," Diego explained. "What to prepare, which table, how long it's been waiting, current status. It auto-refreshes every few seconds so the kitchen staff never have to touch it."

Lena leaned closer. The layout was clean - exactly what Alex and the kitchen crew needed. No clutter, just the essential information.

"Now let's say Alex starts working on those paellas." Diego clicked through to change the order status to "IN_PROGRESS". "When the dishes are ready..." another click, "he marks them 'READY'. Maria sees this update on her tablet and knows to pick up the order."

"What about when we run out of ingredients?" Lena asked. "Yesterday we ran out of prawns mid-service and Maria kept taking orders for the seafood paella."

Diego pulled up the menu management interface. "You can mark items unavailable from here." He toggled the seafood paella to unavailable. "The servers see it grayed out immediately on their tablets. No more taking orders for dishes you can't make."

He walked her through the rest of the menu management features - adding new seasonal dishes, updating prices, organizing by category. It was straightforward, practical.

"There's also basic inventory tracking," Diego said, clicking through to another screen. "It's not a full inventory management system, but it helps you track what's in stock and when to reorder essentials."

Lena studied the interface. Everything she'd asked for was there. Clean, functional, no unnecessary complexity.

"What about when we expand?" she asked. "Laura's already talking about a second location."

Diego hesitated, choosing his words carefully. "Let's focus on making this location work perfectly first. Get your team comfortable with it, work out the workflows. We can think about expansion later."

Lena caught the diplomatic non-answer but didn't press. One step at a time. Right now, she had a system that could replace her tangle of spreadsheets and paper tickets. That was enough.

## What Makes ForkFlow Work

The system is built to be simple and practical:

**For Servers:**
- Fast order entry with a clean menu interface
- See all orders and their current status
- No complicated workflows - just pick items and submit

**For Kitchen Staff:**
- Clear visual display of all active orders
- One-tap status updates (pending → in progress → ready → completed)
- Auto-refreshing so they never miss a new order
- Orders sorted by how long they've been waiting

**For Management:**
- Easy menu updates that reflect immediately
- Basic reporting on orders and inventory
- Everything accessible through a web browser

## The Technical Foundation

Diego built ForkFlow as a single Python application:

**Stack:**
- FastAPI for the web framework
- SQLite database storing everything in one file
- Jinja2 templates for the kitchen display
- Minimal JavaScript for auto-refresh functionality

**Architecture:**
All in one box - the web server, database, and business logic run together in a single process. Data lives in a SQLite file called `forkflow.db`. Deploy it, point browsers at it, and it works.

```
Browser → FastAPI App → SQLite Database
```

This simplicity is intentional. No microservices, no message queues, no distributed systems complexity. Just a straightforward application doing straightforward work.

For Lena's restaurant during normal service - a dozen tables, steady order flow, manageable lunch and dinner rushes - ForkFlow works perfectly well. The system was built for one location with modest traffic, and in that context, it delivers exactly what's needed.

But those simple architectural choices? They have implications that will matter later, when the business grows beyond what Diego and Lena are planning for right now. For the moment, though, that's a problem for another day.

## Try It Yourself

The code is open source. You can run ForkFlow locally and see exactly how it works:

```bash
# Clone the repository
git clone https://github.com/Platform-Chronicles/forkflow-monolith
cd forkflow-monolith

# Install dependencies
pip install -r requirements.txt

# Run the server
python main.py

# Access at http://localhost:8000
# API docs at http://localhost:8000/docs
```

Or with Docker:

```bash
docker-compose up --build
```

Browse the menu, create some orders, watch the kitchen display update. It's the same system Lena's team uses every day.

## What's Inside

The codebase is straightforward Python:

- `main.py` - The FastAPI application and all the routes
- `models.py` - Database table definitions
- `database.py` - Database connection setup
- `templates/` - HTML templates for the kitchen display

**Repository:** [github.com/Platform-Chronicles/forkflow-monolith](https://github.com/Platform-Chronicles/forkflow-monolith)

## What's Next

Diego's demo convinced Lena. ForkFlow does what it needs to do. But does it hold up under real restaurant conditions?

In the next post, we'll put it to the reality test. Friday night dinner rush, multiple concurrent orders, kitchen display refreshing constantly. Will it work?

---

**Repository:** [forkflow-monolith](https://github.com/Platform-Chronicles/forkflow-monolith)
**Next:** "Concurrent Orders: When SQLite Says No"
