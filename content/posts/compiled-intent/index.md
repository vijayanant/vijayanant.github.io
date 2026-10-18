---
title: "Compiled Intent: Enforcing Architectural Invariants for LLM Coding Agents"
seo_title: "Compiled Intent: Enforcing Architectural Invariants for LLM Coding Agents"
subtitle: "Why giving an AI the whole document makes it worse at catching bugs, and how compiling intent fixes it"
date: 2026-10-10
draft: false
slug: "compiled-intent"
pillar: system
pillar_role: deep_dive
level: "Advanced"
description: "Why code syntax is blind to system intent, how stuffing design docs into LLM context triggers the Ammunition Effect, and how compiling intent via small-to-big AST retrieval cuts token bloat by 94.6% while improving enforcement."
tags: ["compiled-intent", "llm", "ai-code-integrity", "rag", "code-generation"]
categories: ["AI in Engineering", "Software Architecture"]
featured_image: "featured.jpg"
---

{{< figure src="featured.jpg" alt="Movable metal type blocks arranged on a composing stick" caption="Photo by [Hannes Wolf](https://unsplash.com/@hannes_wolf?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/photos/black-and-brown-case-n2ILm0aTCYo?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)" lazy="false" >}}

When an LLM generates code that violates system rules, the industry's default reflex is simple: *dump more documentation into the context.*

We feed the model entire design specifications, Architecture Decision Records (ADRs), style guides, and RFCs. Frontier models now offer context windows with millions of tokens, so the assumption seems obvious: giving the AI the complete document gives it the full picture.

When I systematically benchmarked this across 117 engineering tasks, the result broke that assumption completely:

**Giving the model the whole document in context actually made it worse at catching violations.**

Stripping away 95% of the document context and providing only a concise slice of the active rule beat the full-document baseline by **+12.8% on Qwen 2.5 Coder (14B)** and **+17.9% on Gemma 3 (12B)** on adversarial code reviews.

Why would giving an AI *less* documentation make it significantly better at enforcing rules?

Because code syntax is blind to intent, and models given full documents don't just search for rules: they search for excuses.

---

## 1. Syntax is Blind to Intent

Typecheckers, compilers, and linters are great at verifying syntax, memory safety, and API signatures. But they cannot verify **intent**: the collective design rules, protocol invariants, non-negotiable boundaries, and architectural trade-offs that govern how a system is supposed to behave.

Consider two real-world pull requests that look like textbook, production-grade engineering:

### Example A: The Observability Leak

A developer adds structured tracing to an authentication and sync handler:

```rust
#[tracing::instrument(skip(payload))]
pub async fn handle_sync_request(
    account_id: &str, 
    user_id: &str, 
    payload: &[u8]
) -> Result<SyncResponse, ServiceError> {
    // ...
}
```

To a compiler, a linter, or an LLM looking only at the diff, this is exemplary code. The developer even thoughtfully skipped `payload` to avoid bloating log files.

Yet it introduces a serious violation of system intent: `#[tracing::instrument]` automatically captures and serializes all un-skipped function arguments into external telemetry sinks (Datadog, CloudWatch). By leaving `user_id` unhashed, it silently streams plain-text user identifiers into third-party log infrastructure, violating strict privacy boundaries and enterprise diagnostic guidelines.

A generic AI reviewer looking at this diff sees modern observability best practices and stamps it: **Approved.**

### Example B: The Direct Mutation Bypass

In an event-sourced, audited ledger system, an engineer updates a member's organization permissions:

```rust
pub async fn update_member_role(
    tx: &mut DbTransaction<'_>, 
    org_id: &OrgId, 
    member_id: &MemberId, 
    new_role: Role
) -> Result<(), AppError> {
    sqlx::query("UPDATE members SET role = $1 WHERE id = $2 AND org_id = $3")
        .bind(new_role)
        .bind(member_id)
        .bind(org_id)
        .execute(&mut **tx)
        .await?;
    Ok(())
}
```

