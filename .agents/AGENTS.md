# Customer Hub Context & Operating Rules: amfam

## Project & GCP Boundaries
- **Customer**: amfam
- **Target GCP Project**: gecx-dm-demo
- **Target Region/Location**: us
- **Environment**: Argolis / Demo Sandbox

## Context Isolation Contract
- Keep all customer conversation data, schema definitions, prompts, and credentials strictly inside this hub.
- Never cross-import data or configuration from other customer directories.

## Shared Framework Linkage
- The shared cxas-scrapi SDK is linked via .venv (cxas_scrapi.pth). All updates in cxas-scrapi take effect immediately.

## Living Knowledge Base Protocols
- Log all customer meeting notes under docs/calls/YYYY-MM-DD_[topic].md.
- Maintain docs/requirements.md and docs/decisions.md (ADRs) as living ground truth.
- Update todo.md at every transition (Plan -> Act -> Verify).
