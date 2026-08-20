# System Architecture & Agent Topology

## Customer: amfam
- **Platform**: GECX / CX Agent Studio / Digital Coverage Advisor MVP
- **Architecture Pattern**: Hybrid Deterministic Knowledge Engine + Proactive Behavioral Listener + Voice & Chat Multi-Modal Frontend
- **Target GCP Project**: `gecx-dm-demo`
- **Target Region/Location**: `us`
- **Underwriting Companies**:
  - APEX Auto: Midvale Indemnity Company (American Family Insurance)
  - APEX Home: Homesite Insurance (American Family Insurance)

## System Components
1. **Redesigned AmFam Web Portal**: Modernized digital brand experience highlighting "Insure carefully, dream fearlessly", bundle savings, quick quote starter, and product exploration.
2. **APEX Quote Offers Page**: Realistic auto & home quote configuration with Bodily Injury (100/300), Comprehensive/Collision deductibles ($250/$500/$1,000), Water Backup, Extended Replacement Cost, and live rate recalculation.
3. **Digital Coverage Advisor (Phase 1 MVP)**:
   - **Chat & Voice Assistant**: Lightweight floating widget with Web Speech TTS, voice recognition, and suggestion chips.
   - **Behavioral Triggers Engine**:
     - *Dead Click Listener*: Captures multiple clicks on static elements and displays helpful guidance.
     - *Time on Page Monitor*: Identifies dwell times > 30 seconds and offers proactive advice.
     - *Scroll Depth Observer*: Contextual tips triggered by section entry.
   - **Deterministic FAQ Knowledge Base**: Complete structured coverage of all 40+ APEX Auto and APEX Home FAQs.
   - **Escalation Module**: Simulated click-to-call modal (1-800-MY-AMFAM) and live agent transfer payload.
4. **CUJ Interactive Studio**: Turn-by-turn interactive simulation of high-friction customer journeys with live sandbox replay.
5. **Real-User Monitoring (RUM) Telemetry Panel**: Live metric tracking for dead clicks, deflection rate, P95 resolution times, and conversion lift.