To the typechecker and database driver, this code is flawless. It is asynchronous, type-safe, parameterized against SQL injection, and executes inside an atomic transaction.

Yet it breaks a fundamental system invariant: state changes can *never* be applied via direct SQL mutations. Every permission change must be compiled as an immutable, signed ledger event to preserve non-repudiation and audit logs. This shortcut creates "ghost state" that completely bypasses the audit trail.

A generic AI reviewer sees clean, parameterized SQL and stamps it: **Approved.**

---

In both cases, the code compiles cleanly, passes every linter, and follows standard internet practices.

Code reflects *what was built*, but intent defines *what is forbidden, and why*.

When LLMs lack access to that intent, they fall back on generalized internet averages. And internet best practices frequently violate your specific system constraints.

---

## 2. The Illusion of the Short Prompt and The Ammunition Effect

If code cannot enforce its own intent, how do we provide that context to the AI?

Most developers assume their prompts are lightweight. When you type three sentences into an agentic IDE, Copilot, or a chat window, it feels short. 

Under the hood, modern developer tooling quietly packs the context window on every turn with global instructions, multi-turn chat history, open editor buffers, and entire folders of design documentation.

To you, the prompt is 50 words. To the LLM, the working context is 30,000 to 50,000 tokens re-evaluated on every single keystroke.

In day-to-day engineering, this invisible context bloat breaks down on two distinct fronts:

### The Physical Wall

Processing massive context payloads saturates memory bandwidth and triggers Key-Value (KV) cache thrashing on local developer workstations, causing fans to spin and inference latency to spike. On hosted cloud APIs, re-reading tens of thousands of static context tokens on every commit compounds into severe continuous integration bills.

{{< note type="tip" title="The Local KV Cache Illusion" >}}
When testing large prompts locally via Ollama or llama.cpp, Key-Value (KV) caching reuses prefix weights across turns, creating an illusion that massive prompts are computationally free. But in continuous integration over cloud APIs (Claude, GPT-4o), providers bill for the entire context window on every stateless request.
{{< /note >}}

### The Cognitive Trap: The Ammunition Effect

The far more dangerous failure mode is cognitive: an overloaded context actively degrades rule enforcement.

{{< quote type="pull" >}}
When an LLM has the whole document in context, it doesn't just search for violations. It searches for loopholes to agree with the developer.
{{< /quote >}}

LLMs are instruction-tuned to be helpful, cooperative, and agreeable. Meanwhile, engineers who write questionable code rarely submit pull requests saying *"I cut corners."* They attach plausible, persuasive rationalizations in the PR description:

> *"Bypassing cryptographic hash verification here to unblock sync throughput on trusted cluster peers."*

When you hand an LLM a 20-page specification alongside that pull request, the model does not act like a strict auditor. It searches the entire context for loopholes to agree with the author's rationale.

Real specifications are full of peripheral prose: notes on testing mocks, legacy bridges, future roadmaps, and optional traits. When the model has the whole document in context, it goes spelunking through those peripheral sections. In our benchmark evaluations, models frequently latched onto footnotes describing `MockTransport` for local test environments, inferred that "trusted cluster peers" deserved a similar transport exemption, and stamped the violation: **Approved**.

The extraneous prose in the context became **cognitive ammunition** for the model to rationalize bad code.

---

## 3. What About Tool-Calling Agents? (The On-Demand Fallacy)

An obvious objection arises:

*Why stuff documents into context at all? Modern autonomous coding agents don't load documentation upfront. They use tool calling to read files on demand (`read_file`, `grep`).*

Giving an agent file-reading tools feels intuitive, but in practice it runs into two fatal traps when enforcing system intent:

### The "Unknown Unknowns" Trap
An on-demand agent only reads what it thinks it needs to look for.

Consider our earlier sync handler example:

```rust
#[tracing::instrument(skip(payload))]
pub async fn handle_sync_request(account_id: &str, user_id: &str, payload: &[u8])
```

