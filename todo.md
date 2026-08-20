# Implementation Checklist & Task Backlog: Digital Coverage Advisor MVP

## Gate 0: Prerequisites & Environment Setup
- [x] Create project workspace & Git repo structure (`amfam-digital-coverage-advisor-mvp`)
- [x] Initialize virtual environment with `cxas-scrapi` and `cxas` CLI
- [x] Configure `gecx-config.json` with GCP project `gecx-amfam` and App `amfam-digital-coverage-advisor`
- [x] Ingest & verify customer source of truth in `faq.md`
- [x] GCP Project `gecx-amfam` provisioned with required APIs enabled (`ces.googleapis.com`, `dialogflow.googleapis.com`, `aiplatform.googleapis.com`)
- [x] Create CXAS App shell `projects/gecx-amfam/locations/us/apps/amfam-digital-coverage-advisor`

## Gate 1: Gather Requirements & Formalize CUJs
- [x] Formalize Level 1 & 2 Coverage Understanding scope
- [x] Map all 55+ Q&A items from `faq.md` to discrete CUJ domains (Auto, Home, Bundling/General)
- [x] Decouple frontend trigger events (UI handles dead-clicks/timers; agent handles natural language & voice messages)
- [x] Define deterministic escalation paths (`1-800-MYAMFAM`, www.amfam.com/support)

## Gate 2: Technical Design Document (TDD) + User Approval
- [x] Draft comprehensive `tdd.md` (Architecture, XML Taskflows, Callbacks, Coverage Map)
- [x] Update TDD with decoupled frontend triggers and direct multi-agent transfer topology

## Gate 3: Scaffold Application (`cxas_app/`)
- [x] Scaffold `app.json` for `amfam-digital-coverage-advisor` (`gemini-3-flash`, session variables)
- [x] Scaffold `root_advisor` (Intent triage, greetings, domain routing)
- [x] Scaffold `auto_coverage_agent` (Liability, Physical Damage, Deductibles, PIP/UM/UIM, Add-ons)
- [x] Scaffold `home_coverage_agent` (Dwelling A-F, Peril Deductibles, Endorsements)
- [x] Scaffold `bundling_general_agent` (Multi-product discounts, payment terms, DNQ)
- [x] Scaffold `escalation_agent` (Deterministic human support routing)
- [x] Implement deterministic Python callbacks (`before_model_callback`, `after_model_callback`)
- [x] Implement custom tool `set_session_state`

## Gate 4: Static Quality Assurance & Linting
- [x] Run `cxas lint` across `cxas_app/`
- [x] Fix all structural and schema errors/warnings (Verified: 0 ERRORS)

## Gate 5: Author Evaluation Suite
- [x] Author 18 Golden Evaluations (`evals/goldens/*.yaml`) covering all FAQ CUJs
- [x] Author Simulation Evaluations (`evals/simulations/*.yaml`) for multi-turn journeys
- [x] Author Tool test suite (`evals/tool_tests/set_session_state_tests.yaml`) - 100% Pass
- [x] Author Callback unit tests (`evals/callback_tests/test_callbacks.py`) - 100% Pass

## Gate 6: Platform Push & Verification
- [x] Push app to CXAS: `projects/239085721772/locations/us/apps/amfam-digital-coverage-advisor`
- [x] Push all 18 golden evaluations to CES platform
- [x] Execute multi-turn conversational simulation suite (3/3 journeys, 100% Pass)
