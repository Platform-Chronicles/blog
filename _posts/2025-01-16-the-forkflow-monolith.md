---
layout: post
title: "The ForkFlow Monolith: A Technical Overview"
date: 2025-01-16
tags: [chronicles, prologue, fastapi, sqlite, python]
series: "Platform Chronicles"
chapter: prologue
---

This is the system Diego built for Lena's restaurant. A straightforward Python application using FastAPI and SQLite. Let's look at what it does and how it's built.

## What It Does

ForkFlow manages restaurant operations:

- **Menu Management** - Create items, set prices, manage availability
- **Order Processing** - Customers place orders, kitchen receives them
- **Kitchen Display** - Real-time view of active orders
- **Inventory Tracking** - Basic stock management

It's not trying to be fancy. It works. Or at least, it's supposed to.

## The Stack

**Backend:**
- Python 3.11+
- FastAPI 0.104.1 - Modern async web framework
- SQLAlchemy 2.0 - ORM for database operations
- SQLite - File-based database

**Frontend:**
- Jinja2 templates - Server-side rendering
- Minimal JavaScript - Just enough for the kitchen display

**Deployment:**
- Single Python process
- Docker container (optional)
- All data in one SQLite file: `forkflow.db`

## Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTP
┌──────▼──────────┐
│  FastAPI App    │
│  (main.py)      │
├─────────────────┤
│  SQLAlchemy ORM │
└──────┬──────────┘
       │
┌──────▼──────────┐
│  forkflow.db    │
│  (SQLite file)  │
└─────────────────┘
```

Everything runs in one process. All data in one file. Simple.

## Key Endpoints

### Menu Management
```python
GET  /menu              # List all menu items
POST /menu              # Create new item
PUT  /menu/{id}         # Update item
PUT  /menu/{id}/availability  # Toggle availability
```

### Orders
```python
GET   /orders           # List all orders
POST  /orders           # Create new order
PATCH /orders/{id}      # Update order status
```

### Kitchen Display
```python
GET /kitchen/display    # Kitchen view (HTML)
GET /kitchen/orders     # Active orders (JSON)
```

### Health Check
```python
GET /health             # System status
```

## Database Schema

**menu_items**
- id, name, description, price, category, available

**orders**
- id, customer_name, items (JSON), total, status, created_at

**inventory**
- id, item_name, quantity, unit, last_updated

Simple tables. No complex relationships. SQLite handles it fine... when there's only one user.

## The Problem Areas

Three places where things break:

### 1. Concurrent Order Creation

```python
@app.post("/orders")
async def create_order(order_data: OrderCreate):
    with Session(engine) as session:
        # Multiple requests hit this simultaneously
        new_order = Order(**order_data.dict())
        session.add(new_order)
        session.commit()  # SQLite locks here
```

When multiple customers order at the same time, SQLite's file lock causes `database is locked` errors.

### 2. Kitchen Display Auto-Refresh

```javascript
// Kitchen display refreshes every 2 seconds
setInterval(() => {
    fetch('/kitchen/orders')
        .then(response => response.json())
        .then(updateDisplay);
}, 2000);
```

Constant reads while orders are being written. More contention.

### 3. No Retry Logic, No Idempotency

When an order fails due to database lock:
- Customer sees error
- Customer clicks submit again
- Maybe the first one went through
- Now there are two orders

No idempotency keys. No duplicate detection. Just hope.

## Running It Locally

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

## What Makes It Break

SQLite uses file-level locking. One writer at a time. When you have:
- 3 cashiers taking orders
- Kitchen display refreshing every 2 seconds
- Background inventory updates
- Multiple customers on the website

The database spends most of its time locked.

This isn't SQLite's fault. SQLite is excellent for what it's designed for: embedded databases, local storage, single-user applications.

But a multi-user restaurant system during Friday dinner rush? That's not what SQLite was built for.

## The Code

Browse the full source: [github.com/Platform-Chronicles/forkflow-monolith](https://github.com/Platform-Chronicles/forkflow-monolith)

Key files:
- `main.py` - FastAPI application and routes
- `models.py` - SQLAlchemy database models
- `database.py` - Database connection setup
- `templates/` - Jinja2 HTML templates

It's straightforward Python. No magic. That's actually the point - this is a simple application hitting fundamental database concurrency limits.

## Next

Now that we know what the system is, let's prove it breaks. In the next post, we'll run actual tests that demonstrate the concurrent write failures.

Not theory. Not "it should fail." We'll make it fail on purpose, measure it, and show you the results.

---

**Repository:** [forkflow-monolith](https://github.com/Platform-Chronicles/forkflow-monolith)
**Next:** "Concurrent Orders: When SQLite Says No"