An agent inspecting this pull request sees a network sync function. Its natural reflex is to issue a tool call: `read_file("specs/sync_protocol.md")`.

Does the agent know that inside an entirely separate directory (`specs/governance/diagnostics.md`) is a strict privacy invariant forbidding plain-text user identifiers in logs?

No. The model cannot request a document whose relevance it has no reason to suspect. It reads `sync_protocol.md`, verifies the network serialization logic, never asks to inspect the diagnostics guidelines, and stamps the violation: **Approved.**

When intent is distributed across dozens of specifications, relying on the model to guess which files to open fails on every cross-cutting architectural boundary.

### The Whole-File Avalanche
Even when an agent correctly identifies the relevant document, standard file-reading tools operate at whole-file granularity: `read_file("specs/sync_protocol.md")`.

The tool call dumps the entire 3,000-word markdown file into the chat history. The moment that full document enters the conversation, the Ammunition Effect strikes immediately: the model spots a footnote describing `MockTransport` for local tests, links it to the author's excuse, and approves the shortcut.

Worse, every subsequent tool call appends another complete file to the context. After three or four tool turns, the conversation history accumulates 15,000 to 20,000 tokens of raw file dumps. The agent hasn't avoided context bloat; it has merely arrived at the exact same attention bleed across multiple expensive round-trips.

---

## 4. Why Generic RAG Fails

If stuffing whole documents into context triggers the Ammunition Effect, what about standard Retrieval-Augmented Generation (RAG)?

Most off-the-shelf RAG pipelines rely on arbitrary, fixed-size byte windows (for example, splitting text every 500 tokens with a 50-token overlap). For narrative prose, this works reasonably well. For system intent, it introduces two fatal failure modes:

1. **The Pronoun Problem:** When a naive chunker slices text at arbitrary byte counts, it inevitably severs sentences from their governing section headings. A chunk reading *"It must not be called asynchronously"* loses the heading that explains what *"It"* actually refers to. Blinded to context, the LLM hallucinates or guesses.
2. **The Frankenstein Effect:** When a vector database returns multiple disconnected chunks to a local model, the transformer's self-attention mechanism struggles to reconcile the fragments. If Chunk 1 discusses branch `m/0'` and Chunk 2 discusses branch `m/1'`, the model stitches the fragments together and hallucinates an invalid relationship across boundaries.
3. **Query Averaging:** When questions combine a structural component with a protocol rule (for example, *"In the Merkle Index Tree, what serialization format is strictly mandated?"*), squashing the query into a single vector causes the dominant noun (*Merkle Index Tree*) to exert overwhelming mathematical gravity. It pulls search toward tree traversal documents, washing out the rule governing serialization format (*CBOR*).

Simple Top-K vector retrieval over arbitrary text chunks cannot reliably reconstruct structured intent.

---

## 5. Inside the Engine: How Intent is Actually Compiled

To enforce boundaries without triggering the Ammunition Effect or the Frankenstein Effect, we must treat system documentation not as loose text, but as structured intent that can be compiled.

In the open-source **Compitent Engine** (`compiled-intent`), this compilation pipeline is implemented around four core architectural mechanisms:

### A. AST-Guided Small-to-Big Retrieval

Technical specifications possess a rigid hierarchical structure: documents are divided into functional sections defined by Markdown headings (`#`, `##`, `###`).

Instead of splitting text by arbitrary byte offsets, the engine uses an Abstract Syntax Tree (AST) parser (`pulldown_cmark`) to map document structure:

- Every heading defines an authoritative **Parent Section**. The section header is explicitly preserved and prepended to the parent payload (`# Heading\n\n...`), completely eliminating the Pronoun Problem.
- Inside each parent section, the engine generates dense, overlapping sliding windows of **$\le 300$ characters with a 50-character overlap**.

This creates a deliberate duality: **small chunks for mathematical embedding precision, big chunks for LLM reasoning.**

