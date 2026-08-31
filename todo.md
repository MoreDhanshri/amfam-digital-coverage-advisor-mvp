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



### Web Experience Merge & Real-Time Barge-In Voice Sprint (Conversation 4a23ebbd-0b61-40ed-90a5-d7ba918d4354)
- [x] Merge multi-view architecture from `AmFam Website Redesign CUJ`:
  - [x] View 1: 🏠 Homepage Redesign & Policy Finalization Interface (#AF-849204-TX / #AF-98421-WI, BI 100/300, $500 Ded, $380k Dwelling, $10k Water Backup, discounts, payment schedule, electronic binder)
  - [x] View 2: 🚗 APEX Quote Configurator & Live Rate Recalculator ($142/mo) with behavioral friction bench
  - [x] View 3: 🗺️ CUJ Interactive Studio (CUJ-001, CUJ-002, CUJ-003, CUJ-004, Persona cards, friction points, dialogue timeline, and "Run Simulation in Advisor" runner)
  - [x] View 4: 📚 Knowledge Base FAQ Directory with search and category filtering
  - [x] View 5: 📊 Real-User Monitoring (RUM) Telemetry Dashboard with live event stream
- [x] Implement responsive Viewport Switcher (Desktop, Tablet, Mobile 390px with device bezel & notch)
- [x] Implement 10-Second automated pop-in timer with glowing & jumping bubble animations
- [x] Enable real-time voice barge-in:
  - [x] User vocalization or mic click immediately cancels active TTS (`window.speechSynthesis.cancel()`)
  - [x] Added `bargeIn()` handler, `⚡ Interrupted!` visual badge (`#barge-in-toast`), and seamless transition back to listening mode
  - [x] Upgraded speech synthesis with high-grade natural female neural voices (`Microsoft Jenny Online (Natural)`, `Google US English`, `Samantha (Enhanced)`, etc.)
  - [x] Built insurance-fluent spoken text normalizer for natural cadence and pauses
- [x] Verified full end-to-end functionality on `http://dhanshrimore.c.googlers.com:8080`
- [x] Committed and synced repository changes

### Sprint: Deterministic Out-of-Scope Guardrail & OOTB Web Widget Deployment
- [x] **Phase 1: Ingest & Formalize Requirements**
  - [x] Ingest business & technical requirements from `faq.md`, `tdd.md`, and user prompt
  - [x] Lock canned response text: `"I am connecting you with a licensed American Family Insurance specialist right now to assist you with your specific request. You can also call 1-800-MYAMFAM (1-800-692-6326)."`
- [x] **Phase 2: Update Agent Instructions, Tools, and Callbacks**
  - [x] Update `agents/root_agent/instruction.txt` with strict out-of-scope routing to canned response
  - [x] Update `tools/escalate_to_agent/python_function/python_code.py` with standard canned response and `1-800-MYAMFAM (1-800-692-6326)`
  - [x] Update `tools/lookup_coverage_faq/python_function/python_code.py` to prevent false positive matches and return canned response on `not_found`
  - [x] Update `agents/root_agent/after_model_callbacks/after_model_callbacks_01/python_code.py` to enforce canned response guardrail on any escalation or non-FAQ query
- [x] **Phase 3: Author Out-of-Scope Evaluations & Update Baseline Suites**
  - [x] Author `evals/goldens/out_of_scope_queries.yaml` covering pet, life, commercial, claims, policy cancel, billing, and off-topic queries
  - [x] Update existing `bundling_and_general_faq.yaml` golden escalation turns to match new canned response
  - [x] Run `cxas lint` to guarantee 100% clean schema (0 errors, 0 warnings)
  - [x] Run pytest on tool tests and eval verification suites (12/12 passing)
- [x] **Phase 4: OOTB Web Widget Integration**
  - [x] Remove legacy custom chat panel and bubble from `src/index.html`
  - [x] Integrate Google's OOTB CES `<chat-messenger>` web component with `<chat-messenger-container>`
  - [x] Configure `chatSdk.registerContext` for CES deployment with token broker and fallback
  - [x] Update `src/app.js` and `server.py` to support OOTB widget lifecycle, event handling, and deterministic fallback with exact canned response
  - [x] Brand widget with AmFam colors (#002F6C, #D71920) and configure titlebar actions
- [x] **Phase 5: Verification & Walkthrough**
  - [x] Test in-scope FAQ queries (verify exact verbatim answers)
  - [x] Test out-of-scope queries (verify exact canned response)
  - [x] Verify web widget renders and functions properly
  - [x] Update documentation (`docs/decisions.md`, `docs/requirements.md`) and compile final walkthrough

### Sprint: Cloud Platform Deployment, Mandate Tool Call Hardening & 100% Platform Verification
- [x] **Gate 1: Cloud Credentials & Target Discovery**
  - [x] Verify active Altostrat Google Cloud CLI credentials (`admin@dhanshrimore.altostrat.com`)
  - [x] Identify deployed app resource on `gecx-amfam`: `projects/gecx-amfam/locations/us/apps/b8159ce5-24ba-4578-8547-b58995268856`
  - [x] Disprove prior worker's hypothesis of expired OAuth token
- [x] **Gate 2: Tool-Call Mandate & Callback Fail-Safe Hardening**
  - [x] Identify root cause of missed `escalate_to_agent` tool calls: missing out-of-scope triggers in `escalate_to_agent.json` and `<inline_example>` in `instruction.txt`
  - [x] Update `tools/escalate_to_agent/escalate_to_agent.json` description to explicitly handle all non-FAQ topics (pet, life, commercial, claims, cancellations, billing disputes, address updates, trivia)
  - [x] Update `instruction.txt` `<constraints>` and `<subtask name="Out_Of_Scope_And_Escalation">` to strictly forbid generating text before invoking `escalate_to_agent`
  - [x] Enhance `after_model_callback` to intercept direct escalation text and convert into `escalate_to_agent(reason="out_of_scope_query")`
  - [x] Add unit test in `tests/test_after_model_callback.py` and pass 13/13 pytest unit tests
- [x] **Gate 3: CXAS Platform Push & Versioning**
  - [x] Push local application with `cxas push --overwrite`
  - [x] Create immutable version: `projects/239085721772/locations/us/apps/b8159ce5-24ba-4578-8547-b58995268856/versions/a5cabb1e-8913-4722-8fe7-aebd7d57148e`
  - [x] Create real CES deployment on GCP: `projects/gecx-amfam/locations/us/apps/b8159ce5-24ba-4578-8547-b58995268856/deployments/amfam-faq-advisor-web-widget`
  - [x] Promote 100% traffic to version `a5cabb1e-8913-4722-8fe7-aebd7d57148e`
- [x] **Gate 4: Comprehensive Remote Evaluation Suite Execution**
  - [x] Push all 7 evaluation suites to platform: `auto_coverage_faq.yaml`, `home_coverage_faq.yaml`, `bundling_and_general_faq.yaml`, `diverse_phrasings_auto.yaml`, `diverse_phrasings_home.yaml`, `diverse_phrasings_bundling.yaml`, `out_of_scope_queries.yaml`
  - [x] Run remote out-of-scope evaluations (`cxas run --tags out-of-scope`): 10/10 PASS (100%)
  - [x] Run remote in-scope evaluations (`cxas run --tags P0 P1 P2`): 19/19 PASS (100%)
  - [x] Verify live HTTP proxy on `server.py` `/api/chat` against live CXAS backend (exact verbatim FAQ + exact canned escalation)

### Sprint: Web Widget Root-Cause Diagnosis, DOM Restoration & CDP Browser Automation
- [x] **Investigation & Root-Cause Analysis via Headless Chrome DevTools Protocol (CDP)**:
  - [x] Launched headless Chrome on `http://localhost:8080` via remote debugging port 9222
  - [x] Diagnosed why the chat widget was not opening: prior attempt replaced the widget DOM with `<chat-messenger>`, but Google's CDN script registers `<df-messenger>` and `<df-messenger-chat-bubble>` rather than `<chat-messenger>`
  - [x] Identified that the floating launcher button `#chat-bubble-button` and `#advisor-chat-panel` were deleted, making the widget invisible and unclickable
- [x] **Frontend Widget DOM & Interaction Restoration**:
  - [x] Restored `#chat-bubble-container`, `#advisor-chat-panel`, and `#chat-bubble-button` in `src/index.html` with explicit AmFam branding and live Google CES badge
  - [x] Updated `src/app.js` `startBubbleCountdown` and `toggleAdvisor` to keep launcher bubble visible (`flex`) from initial load and guarantee smooth open/focus transitions
  - [x] Verified full integration with backend proxy `/api/chat` calling live Google Cloud CES agent (`amfam-faq-advisor`)
- [x] **Deep End-to-End Verification with Browser Automation**:
  - [x] Verified initial DOM state: launcher button visible with glowing/jumping animation
  - [x] Verified click event opens `#advisor-chat-panel` (`display: flex`)
  - [x] Verified in-scope FAQ query ("What is Bodily Injury liability coverage?"): returns 100% exact verbatim text with dynamic follow-up suggestion chips
  - [x] Verified out-of-scope query ("Can I buy pet health insurance for my cat?"): returns 100% exact canned escalation response
  - [x] Captured UI screenshot (`chat_widget_verified.png`) verifying layout and styling

### Sprint: CES Portal Deployment Reconfiguration & Identity Alignment
- [x] **Deployments Reconfiguration via SCRAPI**:
  - [x] Updated deployment `amfam-faq-advisor-web-widget` to `channelType: WEB_UI`, `modality: CHAT_AND_VOICE`, and `webWidgetTitle: "AmFam FAQ Advisor"`
  - [x] Verified deployment is active on Google Cloud CES serving app `projects/gecx-amfam/locations/us/apps/b8159ce5-24ba-4578-8547-b58995268856`
- [x] **Website UI & Identity Alignment**:
  - [x] Aligned top bar, navbar, and chat widget header to `AmFam FAQ Advisor`
  - [x] Added direct link to the CES portal (`https://ces.cloud.google.com/projects/gecx-amfam/locations/us/apps/b8159ce5-24ba-4578-8547-b58995268856`)
  - [x] Updated initial session greeting in `src/app.js` to `American Family Insurance FAQ Advisor`
  - [x] Restarted `server.py` daemon with updated deployment and portal metadata
- [x] **End-to-End Browser CDP Verification**:
  - [x] Tested "Who are you?" query against live CES agent: returns official AI assistant intro from `b8159ce5-24ba-4578-8547-b58995268856`
  - [x] Tested in-scope FAQ query ("What is Bodily Injury liability coverage?"): returns 100% exact verbatim text with voice readout
  - [x] Captured UI screenshot `amfam_faq_advisor_live.png`

### Sprint: Official Google CES OOTB Web Widget Deployment (`feature/amfam-ootb-widget`)
- [x] **Branch Creation & Skill Ingestion**:
  - [x] Created new feature branch `feature/amfam-ootb-widget`
  - [x] Ingested and applied `/cxas-ootb-widget` skill guidelines (Pierce Points 1–6)
- [x] **Token Broker & Backend Setup (`server.py`)**:
  - [x] Implemented `/api/token` endpoint minting short-lived Google access tokens with CORS support
  - [x] Verified token issuance for deployment `projects/gecx-amfam/locations/us/apps/b8159ce5-24ba-4578-8547-b58995268856/deployments/amfam-faq-advisor-web-widget`
- [x] **Frontend Tier 1 CSS Custom Properties Branding (`src/styles.css`)**:
  - [x] Themed `<chat-messenger>` with AmFam navy `#002F6C`, red `#D71920`, light container `#E8F0FE`, and slate typography
- [x] **Frontend Web Component Integration (`src/index.html` & `src/app.js`)**:
  - [x] Embedded official `<chat-messenger>` with `<chat-messenger-container chat-title="AmFam FAQ Advisor" enable-audio-input enable-file-upload>`
  - [x] Projected action buttons into `slot="titlebar-actions"` (`<chat-reset-session-button>`, `<chat-toggle-dialog-button>`, `<chat-messenger-close-button>`)
  - [x] Hooked `chat-messenger-loaded` to register CES context with Token Broker `/api/token`
  - [x] Integrated Pierce Point 5 methods (`open()`, `close()`, `sendQuery()`, `setVariables()`, `startNewSession()`)
- [x] **Live Verification**:
  - [x] Verified 200 responses on `/api/token`, `/api/status`, and static assets
  - [x] Connected directly to Google CES native streaming audio pipe with natural voice & server-side VAD barge-in
