/**
 * American Family Insurance — Digital Coverage Advisor Unified Application Engine
 *
 * Google Customer Engagement Suite (CES) Fast OOTB Chat Messenger Integration:
 * - App: projects/gecx-amfam/locations/us/apps/b8159ce5-24ba-4578-8547-b58995268856
 * - Deployment: projects/gecx-amfam/locations/us/apps/b8159ce5-24ba-4578-8547-b58995268856/deployments/amfam-faq-advisor-web-widget
 * - Native Voice Modality: CHAT_AND_VOICE with Streaming WebSocket Audio & Server-Side VAD Barge-In
 * - Authentication: Google-Hosted / Token Broker (/api/token)
 * - Multi-View Architecture: 🏠 Homepage, 🚗 APEX Quote Config, 🗺️ CUJ Studio, 📚 FAQ Library, 📊 Telemetry
 * - Viewport Switcher: Desktop, Tablet, Mobile (390px)
 * - 10-Second Automated Countdown Pop-In Timer
 */

const DEPLOYMENT_NAME = "projects/gecx-amfam/locations/us/apps/b8159ce5-24ba-4578-8547-b58995268856/deployments/amfam-faq-advisor-web-widget";

// Global Application State
const state = {
  currentView: "home",
  viewport: "desktop",

  session: {
    id: "SES-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
    startTime: new Date().toLocaleTimeString(),
    dwellSeconds: 0,
    deadClickCount: 0,
    advisorTriggerCount: 0,
    faqsAskedCount: 0,
    rateCalcCount: 0,
    events: []
  },

  // 10-Second Automated Trigger
  bubble: {
    isPopulated: false,
    isOpen: false,
    countdownSeconds: 10,
    timerId: null
  },

  // Quote Configurator Model
  quote: {
    ref: "#AF-98421-WI",
    customer: "Sarah Jenkins",
    location: "1428 Elm Ridge Ct, Madison, WI 53711",
    auto: {
      vehicle: "2024 Honda CR-V Hybrid EX-L",
      bodilyInjury: "100/300",
      propertyDamage: 100000,
      collisionDeductible: 500,
      comprehensiveDeductible: 500,
      gapCoverage: true,
      oemParts: false,
      roadside: true
    },
    home: {
      type: "Single Family Home (HO-3)",
      dwellingA: 380000,
      extendedReplacement: "25%",
      waterBackup: 10000,
      aopDeductible: 1000,
      windHailDeductible: 3800
    },
    billing: {
      dirty: false,
      baseMonthly: 142.00,
      calculatedMonthly: 142.00,
      annualTotal: 1704.00,
      bundleDiscount: 297.00
    }
  },

  // CUJ Studio State
  cuj: {
    activeId: "CUJ-001",
    list: []
  },

  // FAQ Directory
  faqs: [],
  currentFaqFilter: "all"
};

// =========================================================================
// GOOGLE CES OOTB CHAT-MESSENGER CONTEXT & LIFECYCLE (PIERCE POINTS 4 & 5)
// =========================================================================

let cesSdkReady = false;

