/**
 * American Family Insurance - Digital Coverage Advisor Platform
 * Phase 1 MVP Interactive Application Engine
 */

// Application State
const state = {
  currentView: 'home', // 'home', 'quote', 'cuj', 'faqs', 'telemetry'
  viewportMode: 'desktop', // 'desktop', 'mobile', 'tablet'
  
  // Policy Quote Model (Sarah Jenkins - Madison, WI)
  quote: {
    id: "AF-98421-WI",
    customer: "Sarah Jenkins",
    location: "Madison, WI 53711",
    auto: {
      vehicle: "2024 Honda CR-V Hybrid EX-L",
      bodilyInjury: "100/300", // $100k / $300k
      propertyDamage: "$100,000",
      comprehensiveDeductible: 500,
      collisionDeductible: 500,
      uninsuredMotorist: "100/300",
      roadside: true,
      rentalReimbursement: true,
      gapCoverage: true,
      oemParts: false,
      newCarReplacement: true
    },
    home: {
      property: "2,400 sq ft Single Family Home (Built 2018)",
      dwellingA: 380000,
      otherStructuresB: 38000,
      personalPropertyC: 190000,
      lossOfUseD: 150000,
      personalLiabilityE: 300000,
      aopDeductible: 1000,
      windHailDeductible: "1%",
      extendedReplacement: "25%",
      waterBackup: 10000,
      equipmentBreakdown: true
    },
    billing: {
      paymentPlan: "monthly", // 'monthly' ($142/mo) or 'full' ($1,580/yr)
      baseMonthlyRate: 142,
      currentMonthlyRate: 142,
      dirty: false
    }
  },

  // Behavioral & Telemetry Tracking
  telemetry: {
    dwellSeconds: 0,
    deadClicksCount: 0,
    advisorTriggerCount: 0,
    faqQuestionsAsked: 0,
    rateRecalculations: 0,
    escalationTriggered: false,
    eventLog: []
  },

  // Chat & Advisor
  advisor: {
    isOpen: false,
    isVoiceMode: false,
    isSpeaking: false,
    isListening: false,
    messages: [],
    proactiveTrigger: null
  },

  // CUJ Studio State
  cuj: {
    activeCujId: "CUJ-001",
    activeStepIndex: 0,
    isPlaying: false
  },

  // Knowledge Base Data
  faqs: [],
  cujs: []
};

// Rate Calculation Matrix (Deterministic Formula for Sandbox)
function calculateRate() {
  let autoBase = 84;
  let homeBase = 72;

  // Auto Bodily Injury
  if (state.quote.auto.bodilyInjury === '50/100') autoBase -= 8;
  if (state.quote.auto.bodilyInjury === '250/500') autoBase += 12;

  // Auto Collision Deductible
  if (state.quote.auto.collisionDeductible === 250) autoBase += 16;
  if (state.quote.auto.collisionDeductible === 1000) autoBase -= 14;

  // Auto Comprehensive Deductible
  if (state.quote.auto.comprehensiveDeductible === 250) autoBase += 7;
  if (state.quote.auto.comprehensiveDeductible === 1000) autoBase -= 8;

  // Auto Add-ons
  if (!state.quote.auto.gapCoverage) autoBase -= 5;
  if (state.quote.auto.oemParts) autoBase += 6;
  if (!state.quote.auto.rentalReimbursement) autoBase -= 4;
  if (!state.quote.auto.roadside) autoBase -= 3;
  if (!state.quote.auto.newCarReplacement) autoBase -= 4;

  // Home AOP Deductible
  if (state.quote.home.aopDeductible === 2500) homeBase -= 9;
  if (state.quote.home.aopDeductible === 500) homeBase += 11;

  // Home Add-ons
  if (state.quote.home.extendedReplacement === '50%') homeBase += 5;
  if (state.quote.home.waterBackup === 25000) homeBase += 4;
  if (state.quote.home.waterBackup === 0) homeBase -= 6;
  if (!state.quote.home.equipmentBreakdown) homeBase -= 3;

  // Multi-policy discount (-29%)
  const total = Math.round(autoBase + homeBase);
  return total;
}

// Format Phone / Spoken Voice Normalizer
function normalizeTextForVoice(text) {
  let normalized = text;
  normalized = normalized.replace(/\$([0-9,]+)/g, (match, p1) => {
    const num = parseInt(p1.replace(/,/g, ''), 10);
    return num.toLocaleString() + " dollars";
  });
  normalized = normalized.replace(/100\/300/g, "one hundred over three hundred thousand");
  normalized = normalized.replace(/50\/100/g, "fifty over one hundred thousand");
  normalized = normalized.replace(/250\/500/g, "two hundred fifty over five hundred thousand");
  normalized = normalized.replace(/1-800-692-6326/g, "one eight hundred, six nine two, six three two six");
  normalized = normalized.replace(/1-800-MY-AMFAM/g, "one eight hundred, my am fam");
  return normalized;
}

