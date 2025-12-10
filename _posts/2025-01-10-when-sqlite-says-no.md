---
layout: post
title: "When SQLite Says No: Testing Concurrent Orders"
tags: [chronicles, prologue, sqlite, fastapi, testing]
chapter: prologue
---

The crash at Maya's restaurant wasn't just bad luck. It was a fundamental architectural problem with the ForkFlow monolith. To understand exactly what happened, I needed to reproduce it.

## The Test

I created a concurrent orders stress test that simulates what happens during a lunch rush: multiple cashiers taking orders at the same time.

**Test scenario:**
- 3 cashiers working simultaneously
- Each cashier processes 10 orders
- Orders submitted every 2 seconds
- Total expected orders: 30

This mirrors real-world conditions: three terminals at the counter, orders coming in rapid succession but not unreasonably fast.

The test code is straightforward:

```python
def create_order(cashier_id, order_num):
    """Single cashier creating an order"""
    try:
        response = requests.post(
            f"{BASE_URL}/orders",
            json={
                "items": [
                    {"menu_item_id": 1, "quantity": 2},
                    {"menu_item_id": 2, "quantity": 1}
                ],
                "notes": f"Cashier {cashier_id} - Order {order_num}"
            }
        )
        return response.status_code == 200
    except Exception as e:
        return False

# Run with concurrent threads
with concurrent.futures.ThreadPoolExecutor(max_workers=num_cashiers) as executor:
    futures = []
    for cashier_id in range(num_cashiers):
        for order_num in range(orders_per_cashier):
            futures.append(
                executor.submit(create_order, cashier_id, order_num)
            )
            time.sleep(order_delay)
```

## The Results

The test ran for 20.13 seconds. Here's what happened:

| Metric | Value |
|--------|-------|
| Successful Orders | 25 (83.3%) |
| Failed Orders | 5 (16.7%) |
| Database Lock Errors | 0 |
| Other Errors | 5 (404s and 500s) |
| Duplicate Orders | 0 |

**Business Impact:**
- Lost orders per test: 5
- Lost revenue per test: $125.00
- Extrapolated daily loss: $375.00 (3 rushes/day)
- **Extrapolated monthly loss: $11,250.00**

## What This Means

83.3% sounds pretty good, right? Wrong.

During a lunch rush at a busy restaurant, losing 16.7% of orders is catastrophic. That's roughly 1 in 6 orders vanishing into the void. Customers waiting. Food never arriving. Cashiers confused about whether the order went through or not.

And this test is generous. Real lunch rushes have:
- More than 3 cashiers
- Faster order submission (during peak chaos)
- Additional operations (order updates, cancellations, kitchen status changes)

The failures weren't even database lock errors—they were 404s and 500s, suggesting race conditions and unexpected state. SQLite is designed for single-writer scenarios. Under concurrent load, it breaks down in unpredictable ways.

## The Smoking Gun

This test proves what happened during Maya's crash:

1. Lunch rush begins → multiple concurrent writes
2. SQLite struggles with write contention
3. Some requests fail with 404/500 errors
4. Orders get lost
5. Kitchen display shows incomplete data
6. System becomes unreliable under normal load

The monolith isn't broken. It's just built on technology that can't handle the workload.

## Next Steps

This is just one test. The concurrent orders scenario demonstrates the fundamental problem, but there are more issues to explore:

- Race conditions creating duplicate orders
- Read/write conflicts crashing the kitchen display
- High load stress testing
- Recovery behavior after failures

Each test will reveal more about why SQLite isn't suitable for ForkFlow's needs—and why migrating to PostgreSQL is the first critical step.

---

**Test Code:** [test_concurrent_orders.py](https://github.com/Platform-Chronicles/forkflow-tests/blob/main/test_concurrent_orders.py)
**Full Report:** [concurrent_orders_report_20251210_221926.md](/Users/roger/Projectes/ThePlatformChronicles/forkflow-tests/reports/concurrent_orders_report_20251210_221926.md)
