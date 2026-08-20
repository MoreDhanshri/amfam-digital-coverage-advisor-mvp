# Customer Call Notes: Digital Coverage Advisor MVP Kickoff
**Date**: 2026-08-20  
**Customer**: American Family Insurance (AmFam)  
**Participants**: AmFam Digital Experience & Underwriting Team, Google CE / Engineering Pair  
**Project**: Digital Coverage Advisor MVP (Phase 1)  

---

## 1. Executive Summary & Context
* **Objective**: Transition the Digital Policy Advisor from concept to an internal sandbox MVP to reduce consumer confusion around coverage options in quote offers.
* **Underwriting Entities**: APEX Auto is underwritten by Midvale Indemnity Company; APEX Home is underwritten by Homesite Insurance (both AmFam companies).
* **Friction Points (from RUM data)**:
  1. Coverage limit confusion (P95 time on quote page = 27 minutes).
  2. Dead clicks on non-interactive coverage text and badges.
  3. Rate recalculation confusion when modifying deductibles/coverages.
  4. Payment option deliberation (Full Pay vs. 12 Monthly Installments).

---

## 2. Phase 1 MVP Scope (Strictly In-Scope)
* **User Interface**: Lightweight, chat-integrated conversational experience on the quote offers page offering both chat and voice interaction options.
* **Knowledge Base**: Curated FAQ library answering general knowledge-base questions on auto & home limits, deductibles, add-ons, and navigation (Level 1 & 2 confusion).
* **Response Generation**: Deterministic FAQ matching for compliance without requiring advanced AI Review Board (AIRB) overhead.
* **Behavioral Triggers**:
  * Dead clicks detection on static content.
  * Time on page (>30s dwell / hesitation).
  * Scroll depth triggers.
* **Human Escalation**: Seamless mock escalation paths (click-to-call modal, live agent chat handoff).
* **Mobile Optimization**: 49% of current traffic is mobile; responsive mobile-first UI required.

---

## 3. Phase 2 Deferrals (Out of Scope for Phase 1)
* Live telephony / SIP trunking integration.
* Live agent queue integration & active customer DB backend.
* Dynamic generative LLM rate calculations / complex rating engines.
* Policy document / deck page PDF uploads.
* Competitor coverage comparison.

---

## 4. Action Items & Next Steps
1. Ingest customer FAQ library into `faq.md` as source of truth.
2. Build redesigned AmFam digital homepage and interactive quote offers experience.
3. Implement Phase 1 Digital Coverage Advisor with voice/text, behavioral triggers, and deterministic FAQ engine.
4. Construct interactive Critical User Journey (CUJ) studio for executive & stakeholder review.