// Speech Synthesis
function speakText(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  
  const cleanSpoken = normalizeTextForVoice(text);
  const utterance = new SpeechSynthesisUtterance(cleanSpoken);
  utterance.rate = 1.05;
  utterance.pitch = 1.0;
  
  // Set voice to clean natural English if available
  const voices = window.speechSynthesis.getVoices();
  const naturalVoice = voices.find(v => (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('en-US')));
  if (naturalVoice) utterance.voice = naturalVoice;

  state.advisor.isSpeaking = true;
  updateVoiceUI();

  utterance.onend = () => {
    state.advisor.isSpeaking = false;
    updateVoiceUI();
  };
  utterance.onerror = () => {
    state.advisor.isSpeaking = false;
    updateVoiceUI();
  };

  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  state.advisor.isSpeaking = false;
  updateVoiceUI();
}

function updateVoiceUI() {
  const waveBars = document.querySelectorAll('.voice-wave-container');
  waveBars.forEach(el => {
    if (state.advisor.isSpeaking) {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });
}

// Deterministic FAQ Intent Matcher
function findBestFAQMatch(query) {
  if (!query || !state.faqs || state.faqs.length === 0) return null;
  const cleanQuery = query.toLowerCase().trim();
  
  // Direct keyword scoring
  const queryTokens = cleanQuery.split(/\s+/).filter(t => t.length > 2);
  let bestScore = 0;
  let bestFAQ = null;

  for (const faq of state.faqs) {
    let score = 0;
    const qLower = faq.question.toLowerCase();
    const aLower = faq.answer.toLowerCase();

    // Exact question match
    if (qLower === cleanQuery) {
      return faq;
    }

    // Exact substring in question
    if (qLower.includes(cleanQuery)) {
      score += 50;
    }

    // Token matching
    queryTokens.forEach(token => {
      if (qLower.includes(token)) score += 15;
      if (aLower.includes(token)) score += 4;
      if (faq.keywords && faq.keywords.includes(token)) score += 8;
    });

    // Special concept boosters
    if ((cleanQuery.includes('100/300') || cleanQuery.includes('bodily') || cleanQuery.includes('bi limit')) && faq.question.includes('100/300')) score += 60;
    if ((cleanQuery.includes('deductible') && (cleanQuery.includes('choose') || cleanQuery.includes('500') || cleanQuery.includes('1000') || cleanQuery.includes('250'))) && faq.question.includes('choose between a $250, $500, or $1,000')) score += 60;
    if ((cleanQuery.includes('rate') || cleanQuery.includes('recalculate') || cleanQuery.includes('not update')) && faq.question.includes('recalculate my rate')) score += 60;
    if ((cleanQuery.includes('water backup') || cleanQuery.includes('sump pump')) && faq.question.includes('Water Backup')) score += 60;
    if ((cleanQuery.includes('gap') || cleanQuery.includes('loan') || cleanQuery.includes('lease')) && faq.question.includes('Loan or Lease')) score += 60;
    if ((cleanQuery.includes('agent') || cleanQuery.includes('human') || cleanQuery.includes('call') || cleanQuery.includes('speak')) && faq.question.includes('support')) score += 50;
    if ((cleanQuery.includes('underwritten') || cleanQuery.includes('who is')) && faq.question.includes('underwriting')) score += 40;

    if (score > bestScore) {
      bestScore = score;
      bestFAQ = faq;
    }
  }

  if (bestScore >= 12) {
    return bestFAQ;
  }
  return null;
}

// Log Telemetry Event
function logTelemetry(eventType, details) {
  const event = {
    timestamp: new Date().toLocaleTimeString(),
    type: eventType,
    details: details
  };
  state.telemetry.eventLog.unshift(event);
  if (state.telemetry.eventLog.length > 50) state.telemetry.eventLog.pop();
  renderTelemetryUI();
}

// Dead Click Interceptor
let lastDeadClickTime = 0;
let lastDeadClickTarget = null;
let consecutiveDeadClicks = 0;

function handleDeadClick(event) {
  const target = event.currentTarget || event.target;
  const label = target.getAttribute('data-deadclick-label') || target.innerText.trim().substring(0, 30);
  const now = Date.now();

  state.telemetry.deadClicksCount++;
  logTelemetry('DEAD_CLICK_DETECTED', `Dead click on: "${label}"`);

  if (lastDeadClickTarget === label && (now - lastDeadClickTime) < 4000) {
    consecutiveDeadClicks++;
  } else {
    consecutiveDeadClicks = 1;
    lastDeadClickTarget = label;
  }
  lastDeadClickTime = now;

  // Show visual ripple
  showRipple(event);

  // Trigger Advisor if 2+ dead clicks
  if (consecutiveDeadClicks >= 2) {
    consecutiveDeadClicks = 0;
    triggerProactiveAdvisor("dead_click", label);
  }
}

function showRipple(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  const ripple = document.createElement('span');
  ripple.className = 'ripple-effect';
  const size = Math.max(rect.width, rect.height);
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${e.clientX - rect.left - size/2}px`;
  ripple.style.top = `${e.clientY - rect.top - size/2}px`;
  e.currentTarget.style.position = 'relative';
  e.currentTarget.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}

// Trigger Proactive Advisor
function triggerProactiveAdvisor(reason, context) {
  state.telemetry.advisorTriggerCount++;
  state.advisor.isOpen = true;
  renderAdvisorUI();

  let messageText = "";
  let quickReplies = [];

  if (reason === "dead_click") {
    logTelemetry('PROACTIVE_INTERVENTION', `Dead-click proactive trigger on "${context}"`);
    if (context.includes("100/300") || context.includes("Bodily") || context.includes("Liability")) {
      messageText = "I noticed you were checking Bodily Injury 100/300 limits. Would you like a 30-second breakdown of how this protects your personal assets?";
      quickReplies = ["What is 100/300?", "How much limit do I need?", "Select 100/300 Limit"];
    } else if (context.includes("Deductible") || context.includes("$500") || context.includes("$1,000")) {
      messageText = "Tip: Changing your deductible? Remember to click 'Calculate new rate' to see your updated monthly savings.";
      quickReplies = ["How to choose deductible?", "Calculate new rate now", "Compare $500 vs $1000"];
    } else if (context.includes("Rate") || context.includes("$142") || context.includes("Monthly")) {
      messageText = "Looking to refresh your premium? Click the 'Calculate new rate' button right above to instantly update your quote.";
      quickReplies = ["Calculate new rate", "Pay in full vs Monthly", "What fees are included?"];
    } else if (context.includes("Water Backup") || context.includes("Gap")) {
      messageText = `Need more details on ${context}? It's one of our most popular add-ons. Here is what it covers.`;
      quickReplies = ["What is Water Backup?", "What is Loan/Lease Gap?", "What is OEM Parts?"];
    } else {
      messageText = `Need help understanding "${context}"? Ask me any question and I'll explain instantly.`;
      quickReplies = ["Explain this coverage", "Why did my rate change?", "Speak with an Agent"];
    }
  } else if (reason === "dwell_time") {
    logTelemetry('PROACTIVE_INTERVENTION', `Dwell time hesitation trigger (Dwell: ${state.telemetry.dwellSeconds}s)`);
    messageText = "Hello Sarah! I noticed you are reviewing your coverage options. Would you like help choosing your liability limits or checking optional add-ons?";
    quickReplies = ["What is Bodily Injury 100/300?", "How to choose deductible?", "Explain Water Backup & Gap"];
  }

  addAdvisorMessage("agent", messageText, quickReplies);
  if (state.advisor.isVoiceMode) {
    speakText(messageText);
  }
}

