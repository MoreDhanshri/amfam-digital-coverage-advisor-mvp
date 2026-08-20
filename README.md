# Digital Coverage Advisor MVP

**Digital Coverage Advisor MVP (Phase 1)** is an enterprise conversational AI agent built on Google Customer Engagement Suite (CES) / CX Agent Studio (CXAS) for American Family Insurance (AmFam). It provides instant, deterministic explanations of auto, home, and bundling coverages, limits, and deductibles directly within the digital quote-flow experience to reduce consumer confusion.

## Project Structure

```
.
├── README.md
├── faq.md                       # Canonical source of truth for customer FAQs
├── tdd.md                       # Technical Design Document (Architecture & Coverage Map)
├── todo.md                      # Phase gate checklist (Gates 0 - 6)
├── gecx-config.json             # CXAS environment configuration
├── cxas_app/                    # Agents as Code (Canonical local source)
│   └── DigitalCoverageAdvisor/
│       ├── app.json
│       ├── agents/
│       │   ├── root_advisor/
│       │   ├── auto_coverage_agent/
│       │   ├── home_coverage_agent/
│       │   ├── bundling_general_agent/
│       │   └── escalation_agent/
│       ├── tools/
│       └── callbacks/
├── evals/                       # Automated Test & Quality Gates
│   ├── goldens/                 # Turn-by-turn platform golden test cases
│   ├── simulations/             # End-to-end multi-turn simulation evals
│   ├── tool_tests/              # Isolated tool unit tests
│   └── callback_tests/          # Callback runtime unit tests
└── eval-reports/                # Quality benchmark reports & pass rate tracking
```
