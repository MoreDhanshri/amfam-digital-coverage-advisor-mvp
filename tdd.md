# Technical Design Document (TDD): AmFam Digital Coverage Advisor (FAQ Exact-Match Agent)

## 1. Executive Summary & Objective

The **AmFam Digital Coverage Advisor FAQ Agent** is a specialized CXAS (Customer Engagement Suite) conversational agent designed for prospective and existing American Family Insurance policyholders exploring auto and home insurance quotes on the APEX platform.

### Core Problem & Strict Requirement
- **Problem**: Default generative LLM architectures rephrase and summarize FAQ answers, introducing subtle inaccuracies or unwanted conversational filler that violates compliance and exact legal wording standards.
- **Requirement**: Use the LLM's generative reasoning and semantic capabilities solely for **intent understanding and query disambiguation**, while strictly outputting the **100% exact verbatim wording** from the official AmFam FAQ library.
- **Decoding Configuration**: Set **`temperature: 0.0`** across application and agent model settings to eliminate sampling stochasticity and enforce deterministic greedy token generation.

---

## 2. Selected Architecture: Option 3 (Hybrid Deterministic Architecture)

Option 3 combines three layers of strict fidelity guarantees:

1. **Greedy Decoding & Temperature 0.0**: Eliminates random sampling variance across all model turns.
2. **Deterministic Python FAQ Lookup Tool (`lookup_coverage_faq`)**: Indexes all 45+ canonical Q&A pairs. The LLM handles natural language query understanding, maps to the appropriate `question_key`, and receives the exact string payload with a strict `agent_action` directive.
3. **Strict XML `<constraints>` + `after_model_callback` Guardrail**: Instructs the agent to output the string character-for-character without introductory filler, and validates output fidelity in callback execution.

```
                      ┌────────────────────────────────────────┐
                      │           User Query Input             │
                      │  ("What if I hit a deer on highway?")  │
                      └──────────────────┬─────────────────────┘
                                         │
                                         ▼
                      ┌────────────────────────────────────────┐
                      │           amfam_faq_advisor            │
                      │      (gemini-3-flash, Temp: 0.0)       │
                      │  LLM Semantic Intent Classification    │
                      └──────────────────┬─────────────────────┘
                                         │
                           question_key: "comprehensive_coverage"
                                         │
                                         ▼
                      ┌────────────────────────────────────────┐
                      │         lookup_coverage_faq            │
                      │     (Deterministic Python Tool)        │
                      │  Returns exact canonical string        │
                      └──────────────────┬─────────────────────┘
                                         │
                                         ▼ Exact Answer Payload
                      ┌────────────────────────────────────────┐
                      │          after_model_callback          │
                      │    (Verbatim Fidelity Verification)    │
                      └──────────────────┬─────────────────────┘
                                         │
                                         ▼
                      ┌────────────────────────────────────────┐
                      │     Verbatim FAQ Response to User      │
                      └────────────────────────────────────────┘
```

---

## 3. Agent Design

### 3.1 Architecture Overview
- **App Name**: `amfam_faq_advisor`
- **Modality**: `text` (Omnichannel / Web Chat Messenger)
- **Model**: `gemini-3-flash`
- **Temperature**: `0.0`
- **Topology**: High-efficiency Single-Agent architecture utilizing structured XML `<taskflow>`, `<subtask>`, and `<step>` routing with strict `<constraints>`.

### 3.2 Tools & Connectors