// Add Message to Advisor
function addAdvisorMessage(sender, text, quickReplies = [], toolCall = null) {
  const msg = {
    id: 'msg-' + Date.now(),
    sender: sender, // 'agent', 'user', 'system'
    text: text,
    quickReplies: quickReplies,
    toolCall: toolCall,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  state.advisor.messages.push(msg);
  renderAdvisorUI();
  
  const chatScroll = document.getElementById('advisor-chat-messages');
  if (chatScroll) {
    setTimeout(() => {
      chatScroll.scrollTop = chatScroll.scrollHeight;
    }, 50);
  }
}

// Handle User Message Submission
function handleUserMessage(queryText) {
  if (!queryText || !queryText.trim()) return;
  const text = queryText.trim();
  
  // Add user turn
  addAdvisorMessage("user", text);
  state.telemetry.faqQuestionsAsked++;
  logTelemetry('USER_QUERY', text);

  // Check for Human Escalation Intent
  const lower = text.toLowerCase();
  if (lower.includes('agent') || lower.includes('speak to human') || lower.includes('call') || lower.includes('phone') || lower.includes('escalat') || lower.includes('commercial') || lower.includes('custom')) {
    setTimeout(() => {
      const escalationMsg = "I can connect you directly with a licensed American Family Insurance agent right now. You can call us directly or initiate a live priority chat with your quote details attached.";
      addAdvisorMessage("agent", escalationMsg, ["Open Click-to-Call Modal", "Call 1-800-MY-AMFAM", "Back to Coverage Options"], {
        name: "trigger_escalation",
        params: { quote_id: state.quote.id, phone: "1-800-692-6326", wait_time: "45s" }
      });
      if (state.advisor.isVoiceMode) speakText(escalationMsg);
    }, 300);
    return;
  }

  // Check for Action intents
  if (lower.includes('calculate new rate') || lower.includes('recalculate')) {
    setTimeout(() => {
      recalculateQuoteRate();
      const resp = `Rate recalculated! Your new monthly rate is $${state.quote.billing.currentMonthlyRate}/month.`;
      addAdvisorMessage("agent", resp, ["Explain bodily injury", "Review deductible savings", "Proceed to checkout"]);
      if (state.advisor.isVoiceMode) speakText(resp);
    }, 300);
    return;
  }

  if (lower.includes('apply 100/300') || lower.includes('select 100/300')) {
    state.quote.auto.bodilyInjury = '100/300';
    state.quote.billing.dirty = true;
    renderQuoteUI();
    setTimeout(() => {
      const resp = "Updated! I have selected Bodily Injury 100/300 for your auto policy. Click 'Calculate new rate' when you're ready to see the final premium.";
      addAdvisorMessage("agent", resp, ["Calculate new rate now", "What is Property Damage?", "What is Gap coverage?"]);
      if (state.advisor.isVoiceMode) speakText(resp);
    }, 300);
    return;
  }

  // Deterministic FAQ Knowledge Base Match
  const match = findBestFAQMatch(text);
  setTimeout(() => {
    if (match) {
      logTelemetry('FAQ_DETERMINISTIC_HIT', `Matched: "${match.question}"`);
      addAdvisorMessage("agent", match.answer, [
        "Why did my premium change?",
        "How to choose deductible?",
        "Speak with an Agent"
      ], {
        name: "knowledge_retrieval",
        params: { faq_id: match.id, category: match.category, subcategory: match.subcategory }
      });
      if (state.advisor.isVoiceMode) {
        speakText(match.answer);
      }
    } else {
      logTelemetry('FAQ_FALLBACK', `No direct FAQ hit for: "${text}"`);
      const fallback = "I'm your Digital Coverage Advisor. I can answer questions about Bodily Injury limits, deductibles, Collision, Comprehensive, Gap, Water Backup, and rate recalculations. How can I assist you?";
      addAdvisorMessage("agent", fallback, [
        "What is Bodily Injury 100/300?",
        "How to choose deductible?",
        "What is Water Backup?"
      ]);
      if (state.advisor.isVoiceMode) {
        speakText(fallback);
      }
    }
  }, 250);
}

// Recalculate Rate
function recalculateQuoteRate() {
  const newMonthly = calculateRate();
  state.quote.billing.currentMonthlyRate = newMonthly;
  state.quote.billing.dirty = false;
  state.telemetry.rateRecalculations++;
  logTelemetry('RATE_RECALCULATED', `New Rate: $${newMonthly}/mo (was $${state.quote.billing.baseMonthlyRate}/mo)`);
  renderQuoteUI();
}

// Open Escalation Modal
function openEscalationModal() {
  state.telemetry.escalationTriggered = true;
  logTelemetry('ESCALATION_MODAL_OPEN', `Escalation modal displayed for Quote ${state.quote.id}`);
  const modal = document.getElementById('escalation-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeEscalationModal() {
  const modal = document.getElementById('escalation-modal');
  if (modal) modal.classList.add('hidden');
}

// Switch View
function setView(viewName) {
  state.currentView = viewName;
  document.querySelectorAll('.view-container').forEach(el => el.classList.add('hidden'));
  const target = document.getElementById(`view-${viewName}`);
  if (target) target.classList.remove('hidden');

  // Update Nav links
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    if (btn.getAttribute('data-view') === viewName) {
      btn.classList.add('bg-blue-900', 'text-white', 'border-red-600');
      btn.classList.remove('text-slate-600', 'hover:bg-slate-100');
    } else {
      btn.classList.remove('bg-blue-900', 'text-white', 'border-red-600');
      btn.classList.add('text-slate-600', 'hover:bg-slate-100');
    }
  });

  window.scrollTo(0, 0);
  logTelemetry('VIEW_NAVIGATION', `Navigated to view: ${viewName}`);
}