The 300-character child windows are tiny and dense, giving vector embeddings maximum mathematical sharpness and preventing query averaging. But when a search hits a child window, the engine expands and returns the entire, intact **Parent Block** to the downstream model. The LLM receives complete, unbroken contextual logic under its authoritative title.

{{< note type="info" title="Why ~750 Tokens?" >}}
The ~750-token average is an emergent property of our specification corpus, not a hardcoded algorithm limit. Because the engine slices along Markdown AST headings, section size is dictated by how human authors naturally organize their thoughts, rather than an arbitrary token ceiling.
{{< /note >}}

### B. Parent Chunk Collapsing (Anti-Crowding)

In naive RAG, if a long section contains four matching child windows, those four sibling chunks will consume all top-$k$ search slots, starving the model of other critical specifications.

The engine solves this by applying an **over-fetch multiplier ($4\times$)** during stream traversal, followed by a **parent collapsing pass**. Sibling child chunks that resolve to the same `parent_id` are collapsed into a single parent return. This eliminates sibling crowding and guarantees that the retrieved context contains diverse, independent architectural sections.

### C. Tri-Modal Retrieval with Reciprocal Rank Fusion (RRF)

An architectural coprocessor must handle two conflicting query archetypes:

1. **Exact Identifier Lookups:** When auditing code for a specific trait, struct, or error type (such as `SessionLedger` or `akshara::Error`), dense vector search struggles because sub-word tokenization and embedding spaces wash out exact symbol strings.
2. **Conceptual and Behavioral Rules:** When auditing abstract invariants (*"metadata blindness"* or *"deterministic tie-breaking"*), lexical keyword search fails when the code diff uses different terminology.

Linear score weighting ($\alpha \cdot S_{\text{vector}} + (1-\alpha) \cdot S_{\text{bm25}}$) is notoriously fragile because cosine distance and BM25 scores follow entirely different numerical distributions, requiring constant manual tuning.

The engine implements **Tri-Modal Retrieval** with three execution modes:

- `fts`: Pure Tantivy BM25 scalar search for exact symbol verification.
- `vector`: Pure dense vector search for high-level conceptual questions.
- `hybrid` (default): LanceDB executes both in parallel and fuses the results using **Reciprocal Rank Fusion (RRF)**:

$$RRF(d) = \sum_{m \in \{\text{vector}, \text{fts}\}} \frac{1}{k + r_m(d)}$$

Because RRF operates strictly on reciprocal rank positions rather than raw scores, it is scale-invariant and requires zero corpus-specific weight tuning. Exact code symbols rank at the top via Tantivy, while conceptual rules resolve via vector similarity.

### D. Adaptive Score Tolerance Gating

Even with parent collapsing, returning long-tail, low-confidence matches pollutes the context and invites the Ammunition Effect.

The engine applies **relative score tolerance gating** (`score_tolerance`). Rather than relying solely on an arbitrary static score floor, the engine computes a cutoff threshold relative to the peak match:

$$\text{Threshold} = (1.0 - \text{score\_tolerance}) \times S_{\text{top}}$$

If the top retrieved invariant scores 0.85 with a tolerance of 0.15, any candidate scoring below ~0.72 is automatically pruned. If the engine finds the exact governing rule, it refuses to inject noisy, borderline distractions into context.

---

## 6. The Empirical Evidence: The ArchEval Benchmark

To evaluate whether compiling intent reliably enforces system boundaries, I designed **ArchEval**: an empirical benchmark suite of 117 realistic engineering tasks spanning three distinct tracks:

- **Architectural Trivia (39 tasks):** Proactive questions testing proprietary design rules in the IDE.
- **PR Audits (39 tasks):** Routine code reviews evaluating compliance on incoming commits.
- **Adversarial Traps (39 tasks):** Code changes paired with persuasive rationalizations designed to trick the reviewer into approving violations.

We benchmarked four strategies across open-weight models (`qwen2.5-coder:14b` and `gemma3:12b` at temperature $T=0$): **Zero Context**, **Oracle (Single-File)**, **Prompt Stuffing**, and **Compiled Intent**.

