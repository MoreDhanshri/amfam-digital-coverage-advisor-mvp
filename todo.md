# Implementation Checklist & Task Backlog: Digital Coverage Advisor MVP

## Gate 0: Prerequisites & Environment Setup
- [x] Create project workspace & Git repo structure (`amfam-digital-coverage-advisor-mvp`)
- [x] Initialize virtual environment with `cxas-scrapi` and `cxas` CLI
- [x] Configure `gecx-config.json` with GCP project `gecx-amfam` and App `amfam-digital-coverage-advisor`
- [x] Ingest & verify customer source of truth in `faq.md`
- [x] GCP Project `gecx-amfam` provisioned with required APIs enabled (`ces.googleapis.com`, `dialogflow.googleapis.com`)
- [x] Create CXAS App shell `projects/gecx-amfam/locations/us/apps/amfam-digital-coverage-advisor`

## Gate 1: Gather Requirements & Formalize CUJs
- [x] Formalize Level 1 & 2 Coverage Understanding scope
- [x] Map all 55+ Q&A items from `faq.md` to discrete CUJ domains (Auto, Home, Bundling/General)
- [x] Define behavioral trigger contracts (Time-on-page, dead-clicks, scroll threshold)
- [x] Define deterministic escalation paths (click-to-call, human chat redirection)

## Gate 2: Technical Design Document (TDD) + User Approval
- [x] Draft comprehensive `tdd.md` (Architecture, XML Taskflows, Callbacks, Coverage Map)
- [ ] Review open questions with user and obtain explicit TDD approval

## Gate 3: Scaffold Application (`cxas_app/`)
- [ ] Scaffold `app.json` for `amfam-digital-coverage-advisor`
- [ ] Scaffold `root_advisor` (Intent triage, greetings, event routing)
- [ ] Scaffold `auto_coverage_agent` (Liability, Physical Damage, Deductibles, PIP/UM/UIM, Add-ons)
- [ ] Scaffold `home_coverage_agent` (Dwelling A-F, Peril Deductibles, Endorsements)
- [ ] Scaffold `bundling_general_agent` (Multi-product discounts, payment terms, DNQ)
- [ ] Scaffold `escalation_agent` (Deterministic human support routing)
- [ ] Scaffold Python callbacks (`before_model_callback`, `after_model_callback`)

## Gate 4: Static Quality Assurance & Linting
- [ ] Run `cxas lint` across `cxas_app/`
- [ ] Fix all structural and schema errors/warnings (Zero Warnings Policy)

## Gate 5: Author Evaluation Suite
- [ ] Author Golden Evaluations (`evals/goldens/*.yaml`) covering all FAQ CUJs
- [ ] Author Simulation Evaluations (`evals/simulations/*.yaml`) for multi-turn journeys
- [ ] Author Callback unit tests (`evals/callback_tests/`)

## Gate 6: Platform Push & Verification
- [ ] Push app to CXAS: `cxas push --app-dir cxas_app/amfam_digital_coverage_advisor`
- [ ] Run platform build verification: `python scripts/gate-check.py`
- [ ] Execute baseline evaluation runs (`run-and-report.py --runs 5`)
- [ ] Verify pass rates >= 90% and log in `experiment_log.md`