// Switch Viewport
function setViewport(mode) {
  state.viewportMode = mode;
  const container = document.getElementById('app-viewport-wrapper');
  const notch = document.getElementById('mobile-notch-el');

  if (mode === 'mobile') {
    container.className = 'viewport-mobile-frame';
    if (notch) notch.classList.remove('hidden');
  } else if (mode === 'tablet') {
    container.className = 'viewport-tablet-frame';
    if (notch) notch.classList.add('hidden');
  } else {
    container.className = 'w-full';
    if (notch) notch.classList.add('hidden');
  }

  // Update Viewport Buttons
  document.querySelectorAll('.viewport-btn').forEach(btn => {
    if (btn.getAttribute('data-mode') === mode) {
      btn.classList.add('bg-blue-600', 'text-white');
      btn.classList.remove('bg-slate-200', 'text-slate-700');
    } else {
      btn.classList.remove('bg-blue-600', 'text-white');
      btn.classList.add('bg-slate-200', 'text-slate-700');
    }
  });
}

// CUJ Interactive Step Player
function selectCUJ(cujId) {
  state.cuj.activeCujId = cujId;
  state.cuj.activeStepIndex = 0;
  renderCUJUI();
}

function nextCUJStep() {
  const activeCuj = state.cujs.find(c => c.id === state.cuj.activeCujId);
  if (!activeCuj) return;
  if (state.cuj.activeStepIndex < activeCuj.dialogue.length - 1) {
    state.cuj.activeStepIndex++;
    renderCUJUI();
  }
}

