---
title: "Compiled Intent: Enforcing Software Architecture with Local AI"
seo_title: "Compiled Intent: Enforcing Software Architecture with Local AI"
subtitle: "Making documentation executable using local models and vector search."
date: 2026-06-08
slug: "compiled-intent"
draft: false
pillar: system
pillar_role: deep_dive
level: "Advanced"
description: "A practical experiment using a local vector index and reasoning model to audit code against Architectural Decision Records (ADRs) during development."
featured_image: "featured.jpg"
tags: ["ai", "llm", "ai-code-integrity", "enforceable-architecture", "local-first", "chronicle-ai", "rag"]
categories: ["AI in Engineering"]
---

{{< figure src="featured.jpg" alt="A concrete structure illustrating compiled path boundaries" caption="Photo by [Brett Jordan](https://unsplash.com/@brett_jordan?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText) on [Unsplash](https://unsplash.com/photos/text-TMj1c5wlO3k?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText)" lazy="false" >}}

I built [**Chronicle AI**](https://github.com/vijayanant/chronicle-ai) as a narrative linter to solve this problem for my blog—indexing my technical writing history to audit new drafts against style, definitions, and series continuity. But as I worked on the engine, I realized the underlying primitives are identical. Software design documentation and [ADRs]({{\< ref "/posts/from-patterns-to-practice/documenting-your-decision" \>}}) are, after all, just another form of technical narrative.

To test this, I ran an architectural spike: I pointed the Chronicle engine at its own codebase's ADRs, compiled a \"Technical Constitution\" of our coding constraints, and used the auditor to scan our Python source code.

Here is what happened, what we built, and what it taught me about the future of executable documentation.

---

## The Target: Enforcing Information Hiding (ADR-005)

Recently, we designed a strict 3-Tier Architecture for Chronicle to enforce David Parnas's principle of **Information Hiding**:

* **Tier 1 (Core Engine):** Connects to databases (LanceDB) and indices.
* **Tier 2 (Facade SDK):** A stable Python API (`api.py`) wrapping database queries.
* **Tier 3 (CLI / MCP Server):** Interacts exclusively via the Facade SDK.

{{< figure src="three_tier_architecture.svg" alt="3-Tier Architecture Invariant showing CLI blocked from accessing LanceDB directly" width="800px" >}}

We documented this as **ADR-005**. The hard invariant was clear:

> High-level CLI commands and user scripts are strictly prohibited from directly importing LanceDB or querying database files.

I wanted to see if a local AI system could catch us if we broke this rule.

{{< figure src="compiled_intent_pipeline.svg" alt="Compiled Intent RAG pipeline detailing index, compile, and verify steps" width="760px" >}}

---

## Step 1: Indexing the Design Intent

Instead of copy-pasting our entire documentation library into a giant system prompt, we used Chronicle's local indexer.

```bash
chronicle index --rebuild
```

This parsed our ADRs and specifications into a local LanceDB database, vectorizing our design intent using a local embedding model (`nomic-embed-text` via Ollama).

---

## Step 2: Compiling the "Technical Constitution"

To run audits efficiently, the AI needs a concentrated source of truth.

A project's architecture is often spread across dozens of ADRs, design notes, and specifications. Feeding all of that into every audit would be slow, expensive, and increasingly ineffective as the project grows.

Instead, we compile a concise **Technical Constitution**.

Like a nation's constitution, it doesn't attempt to describe every implementation detail. It captures the non-negotiable principles that govern the system.

We specified our seed topics ("3-Tier Architecture", "Information Hiding") and ran:

```bash
chronicle constitution
```

Behind the scenes, Chronicle queried LanceDB, retrieved the semantically relevant chunks from ADR-005, and fed them to our local reasoning model (`qwen2.5-coder:14b` running via Llama.cpp).

The result was a synthesized `constitution.md` containing the architectural invariants that matter most during development.

> **9. Strict API Boundary:** The AI client does not access the database directly or write raw SQL/LanceDB queries. The system uses a clean, stable, high-level API (Facade SDK) to prevent database schema leakage.

---

## Step 3: Injecting the Violation

Next, we wrote a test script that intentionally bypassed the SDK facade and connected directly to LanceDB:

```python
import lancedb

def run_direct_query():
    db = lancedb.connect(".chronicle/data/lancedb")
    table = db.open_table("chunks")
    print(table.head(5))
```

---

## Step 4: The Local Audit Gate

We ran the audit command directly on our violation file:

```bash
chronicle audit chronicle/scripts/direct_lancedb_violation.py
```

Within seconds, the local reasoning model returned a hard intercept:

```text
🚨 GUARDIAN INTERCEPT: LOGIC VIOLATION DETECTED 🚨
Reason: 🚨 VIOLATION DETECTED: Direct connection to LanceDB on disk bypasses the chronicle.src.api Facade SDK. This violates the Strict API Boundary principle.
```

It worked.

What impressed me wasn't that the model spotted `import lancedb`.

In JVM codebases, you can use tools like **ArchUnit** (or **NetArchTest** in .NET) to enforce structural invariants via unit tests. We've previously explored some of these structural enforcement techniques—like [using packages as boundaries]({{\< ref "/posts/codifying-your-architecture/the-blueprint" \>}}) to design clean directories and [defining visibility rules]({{\< ref "/posts/codifying-your-architecture/the-formal-contract" \>}}) to create formal access controls. But static checkers have clear limits:

* **High Maintenance:** You have to write and maintain code to test code. If packages are renamed or refactored, the test rules themselves must be rewritten.
* **Polyglot Friction:** They are bound to specific runtimes. In a polyglot system (e.g., Python scripts talking to a Go backend), you have to manage multiple, disparate framework rules.
* **Structural, Not Semantic:** They inspect imports and AST hierarchies, not design intent. They can stop a CLI script from importing a database client, but they can't verify semantic constraints—such as ensuring a service method implements cache-invalidation rules or that write paths use a specific transaction pattern documented in an ADR.

What mattered in this audit was that the violation wasn't encoded as a hard-coded lint rule. The audit system connected a low-level implementation detail (`lancedb.connect(...)`) with a high-level architectural invariant ("Strict API Boundary") that existed only in plain English, directly in the documentation.

The interesting part wasn't AI intelligence. The interesting part was intent retrieval.

At audit time, the model was given access to the architectural intent captured in ADR-005, distilled into the Technical Constitution, and asked to evaluate whether the code aligned with that intent.

In other words, the documentation is no longer a passive record; it participates in the verification process.

---

## The Scaling Limit of System Prompts

When integrating local models into a development workflow, a common starting point is to dump all instructions and guidelines into a single configuration file like `CLAUDE.md`.

But prompt stuffing scales poorly. As a project accumulates dozens of ADRs, dumping the entire documentation folder into the context window causes attention decay (the model misses details in the middle) and increases local inference latency.

A local retrieval gate offers an alternative: we keep the source material in individual ADRs, but retrieve and compile only the relevant design constraints at the moment they are needed. The goal is to make documentation *executable* during code reviews without bloating the context buffer.

---

## Executable Documentation

Traditionally, documentation is passive. We write it, publish it to a wiki or folder, and hope future developers remember to read it.

But when design decisions are indexed and queried during development, they start acting as active constraints. We have compilers to enforce code syntax, tests to verify behavior, and linters to check style. Treating architectural decisions as retrievable linters suggests we can enforce design intent the same way.

The documentation does not become code, but it ceases to be a static reference. It becomes a verifiable checkpoint in the engineering pipeline.
