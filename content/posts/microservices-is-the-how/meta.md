# Post Meta: Microservices is the How

## Core Purpose
To correct the industry-wide category error: confusing physical implementation (Microservices) with logical design (Architecture).

## The "Unified Model" (The Hierarchy)
1.  **Nature (The Intent):** The adjectives. (e.g., Decentralized, Unified, Reactive).
2.  **Architecture (The Constraints):** The rules that protect the Nature. (e.g., "No sync calls," "Hide secrets").
3.  **Mechanism (The Topology):** The physical artifact. (e.g., Microservices, Monolith).

## Key Arguments (Minimalist Form)
*   **Adjectives vs. Nouns:** You don't "have a microservices architecture." You have a *decentralized* architecture implemented *via* microservices.
*   **Architecture as Constraint:** (Roy Fielding) Architecture is the coordinated set of constraints. It is the defensive boundary that protects the system's nature.
*   **Choice of Pain (The Trade-off):** Architecture is not a wish list of "ilities." It is the explicit choice of what to sacrifice (e.g., Consistency) to protect a goal (e.g., Availability). If you can't name the constraint (the "forbidden" path), you haven't architected anything.
*   **The Burden of Proof:** Microservices is the most expensive way to enforce a constraint. It must be earned by proving simpler mechanisms (packages, schema rules) fail.
*   **Topological Blindness:** Focusing on the "IP addresses" while ignoring the "logical knots."

## Vocabulary / "Expert Signals"
*   **Topology:** (Tilkov/Richards) Use this to describe Microservices/Monolith.
*   **Constraints:** Use this to describe Architecture.
*   **Connascence:** Use this to describe the degree of coupling.
*   **The Artifact Trap:** Confusing the tool for the design.

## Style Notes
*   **Minimalist:** Bone and muscle. No word salad.
*   **Authoritative:** Write for Level-3 architects. Assume they know the basics.
*   **Provocative:** "Microservices is just a hosting bill."

## Casually Worded "Hammer" Lines
*   "Architecture that isn't visible in the code is just a shared hallucination."
*   "Microservices is often just distributed procrastination."
*   "If you can't enforce a boundary in a single repository, moving to 50 won't save you."
*   "A wish list of 'ilities' is not an architecture; it's a letter to Santa. Real architecture is the choice of which pain you are willing to accept."