function prevCUJStep() {
  if (state.cuj.activeStepIndex > 0) {
    state.cuj.activeStepIndex--;
    renderCUJUI();
  }
}

function runCUJInSandbox(cujId) {
  const cuj = state.cujs.find(c => c.id === cujId);
  if (!cuj) return;
  
  setView('quote');
  state.advisor.isOpen = true;
  state.advisor.messages = [];
  renderAdvisorUI();

  logTelemetry('CUJ_SANDBOX_RUN', `Executing CUJ: ${cuj.title}`);

  // Play steps sequentially
  let stepIdx = 0;
  function playNextTurn() {
    if (stepIdx >= cuj.dialogue.length) return;
    const turn = cuj.dialogue[stepIdx];
    
    if (turn.type === 'trigger') {
      logTelemetry('SYSTEM_TRIGGER', turn.text);
      triggerProactiveAdvisor('dead_click', 'Bodily Injury 100/300');
    } else if (turn.type === 'agent') {
      addAdvisorMessage('agent', turn.text, turn.quick_replies || [], turn.tool_call);
      if (turn.tool_call && turn.tool_call.name === 'update_quote_selection') {
        state.quote.auto.bodilyInjury = '100/300';
        renderQuoteUI();
      }
      if (turn.tool_call && turn.tool_call.name === 'recalculate_rate') {
        recalculateQuoteRate();
      }
      if (turn.tool_call && turn.tool_call.name === 'trigger_escalation') {
        openEscalationModal();
      }
    } else if (turn.type === 'user') {
      addAdvisorMessage('user', turn.text);
    }
    
    stepIdx++;
    if (stepIdx < cuj.dialogue.length) {
      setTimeout(playNextTurn, 1400);
    }
  }

  setTimeout(playNextTurn, 600);
}

// Render Functions
function renderQuoteUI() {
  // Update Price Displays
  const monthlyRateEl = document.getElementById('quote-monthly-rate');
  const fullRateEl = document.getElementById('quote-full-rate');
  const calcBtn = document.getElementById('calc-rate-btn');

  if (monthlyRateEl) monthlyRateEl.innerText = `$${state.quote.billing.currentMonthlyRate}.00`;
  if (fullRateEl) fullRateEl.innerText = `$${Math.round(state.quote.billing.currentMonthlyRate * 12 * 0.92)}.00`;

  if (calcBtn) {
    if (state.quote.billing.dirty) {
      calcBtn.classList.add('animate-bounce', 'ring-4', 'ring-red-400');
      calcBtn.classList.remove('opacity-90');
    } else {
      calcBtn.classList.remove('animate-bounce', 'ring-4', 'ring-red-400');
      calcBtn.classList.add('opacity-90');
    }
  }

  // Update Select values
  const biSelect = document.getElementById('select-bodily-injury');
  if (biSelect) biSelect.value = state.quote.auto.bodilyInjury;

  const collSelect = document.getElementById('select-collision-ded');
  if (collSelect) collSelect.value = state.quote.auto.collisionDeductible;

  const compSelect = document.getElementById('select-comp-ded');
  if (compSelect) compSelect.value = state.quote.auto.comprehensiveDeductible;

  const gapCheck = document.getElementById('check-gap-coverage');
  if (gapCheck) gapCheck.checked = state.quote.auto.gapCoverage;

  const oemCheck = document.getElementById('check-oem-parts');
  if (oemCheck) oemCheck.checked = state.quote.auto.oemParts;

  const roadCheck = document.getElementById('check-roadside');
  if (roadCheck) roadCheck.checked = state.quote.auto.roadside;

  const waterSelect = document.getElementById('select-water-backup');
  if (waterSelect) waterSelect.value = state.quote.home.waterBackup;

  const extSelect = document.getElementById('select-ext-replacement');
  if (extSelect) extSelect.value = state.quote.home.extendedReplacement;
}

