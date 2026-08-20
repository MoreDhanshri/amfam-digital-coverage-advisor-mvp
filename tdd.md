# Technical Design Document (TDD): Digital Coverage Advisor MVP

## 1. Agent Design

### 1.1 Architecture
The **Digital Coverage Advisor MVP** is an enterprise conversational assistant on Google Customer Engagement Suite (CES / CX Agent Studio) designed to answer customer coverage questions, explain limits and deductibles, and reduce policy confusion on the American Family Insurance (AmFam) quote offers page (`www.amfam.com`).

- **Modality**: `text` (handles natural language chat and voice transcript inputs from frontend quote flow)
- **Model**: `gemini-3-flash`
- **Pattern**: Multi-Agent XML Taskflows with Deterministic FAQ Grounding (Option B)

#### Frontend Decoupling Note:
- Behavioral UI triggers (e.g., dead click detection, dwell timers, scroll milestones) are managed directly by the frontend UI layer. The frontend initiates conversations or sends natural language user queries directly into this agent.
- The agent focuses purely on conversational intent classification, deterministic coverage explanation, and seamless human escalation routing.

#### Agent Hierarchy:
```
root_advisor (Root Agent)
├── auto_coverage_agent (Sub-Agent)
├── home_coverage_agent (Sub-Agent)
├── bundling_general_agent (Sub-Agent)
└── escalation_agent (Sub-Agent)
```

#### Agent Roles & Responsibilities:
1. **`root_advisor`**:
   - Primary conversational router and session entry point.
   - Welcomes the user, classifies the user's inquiry, and transfers to specialized domain sub-agents (`auto_coverage_agent`, `home_coverage_agent`, `bundling_general_agent`, or `escalation_agent`).
   - Manages session closure when the user is satisfied.
2. **`auto_coverage_agent`**:
   - Manages all APEX Auto insurance inquiries (underwritten by Midvale Indemnity Company).
   - Covers Liability (Bodily Injury, Property Damage, 100/300 split limits), Physical Damage (Comprehensive, Collision, deductible trade-offs like \$250/\$500/\$1000, rate recalculation button), Optional Add-ons (Roadside Assistance, Rental Reimbursement, OEM Parts, Gap coverage, Road Trip, New Car Replacement, AD&D, MedPay, PIP), and Auto quote navigation.
3. **`home_coverage_agent`**:
   - Manages all APEX Home insurance inquiries (underwritten by Homesite Insurance).
   - Covers Core Coverages (A: Dwelling Rebuild Cost vs Market Value, B: Other Structures, C: Personal Property Replacement Cost vs ACV, D: Loss of Use \$150k limit, E: Personal Liability, F: Medical Payments), Deductibles (All-Perils AOP, Wind/Hail percentage, Hurricane), Optional Endorsements (Extended Replacement Cost 25%/50%, Water Backup, Service Line, Equipment Breakdown, Earthquake, Scheduled Jewelry, Mold, Pet/Pool/Libel Liability), and Home quote navigation.
4. **`bundling_general_agent`**:
   - Manages multi-product Auto + Home bundling discounts and overall savings.
   - Handles general policy terms, payment options (EFT, Credit/Debit, full pay vs 12-month installments), paperless delivery, post-purchase changes, and "Does Not Qualify" (DNQ) guidance.
5. **`escalation_agent`**:
   - Handles deterministic escalation when users request live agent assistance, ask for dynamic exact premium recalculations (deferred to Phase 2), or request competitor policy comparisons (deferred to Phase 2).
   - Provides clear AmFam contact center numbers (`1-800-MYAMFAM` / `1-800-692-6326`) and customer support portal guidance.

---

### 1.2 Tools

| Tool Name | Type | Purpose | Associated Agents |
| :--- | :--- | :--- | :--- |
| `end_session` | System (Built-in) | Gracefully terminates the session after farewell or user resolution. | `root_advisor`, `auto_coverage_agent`, `home_coverage_agent`, `bundling_general_agent`, `escalation_agent` |
| `customize_response` | System (Built-in) | Allows response payload customization. | `root_advisor` |
| `transfer_to_agent` | System (Built-in) | Executes deterministic handoffs between parent and sub-agents. | `root_advisor` |
| `set_session_state` | Python Function | Deterministically sets session variables (e.g. `_action_trigger`, `_escalation_reason`) from instructions or callbacks. | `root_advisor`, `auto_coverage_agent`, `home_coverage_agent`, `bundling_general_agent`, `escalation_agent` |

