# Sprint Task Backlog & Execution Contract

## Current Sprint Objectives: AmFam Digital Coverage Advisor (Deterministic FAQ CXAS Agent)

### Build Checklist (CXAS Agent Foundry Gates 0–6)
- [x] **Gate 0: Initialize Task Backlog (`todo.md`) & Environment Readiness**
  - [x] Link and verify `cxas-scrapi` venv & CLI functionality
  - [x] Verify workspace and project isolation rules
- [x] **Gate 1: Ingest Requirements & FAQ Corpus**
  - [x] Ingest comprehensive AmFam FAQ library into `sources/amfam_faq_library.md` (45+ questions across Auto, Home, Bundling, Navigation, Deductibles)
  - [x] Document strict verbatim wording & intent understanding requirements
- [x] **Gate 2: Technical Design Document (TDD) + User Approval**
  - [x] Draft TDD (`tdd.md`) covering Architecture, Data Connectors / FAQ Tools, State Variables, Callbacks, and Golden/Sim Evals
  - [x] Include `temperature: 0.0` greedy decoding in application and agent model settings
  - [x] Select and approve Option 3 (Hybrid Exact-Match Architecture)
- [x] **Gate 3: Scaffold CXAS Application**
  - [x] Create `cxas_app/amfam_faq_advisor/` app structure
  - [x] Author `app.json`, `agents/root_agent/` (instruction.txt with XML taskflow & constraints)
  - [x] Implement deterministic FAQ tool (`tools/lookup_coverage_faq/`) with full canonical library of 45+ questions & exact return schema
  - [x] Implement escalation tool (`tools/escalate_to_agent/`)
  - [x] Author deterministic callback in `agents/root_agent/after_model_callbacks/`
- [x] **Gate 4: Lint Clean (`cxas lint`)**
  - [x] Run structural & schema validation; achieved 100% clean status (0 errors, 0 warnings)
- [x] **Gate 5: Author Baseline Evals**
  - [x] Generate baseline goldens in `evals/goldens/auto_coverage_faq.yaml`, `evals/goldens/home_coverage_faq.yaml`, `evals/goldens/bundling_and_general_faq.yaml`
  - [x] Generate simulations in `evals/simulations/simulations.yaml`
  - [x] Author and pass tool unit tests in `evals/tool_tests/test_lookup_coverage_faq.py`
- [x] **Gate 6: Push & Initial Verification**
  - [x] Deployed app `amfam-faq-advisor` to `gecx-amfam` location `us` (`projects/gecx-amfam/locations/us/apps/b8159ce5-24ba-4578-8547-b58995268856`)
  - [x] Pushed baseline goldens and verified 100% PASS (12/12)

### Extended Evaluation Sprint: Diverse Customer Phrasings & Robustness
- [x] Author diverse phrasing evaluation suites:
  - [x] `evals/goldens/diverse_phrasings_auto.yaml` (Colloquial Auto Liability, Physical Damage, Deductible trade-offs, Gap, ERA, Rate recalculation)
  - [x] `evals/goldens/diverse_phrasings_home.yaml` (Informal Dwelling rebuild vs market value, RCV vs ACV, Wind/Hail %, Water Backup, Service Line, Equipment Breakdown)
  - [x] `evals/goldens/diverse_phrasings_bundling.yaml` (Bundling savings, Underwriter identities, DNQ explanations, Quote tab closing)
- [x] Validate evals structure with `cxas lint` (0 errors, 0 warnings)
- [x] Push new evaluation suites to `gecx-amfam` platform (`cxas push-eval`)
- [x] Execute platform evaluation runs across the expanded test suite (`cxas run`) — 29/29 tests PASS (100%)
- [x] Compile comprehensive pass/fail and verbatim fidelity verification report

### Human Agent Escalation & Dynamic Follow-Up Experience Sprint
- [x] Integrate full human escalation modal flows:
  - [x] Modal 1: Click-to-Call (Toll-Free `1-800-MY-AMFAM` / `1-800-692-6326`, Operating hours Mon-Fri 8am-8pm CST / Sat 8:30am-5pm CST, Quote Ref `#AF-98421-WI`)
  - [x] Modal 2: Schedule Priority Callback (Customer name, phone, preferred time window, direct transfer confirmation)
- [x] Enrich `escalate_to_agent` tool and agent instructions (`instruction.txt`) with compliant contact info
- [x] Author golden evaluation tests for live agent handoff and complex claims escalation
- [x] Implement dynamic context-aware smart next question suggestions (`getSmartNextSuggestions`) across Auto, Home, Bundling, and Escalation
- [x] Sanitize session initialization and refresh greetings — eliminated all raw session IDs (`SES-...`) from chat bubbles
- [x] Validate zero-warning CXAS linter status (`cxas lint` 0 errors, 0 warnings across all 7 evaluation suites)
- [x] Git commit and push all updates to feature branch