1. **`lookup_coverage_faq`** (Python Code Tool)
   - **Purpose**: Deterministically retrieves the exact canonical answer for any AmFam FAQ topic or question key.
   - **Parameters**:
     - `category` (string, enum: `["auto_liability", "auto_physical_damage", "auto_addons", "auto_premium_nav", "home_core", "home_deductibles", "home_addons", "home_premium_nav", "bundling_general"]`): The high-level insurance domain.
     - `question_key` (string, REQUIRED): The specific FAQ identifier (e.g., `bodily_injury_liability`, `wind_hail_deductible`, `rental_reimbursement`, `difference_apex_auto_home`).
     - `user_query` (string, optional): The raw question asked by the user for logging/observability.
   - **Output Schema**:
     ```json
     {
       "status": "success",
       "question": "What is Bodily Injury (BI) liability coverage and why do I need it?",
       "exact_answer": "Bodily Injury covers costs if you injure someone else in an accident — including their medical bills, lost wages, and legal fees if they sue you. It is required in most states and protects your personal assets.",
       "action": "Output the exact_answer text VERBATIM. Do not modify, rephrase, summarize, or prepend pleasantries."
     }
     ```

2. **`escalate_to_agent`** (Python Code Tool)
   - **Purpose**: Handles seamless handover to a licensed American Family Insurance agent when a user's question cannot be answered from the FAQ library or requires personalized binding assistance.
   - **Parameters**:
     - `reason` (string): Summary of why escalation was requested.
     - `customer_context` (string, optional): Relevant policy / quote details.

### 3.3 Session Variables
- `last_faq_category` (string): Tracks the most recently discussed insurance domain (`auto`, `home`, `bundle`).
- `last_faq_key` (string): Tracks the specific FAQ question key answered in the previous turn.
- `consecutive_unknown_queries` (integer): Counter to trigger graceful human agent escalation after 2 unresolvable inquiries.

### 3.4 Callbacks
- **`after_model_callback`**:
  - Validates that when `lookup_coverage_faq` is invoked, the model's output contains the exact answer text and strips any conversational drift or accidental hallucinations.

---

## 4. Coverage Map & Evaluation Strategy

| Requirement / CUJ | Eval Type | Description | Priority | Severity |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-FAQ-01: Auto Liability Understanding** | Golden | User asks about Bodily Injury, Property Damage, 100/300 limits, and UM/UIM. Agent invokes `lookup_coverage_faq` and outputs verbatim answer. | P0 | BLOCKER |
| **REQ-FAQ-02: Auto Physical Damage & Deductibles** | Golden | User inquires about Comprehensive vs Collision, deductible selection ($250 vs $500 vs $1000), and rate recalculation. Agent answers with exact wording. | P0 | BLOCKER |
| **REQ-FAQ-03: Auto Add-on Coverages** | Golden | User asks about Gap coverage, Roadside Assistance (ERA), OEM parts, and Road Trip Accommodations. Agent outputs exact canonical answers. | P1 | HIGH |
| **REQ-FAQ-04: Home Core Coverages & Dwelling** | Golden | User asks about Dwelling (Coverage A), Other Structures (Coverage B), Personal Property (Coverage C), and ACV vs Replacement Cost. | P0 | BLOCKER |
| **REQ-FAQ-05: Home Deductibles (Wind/Hail & Hurricane)** | Golden | User asks about AOP vs Wind/Hail vs Hurricane deductibles. Agent explains percentage rules verbatim. | P0 | BLOCKER |
| **REQ-FAQ-06: Home Optional Endorsements** | Golden | User asks about Water Backup, Service Line, Equipment Breakdown, and Earthquake coverage. Verbatim answers verified. | P1 | HIGH |
| **REQ-FAQ-07: Bundling, Underwriters & Navigation** | Golden | User asks about Auto+Home bundle discount, Midvale Indemnity vs Homesite Insurance underwriting, and DNQ messages. | P0 | BLOCKER |
| **REQ-FAQ-08: Natural Language & Fuzzy Intent Matching** | Simulation | User phrases questions informally (e.g. "what if a tree falls on my car?", "does this pay for hotel if my roof blows off?"). Agent correctly maps intent and returns exact FAQ text. | P1 | HIGH |
| **REQ-FAQ-09: Out-of-Scope & Human Escalation** | Simulation | User asks an unanswerable personal claim query. Agent triggers `escalate_to_agent` after offering assistance. | P1 | MEDIUM |