---

### 1.3 Routing Logic

#### Inbound Routing (`root_advisor`):
1. **Auto Inquiries**: Transfer to `auto_coverage_agent` (e.g., "What is Bodily Injury?", "Collision deductible", "OEM coverage", "PIP").
2. **Home Inquiries**: Transfer to `home_coverage_agent` (e.g., "What is Dwelling A?", "Water backup", "Wind/hail deductible", "Personal property").
3. **Bundling & General**: Transfer to `bundling_general_agent` (e.g., "How does bundling save money?", "Payment options", "DNQ message").
4. **Complex Pricing / Competitor / Live Agent**: Transfer to `escalation_agent` (e.g., "Recalculate my exact dollar rate", "Compare me with Geico", "I want to talk to an agent").

#### Lateral Transfers & Return to Root:
- Sub-agents resolve follow-up questions within their domain.
- If a user switches domains (e.g., asking about Auto PIP while in Home Dwelling discussion), sub-agents route to the appropriate peer or return to `root_advisor`.

---

### 1.4 Variables

| Variable Name | Type | Description | Source | Eval Override Allowed? |
| :--- | :--- | :--- | :--- | :--- |
| `user_state` | `STRING` | User's geographic state (e.g. "WI", "MN", "FL") for state-specific nuances (PIP vs MedPay, Wind/Hail deductibles). | Session Parameter | Yes |
| `active_tab` | `STRING` | Current active quote tab on the frontend (`"auto"` or `"home"`). | Session Parameter | Yes |
| `quote_id` | `STRING` | Anonymized quote session identifier. | Session Parameter | Yes |
| `current_topic` | `STRING` | Active conversation topic (`"liability"`, `"deductibles"`, `"dwelling"`, `"bundling"`, etc.). | Tool / Instruction | **NEVER** |
| `_action_trigger` | `STRING` | Internal trigger for deterministic callback actions (`"escalate"`, `"farewell"`). | Tool / Callback | **NEVER** |
| `_escalation_reason` | `STRING` | Internal reason for escalation (`"dynamic_rating"`, `"competitor_comparison"`, `"live_agent"`). | Tool / Callback | **NEVER** |

---

### 1.5 Callbacks

| Agent | Callback Type | Purpose & Implementation |
| :--- | :--- | :--- |
| `root_advisor` | `before_model_callback` | Intercepts session start (`<event>session start</event>`), initializes default session variables safely without overwriting existing state, and provides a deterministic greeting. |
| `root_advisor` | `after_model_callback` | Injects deterministic farewell text before `end_session` invocation if the model does not produce text before closing. |
| `auto_coverage_agent` | `before_model_callback` | Contextualizes state-specific restrictions (e.g., UM/UIM rejection rules in MN/NE/SD/NH, PIP vs MedPay rules) based on `$context.variables.user_state`. |
| `home_coverage_agent` | `before_model_callback` | Contextualizes mandatory Wind/Hail / Hurricane deductibles and Mold Property Protection availability (FL, GA, LA, MA, MS, NJ) based on `$context.variables.user_state`. |
| `escalation_agent` | `before_model_callback` | Guarantees deterministic rendering of AmFam contact telephone details (`1-800-MYAMFAM`) and human support guidance. |

---

## 2. Eval Design

### 2.1 Coverage Map