function renderAdvisorUI() {
  const panel = document.getElementById('advisor-widget-panel');
  const badge = document.getElementById('advisor-unread-badge');
  const messagesList = document.getElementById('advisor-chat-messages');

  if (!panel || !messagesList) return;

  if (state.advisor.isOpen) {
    panel.classList.remove('hidden');
    if (badge) badge.classList.add('hidden');
  } else {
    panel.classList.add('hidden');
  }

  messagesList.innerHTML = '';

  if (state.advisor.messages.length === 0) {
    // Initial welcome state
    const welcomeHtml = `
      <div class="text-center py-4 px-2">
        <div class="w-12 h-12 rounded-full bg-blue-100 text-blue-900 mx-auto flex items-center justify-center font-bold text-xl shadow-sm mb-3">
          AF
        </div>
        <h4 class="font-bold text-slate-800 text-base mb-1">Digital Coverage Advisor</h4>
        <p class="text-xs text-slate-500 mb-4">Phase 1 Sandbox MVP • 100% Deterministic Knowledge Base</p>
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-slate-700 text-left mb-3">
          👋 Hi Sarah! I'm here to explain coverages, deductibles, and help recalculate your rate in real-time.
        </div>
        <p class="text-xs font-semibold text-slate-600 mb-2 text-left">Suggested Questions:</p>
        <div class="flex flex-col gap-1.5 text-left">
          <button onclick="handleUserMessage('What is Bodily Injury 100/300?')" class="text-xs bg-white hover:bg-blue-50 text-blue-800 border border-slate-200 rounded-lg p-2 text-left transition flex items-center justify-between">
            <span>🚗 What is Bodily Injury 100/300?</span>
            <span class="text-slate-400">→</span>
          </button>
          <button onclick="handleUserMessage('How do I choose a $500 vs $1000 deductible?')" class="text-xs bg-white hover:bg-blue-50 text-blue-800 border border-slate-200 rounded-lg p-2 text-left transition flex items-center justify-between">
            <span>🛡️ How to choose $500 vs $1,000 deductible?</span>
            <span class="text-slate-400">→</span>
          </button>
          <button onclick="handleUserMessage('What is Water Backup coverage?')" class="text-xs bg-white hover:bg-blue-50 text-blue-800 border border-slate-200 rounded-lg p-2 text-left transition flex items-center justify-between">
            <span>🏠 What is Water Backup coverage?</span>
            <span class="text-slate-400">→</span>
          </button>
          <button onclick="handleUserMessage('Why did my rate not update?')" class="text-xs bg-white hover:bg-blue-50 text-blue-800 border border-slate-200 rounded-lg p-2 text-left transition flex items-center justify-between">
            <span>🔄 How do I recalculate my rate?</span>
            <span class="text-slate-400">→</span>
          </button>
        </div>
      </div>
    `;
    messagesList.innerHTML = welcomeHtml;
    return;
  }

  state.advisor.messages.forEach(msg => {
    const msgDiv = document.createElement('div');
    msgDiv.className = `flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} mb-3`;

    let bubbleClass = msg.sender === 'user'
      ? 'bg-blue-900 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%] shadow-sm text-sm'
      : 'bg-white text-slate-800 border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[90%] shadow-sm text-sm';

    let toolCallHtml = '';
    if (msg.toolCall) {
      toolCallHtml = `
        <div class="mt-2 pt-2 border-t border-slate-100 text-[11px] font-mono text-blue-700 bg-blue-50 p-2 rounded-lg">
          <div class="flex items-center gap-1 font-bold text-blue-900">
            <span>⚡ Action:</span> <span>${msg.toolCall.name}</span>
          </div>
          <div class="text-slate-600 truncate">${JSON.stringify(msg.toolCall.params)}</div>
        </div>
      `;
    }

    let voiceButtonHtml = '';
    if (msg.sender === 'agent') {
      voiceButtonHtml = `
        <button onclick="speakText('${msg.text.replace(/'/g, "\\'")}')" class="text-slate-400 hover:text-blue-600 p-1 transition" title="Listen with Voice">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
        </button>
      `;
    }

    let quickRepliesHtml = '';
    if (msg.quickReplies && msg.quickReplies.length > 0) {
      quickRepliesHtml = `
        <div class="flex flex-wrap gap-1.5 mt-2">
          ${msg.quickReplies.map(qr => `
            <button onclick="handleQuickReply('${qr.replace(/'/g, "\\'")}')" class="text-[11px] bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-medium px-2.5 py-1 rounded-full transition">
              ${qr}
            </button>
          `).join('')}
        </div>
      `;
    }

    msgDiv.innerHTML = `
      <div class="${bubbleClass}">
        <div class="flex justify-between items-start gap-2">
          <span>${msg.text}</span>
          ${voiceButtonHtml}
        </div>
        ${toolCallHtml}
      </div>
      <div class="text-[10px] text-slate-400 px-1 mt-0.5">${msg.time}</div>
      ${quickRepliesHtml}
    `;

    messagesList.appendChild(msgDiv);
  });
}