window.addEventListener("chat-messenger-loaded", () => {
  cesSdkReady = true;
  console.log("🚀 CES OOTB Chat Messenger SDK Loaded — Registering Context with Token Broker...");

  try {
    if (window.chatSdk && typeof window.chatSdk.registerContext === "function") {
      window.chatSdk.registerContext(
        window.chatSdk.prebuilts.ces.createContext({
          deploymentName: DEPLOYMENT_NAME,
          tokenBroker: {
            enableTokenBroker: true,
            enableRecaptcha: false,
            tokenBrokerUrl: "/api/token",
          },
        })
      );
      console.log("✅ Context registered successfully for deployment:", DEPLOYMENT_NAME);
      logTelemetryEvent("ces_widget_registered", { deploymentName: DEPLOYMENT_NAME });
    }
  } catch (err) {
    console.error("Error registering CES OOTB context:", err);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const widget = document.querySelector("chat-messenger");
  if (widget) {
    widget.addEventListener("chat-messenger-close", () => {
      console.log("CES Chat Messenger Drawer Closed");
      state.bubble.isOpen = false;
      updateCountdownDisplay();
      logTelemetryEvent("ces_widget_closed", {});
    });

    widget.addEventListener("chat-messenger-error", (e) => {
      console.error("CES Chat Messenger Error event:", e.detail);
      logTelemetryEvent("ces_widget_error", { error: e.detail });
    });
  }
});

function getWidget() {
  return document.querySelector("chat-messenger");
}

function openAdvisorWidget() {
  const widget = getWidget();
  if (widget) {
    state.bubble.isOpen = true;
    updateCountdownDisplay();
    if (typeof widget.open === "function") {
      widget.open();
    }
    syncQuoteContextToAdvisor();
    logTelemetryEvent("ces_widget_opened", {});
  }
}

function closeAdvisorWidget() {
  const widget = getWidget();
  if (widget) {
    state.bubble.isOpen = false;
    updateCountdownDisplay();
    if (typeof widget.close === "function") {
      widget.close();
    }
  }
}

function toggleAdvisor(forceOpen = null) {
  if (forceOpen === true) {
    openAdvisorWidget();
  } else if (forceOpen === false) {
    closeAdvisorWidget();
  } else {
    if (state.bubble.isOpen) {
      closeAdvisorWidget();
    } else {
      openAdvisorWidget();
    }
  }
}

function handleUserPrompt(promptText) {
  if (!promptText || !promptText.trim()) return;
  const clean = promptText.trim();
  openAdvisorWidget();

  const widget = getWidget();
  if (widget) {
    if (typeof widget.sendQuery === "function") {
      widget.sendQuery(clean);
    } else if (typeof widget.renderCustomText === "function") {
      widget.renderCustomText(clean, true);
    }
  }
  state.session.faqsAskedCount++;
  logTelemetryEvent("user_query_submitted", { query: clean });
}

function resetSession() {
  const widget = getWidget();
  if (widget && typeof widget.startNewSession === "function") {
    widget.startNewSession();
  }
  state.session.id = "SES-" + Math.random().toString(36).substring(2, 9).toUpperCase();
  logTelemetryEvent("session_reset", { newSessionId: state.session.id });
}

function syncQuoteContextToAdvisor() {
  const widget = getWidget();
  if (widget && typeof widget.setVariables === "function") {
    try {
      widget.setVariables({
        quote_ref: state.quote.ref,
        customer_name: state.quote.customer,
        customer_location: state.quote.location,
        monthly_premium: `$${state.quote.billing.calculatedMonthly.toFixed(2)}/mo`,
        auto_vehicle: state.quote.auto.vehicle,
        bodily_injury_limits: state.quote.auto.bodilyInjury,
        collision_deductible: `$${state.quote.auto.collisionDeductible}`,
        comprehensive_deductible: `$${state.quote.auto.comprehensiveDeductible}`,
        home_dwelling_a: `$${state.quote.home.dwellingA.toLocaleString()}`,
        water_backup_limit: `$${state.quote.home.waterBackup.toLocaleString()}`,
      });
      console.log("Attached quote context variables to CES OOTB widget");
    } catch (e) {
      console.warn("Could not set CES variables:", e);
    }
  }
}

// =========================================================================
// 10-SECOND AUTOMATED COUNTDOWN & CHAT BUBBLE TRIGGER
// =========================================================================

function startBubbleCountdown() {
  state.bubble.countdownSeconds = 10;
  state.bubble.isPopulated = false;
  state.bubble.isOpen = false;
  updateCountdownDisplay();

  if (state.bubble.timerId) clearInterval(state.bubble.timerId);

  state.bubble.timerId = setInterval(() => {
    state.bubble.countdownSeconds--;
    updateCountdownDisplay();

    if (state.bubble.countdownSeconds <= 0) {
      clearInterval(state.bubble.timerId);
      populateChatBubble();
    }
  }, 1000);
}

function updateCountdownDisplay() {
  const cdEl = document.getElementById("bubble-timer-badge");
  if (cdEl) {
    if (state.bubble.isOpen) {
      cdEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> <span>Advisor Open</span>`;
      cdEl.className = "bg-emerald-900/80 text-emerald-200 border border-emerald-700 px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-sm";
    } else if (state.bubble.countdownSeconds <= 0) {
      cdEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> <span>Advisor Ready</span>`;
      cdEl.className = "bg-emerald-900/80 text-emerald-200 border border-emerald-700 px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-sm";
    } else {
      cdEl.innerHTML = `⏱️ Auto-Open in <strong>${state.bubble.countdownSeconds}s</strong>`;
      cdEl.className = "bg-red-900/80 text-red-200 border border-red-700 px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-sm animate-pulse";
    }
  }
}

function populateChatBubble() {
  state.bubble.isPopulated = true;
  updateCountdownDisplay();
  openAdvisorWidget();
  playSoftChime();
  logTelemetryEvent("chat_bubble_populated", { trigger: "10s_timer_or_action" });
}

function resetBubbleTimer() {
  closeAdvisorWidget();
  startBubbleCountdown();
}

function playSoftChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
    gain1.gain.setValueAtTime(0.08, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(987.77, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0.09, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.6);
  } catch (e) {}
}