| ID | Requirement / FAQ Topic | Eval Type | Rationale | Priority | Severity | Tags |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `AUT-01` | Auto Bodily Injury (BI) & Property Damage (PD) Definitions | Golden | Deterministic explanation of state-required liability coverages and asset protection. | P0 | NO-GO | `auto`, `liability`, `p0` |
| `AUT-02` | Split Limits Explanation (100/300) | Golden | Exact explanation of per-person (\$100k) vs per-accident (\$300k) maximum payouts. | P0 | NO-GO | `auto`, `limits`, `p0` |
| `AUT-03` | UM / UIM Coverage Differences & State Rejection Rules | Golden | Explains uninsured vs underinsured difference and rejection rules in MN/NE/SD/NH. | P0 | HIGH | `auto`, `uninsured`, `p0` |
| `AUT-04` | Comprehensive vs Collision Differences | Golden | Non-collision events (weather, theft, animals) vs collision impact coverage. | P0 | NO-GO | `auto`, `physical_damage`, `p0` |
| `AUT-05` | Auto Deductible Trade-off Decision (\$250, \$500, \$1,000) | Golden | Guidance on premium savings vs out-of-pocket emergency cash flow. | P1 | HIGH | `auto`, `deductibles`, `p1` |
| `AUT-06` | Auto Rate Recalculation Guidance ("Calculate new rate" button) | Golden | Directs user to the "Calculate new rate" button after modifying deductible/limits. | P1 | HIGH | `auto`, `rate`, `p1` |
| `AUT-07` | Rental Reimbursement & Emergency Roadside Assistance (ERA) | Golden | Explains rental car coverage and Costco Executive default inclusion for ERA. | P1 | MEDIUM | `auto`, `addons`, `p1` |
| `AUT-08` | OEM Parts & Loan/Lease Gap Coverage | Golden | OEM vehicle age limit (11 years) and Gap coverage requirement for Comp/Coll. | P1 | HIGH | `auto`, `addons`, `p1` |
| `AUT-09` | New Car Replacement & AD&D Coverages | Golden | New vehicle replacement terms and Accidental Death & Dismemberment benefits. | P2 | MEDIUM | `auto`, `addons`, `p2` |
| `AUT-10` | PIP vs Medical Expense (MedPay) Nuances | Golden | Explains no-fault coverage differences and mutual exclusivity where PIP applies. | P0 | HIGH | `auto`, `pip`, `medpay`, `p0` |
| `AUT-11` | Auto Underwriting Entity (Midvale Indemnity Company) | Golden | Confirms underwriting by Midvale Indemnity Company, an AmFam company. | P1 | MEDIUM | `auto`, `underwriting`, `p1` |
| `HOM-01` | Dwelling (Coverage A) & Replacement Cost vs Market Value | Golden | Explains Coverage A is based on rebuild cost estimate, not real estate market value. | P0 | NO-GO | `home`, `dwelling`, `p0` |
| `HOM-02` | Other Structures (Coverage B) & Limit Increases | Golden | Explains detached garage/shed coverage (10% default) and \$1,000 increment increases. | P1 | MEDIUM | `home`, `structures`, `p1` |
| `HOM-03` | Personal Property (Coverage C) - Replacement Cost vs ACV | Golden | Explains new replacement vs depreciated actual cash value for belongings. | P0 | HIGH | `home`, `personal_property`, `p0` |
| `HOM-04` | Loss of Use (Coverage D) Standard Limits | Golden | Explains \$150,000 standard limit for temporary living expenses during repairs. | P1 | MEDIUM | `home`, `loss_of_use`, `p1` |
| `HOM-05` | Personal Liability (Coverage E) & Medical Payments (Coverage F) | Golden | Explains \$100k/\$300k/\$500k liability limits and goodwill guest medical payments. | P0 | NO-GO | `home`, `liability`, `p0` |
| `HOM-06` | All-Perils (AOP) vs Wind/Hail vs Hurricane Deductibles | Golden | Explains mandatory separate percentage deductibles (1%-2%) for wind/hurricane. | P0 | NO-GO | `home`, `deductibles`, `p0` |
| `HOM-07` | Extended Replacement Cost (25% / 50% Buffer) | Golden | Explains surge/inflation buffer above Coverage A limit after major disaster. | P0 | HIGH | `home`, `replacement_cost`, `p0` |
| `HOM-08` | Water Backup & Service Line Coverages | Golden | Sewer/drain overflow limits (\$5k-\$25k) and underground utility line repairs. | P0 | NO-GO | `home`, `water_backup`, `p0` |
| `HOM-09` | Equipment Breakdown & Scheduled Jewelry Coverage | Golden | Mechanical failure coverage for HVAC/appliances and appraised jewelry sub-limits. | P1 | HIGH | `home`, `addons`, `p1` |
| `HOM-10` | Earthquake & Ordinance of Law Coverages | Golden | Percentage deductibles for seismic risk and code-upgrade compliance costs. | P1 | MEDIUM | `home`, `addons`, `p1` |
| `HOM-11` | Mold, Mine Subsidence, Animal/Pool/Libel Liability Endorsements | Golden | State-specific endorsements (FL/GA/LA mold, CA/FL pool/pet liability). | P2 | MEDIUM | `home`, `endorsements`, `p2` |
| `HOM-12` | Home Underwriting Entity (Homesite Insurance) | Golden | Confirms underwriting by Homesite Insurance, an AmFam company. | P1 | MEDIUM | `home`, `underwriting`, `p1` |
| `BND-01` | Auto + Home Multi-Product Bundling Discount | Golden | Explains multi-product bundling savings applied across both policies. | P0 | NO-GO | `bundling`, `discounts`, `p0` |
| `BND-02` | Payment Methods & Full-Pay vs Monthly Installments | Golden | Explains EFT, credit/debit card, installment fees vs zero-fee full payment. | P1 | HIGH | `payments`, `billing`, `p1` |
| `BND-03` | Does Not Qualify (DNQ) Routing & Guidance | Golden | Empathetic explanation of online quote DNQ and escalation to support agent. | P0 | NO-GO | `dnq`, `support`, `p0` |
| `BND-04` | Quote Auto-Saving & Session Persistence | Golden | Confirms quotes are automatically saved and accessible via account login. | P1 | MEDIUM | `navigation`, `quote_save`, `p1` |
| `ESC-01` | Dynamic Rate Calculation Out-of-Scope Escalation | Golden | Intercepts requests for exact premium dollar calculations and routes to human support. | P0 | NO-GO | `escalation`, `compliance`, `p0` |
| `ESC-02` | Competitor Policy Comparison Out-of-Scope Escalation | Golden | Explains Phase 1 boundary on competitor deck page analysis and routes to agent. | P0 | HIGH | `escalation`, `compliance`, `p0` |
| `SIM-01` | Multi-Turn Auto Coverage Exploration & Deductible Adjustment | Simulation | Multi-turn journey navigating from BI/PD to Collision deductible selection. | P0 | NO-GO | `sim`, `auto`, `multi_turn` |
| `SIM-02` | Multi-Turn Home Endorsement & Water Backup Exploration | Simulation | Multi-turn exploration of Dwelling A, Water Backup, and Extended Replacement. | P0 | NO-GO | `sim`, `home`, `multi_turn` |
| `SIM-03` | Cross-Domain Auto to Home Bundle Inquiry with Escalation Attempt | Simulation | User inquires about auto, switches to home bundle discount, then asks for exact rate quote. | P0 | NO-GO | `sim`, `cross_domain`, `escalation` |

---

### 2.2 Test Data & Customer Profiles

```yaml
profiles:
  profile_auto_shopper:
    user_state: "WI"
    active_tab: "auto"
    quote_id: "Q-AUTO-88219"
  profile_home_shopper:
    user_state: "FL"
    active_tab: "home"
    quote_id: "Q-HOME-44012"
  profile_bundle_shopper:
    user_state: "MN"
    active_tab: "bundle"
    quote_id: "Q-BND-10923"
```

---

## 3. Tracking

### 3.1 Pass Rate History

| Date | Changes Description | Goldens Pass Rate | Sims Pass Rate | Overall Status |
| :--- | :--- | :--- | :--- | :--- |
| *(Pending Gate 6)* | Initial baseline run (5 runs per eval) | --% | --% | Pending Scaffold & Push |

---

### 3.2 Changelog
- **2026-08-20**: Initial requirements-derived TDD draft created from customer `faq.md` and Phase 1 Scope of Work.
- **2026-08-20**: Updated TDD to decouple frontend-managed triggers (dead-clicks, dwell timers) and focus on pure natural language chat/voice inputs.

---

*Review and approve before scaffolding the agent.*
