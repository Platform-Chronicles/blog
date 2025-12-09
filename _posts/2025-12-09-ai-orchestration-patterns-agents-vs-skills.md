---
layout: post
title: "AI Orchestration Patterns: When Agents Should Call Skills"
date: 2025-12-09
tags: [ai, orchestration, architecture, design-patterns]
---

I spent today building three different orchestration patterns for AI systems. What started as a simple experiment in task decomposition turned into a lesson about separation of concerns, computational delegation, and why LLMs shouldn't do arithmetic.

## The Problem

You have a task that needs to be broken down into smaller pieces and executed. Maybe it's prime factorization. Maybe it's a software project. The question is: how do you structure the coordination?

Three patterns emerged:

1. **Agent-based** - Orchestrator dispatches to specialized subagents
2. **Skill-based** - Orchestrator calls stateless computational skills
3. **Hybrid** - Agents that can call skills

Each has different trade-offs. Let's look at what happened when I tried all three.

## The Experiment Setup

I built a test orchestration system with three directories:
- `/agents` - Pure multi-agent coordination
- `/skills` - Orchestrator with computational skills
- `/hybrid` - Agents with skill capabilities

The default task: prime factorization. Why? Because it's simple conceptually but computationally demanding. And because LLMs are terrible at arithmetic.

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

## Hybrid Pattern: Agents That Call Skills

For more complex tasks (like planning a software project), you want agents that can reason but also leverage computational skills.

**Structure:**
```
Orchestrator (Staff Engineer role)
├── PlanningAgent
│   └── Skills: (rarely needed)
├── InfraAgent
│   ├── validate_schema skill
│   └── log_execution skill
├── BackendAgent
│   ├── generate_stub skill
│   └── log_execution skill
└── QAAgent
    ├── check_readiness skill
    └── log_execution skill
```

**Key rules:**
- Agents never talk to each other (only to orchestrator)
- Agents may call skills within their domain
- Skills are stateless and non-reasoning
- Orchestrator owns final decisions

**Example flow:**
```
User: "Prepare production-ready REST API skeleton"

Orchestrator → PlanningAgent
PlanningAgent → Returns scope, non-goals, criteria

Orchestrator → InfraAgent
InfraAgent → Calls validate_schema(k8s_manifest)
InfraAgent → Returns infra decisions

Orchestrator → BackendAgent
BackendAgent → Calls generate_stub(language="js", framework="express")
BackendAgent → Returns system structure

Orchestrator → QAAgent
QAAgent → Calls check_readiness(checklist=[...])
QAAgent → Returns risk analysis

Orchestrator → Synthesizes final summary
```

## Design Principles That Emerged

### 1. Agents reason, skills compute

If it's algorithmic and error-prone for LLMs, it's a skill. If it requires judgment and context, it's an agent.

**Skill candidates:**
- Arithmetic operations
- Data parsing/validation
- Schema checking
- File generation
- Systematic searches

**Agent candidates:**
- Architectural decisions
- Risk assessment
- Planning and scoping
- Trade-off analysis
- Context synthesis

### 2. Skills must be stateless

Every skill call should be independent. No shared state, no side effects (beyond the return value).

**Good:**
```
factorize(11305) → [5, 7, 17, 19]
factorize(11305) → [5, 7, 17, 19]  // Same result
```

**Bad:**
```
configure_system("prod")  // Changes global state
get_config() → "prod"     // Depends on previous call
```

### 3. Include verification in computational skills

Skills that compute should verify their work:

```json
{
  "prime_factors": [5, 7, 17, 19],
  "verification": 11305,
  "is_correct": true
}
```

This catches errors immediately instead of propagating bad data.

### 4. Orchestrators coordinate, don't compute

Original orchestrator (agents pattern):
```
- Compute prime factorization
- Assign factors to agents
- Collect responses
- Aggregate metrics
```

Fixed orchestrator (skills pattern):
```
- Call factorize skill
- Use results to create assignments
- Call record_execution skills
- Aggregate metrics
```

The orchestrator stopped doing arithmetic and started doing coordination.

## When to Use Each Pattern

**Agent-based** - When you need:
- Dynamic scaling of similar workers
- Explicit retry and failure handling
- Complex state machines
- Quota management per agent

**Skills-based** - When you need:
- Deterministic computation
- Minimal coordination overhead
- Clear separation of reasoning vs execution
- Verifiable results

**Hybrid** - When you need:
- Multiple reasoning perspectives (planning, QA, architecture)
- Domain-specific computational tools
- Clear boundaries between agent responsibilities
- Reusable skills across agents

## The Key Insight

The failure with 11305 wasn't a bug - it was a design problem. Asking an orchestrator to compute prime factorization is like asking a project manager to write the code. They might get it right sometimes, but it's not their job.

When I moved computation into a skill, three things happened:
1. The orchestrator became simpler (just coordination)
2. The computation became reliable (systematic algorithm)
3. The system became testable (skill returns verification)

## Implementation Files

All three patterns are documented with:
- Orchestrator prompts with call examples
- Agent/skill definitions with I/O specs
- Configuration parameters
- Example workflows

The repository structure:
```
orchestration/
├── agents/
│   ├── orchestrator.md
│   ├── prime-agent-two.md
│   ├── prime-agent-three.md
│   └── prime-agent-generic.md
├── skills/
│   ├── orchestrator.md
│   ├── factorize-skill.md
│   └── record-execution-skill.md
└── hybrid/
    ├── orchestrator.md
    ├── agents/
    │   ├── planning-agent.md
    │   ├── infra-agent.md
    │   ├── backend-agent.md
    │   └── qa-agent.md
    └── skills/
        ├── generate_stub.md
        ├── validate_schema.md
        ├── check_readiness.md
        └── log_execution.md
```

Each file includes:
- Role definition
- Input/output formats
- Concrete call examples
- Expected behavior

## What I Learned

**LLMs are not calculators.** Don't ask them to be. Give them tools.

**Separation of concerns applies to AI systems.** The same principles that work for traditional software (single responsibility, dependency injection, interface contracts) work for orchestration patterns.

**Test with edge cases early.** 360 factors easily. 11305 reveals the cracks. Always test beyond the happy path.

**Documentation needs examples.** Abstract patterns are hard to understand. Concrete examples with specific inputs and outputs make patterns obvious.

## Next Steps

These patterns are building blocks. The next experiments:
- Add more decomposers (sum_of_squares, base_expansion)
- Implement failure injection and measure retry effectiveness
- Build a hybrid pattern for actual software projects
- Compare performance characteristics under different loads

But the core insight stands: when you need computation, use skills. When you need reasoning, use agents. When you need both, use hybrid patterns with clear boundaries.

---

**Repository:** The orchestration pattern experiments are in a private exploration repo. If there's interest, I'll clean it up and publish it.

**Key takeaway:** If your AI orchestrator is doing arithmetic, you're doing it wrong. Delegate to skills.