// =========================================================================
// MULTI-VIEW NAVIGATION & ROUTING
// =========================================================================

function setView(viewName) {
  state.currentView = viewName;
  const views = ["home", "quote", "cuj", "faqs", "telemetry"];
  
  views.forEach(v => {
    const el = document.getElementById(`view-${v}`);
    if (el) {
      if (v === viewName) {
        el.classList.remove("hidden");
      } else {
        el.classList.add("hidden");
      }
    }
  });

  // Update Desktop Nav Button Styles
  views.forEach(v => {
    const btn = document.getElementById(`nav-btn-${v}`);
    if (btn) {
      if (v === viewName) {
        btn.className = "nav-tab-btn px-3 py-2 rounded-xl transition bg-[#002F6C] text-white font-bold";
      } else {
        btn.className = "nav-tab-btn px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition font-semibold";
      }
    }
  });

  // Update Mobile Nav Button Styles
  views.forEach(v => {
    const mBtn = document.getElementById(`mob-nav-${v}`);
    if (mBtn) {
      if (v === viewName) {
        mBtn.className = "px-2.5 py-1.5 rounded-lg font-bold bg-[#002F6C] text-white whitespace-nowrap";
      } else {
        mBtn.className = "px-2.5 py-1.5 rounded-lg font-semibold text-slate-600 whitespace-nowrap";
      }
    }
  });

  // View-specific initializations
  if (viewName === "cuj") renderCUJStudio();
  if (viewName === "faqs") renderFAQDirectory();
  if (viewName === "telemetry") renderTelemetryUI();

  window.scrollTo({ top: 0, behavior: "smooth" });
  logTelemetryEvent("view_switched", { viewName });
}

// =========================================================================
// VIEWPORT SWITCHER (DESKTOP / TABLET / MOBILE 390px)
// =========================================================================

function setViewport(mode) {
  state.viewport = mode;
  const wrapper = document.getElementById("app-viewport-wrapper");
  const notch = document.getElementById("mobile-notch-el");

  const btnDesktop = document.getElementById("vp-btn-desktop");
  const btnTablet = document.getElementById("vp-btn-tablet");
  const btnMobile = document.getElementById("vp-btn-mobile");

  // Reset classes
  if (btnDesktop) btnDesktop.className = "px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-300 hover:text-white transition flex items-center gap-1";
  if (btnTablet) btnTablet.className = "px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-300 hover:text-white transition flex items-center gap-1";
  if (btnMobile) btnMobile.className = "px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-300 hover:text-white transition flex items-center gap-1";

  if (wrapper) {
    wrapper.classList.remove("viewport-mobile-frame", "viewport-tablet-frame");
  }
  if (notch) notch.classList.add("hidden");

  if (mode === "desktop") {
    if (btnDesktop) btnDesktop.className = "px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-600 text-white transition flex items-center gap-1";
  } else if (mode === "tablet") {
    if (btnTablet) btnTablet.className = "px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-600 text-white transition flex items-center gap-1";
    if (wrapper) wrapper.classList.add("viewport-tablet-frame");
  } else if (mode === "mobile") {
    if (btnMobile) btnMobile.className = "px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-600 text-white transition flex items-center gap-1";
    if (wrapper) wrapper.classList.add("viewport-mobile-frame");
    if (notch) notch.classList.remove("hidden");
  }

  logTelemetryEvent("viewport_changed", { mode });
}