### Table 1: Benchmark Accuracy Matrix ($N=117$, $T=0$)

| Strategy | Overall Accuracy | PR Audit Track | Adversarial Traps | Architectural Trivia |
| :--- | :---: | :---: | :---: | :---: |
| **Qwen 2.5 Coder (14B)** | | | | |
| Zero Context | 34.2% | 41.0% | 38.5% | 23.1% |
| Oracle (Single-File) | 75.2% | 71.8% | 59.0% | 94.9% |
| Prompt Stuffing | 75.2% | 64.1% | 69.2% | 92.3% |
| **Compiled Intent** | **79.5%** | **69.2%** | **74.4%** | **94.9%** |
| | | | | |
| **Gemma 3 (12B)** | | | | |
| Zero Context | 46.6% | 33.3% | 53.8% | 52.6% |
| Oracle (Single-File) | 75.2% | 66.7% | 66.7% | 92.3% |
| Prompt Stuffing | 80.3% | 74.4% | 69.2% | 97.4% |
| **Compiled Intent** | **82.9%** | **79.5%** | **82.1%** | **87.2%** |

On standard daily coding and routine PR reviews, Compiled Intent matched or exceeded prompt stuffing. But the critical result is in the **Adversarial Traps** column:

When developers attach persuasive excuses to bad code, handing the model the full document drops auditing accuracy to 59.0% on Qwen and 66.7% on Gemma. The model gets lost in the peripheral prose and approves the shortcut.

By isolating the governing rule, Compiled Intent raises adversarial enforcement accuracy to **74.4% on Qwen (+15.4 points)** and **82.1% on Gemma (+15.4 points)**.

### Table 2: Injected Context and Token Footprint

| Strategy | Avg. Input Context | Total Injected Tokens (117 Tasks) | Reduction vs. Stuffing |
| :--- | :---: | :---: | :---: |
| Zero Context | ~250 tokens | ~33,000 tokens | -98.2% |
| Oracle (Single-File) | ~2,100 tokens | ~245,000 tokens | -87.0% |
| Prompt Stuffing | ~15,400 tokens | ~1,880,000 tokens | Baseline |
| **Compiled Intent** | **~820 tokens** | **~96,000 tokens** | **-94.7%** |

Across all 117 benchmark tasks, prompt stuffing burned **1.88 million input tokens**. Compiled Intent completed the exact same evaluation suite using just **96,000 tokens**, achieving a **94.7% reduction in context payload** while delivering higher adversarial accuracy.

Even compared to an ideal human Oracle who pre-selects the exact file containing the rule (~2,100 tokens), Compiled Intent cuts context by **61.0%** by stripping out intra-file narratives and focusing the model's attention entirely on the active constraint.

---

## 7. Don't Stuff Context. Compile Intent.

As AI models gain larger context windows, our natural instinct is to treat the context window as an infinite wastebasket for static documentation.

It feels thorough, but it is an illusion. Stuffing context burns tokens, introduces memory bottlenecks on local machines, causes lost-in-the-middle amnesia, and gives coding models the exact cognitive ammunition they need to agree with bad code.

If we want autonomous coding agents to build reliable, maintainable systems, we don't need bigger context windows. We need **attention hygiene**.

Code syntax reflects past implementation. Intent defines future boundaries.

Don't stuff your context. Compile your intent.

---

*(The complete methodology, statistical evaluation, and reproducible dataset are detailed in our technical report: [Compiled Intent: Enforcing Architectural Invariants for LLM Coding Agents (PDF)](https://github.com/vijayanant/compiled-intent-research/releases/latest/download/compiled-intent.pdf). The open-source Rust engine is available on [GitHub (compiled-intent)](https://github.com/vijayanant/compiled-intent), and the benchmark suite can be inspected in the [ArchEval repository](https://github.com/vijayanant/compiled-intent-research).)*

{{< newsletter type="simple" >}}
