---
layout: post
title: "AI Orchestration Patterns: When Agents Should Call Skills"
date: 2025-12-09
tags: [off-story, ai, orchestration, architecture, design-patterns]
---

I spent today building orchestration patterns for AI systems. What started as a simple experiment in task decomposition turned into a lesson about separation of concerns, computational delegation, and why LLMs shouldn't do arithmetic.

## The Problem

You have a task that needs computation. Prime factorization, in this case. The question is: should your orchestrator do the math, or delegate it?

Two approaches:

1. **Agent-based** - Orchestrator computes, then dispatches to specialized agents
2. **Skill-based** - Orchestrator delegates computation to stateless skills

I tried both. One failed, one worked.

## The Experiment

I built a test orchestration system comparing two patterns using Claude's function calling. The orchestrator is an LLM with a system prompt defining its role. "Calling a skill" means the orchestrator uses function calling to invoke a Python function. "Dispatching to an agent" means spawning a new LLM instance with a specialized prompt.

Two directories:
- `/agents` - Orchestrator does arithmetic, coordinates subagents
- `/skills` - Orchestrator delegates arithmetic to computational skills

The test task: prime factorization. Simple conceptually, computationally demanding, and LLMs are terrible at arithmetic.

## Agent-Based Pattern

**Structure:**
```
Orchestrator
├── Agent 2 (handles factor 2)
├── Agent 3 (handles factor 3)
├── Agent 5 (handles factor 5)
├── Agent 7 (handles factor 7)
└── Generic Agent (handles all other primes)
```

**How it works:**
1. Orchestrator computes factorization (e.g., 360 → [2,2,2,3,3,5])
2. Creates one assignment per factor instance
3. Dispatches to appropriate agent
4. Collects JSON responses
5. Returns aggregated summary with metrics

**What's good:**
- Dynamic agent scaling
- Explicit retry logic with configurable max_retries
- Detailed failure tracking
- State machine with observable transitions

**What broke:**
```
Task: Factor 11305
Orchestrator: [5, 2261] ✓
Wait... is 2261 prime?
2261 = 7 × 17 × 19
Result: WRONG ❌
```

The orchestrator incorrectly assumed 2261 was prime and stopped early.

## The Arithmetic Problem

LLMs aren't calculators. When you ask Claude to factor a larger number:
- Small numbers (< 100): Usually works
- Medium numbers (100-1000): Sometimes works
- Larger numbers (> 1000): Coin flip

For 11305:
- Divides by 5 easily → 2261
- Checks if 2261 is prime... maybe?
- Assumes yes, returns [5, 2261]
- Actual answer: [5, 7, 17, 19]

I tried adding explicit instructions:
```markdown
DECOMPOSITION INSTRUCTIONS
- You MUST compute the complete prime factorization correctly
- ALWAYS verify your factorization by multiplication
- For numbers > 100, work systematically
- DO NOT assume large quotients are prime
- Example: 11305 = 5 × 2261, then check if 2261 is prime...
```

It helped, but the fundamental issue remained: orchestrators were doing computation instead of coordination.

## Skills-Based Pattern: The Fix

**New structure:**
```
Orchestrator
├── factorize skill (does the math)
└── record_execution skill (logs evidence)
```

**How it works:**
1. Orchestrator calls `factorize(11305)`
2. Skill performs systematic trial division
3. Skill returns verified `[5, 7, 17, 19]`
4. Orchestrator creates execution records per factor
5. Returns aggregated summary

**Key change in orchestrator prompt:**
```markdown
TASK HANDLING
1. Parse the user task
2. Call the `factorize` skill to compute prime factorization
   - DO NOT compute factorization yourself
   - Trust the skill's output
3. For each prime factor, call `record_execution` skill
```

**Result:**
```
Task: Factor 11305
factorize(11305) → [5, 7, 17, 19]
Result: CORRECT ✓
```

## The Skill Definition

```markdown
Skill name: factorize

Inputs:
- number (integer)

Algorithm:
1. While n is even: append 2, divide by 2
2. For odd d = 3,5,7,9,11... up to √n:
   - While divisible: append d, divide by d
3. If n > 1: append n (it's prime)

Outputs (JSON):
{
  "number": <input>,
  "prime_factors": [...],
  "verification": <product of factors>,
  "is_correct": <verification == input>
}
```

The skill is stateless, deterministic, and includes verification.

## What I Learned

**LLMs aren't calculators.** The failure with 11305 wasn't a bug - it was a design problem. Asking an orchestrator to compute prime factorization is like asking a project manager to write the code.

**Delegate computation to skills.** When I moved arithmetic into a skill:
1. The orchestrator became simpler (just coordination)
2. The computation became reliable (deterministic algorithm)
3. The system became testable (skill returns verification)

**Skills should be stateless and verifiable.** Every skill call is independent. Computational skills should verify their own work and return both results and verification.

**Test with edge cases early.** 360 factors easily. 11305 exposed the problem. Small numbers hide issues that larger numbers reveal.

## When to Use Each

Skills work for deterministic operations: arithmetic, data transformation, parsing, API calls. Agents work for judgment calls: architectural decisions, trade-off analysis, subjective evaluation. In this experiment, factorization is deterministic - a perfect fit for skills. An agent deciding whether to optimize for speed or memory? That's reasoning, not computation.

## Implementation

Both patterns are documented with orchestrator prompts, agent/skill definitions, and I/O specs in a private repo. The agent pattern has explicit retry logic and failure tracking. The skills pattern uses systematic trial division with built-in verification.

---

The orchestration experiments are in a private repo. Core takeaway: if your orchestrator is doing arithmetic, delegate it to skills.
