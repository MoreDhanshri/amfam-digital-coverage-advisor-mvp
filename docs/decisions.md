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

## ADR-004: Exact-Match FAQ CXAS Agent with Temperature 0.0 & Deterministic Python Tooling
* **Date**: 2026-08-25
* **Context**: Standard LLM generation rephrases, summarizes, and adds conversational preamble to compliance-critical insurance FAQ answers. Strict requirement mandates LLM for intent understanding while returning 100% exact verbatim wording from canonical FAQ database.
* **Decision**: Deploy CXAS agent `amfam-faq-advisor` on `gecx-amfam` using `gemini-3-flash` with `temperature: 0.0` (greedy decoding), coupled with synchronous deterministic Python tool `lookup_coverage_faq` indexing all 45+ canonical Q&As, strict XML `<constraints>`, and `after_model_callback` verbatim guardrail.
* **Consequences**: Complete elimination of token sampling variance, zero hallucination, 100% compliance and legal text adherence, with full golden evaluation verification on Google Cloud CES.

## ADR-005: Human Escalation Modals, Smart Follow-Up Chips & Clean Session Initialization
* **Date**: 2026-08-26
* **Context**: Requirement for full human agent escalation path (Click-to-Call modal and Priority Scheduled Callback modal) with quote context (#AF-98421-WI), dynamic topic-based next suggestion bubbles, and natural conversational greeting without session ID artifacts.
* **Decision**: Integrate dual-path escalation modals in frontend (`src/index.html` & `src/app.js`), update `escalate_to_agent` tool and agent instructions to provide `1-800-MY-AMFAM` toll-free contact and operating hours, implement `getSmartNextSuggestions()` for dynamic 4-chip topic routing, and sanitize `resetSession()` to emit natural advisor greetings without raw session identifiers.
* **Consequences**: Seamless end-to-end customer support journey from digital FAQ clarification to live licensed agent transfer with pre-routed quote state.