// =========================================================================
// QUOTE CONFIGURATOR & RATE RECALCULATOR (VIEW 2)
// =========================================================================

function updateQuoteConfig(key, value) {
  state.quote.billing.dirty = true;

  if (key === "bodilyInjury") state.quote.auto.bodilyInjury = value;
  if (key === "collisionDeductible") state.quote.auto.collisionDeductible = parseInt(value);
  if (key === "dwellingA") state.quote.home.dwellingA = parseInt(value);
  if (key === "waterBackup") state.quote.home.waterBackup = parseInt(value);

  // Recalculate local estimated rate
  let monthly = 142.00;
  if (state.quote.auto.bodilyInjury === "250/500") monthly += 18.50;
  if (state.quote.auto.bodilyInjury === "50/100") monthly -= 9.00;
  if (state.quote.auto.collisionDeductible === 250) monthly += 14.00;
  if (state.quote.auto.collisionDeductible === 1000) monthly -= 12.00;
  if (state.quote.home.waterBackup === 25000) monthly += 7.20;

  state.quote.billing.calculatedMonthly = monthly;
  state.quote.billing.annualTotal = monthly * 12;

  renderQuoteSummaryUI();
  syncQuoteContextToAdvisor();
}

function calculateNewRate() {
  state.quote.billing.dirty = false;
  state.session.rateCalcCount++;
  renderQuoteSummaryUI();
  
  const notif = document.getElementById("rate-calc-toast");
  if (notif) {
    notif.classList.remove("hidden");
    setTimeout(() => notif.classList.add("hidden"), 3000);
  }

  logTelemetryEvent("rate_recalculated", {
    monthly: state.quote.billing.calculatedMonthly,
    annual: state.quote.billing.annualTotal
  });
}

function renderQuoteSummaryUI() {
  const mEl = document.getElementById("quote-monthly-price");
  const aEl = document.getElementById("quote-annual-price");
  const dirtyBadge = document.getElementById("quote-dirty-badge");

  if (mEl) mEl.innerText = `$${state.quote.billing.calculatedMonthly.toFixed(2)}`;
  if (aEl) aEl.innerText = `$${state.quote.billing.annualTotal.toFixed(2)}`;

  if (dirtyBadge) {
    if (state.quote.billing.dirty) {
      dirtyBadge.classList.remove("hidden");
    } else {
      dirtyBadge.classList.add("hidden");
    }
  }
}

// =========================================================================
// CUJ INTERACTIVE STUDIO (VIEW 3)
// =========================================================================

