---
title: "Glossary: Codifying Your Architecture"
slug: "glossary"
weight: 9999 # Often used to place glossary at the end of a list/series
draft: false
---

# Glossary: Codifying Your Architecture

This glossary provides definitions for key terms used throughout the "Codifying Your Architecture" series. It will be updated as new concepts are introduced and discussed in the posts.

---

*   **Architectural Drift:** The phenomenon where the implemented architecture of a system deviates over time from its intended or designed architecture, often due to expedient decisions, lack of enforcement, or changing requirements.

*   **Architectural Fitness Function:** An objective, automated measure of some architectural characteristic. It's a mechanism that actively prevents architectural drift by failing a build or test suite if a defined architectural constraint is violated.

*   **Architectural Quantum:** An independently deployable artifact with high functional cohesion and synchronous coupling. It represents the smallest unit of architecture that can stand on its own.

*   **Code Structure:** The organization of files, directories, and modules within a codebase. Architectural patterns often dictate how code should be structured to support specific qualities.

*   **Component (in Package by Component):** A cohesive, business-centric unit of code that encapsulates all the necessary logic (UI, business rules, data access) for a specific domain feature or capability.

*   **Coupling:** The degree of interdependence between software modules. High coupling means modules are heavily reliant on each other, while low (or loose) coupling means they can operate relatively independently.

*   **Cohesion:** The degree to which the elements within a single module belong together and contribute to a single, well-defined purpose. High cohesion is desirable, as it means a module is focused and easy to understand.

*   **Distributed Monolith:** A system that is architecturally split into multiple services (e.g., microservices) but remains logically coupled such that they cannot be developed, tested, or deployed independently.

*   **Information Hiding:** A design principle where the internal implementation details of a module are kept private, and only its public interface is exposed. This reduces dependencies between modules and makes systems easier to change.

*   **Package by Component:** A code organization strategy where files and directories are grouped by business capability or domain feature, rather than by technical layer (e.g., `users/` and `orders/` instead of `controllers/` and `services/`).

*   **Package by Layer:** A code organization strategy where files and directories are grouped by their technical role or layer within the application (e.g., `controllers/`, `services/`, `repositories/`).

*   **Public API (of a Module):** The explicitly exposed interface of a software module or component, defining the methods and data structures that other modules are allowed to interact with. Everything else is considered an internal implementation detail.

*   **Screaming Architecture:** A term coined by Robert C. Martin, advocating for an architecture where the top-level structure of the codebase immediately communicates the primary purpose and domain of the application, rather than its technical framework.