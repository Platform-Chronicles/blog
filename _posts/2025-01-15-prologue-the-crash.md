---
layout: post
title: "Prologue: The Crash"
date: 2025-01-15
tags: [chronicles, prologue]
series: "Platform Chronicles"
chapter: prologue
---

# Prologue: The Crash

It's 8:47 PM on a Friday in Barcelona, and Lena Kowalski's phone won't stop buzzing.

"The system is down again," reads the message from her restaurant manager. "Customers can't order."

This is the third time this week.

## The Beginning

Six months ago, Lena had a problem that many small restaurant owners face: the existing point-of-sale systems were too expensive (€10K+ setup fees, €165/month per terminal), too complicated, or both. As someone who had built a successful farm-to-table restaurant in the heart of Barcelona's Gràcia neighborhood, she knew what she needed: something simple, affordable, and modern.

Her cousin Diego, a computer science student, offered to help. "I can build you something better," he said. "Give me three weeks."

Diego was true to his word. He built a clean, simple system using Python and FastAPI. Orders came in through a web interface, the kitchen got a real-time display, and everything was stored in a SQLite database. No monthly fees. No complicated setup. Just a Python script running on a small server.

It worked beautifully.

For the first month.

## The Pattern

The problems started small. Occasionally, an order would get "stuck" - the customer would see a loading spinner that never stopped. A page refresh usually fixed it.

Then customers started reporting duplicate orders. They'd submit once, but two identical orders would appear in the system. Annoying, but Lena's team learned to check for duplicates before processing.

But the real issue became clear during Friday and Saturday dinner service. Between 8 PM and 10 PM, when the restaurant was busiest, the entire system would freeze. Sometimes for 30 seconds. Sometimes for minutes.

Orders stopped coming through. The kitchen display would go blank. Customers would abandon their carts.

Last Friday, they lost €1,200 in orders during a two-hour period.

## The Investigation

Diego spent his weekends debugging. He added logging. He watched the server resources. CPU was fine. Memory was fine. Network was fine.

The logs showed errors like:

```
OperationalError: database is locked
```

But they appeared randomly. Sometimes under heavy load, sometimes not. He couldn't reproduce them consistently.

"It's probably just the server," Diego said. "We should upgrade to something more powerful."

They upgraded. The problems got worse.

## Friday, 8:47 PM

Tonight is different. The system isn't just slow - it's completely frozen. The database file is locked and won't accept any writes. Diego is on his way to the restaurant, laptop in hand, but Lena knows they're losing money every minute the system is down.

She opens her laptop and starts taking orders manually on paper, like she did before Diego built the system. Her staff is confused. Customers are frustrated. One couple walks out.

By the time Diego arrives at 9:30 PM, they've lost at least €800 in orders.

He restarts the Python process. The system comes back up. Orders start flowing again.

"I don't understand," Diego says, staring at the logs. "The database is too small to cause these issues. We only have maybe 2,000 orders in there."

Lena looks at the Friday night crowd - every table full, orders coming in steadily. "Can you fix this before next Friday?"

Diego doesn't answer.

## The Real Problem

What Lena and Diego don't know yet is that their problem isn't the hardware, the network, or even the code quality. Their problem is architectural.

SQLite is a remarkable piece of software - simple, reliable, and perfect for many applications. But it has one fundamental limitation: it uses file-level locking. When one process is writing to the database, all other processes must wait. In a restaurant during dinner rush, with multiple customers trying to place orders simultaneously, with the kitchen display refreshing every few seconds, and with various background processes running... the database spends most of its time locked.

The "database is locked" errors aren't random. They're predictable. They happen exactly when the system is doing what it's supposed to do: handling multiple operations at once.

But Lena and Diego don't know this yet. All they know is:
- Orders fail 20-30% of the time during peak hours
- Duplicate orders appear regularly (5-10% of all orders)
- The kitchen display crashes when too many people are ordering
- Every Friday and Saturday night is a gamble

And here's the thing that keeps Lena up at night: other restaurant owners have started asking about her system. They see the modern interface, the simplicity, the low cost. Three other restaurants in Barcelona want to use it.

She's starting to think there might be a business here. A real business. Not just a tool for her restaurant, but a platform for independent restaurants across Europe who can't afford the enterprise solutions.

But first, they need to fix whatever is breaking every Friday night.

## What's Next

In the next posts, we'll dive deep into the technical details:
- Reproducing the concurrent order failures with actual tests
- Demonstrating the race conditions that create duplicate orders
- Understanding why the kitchen display crashes under load
- Measuring the actual impact on the business

We're going to prove exactly what's wrong with SQLite for this use case. Not by theory or by reading documentation, but by writing tests that demonstrate the failures, measuring the impact, and showing you the results.

Because in platform engineering, you can't fix what you can't measure. And you can't measure what you can't reproduce.

---

**Code:** The ForkFlow monolith (in its current, broken state) is available at [github.com/Platform-Chronicles/forkflow-monolith](https://github.com/Platform-Chronicles/forkflow-monolith)

**Tests:** All reproduction tests will be published at [github.com/Platform-Chronicles/forkflow-tests](https://github.com/Platform-Chronicles/forkflow-tests)

**Next:** "Concurrent Orders: When SQLite Says No" - Writing tests that prove the problem