function handleQuickReply(text) {
  if (text.includes("Modal") || text.includes("1-800")) {
    openEscalationModal();
    return;
  }
  handleUserMessage(text);
}

function renderCUJUI() {
  const cujSelect = document.getElementById('cuj-selector');
  const cujDetailContainer = document.getElementById('cuj-detail-card');
  const activeCuj = state.cujs.find(c => c.id === state.cuj.activeCujId);

  if (!activeCuj || !cujDetailContainer) return;

  if (cujSelect) {
    cujSelect.innerHTML = state.cujs.map(c => `
      <option value="${c.id}" ${c.id === state.cuj.activeCujId ? 'selected' : ''}>
        ${c.id}: ${c.title}
      </option>
    `).join('');
  }

  const currentTurn = activeCuj.dialogue[state.cuj.activeStepIndex];

  cujDetailContainer.innerHTML = `
    <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
      <div class="flex flex-wrap justify-between items-start gap-4 mb-4 pb-4 border-b border-slate-100">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-0.5 rounded-full">${activeCuj.id}</span>
            <h3 class="text-xl font-bold text-slate-900">${activeCuj.title}</h3>
          </div>
          <p class="text-sm text-slate-600">👤 <strong>Persona:</strong> ${activeCuj.persona}</p>
        </div>
        <button onclick="runCUJInSandbox('${activeCuj.id}')" class="bg-blue-900 hover:bg-blue-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-2 transition">
          <span>▶️ Run Interactive Simulation in Sandbox</span>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900">
          <div class="font-bold mb-1 flex items-center gap-1">⚠️ Friction Signal & RUM Baseline:</div>
          <div>${activeCuj.friction_point}</div>
        </div>
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900">
          <div class="font-bold mb-1 flex items-center gap-1">⚡ Behavioral Trigger:</div>
          <div>${activeCuj.trigger}</div>
        </div>
        <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900">
          <div class="font-bold mb-1 flex items-center gap-1">📈 Business & Experience Outcome:</div>
          <div>${activeCuj.business_outcome}</div>
        </div>
      </div>

      <!-- Interactive Step-by-Step Viewer -->
      <div class="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-4">
        <div class="flex justify-between items-center mb-4">
          <h4 class="font-bold text-slate-800 text-sm flex items-center gap-2">
            <span>Turn-by-Turn Dialogue</span>
            <span class="text-xs text-slate-500 font-normal">(Turn ${state.cuj.activeStepIndex + 1} of ${activeCuj.dialogue.length})</span>
          </h4>
          <div class="flex items-center gap-2">
            <button onclick="prevCUJStep()" ${state.cuj.activeStepIndex === 0 ? 'disabled' : ''} class="px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold disabled:opacity-40 hover:bg-slate-100">
              ← Previous Turn
            </button>
            <button onclick="nextCUJStep()" ${state.cuj.activeStepIndex === activeCuj.dialogue.length - 1 ? 'disabled' : ''} class="px-3 py-1 bg-blue-900 text-white rounded-lg text-xs font-semibold disabled:opacity-40 hover:bg-blue-800">
              Next Turn →
            </button>
          </div>
        </div>

        <div class="space-y-3">
          ${activeCuj.dialogue.map((turn, idx) => {
            const isActive = idx === state.cuj.activeStepIndex;
            return `
              <div class="p-3.5 rounded-xl border transition ${isActive ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-100' : 'bg-slate-100/70 border-slate-200 opacity-60'}">
                <div class="flex justify-between items-center mb-1.5">
                  <span class="font-bold text-xs ${turn.type === 'agent' ? 'text-blue-900' : turn.type === 'user' ? 'text-emerald-700' : 'text-amber-800'}">
                    ${turn.speaker} ${isActive ? '📍 (Current Turn)' : ''}
                  </span>
                  <span class="text-[10px] uppercase font-mono px-2 py-0.5 rounded ${turn.type === 'agent' ? 'bg-blue-100 text-blue-800' : turn.type === 'user' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                    ${turn.type}
                  </span>
                </div>
                <div class="text-xs text-slate-800 mb-2">${turn.text}</div>
                ${turn.tool_call ? `
                  <div class="text-[11px] font-mono bg-slate-900 text-green-400 p-2 rounded-lg">
                    ⚡ Tool Execution: ${turn.tool_call.name} (${JSON.stringify(turn.tool_call.params)})
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderFAQsUI(filterCategory = 'all', searchTerm = '') {
  const container = document.getElementById('faqs-list-container');
  if (!container || !state.faqs) return;

  let filtered = state.faqs;
  if (filterCategory !== 'all') {
    filtered = filtered.filter(f => f.category.toLowerCase().includes(filterCategory.toLowerCase()) || f.subcategory.toLowerCase().includes(filterCategory.toLowerCase()));
  }
  if (searchTerm && searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(f => f.question.toLowerCase().includes(term) || f.answer.toLowerCase().includes(term));
  }

  container.innerHTML = filtered.map(faq => `
    <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-blue-400 transition flex flex-col justify-between">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <span class="bg-blue-100 text-blue-900 text-[10px] font-bold px-2 py-0.5 rounded-full">${faq.category}</span>
          <span class="text-slate-400 text-xs">•</span>
          <span class="text-slate-500 text-xs font-medium">${faq.subcategory}</span>
        </div>
        <h4 class="font-bold text-slate-900 text-sm mb-2">${faq.question}</h4>
        <p class="text-xs text-slate-600 leading-relaxed mb-4">${faq.answer}</p>
      </div>
      <div class="flex items-center justify-between pt-3 border-t border-slate-100">
        <button onclick="handleUserMessage('${faq.question.replace(/'/g, "\\'")}'); setView('quote'); state.advisor.isOpen=true; renderAdvisorUI();" class="text-xs font-semibold text-blue-900 hover:text-red-600 flex items-center gap-1">
          <span>Ask in Advisor</span> <span>→</span>
        </button>
        <button onclick="speakText('${faq.answer.replace(/'/g, "\\'")}')" class="text-slate-400 hover:text-blue-600 p-1" title="Play voice audio">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
        </button>
      </div>
    </div>
  `).join('');
}

function renderTelemetryUI() {
  const dwellEl = document.getElementById('stat-dwell-time');
  const deadEl = document.getElementById('stat-dead-clicks');
  const trigEl = document.getElementById('stat-advisor-triggers');
  const faqEl = document.getElementById('stat-faqs-asked');
  const rateEl = document.getElementById('stat-rate-calcs');
  const logContainer = document.getElementById('telemetry-event-stream');

  if (dwellEl) dwellEl.innerText = `${state.telemetry.dwellSeconds}s`;
  if (deadEl) deadEl.innerText = state.telemetry.deadClicksCount;
  if (trigEl) trigEl.innerText = state.telemetry.advisorTriggerCount;
  if (faqEl) faqEl.innerText = state.telemetry.faqQuestionsAsked;
  if (rateEl) rateEl.innerText = state.telemetry.rateRecalculations;

  if (logContainer) {
    logContainer.innerHTML = state.telemetry.eventLog.map(e => `
      <div class="text-[11px] font-mono p-2 border-b border-slate-100 flex items-start gap-2">
        <span class="text-slate-400 shrink-0">${e.timestamp}</span>
        <span class="font-bold text-blue-800 shrink-0">[${e.type}]</span>
        <span class="text-slate-700 truncate">${e.details}</span>
      </div>
    `).join('');
  }
}

// Global Dwell Timer
setInterval(() => {
  if (state.currentView === 'quote') {
    state.telemetry.dwellSeconds++;
    const dwellEl = document.getElementById('stat-dwell-time');
    if (dwellEl) dwellEl.innerText = `${state.telemetry.dwellSeconds}s`;

    // Trigger Dwell assistance at 30 seconds
    if (state.telemetry.dwellSeconds === 30 && state.advisor.messages.length === 0) {
      triggerProactiveAdvisor("dwell_time", "General Quote Review");
    }
  }
}, 1000);

// Initialize Application
async function initApp() {
  try {
    const faqRes = await fetch('data/faqs.json');
    state.faqs = await faqRes.json();
  } catch (e) {
    console.warn("FAQ fetch error, fallback to inline", e);
  }

  try {
    const cujRes = await fetch('data/cujs.json');
    state.cujs = await cujRes.json();
  } catch (e) {
    console.warn("CUJ fetch error", e);
  }

  // Setup Event Listeners
  document.querySelectorAll('.dead-click-target').forEach(el => {
    el.addEventListener('click', handleDeadClick);
  });

  renderQuoteUI();
  renderAdvisorUI();
  renderCUJUI();
  renderFAQsUI();
  renderTelemetryUI();

  // Voice setup
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      // Voices loaded
    };
  }

  logTelemetry('SYSTEM_READY', 'AmFam Digital Coverage Advisor Sandbox Initialized (Phase 1)');
}

window.addEventListener('DOMContentLoaded', initApp);
