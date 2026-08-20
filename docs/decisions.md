# Architecture Decision Records (ADRs)

## ADR-001: Customer Hub Initialization & Scaffolding
* **Date**: 2026-08-19
* **Context**: Kickoff of amfam conversational AI engagement.
* **Decision**: Adopt the standard CE Hub-and-Spoke topology with shared SCRAPI framework linkage (.pth) and isolated living knowledge base.
* **Consequences**: Ensures strict customer data isolation, reproducible local simulations, and rapid iteration without SDK code duplication.

## ADR-002: Phase 1 Deterministic FAQ Engine & Multi-Modal Trigger Architecture
* **Date**: 2026-08-20
* **Context**: SOW Phase 1 requires compliance-safe, deterministic responses for auto/home policy questions without AIRB review, coupled with real-time proactive triggers for dead clicks and page dwell.
* **Decision**: Implement a client-side and server-ready hybrid deterministic retrieval engine with keyword/intent matching directly over `faq.md`, paired with an event-driven DOM listener for dead clicks, scroll boundaries, and dwell thresholds.
* **Consequences**: Zero latency (<50ms), 100% compliance adherence, eliminated hallucination risks, while providing high-fidelity voice synthesis and simulated human escalation.

## ADR-003: Integrated Executive CUJ Studio & Mobile Emulation
* **Date**: 2026-08-20
* **Context**: Need to demonstrate both the redesigned American Family Insurance web experience, the live quote advisor, and the structured Critical User Journeys to executive stakeholders.
* **Decision**: Build a cohesive, modern single-page application (SPA) featuring seamless switching between AmFam Homepage Redesign, Live APEX Quote Flow, Interactive CUJ Studio, Knowledge Explorer, and Mobile Viewport Emulation.
* **Consequences**: Complete self-contained demonstration for desktop and mobile form factors with real-time telemetry.
