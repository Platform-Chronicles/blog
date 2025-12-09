---
layout: post
title: "The ForkFlow Monolith: A Restaurant Management System"
date: 2025-01-16
tags: [chronicles, prologue, fastapi, sqlite, python]
series: "Platform Chronicles"
chapter: prologue
---

This is the system Diego built for Lena's restaurant. A straightforward Python application that handles everything from taking orders to displaying them in the kitchen. Let's walk through how ForkFlow works in a real restaurant.

## A Day in the Life of ForkFlow

Picture a busy lunch service at Lena's restaurant:

**12:15 PM - The Server Takes an Order**

Maria, one of the servers, pulls up ForkFlow on her tablet. Table 7 wants two paellas and a salad. She navigates to the menu, selects the items, enters "Table 7" as the customer name, and hits submit. The order goes straight into the system with a timestamp and a unique order ID.

**12:16 PM - The Kitchen Gets It**

In the kitchen, there's a display mounted on the wall showing all active orders. The moment Maria submits, Table 7's order appears on the screen with a "PENDING" status. The kitchen staff can see:
- What dishes to prepare
- Which table it's for
- How long it's been waiting
- Current status of each order

The display auto-refreshes every few seconds, so the kitchen always sees the latest orders without touching anything.

**12:35 PM - The Kitchen Updates Status**

As Chef Alex starts working on the paellas, he taps the order to mark it "IN_PROGRESS". When the dishes are ready to serve, another tap changes it to "READY". Maria can see this update on her tablet and knows to pick up the order.

**Throughout the Day - Lena Manages the Menu**

Lena logs into ForkFlow to manage the menu. She can:
- Add new seasonal dishes
- Update prices
- Mark items as unavailable when ingredients run low
- Organize items by category (appetizers, mains, desserts, drinks)

When she marks the seafood paella as unavailable because they're out of prawns, servers immediately see it grayed out on their tablets.

**Behind the Scenes - Inventory Tracking**

ForkFlow also keeps track of inventory basics - what's in stock, quantities, and when items were last updated. It's not a full inventory management system, but it helps Lena know when to reorder essentials.

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

ForkFlow runs as a single Python application:

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

This simplicity is a feature. No microservices, no message queues, no distributed systems complexity. Just a straightforward application doing straightforward work.

## The Reality Check

ForkFlow handles Lena's restaurant perfectly well during normal service. A dozen tables, steady order flow, manageable lunch and dinner rushes - it all works.

But it was built for one location with modest traffic. The architecture has limits:
- SQLite works great for smaller workloads but has concurrency constraints
- Everything runs in one process on one server
- No built-in redundancy or failover

For many restaurants, this is completely fine. But as we'll see in the chronicles ahead, when ForkFlow needs to scale or when multiple locations want to use it, these simple architectural choices start to matter.

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

No magic, no over-engineering. Just enough code to solve the problem.

**Repository:** [github.com/Platform-Chronicles/forkflow-monolith](https://github.com/Platform-Chronicles/forkflow-monolith)

## What's Next

Now you know what ForkFlow is and how it's used. It's a working restaurant management system that handles real operations.

In the next post, we'll see what happens when this simple system meets real-world load. Not speculation about what might break - actual tests showing exactly where and how the architecture reaches its limits.

---

**Repository:** [forkflow-monolith](https://github.com/Platform-Chronicles/forkflow-monolith)
**Next:** "Concurrent Orders: When SQLite Says No"