function renderCUJStudio() {
  const container = document.getElementById("cuj-studio-content");
  if (!container || !state.cuj.list || state.cuj.list.length === 0) return;

  const currentCuj = state.cuj.list.find(c => c.id === state.cuj.activeId) || state.cuj.list[0];

  container.innerHTML = `
    <div class="space-y-6">
      <!-- CUJ SELECTOR TABS -->
      <div class="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        ${state.cuj.list.map(c => `
          <button onclick="selectCUJ('${c.id}')" class="px-4 py-2 rounded-xl text-xs font-bold transition ${c.id === currentCuj.id ? "bg-[#002F6C] text-white shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}">
            ${c.id}: ${c.title}
          </button>
        `).join("")}
      </div>

      <!-- SELECTED CUJ CARD -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">${currentCuj.stage || "Critical User Journey"}</span>
            <h3 class="text-xl sm:text-2xl font-black text-[#002F6C] mt-2">${currentCuj.id}: ${currentCuj.title}</h3>
            <p class="text-xs sm:text-sm text-slate-600 mt-1">${currentCuj.description || ""}</p>
          </div>
          <button onclick="runCUJSimulation('${currentCuj.id}')" class="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-3 rounded-2xl text-xs shadow-md transition flex items-center gap-2 shrink-0">
            <span>▶️ Run Simulation in Advisor</span>
          </button>
        </div>

        <!-- PERSONA & FRICTION GRID -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <h4 class="font-bold text-[#002F6C] flex items-center gap-1.5">
              <span>👤 Persona &amp; Baseline Profile</span>
            </h4>
            <p class="text-slate-600 leading-relaxed">${currentCuj.persona || "Target User"}</p>
          </div>
          <div class="bg-red-50/50 border border-red-200 rounded-2xl p-4 space-y-2">
            <h4 class="font-bold text-red-900 flex items-center gap-1.5">
              <span>⚠️ Core Friction / Drop-Off Risk</span>
            </h4>
            <p class="text-slate-700 leading-relaxed">${currentCuj.friction || "Uncertainty regarding coverage definitions and trade-offs."}</p>
          </div>
        </div>

        <!-- DIALOGUE TRANSCRIPT -->
        <div class="space-y-3">
          <h4 class="font-bold text-slate-900 text-xs sm:text-sm">💬 Verified Conversation Steps:</h4>
          <div class="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-3 font-mono text-xs">
            ${(currentCuj.transcript || []).map((step, idx) => `
              <div class="p-3 rounded-xl ${step.type === "user" ? "bg-blue-50 border border-blue-200 text-blue-950 ml-6" : "bg-white border border-slate-200 text-slate-800 mr-6"}">
                <span class="font-bold text-[10px] uppercase tracking-wider block mb-1 ${step.type === "user" ? "text-blue-700" : "text-emerald-700"}">
                  Turn ${idx + 1}: ${step.type === "user" ? "👤 Customer" : "🤖 AmFam Advisor (Verbatim)"}
                </span>
                <p class="leading-relaxed font-sans text-xs">${step.text}</p>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}

function selectCUJ(cujId) {
  state.cuj.activeId = cujId;
  renderCUJStudio();
}

function runCUJSimulation(cujId) {
  const cuj = state.cuj.list.find(c => c.id === cujId);
  if (!cuj || !cuj.transcript) return;

  openAdvisorWidget();
  const firstUserStep = cuj.transcript.find(s => s.type === "user");
  if (firstUserStep) {
    handleUserPrompt(firstUserStep.text);
  }
}

// =========================================================================
// FAQ KNOWLEDGE DIRECTORY (VIEW 4)
// =========================================================================

function renderFAQDirectory() {
  renderFAQsUI(state.currentFaqFilter);
}

function renderFAQsUI(filter = "all", searchQuery = "") {
  state.currentFaqFilter = filter;
  const grid = document.getElementById("faq-cards-grid");
  if (!grid || !state.faqs) return;

  let filtered = state.faqs;

  if (filter !== "all") {
    filtered = filtered.filter(f => (f.category || "").toLowerCase().includes(filter.toLowerCase()));
  }

  if (searchQuery && searchQuery.trim()) {
    const clean = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(f => 
      f.question.toLowerCase().includes(clean) || 
      f.answer.toLowerCase().includes(clean) ||
      (f.category && f.category.toLowerCase().includes(clean))
    );
  }

  grid.innerHTML = filtered.map(faq => `
    <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition space-y-2.5">
      <div class="flex justify-between items-start gap-2">
        <span class="text-[10px] font-bold uppercase text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-full">${faq.category || "General"}</span>
        <button onclick="handleUserPrompt('${faq.question.replace(/'/g, "\\\'")}');" class="text-blue-600 hover:text-blue-800 text-[11px] font-bold shrink-0">
          Ask Advisor ↗
        </button>
      </div>
      <h4 class="font-bold text-slate-900 text-xs">${faq.question}</h4>
      <p class="text-[11px] text-slate-600 leading-relaxed">${faq.answer}</p>
    </div>
  `).join("") || `<div class="col-span-2 text-center text-slate-400 p-8">No matching FAQs found.</div>`;
}

function filterFAQList(query) {
  renderFAQsUI(state.currentFaqFilter, query);
}

function filterFAQCategory(category) {
  renderFAQsUI(category);
}

function explainCoverage(term) {
  handleUserPrompt(term);
}

// =========================================================================
// REAL-USER MONITORING (RUM) TELEMETRY (VIEW 5)
// =========================================================================

function logTelemetryEvent(eventType, payload = {}) {
  const event = {
    id: "EVT-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    type: eventType,
    time: new Date().toLocaleTimeString(),
    payload: payload
  };
  state.session.events.unshift(event);
  if (state.session.events.length > 50) state.session.events.pop();

  if (state.currentView === "telemetry") {
    renderTelemetryUI();
  }
}

function renderTelemetryUI() {
  const logContainer = document.getElementById("telemetry-event-log");
  const sidEl = document.getElementById("telemetry-session-id");
  const timeEl = document.getElementById("telemetry-dwell-time");
  const countEl = document.getElementById("telemetry-faq-count");
  const dcEl = document.getElementById("telemetry-dead-clicks");

  if (sidEl) sidEl.innerText = state.session.id;
  if (timeEl) timeEl.innerText = `${state.session.dwellSeconds}s`;
  if (countEl) countEl.innerText = state.session.faqsAskedCount;
  if (dcEl) dcEl.innerText = state.session.deadClickCount;

  if (logContainer) {
    logContainer.innerHTML = state.session.events.map(ev => `
      <div class="flex items-center justify-between p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-[11px] font-mono">
        <div class="flex items-center gap-2">
          <span class="text-emerald-400 font-bold">${ev.type}</span>
          <span class="text-slate-400">${JSON.stringify(ev.payload)}</span>
        </div>
        <span class="text-slate-500">${ev.time}</span>
      </div>
    `).join("") || `<div class="text-slate-500 text-center p-4">No events logged yet.</div>`;
  }
}

// Dwell timer ticker
setInterval(() => {
  state.session.dwellSeconds++;
  if (state.currentView === "telemetry") {
    const timeEl = document.getElementById("telemetry-dwell-time");
    if (timeEl) timeEl.innerText = `${state.session.dwellSeconds}s`;
  }
}, 1000);

// =========================================================================
// ESCALATION MODAL HANDLERS
// =========================================================================

function openClickToCallModal() {
  const modal = document.getElementById("click-to-call-modal");
  if (modal) modal.classList.remove("hidden");
  logTelemetryEvent("escalation_click_to_call_opened", {});
}

function closeClickToCallModal() {
  const modal = document.getElementById("click-to-call-modal");
  if (modal) modal.classList.add("hidden");
}

function openScheduleCallbackModal() {
  const modal = document.getElementById("schedule-callback-modal");
  if (modal) modal.classList.remove("hidden");
  logTelemetryEvent("escalation_schedule_callback_opened", {});
}

function closeScheduleCallbackModal() {
  const modal = document.getElementById("schedule-callback-modal");
  if (modal) modal.classList.add("hidden");
}

function submitCallbackRequest() {
  const name = document.getElementById("cb-name")?.value || "Customer";
  const phone = document.getElementById("cb-phone")?.value || "Phone";
  const time = document.getElementById("cb-time")?.value || "Afternoon";

  closeScheduleCallbackModal();
  alert(`✅ Callback Scheduled!\n\nThank you, ${name}. A licensed American Family Insurance specialist will call you at ${phone} during the ${time} window with your quote (#AF-98421-WI) prepared.`);
  logTelemetryEvent("callback_request_submitted", { name, phone, time });
}

// =========================================================================
// POLICY BINDING MODAL HANDLERS
// =========================================================================

function confirmAndBindPolicy() {
  const nameInp = document.getElementById("sig-name-input");
  const agreeCheck = document.getElementById("sig-agree-check");
  
  if (agreeCheck && !agreeCheck.checked) {
    alert("Please check the declaration box agreeing to the Terms of Service & Electronic Delivery before binding.");
    return;
  }

  const signerName = nameInp ? nameInp.value : "Jane M. Doe";
  const modal = document.getElementById("bind-success-modal");
  const modalSigner = document.getElementById("bind-modal-signer");

  if (modalSigner) modalSigner.innerText = signerName;
  if (modal) modal.classList.remove("hidden");

  logTelemetryEvent("policy_bound_success", { signerName });
}

function closeBindModal() {
  const modal = document.getElementById("bind-success-modal");
  if (modal) modal.classList.add("hidden");
}

// =========================================================================
// APPLICATION INITIALIZATION
// =========================================================================

async function init() {
  try {
    const res = await fetch("data/faqs.json");
    state.faqs = await res.json();
  } catch (e) {
    console.log("Loaded fallback inline FAQs");
  }

  try {
    const resCuj = await fetch("data/cujs.json");
    state.cuj.list = await resCuj.json();
  } catch (e) {
    console.log("Loaded fallback CUJs");
  }

  startBubbleCountdown();
}

window.addEventListener("DOMContentLoaded", init);
