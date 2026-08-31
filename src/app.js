/**
 * American Family Insurance - Digital Coverage Advisor Unified Application Engine
 *
 * Core Capabilities:
 * - Multi-View Navigation: 🏠 Homepage & Finalization, 🚗 APEX Quote Configurator, 🗺️ CUJ Interactive Studio, 📚 FAQ Knowledge Base, 📊 RUM Telemetry Dashboard
 * - Viewport Switcher: Desktop, Tablet, Mobile (390px)
 * - 10-Second Automated Pop-In Timer with Radiant Glow & Jumping Launcher Button
 * - Real-Time Barge-In Two-Way Voice Engine (Natural Neural Female Voice TTS + Web Speech STT)
 * - Full Interruption Capability: User speech instantly cancels agent TTS and transitions to listening mode
 * - Clean Session Initializer (No technical session ID output in chat bubbles)
 * - Deterministic FAQ Matching & Live CXAS GCP Agent Integration (/api/chat)
 * - Contextual Smart Next-Question Suggestions
 * - Dual-Path Human Escalation (Click-to-Call 1-800-692-6326 & Scheduled Priority Callback)
 * - Live Rate Recalculation & Electronic Policy Binding
 */

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

  // Chat Bubble State
  bubble: {
    isPopulated: false,
    isOpen: false, // Starts closed & hidden on page load
    countdownSeconds: 10,
    timerId: null
  },

  // Two-Way Voice & Barge-In State
  voice: {
    isVoiceMode: false,
    isListening: false,
    isSpeaking: false,
    isMuted: false,
    isInterrupted: false,
    recognition: null,
    selectedVoice: null,
    interimText: ""
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

  // Advisor Conversation Messages
  advisor: {
    messages: []
  },

  // FAQ Directory
  faqs: [],
  currentFaqFilter: "all"
};

// =========================================================================
// INITIAL GREETING & CHIME
// =========================================================================

function getFreshSessionGreeting() {
  return [
    {
      id: "msg-welcome",
      sender: "agent",
      text: "👋 Hi there! I am your American Family Digital Coverage Advisor. How can I help you today? Ask me any question about auto & home coverage limits, deductibles, optional add-ons, or multi-policy bundling.",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      quickReplies: [
        "🚗 What is Bodily Injury 100/300?",
        "🛡️ How do I choose between $500 and $1,000 deductible?",
        "🏠 What is Water Backup coverage?",
        "🎙️ Talk to Advisor (Voice Mode)"
      ]
    }
  ];
}

function playSoftChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
    gain1.gain.setValueAtTime(0.08, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(987.77, ctx.currentTime + 0.12); // B5
    gain2.gain.setValueAtTime(0.09, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.6);
  } catch (e) {}
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
    if (state.bubble.isPopulated) {
      cdEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> <span>Advisor Active</span>`;
      cdEl.className = "bg-emerald-900/80 text-emerald-200 border border-emerald-700 px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-sm";
    } else {
      cdEl.innerHTML = `⏱️ Chat Bubble Populates in <strong>${state.bubble.countdownSeconds}s</strong>`;
      cdEl.className = "bg-red-900/80 text-red-200 border border-red-700 px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-sm animate-pulse";
    }
  }
}

function populateChatBubble() {
  state.bubble.isPopulated = true;
  updateCountdownDisplay();

  const container = document.getElementById("chat-bubble-container");
  const button = document.getElementById("chat-bubble-button");

  if (container) {
    container.classList.remove("hidden");
    container.classList.add("flex");
  }

  if (button) {
    button.classList.add("bubble-enter", "bubble-glowing", "bubble-jumping");
  }

  toggleAdvisor(true);
  playSoftChime();
  logTelemetryEvent("chat_bubble_populated", { trigger: "10s_timer_or_action" });
}

function resetBubbleTimer() {
  state.bubble.isPopulated = false;
  state.bubble.isOpen = false;
  
  const container = document.getElementById("chat-bubble-container");
  const panel = document.getElementById("advisor-chat-panel");
  const button = document.getElementById("chat-bubble-button");

  if (panel) panel.classList.add("hidden");
  if (button) button.classList.remove("bubble-glowing", "bubble-jumping");
  if (container) {
    container.classList.add("hidden");
    container.classList.remove("flex");
  }

  startBubbleCountdown();
}

function toggleAdvisor(forceOpen = null) {
  const widget = document.getElementById("amfam-ces-widget") || document.querySelector("chat-messenger");

  if (forceOpen !== null) {
    state.bubble.isOpen = forceOpen;
  } else {
    state.bubble.isOpen = !state.bubble.isOpen;
  }

  if (widget) {
    if (state.bubble.isOpen) {
      if (typeof widget.open === "function") widget.open();
    } else {
      if (typeof widget.close === "function") widget.close();
      stopSpeaking();
      stopListening();
    }
  }

  const container = document.getElementById("chat-bubble-container");
  const panel = document.getElementById("advisor-chat-panel");
  const button = document.getElementById("chat-bubble-button");

  if (container && forceOpen === true) {
    container.classList.remove("hidden");
    container.classList.add("flex");
  }

  if (state.bubble.isOpen) {
    if (panel) panel.classList.remove("hidden");
    if (button) button.classList.remove("bubble-jumping");
    renderAdvisorMessages();
  } else {
    if (panel) panel.classList.add("hidden");
    if (button && state.bubble.isPopulated) button.classList.add("bubble-jumping");
    stopSpeaking();
    stopListening();
  }
}

function resetSession() {
  state.session.id = "SES-" + Math.random().toString(36).substring(2, 9).toUpperCase();
  state.session.startTime = new Date().toLocaleTimeString();

  stopSpeaking();
  stopListening();

  state.advisor.messages = getFreshSessionGreeting();
  renderAdvisorMessages();

  showResetToast();
  playSoftChime();
  logTelemetryEvent("session_reset", { newSessionId: state.session.id });
}

function showResetToast() {
  const toast = document.getElementById("session-reset-toast");
  if (toast) {
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 3000);
  }
}

// =========================================================================
// TWO-WAY VOICE ENGINE (NATURAL FEMALE VOICE + REAL-TIME BARGE-IN)
// =========================================================================

function initFemaleVoice() {
  if (!("speechSynthesis" in window)) return;

  function loadVoice() {
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    const naturalFemaleVoice = voices.find(v => 
      v.name.includes("Jenny Online (Natural)") ||
      v.name.includes("Aria Online (Natural)") ||
      v.name.includes("Google US English") ||
      v.name.includes("Google UK English Female") ||
      v.name.includes("Samantha (Enhanced)") ||
      v.name.includes("Samantha") ||
      v.name.includes("Victoria") ||
      v.name.includes("Karen") ||
      v.name.includes("Ava") ||
      v.name.includes("Neural2") ||
      v.name.includes("Journey") ||
      (v.lang.startsWith("en") && v.name.toLowerCase().includes("female"))
    ) || voices.find(v => v.lang === "en-US") || voices[0];

    state.voice.selectedVoice = naturalFemaleVoice;
  }

  loadVoice();
  window.speechSynthesis.onvoiceschanged = loadVoice;
}

// REAL-TIME BARGE-IN INTERRUPTION HANDLER
function bargeIn() {
  if (state.voice.isSpeaking) {
    console.log("⚡ Barge-In Interruption: User spoke during agent playback. Halting speech synthesis immediately.");
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    state.voice.isSpeaking = false;
    state.voice.isInterrupted = true;
    showBargeInFeedback();
    updateVoiceUI();
    logTelemetryEvent("barge_in_interruption", { timestamp: new Date().toISOString() });
  }
}

function showBargeInFeedback() {
  const toast = document.getElementById("barge-in-toast");
  if (toast) {
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 2200);
  }
}

function triggerMainMicClick() {
  if (state.voice.isSpeaking) {
    bargeIn();
    return;
  }
  
  if (!state.voice.isVoiceMode) {
    toggleVoiceMode();
  } else {
    if (state.voice.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }
}

function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn("SpeechRecognition not supported in this browser");
    return;
  }

  const rec = new SpeechRecognition();
  rec.continuous = true;
  rec.interimResults = true;
  rec.lang = "en-US";

  rec.onstart = () => {
    state.voice.isListening = true;
    updateVoiceUI();
  };

  rec.onspeechstart = () => {
    if (state.voice.isSpeaking) {
      bargeIn();
    }
  };

  rec.onsoundstart = () => {
    if (state.voice.isSpeaking) {
      bargeIn();
    }
  };

  rec.onresult = (event) => {
    let interim = "";
    let finalTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interim += event.results[i][0].transcript;
      }
    }

    if ((interim.trim() || finalTranscript.trim()) && state.voice.isSpeaking) {
      bargeIn();
    }

    state.voice.interimText = interim;
    updateVoiceUI();

    if (finalTranscript.trim()) {
      state.voice.interimText = "";
      handleUserPrompt(finalTranscript.trim());
    }
  };

  rec.onerror = (event) => {
    if (event.error !== "no-speech") {
      console.warn("Speech recognition error:", event.error);
    }
    state.voice.isListening = false;
    updateVoiceUI();
  };

  rec.onend = () => {
    state.voice.isListening = false;
    updateVoiceUI();
    if (state.voice.isVoiceMode && !state.voice.isMuted && !state.voice.isSpeaking) {
      setTimeout(startListening, 300);
    }
  };

  state.voice.recognition = rec;
}

function toggleVoiceMode() {
  state.voice.isVoiceMode = !state.voice.isVoiceMode;
  
  const voiceBtn = document.getElementById("voice-mode-toggle-btn");
  if (voiceBtn) {
    if (state.voice.isVoiceMode) {
      voiceBtn.classList.add("text-emerald-400", "bg-blue-900/60");
      voiceBtn.classList.remove("text-blue-200");
    } else {
      voiceBtn.classList.remove("text-emerald-400", "bg-blue-900/60");
      voiceBtn.classList.add("text-blue-200");
      stopSpeaking();
      stopListening();
    }
  }

  updateVoiceUI();

  if (state.voice.isVoiceMode && !state.voice.isMuted) {
    startListening();
  }
}

function toggleMute() {
  state.voice.isMuted = !state.voice.isMuted;
  
  if (state.voice.isMuted) {
    stopListening();
  } else {
    if (state.voice.isVoiceMode && !state.voice.isSpeaking) {
      startListening();
    }
  }

  updateVoiceUI();
}

function startListening() {
  if (state.voice.isMuted || !state.voice.recognition) return;
  try {
    state.voice.recognition.start();
  } catch (e) {}
}

function stopListening() {
  if (state.voice.recognition) {
    try {
      state.voice.recognition.stop();
    } catch (e) {}
  }
  state.voice.isListening = false;
  state.voice.interimText = "";
  updateVoiceUI();
}

function stopSpeaking() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  state.voice.isSpeaking = false;
  updateVoiceUI();
}

function speakVoice(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(normalizeVoice(text));
  utterance.rate = 1.0;
  utterance.pitch = 1.03;

  if (state.voice.selectedVoice) {
    utterance.voice = state.voice.selectedVoice;
  }

  state.voice.isSpeaking = true;
  updateVoiceUI();

  utterance.onend = () => {
    state.voice.isSpeaking = false;
    updateVoiceUI();
    if (state.voice.isVoiceMode && !state.voice.isMuted) {
      setTimeout(startListening, 350);
    }
  };

  utterance.onerror = () => {
    state.voice.isSpeaking = false;
    updateVoiceUI();
  };

  window.speechSynthesis.speak(utterance);
}

function normalizeVoice(text) {
  let res = text;
  res = res.replace(/—/g, ", ");
  res = res.replace(/--/g, ", ");
  
  res = res.replace(/\$100,000/g, "one hundred thousand dollars");
  res = res.replace(/\$300,000/g, "three hundred thousand dollars");
  res = res.replace(/\$250,000/g, "two hundred fifty thousand dollars");
  res = res.replace(/\$500,000/g, "five hundred thousand dollars");
  res = res.replace(/\$380,000/g, "three hundred eighty thousand dollars");
  res = res.replace(/\$190,000/g, "one hundred ninety thousand dollars");
  res = res.replace(/\$150,000/g, "one hundred fifty thousand dollars");
  res = res.replace(/\$50,000/g, "fifty thousand dollars");
  res = res.replace(/\$38,000/g, "thirty eight thousand dollars");
  res = res.replace(/\$25,000/g, "twenty five thousand dollars");
  res = res.replace(/\$10,000/g, "ten thousand dollars");
  res = res.replace(/\$5,000/g, "five thousand dollars");
  res = res.replace(/\$3,800/g, "three thousand eight hundred dollars");
  res = res.replace(/\$1,500/g, "fifteen hundred dollars");
  res = res.replace(/\$1,120/g, "eleven hundred twenty dollars");
  res = res.replace(/\$1,000/g, "one thousand dollars");
  res = res.replace(/\$584/g, "five hundred eighty-four dollars");
  res = res.replace(/\$500/g, "five hundred dollars");
  res = res.replace(/\$250/g, "two hundred fifty dollars");
  res = res.replace(/\$184/g, "one hundred eighty-four dollars");
  res = res.replace(/\$142/g, "one hundred forty-two dollars");
  res = res.replace(/\$128/g, "one hundred twenty-eight dollars");
  res = res.replace(/\$68/g, "sixty-eight dollars");
  res = res.replace(/\$45/g, "forty-five dollars");
  res = res.replace(/\$14/g, "fourteen dollars");
  
  res = res.replace(/100\/300/g, "one hundred over three hundred thousand dollars");
  res = res.replace(/50\/100/g, "fifty over one hundred thousand dollars");
  res = res.replace(/250\/500/g, "two hundred fifty over five hundred thousand dollars");
  
  res = res.replace(/1-800-MY-AMFAM/g, "one eight hundred, my am fam");
  res = res.replace(/1-800-MYAMFAM/g, "one eight hundred, my am fam");
  res = res.replace(/1-800-692-6326/g, "one eight hundred, six nine two, six three two six");
  
  res = res.replace(/\bAOP\b/g, "All Other Perils");
  res = res.replace(/\bUM\/UIM\b/g, "Uninsured and Underinsured Motorist");
  res = res.replace(/\bBI\b/g, "Bodily Injury");
  res = res.replace(/\bPD\b/g, "Property Damage");
  res = res.replace(/\bHO-3\b/g, "Homeowners three");
  res = res.replace(/\bRCV\b/g, "Replacement Cost Value");
  res = res.replace(/\bACV\b/g, "Actual Cash Value");
  res = res.replace(/\bERA\b/g, "Emergency Roadside Assistance");
  res = res.replace(/\bOEM\b/g, "Original Equipment Manufacturer");
  res = res.replace(/\bDNQ\b/g, "Does Not Qualify");
  res = res.replace(/\bCST\b/g, "Central Time");
  res = res.replace(/Auto \+ Home/g, "Auto plus Home");
  return res;
}

function updateVoiceUI() {
  const banner = document.getElementById("voice-status-banner");
  const micBtn = document.getElementById("voice-mic-main-btn");
  const muteBtn = document.getElementById("voice-mute-btn");
  const statusText = document.getElementById("voice-status-text");
  const interimEl = document.getElementById("voice-interim-display");

  if (!banner) return;

  if (state.voice.isVoiceMode) {
    banner.classList.remove("hidden");
  } else {
    banner.classList.add("hidden");
    return;
  }

  if (muteBtn) {
    if (state.voice.isMuted) {
      muteBtn.innerHTML = `🔇 <span>Unmute</span>`;
      muteBtn.className = "bg-amber-600 hover:bg-amber-700 text-white px-2 py-0.5 rounded text-[10px] font-bold transition flex items-center gap-1";
    } else {
      muteBtn.innerHTML = `🎙️ <span>Mute</span>`;
      muteBtn.className = "bg-blue-800 hover:bg-blue-700 text-blue-100 px-2 py-0.5 rounded text-[10px] font-semibold transition flex items-center gap-1";
    }
  }

  if (statusText) {
    if (state.voice.isSpeaking) {
      statusText.innerHTML = `<span class="voice-bar w-1 bg-amber-400 rounded"></span><span class="voice-bar w-1 bg-amber-400 rounded"></span><span class="text-amber-300 font-semibold">Speaking response... (Interrupt anytime)</span>`;
    } else if (state.voice.isMuted) {
      statusText.innerHTML = `<span class="text-amber-300">🔇 Microphone Muted</span>`;
    } else if (state.voice.isListening) {
      statusText.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span><span class="text-emerald-300 font-semibold">Listening... Speak now (Barge-in ready)</span>`;
    } else {
      statusText.innerHTML = `<span class="text-blue-200">Voice Mode Ready</span>`;
    }
  }

  if (micBtn) {
    if (state.voice.isListening && !state.voice.isMuted) {
      micBtn.className = "p-2 rounded-xl text-white bg-emerald-600 mic-listening-active transition shrink-0 shadow-xs";
    } else if (state.voice.isMuted) {
      micBtn.className = "p-2 rounded-xl text-white bg-amber-600 transition shrink-0 shadow-xs";
    } else {
      micBtn.className = "p-2 rounded-xl text-blue-100 bg-blue-800 hover:bg-blue-700 transition shrink-0 shadow-xs";
    }
  }

  if (interimEl) {
    if (state.voice.interimText) {
      interimEl.innerText = `"${state.voice.interimText}..."`;
      interimEl.classList.remove("hidden");
    } else {
      interimEl.classList.add("hidden");
    }
  }
}

// =========================================================================
// DETERMINISTIC FAQ RETRIEVAL & CXAS AGENT MESSAGING
// =========================================================================

function searchFAQ(query) {
  if (!query || !state.faqs || state.faqs.length === 0) return null;
  const clean = query.toLowerCase().trim();
  const cleanNoPunct = clean.replace(/[?,.!"']/g, "");

  // 1. Direct exact or substring question match
  for (const faq of state.faqs) {
    const q = faq.question.toLowerCase().trim();
    const qClean = q.replace(/[?,.!"']/g, "");
    if (q === clean || qClean === cleanNoPunct) return faq;
  }

  // Explicit guard against out-of-scope topics
  const outOfScopeKeywords = [
    "pet", "dog", "cat", "veterinarian", "life insurance", "term life", "whole life",
    "commercial", "business", "fleet", "cancel", "refund", "cancellation", "claim",
    "claims", "adjuster", "billing", "dispute", "charged twice", "bank", "installment",
    "motorcycle", "boat", "rv", "harley", "address change", "garaging address", "update address",
    "astronaut", "weather", "capital", "trivia", "joke"
  ];
  for (const oos of outOfScopeKeywords) {
    if (clean.includes(oos)) return null;
  }

  // 2. High-precision keyword matching against questions
  const stopWords = new Set(["what", "does", "have", "with", "from", "this", "that", "your", "coverage", "insurance", "about", "need", "could", "should", "would", "like"]);
  const tokens = cleanNoPunct.split(/\s+/).filter(t => t.length > 2 && !stopWords.has(t));

  let bestFAQ = null;
  let bestScore = 0;

  for (const faq of state.faqs) {
    let score = 0;
    const q = faq.question.toLowerCase();
    const a = faq.answer.toLowerCase();

    tokens.forEach(t => {
      if (q.includes(t)) score += 20;
      else if (a.includes(t)) score += 5;
    });

    if (clean.includes("100/300") && q.includes("100/300")) score += 60;
    if (clean.includes("bodily injury") && q.includes("bodily injury")) score += 60;
    if (clean.includes("property damage") && q.includes("property damage")) score += 60;
    if (clean.includes("water backup") && q.includes("water backup")) score += 60;
    if ((clean.includes("gap") || clean.includes("loan") || clean.includes("lease")) && q.includes("loan or lease")) score += 60;
    if (clean.includes("oem") && q.includes("oem")) score += 60;
    if (clean.includes("wind") && q.includes("wind/hail")) score += 60;
    if (clean.includes("all-perils") || clean.includes("aop")) score += 60;
    if (clean.includes("dwelling") && q.includes("dwelling")) score += 50;
    if (clean.includes("recalculate") && q.includes("recalculate")) score += 50;
    if (clean.includes("paying monthly") || clean.includes("paying in full")) score += 50;
    if (clean.includes("underwriter") && (q.includes("underwriting") || q.includes("underwriters") || q.includes("midvale"))) score += 50;

    if (score > bestScore) {
      bestScore = score;
      bestFAQ = faq;
    }
  }

  // Require high threshold so out-of-scope queries return null
  if (bestScore >= 40) return bestFAQ;
  return null;
}

function addMessage(sender, text, quickReplies = [], toolAction = null) {
  state.advisor.messages.push({
    id: "m-" + Date.now(),
    sender,
    text,
    quickReplies,
    toolAction,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  });
  renderAdvisorMessages();
}

function renderAdvisorMessages() {
  const container = document.getElementById("advisor-messages-list");
  if (!container) return;

  container.innerHTML = state.advisor.messages.map(m => {
    const isUser = m.sender === "user";
    return `
      <div class="flex flex-col ${isUser ? "items-end" : "items-start"} mb-3">
        <div class="${isUser ? "bg-[#002F6C] text-white rounded-2xl rounded-tr-xs" : "bg-white text-slate-800 border border-slate-200 rounded-2xl rounded-tl-xs shadow-xs"} px-4 py-2.5 max-w-[88%] text-xs leading-relaxed">
          <div class="flex justify-between items-start gap-2">
            <span>${m.text}</span>
            ${!isUser ? `
              <button onclick="speakVoice('${m.text.replace(/'/g, "\\'")}')" class="text-slate-400 hover:text-blue-600 p-0.5 shrink-0" title="Listen with Natural Female Voice">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
              </button>
            ` : ""}
          </div>
        </div>
        <span class="text-[10px] text-slate-400 px-1 mt-0.5">${m.time}</span>
        ${m.quickReplies && m.quickReplies.length > 0 ? `
          <div class="flex flex-wrap gap-1.5 mt-1.5">
            ${m.quickReplies.map(qr => `
              <button onclick="handleUserPrompt('${qr.replace(/'/g, "\\'")}')" class="text-[11px] bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 px-2.5 py-1 rounded-full font-medium transition">
                ${qr}
              </button>
            `).join("")}
          </div>
        ` : ""}
      </div>
    `;
  }).join("");

  setTimeout(() => {
    container.scrollTop = container.scrollHeight;
  }, 50);
}

function getSmartNextSuggestions(topicOrKey = "", query = "") {
  const clean = (topicOrKey || query || "").toLowerCase();

  if (clean.includes("bodily") || clean.includes("liability") || clean.includes("100/300") || clean.includes("um") || clean.includes("uim") || clean.includes("property_damage")) {
    return [
      "🚗 How much liability coverage do I need?",
      "🛡️ What is Comprehensive vs Collision?",
      "💰 How to choose deductible ($500 vs $1,000)?",
      "🔗 How much do I save by bundling?"
    ];
  }

  if (clean.includes("comprehensive") || clean.includes("collision") || clean.includes("deductible") || clean.includes("physical_damage")) {
    return [
      "🚘 What is Loan or Lease (Gap) coverage?",
      "🛞 What is Emergency Roadside Assistance (ERA)?",
      "🔄 How do I recalculate rate after changing deductible?",
      "💵 Monthly installments vs paying in full?"
    ];
  }

  if (clean.includes("gap") || clean.includes("roadside") || clean.includes("era") || clean.includes("oem") || clean.includes("rental") || clean.includes("pip") || clean.includes("medical")) {
    return [
      "✨ What is New Car Replacement?",
      "🩺 What is Medical Expense / PIP?",
      "🔄 How do I recalculate my updated rate?",
      "📞 Speak with an Agent"
    ];
  }

  if (clean.includes("dwelling") || clean.includes("structures") || clean.includes("personal_property") || clean.includes("loss_of_use") || clean.includes("replacement_cost") || clean.includes("coverage_a")) {
    return [
      "🏠 Replacement Cost vs Depreciated Value?",
      "🌪️ What is Wind/Hail Deductible?",
      "💧 What is Water Backup coverage?",
      "🔌 What is Service Line coverage?"
    ];
  }

  if (clean.includes("water_backup") || clean.includes("service_line") || clean.includes("equipment") || clean.includes("mold") || clean.includes("earthquake") || clean.includes("ordinance")) {
    return [
      "⚡ What is Equipment Breakdown?",
      "🛡️ Extended Replacement Cost (25% or 50%)?",
      "🔗 How does bundling auto and home save money?",
      "📞 Speak with an Agent"
    ];
  }

  if (clean.includes("bundl") || clean.includes("rate") || clean.includes("underwrit") || clean.includes("dnq") || clean.includes("payment") || clean.includes("quote") || clean.includes("leave")) {
    return [
      "🏢 Who underwrites APEX Auto and Home?",
      "💳 What payment methods are accepted?",
      "💾 Is my quote saved if I leave the page?",
      "✅ Next steps to finalize quote"
    ];
  }

  if (clean.includes("agent") || clean.includes("human") || clean.includes("escalat") || clean.includes("call") || clean.includes("claim")) {
    return [
      "📞 Call 1-800-MY-AMFAM (1-800-692-6326)",
      "📅 Schedule Agent Callback",
      "🚗 Return to Auto Coverages",
      "🏠 Return to Home Coverages"
    ];
  }

  return [
    "🚗 What is Bodily Injury 100/300?",
    "🛡️ How do I choose between $500 and $1,000 deductible?",
    "🏠 What is Water Backup coverage?",
    "🔗 How much do I save by bundling?"
  ];
}

// ESCALATION MODAL HANDLERS
function openClickToCallModal() {
  const modal = document.getElementById("click-to-call-modal");
  if (modal) modal.classList.remove("hidden");
}

function closeClickToCallModal() {
  const modal = document.getElementById("click-to-call-modal");
  if (modal) modal.classList.add("hidden");
}

function openScheduleCallbackModal() {
  const modal = document.getElementById("schedule-callback-modal");
  if (modal) modal.classList.remove("hidden");
}

function closeScheduleCallbackModal() {
  const modal = document.getElementById("schedule-callback-modal");
  if (modal) modal.classList.add("hidden");
}

function submitCallbackRequest() {
  const name = document.getElementById("cb-name")?.value || "Sarah Jenkins";
  const phone = document.getElementById("cb-phone")?.value || "(608) 555-0194";
  const time = document.getElementById("cb-time")?.value || "Afternoon (12:00 PM - 4:00 PM CST)";
  
  closeScheduleCallbackModal();
  
  const confirmMsg = `✅ Priority callback scheduled! A licensed American Family specialist will call ${name} at ${phone} during the ${time} window with your quote details (Ref: #AF-98421-WI) ready.`;
  addMessage("agent", confirmMsg, getSmartNextSuggestions("escalation"));
  if (state.voice.isVoiceMode) speakVoice(confirmMsg);
  logTelemetryEvent("scheduled_callback_submitted", { name, time });
}

// User Prompt Handler — Direct Integration with Live CXAS Agent
async function handleUserPrompt(text) {
  if (!text || !text.trim()) return;
  const q = text.trim();

  state.session.faqsAskedCount++;
  logTelemetryEvent("user_message_sent", { query: q });

  if (q.includes("Voice Mode") || q.includes("Talk to Advisor")) {
    if (!state.voice.isVoiceMode) toggleVoiceMode();
    return;
  }

  if (q.includes("Call 1-800") || q.includes("Call Now")) {
    openClickToCallModal();
    return;
  }

  if (q.includes("Schedule Agent Callback") || q.includes("Schedule Callback")) {
    openScheduleCallbackModal();
    return;
  }

  toggleAdvisor(true);
  addMessage("user", q);

  const lower = q.toLowerCase();
  const isEscalation = lower.includes("agent") || lower.includes("human") || lower.includes("call") || lower.includes("speak") || lower.includes("commercial") || lower.includes("claim");

  const cannedEscalation = "I am connecting you with a licensed American Family Insurance specialist right now to assist you with your specific request. You can also call 1-800-MYAMFAM (1-800-692-6326).";

  const widget = document.getElementById("amfam-ces-widget") || document.querySelector("chat-messenger");
  if (widget && typeof widget.open === "function") {
    widget.open();
    if (typeof widget.renderCustomText === "function") {
      widget.renderCustomText(q, true);
    }
  }

  // Try calling the live CXAS agent on GCP or backend server
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: state.session.id,
        message: q
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.status === "success" && data.reply) {
        const matchedKey = data.tool_calls?.[0]?.args?.question_key || (isEscalation ? "agent" : q);
        const smartSuggestions = getSmartNextSuggestions(matchedKey, q);

        addMessage("agent", data.reply, smartSuggestions);
        if (widget && typeof widget.renderCustomText === "function") {
          widget.renderCustomText(data.reply, false);
        }
        if (state.voice.isVoiceMode) speakVoice(data.reply);
        return;
      }
    }
  } catch (err) {
    console.warn("Live CXAS API call failed, using deterministic in-browser engine:", err);
  }

  // Fallback to local deterministic FAQ engine
  if (isEscalation) {
    addMessage("agent", cannedEscalation, getSmartNextSuggestions("agent", q));
    if (widget && typeof widget.renderCustomText === "function") {
      widget.renderCustomText(cannedEscalation, false);
    }
    if (state.voice.isVoiceMode) speakVoice(cannedEscalation);
    return;
  }

  const match = searchFAQ(q);
  if (match) {
    addMessage("agent", match.answer, getSmartNextSuggestions(match.question_key || match.category, q));
    if (widget && typeof widget.renderCustomText === "function") {
      widget.renderCustomText(match.answer, false);
    }
    if (state.voice.isVoiceMode) speakVoice(match.answer);
  } else {
    addMessage("agent", cannedEscalation, getSmartNextSuggestions("agent", q));
    if (widget && typeof widget.renderCustomText === "function") {
      widget.renderCustomText(cannedEscalation, false);
    }
    if (state.voice.isVoiceMode) speakVoice(cannedEscalation);
  }
}

// =========================================================================
// MULTI-VIEW NAVIGATION & VIEWPORT EMULATOR
// =========================================================================

function setView(viewName) {
  state.currentView = viewName;
  const views = ["home", "quote", "cuj", "faqs", "telemetry"];
  
  views.forEach(v => {
    const el = document.getElementById("view-" + v);
    if (el) {
      if (v === viewName) {
        el.classList.remove("hidden");
      } else {
        el.classList.add("hidden");
      }
    }

    const navBtn = document.getElementById("nav-btn-" + v);
    if (navBtn) {
      if (v === viewName) {
        navBtn.className = "nav-tab-btn px-3 py-2 rounded-xl transition bg-[#002F6C] text-white font-bold";
      } else {
        navBtn.className = "nav-tab-btn px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition font-semibold";
      }
    }

    const mobBtn = document.getElementById("mob-nav-" + v);
    if (mobBtn) {
      if (v === viewName) {
        mobBtn.className = "px-2.5 py-1.5 rounded-lg font-bold bg-[#002F6C] text-white whitespace-nowrap";
      } else {
        mobBtn.className = "px-2.5 py-1.5 rounded-lg font-semibold text-slate-600 whitespace-nowrap";
      }
    }
  });

  if (viewName === "quote") renderQuoteUI();
  if (viewName === "cuj") initCUJStudio();
  if (viewName === "faqs") renderFAQDirectory();
  if (viewName === "telemetry") renderTelemetryUI();

  window.scrollTo({ top: 0, behavior: "smooth" });
  logTelemetryEvent("view_switched", { view: viewName });
}

function setViewport(mode) {
  state.viewport = mode;
  const wrapper = document.getElementById("app-viewport-wrapper");
  const notch = document.getElementById("mobile-notch-el");
  const modes = ["desktop", "tablet", "mobile"];

  modes.forEach(m => {
    const btn = document.getElementById("vp-btn-" + m);
    if (btn) {
      if (m === mode) {
        btn.className = "px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-600 text-white transition flex items-center gap-1";
      } else {
        btn.className = "px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-300 hover:text-white transition flex items-center gap-1";
      }
    }
  });

  if (!wrapper) return;

  wrapper.classList.remove("viewport-mobile-frame", "viewport-tablet-frame");
  if (notch) notch.classList.add("hidden");

  if (mode === "mobile") {
    wrapper.classList.add("viewport-mobile-frame");
    if (notch) notch.classList.remove("hidden");
  } else if (mode === "tablet") {
    wrapper.classList.add("viewport-tablet-frame");
  }

  logTelemetryEvent("viewport_changed", { mode });
}

// =========================================================================
// QUOTE CONFIGURATOR & RATE RECALCULATION
// =========================================================================

function renderQuoteUI() {
  let monthly = 142.00;

  if (state.quote.auto.bodilyInjury === "50/100") monthly -= 8.00;
  if (state.quote.auto.bodilyInjury === "250/500") monthly += 12.00;

  if (state.quote.auto.collisionDeductible === 250) monthly += 9.00;
  if (state.quote.auto.collisionDeductible === 1000) monthly -= 11.00;

  if (state.quote.auto.comprehensiveDeductible === 250) monthly += 4.00;
  if (state.quote.auto.comprehensiveDeductible === 1000) monthly -= 5.00;

  if (state.quote.auto.gapCoverage) monthly += 5.00;
  if (state.quote.auto.oemParts) monthly += 6.00;

  if (state.quote.home.extendedReplacement === "50%") monthly += 4.50;
  if (state.quote.home.waterBackup === 25000) monthly += 8.00;
  if (state.quote.home.waterBackup === 0) monthly -= 4.00;

  state.quote.billing.calculatedMonthly = Math.max(89.00, monthly);
  state.quote.billing.annualTotal = state.quote.billing.calculatedMonthly * 12;

  const rateEl = document.getElementById("quote-monthly-rate");
  const fullEl = document.getElementById("quote-full-rate");
  const dirtyBadge = document.getElementById("quote-dirty-badge");
  const calcBtn = document.getElementById("calc-rate-btn");

  if (rateEl) rateEl.innerText = `$${state.quote.billing.calculatedMonthly.toFixed(2)}`;
  if (fullEl) fullEl.innerText = `$${(state.quote.billing.annualTotal - 124.00).toFixed(2)}`;

  if (dirtyBadge && calcBtn) {
    if (state.quote.billing.dirty) {
      dirtyBadge.classList.remove("hidden");
      calcBtn.classList.add("animate-bounce");
    } else {
      dirtyBadge.classList.add("hidden");
      calcBtn.classList.remove("animate-bounce");
    }
  }
}

function recalculateQuoteRate() {
  state.quote.billing.dirty = false;
  state.session.rateCalcCount++;
  renderQuoteUI();
  
  populateChatBubble();
  const rateMsg = `🔄 Rate recalculation complete! Your updated total is $${state.quote.billing.calculatedMonthly.toFixed(2)}/month (or $${(state.quote.billing.annualTotal - 124.00).toFixed(2)}/year in full). This includes your $297.00 Multi-Policy Bundle Discount.`;
  addMessage("agent", rateMsg, [
    "Review & Bind Policy",
    "What is the difference between paying monthly and in full?",
    "Explain my coverage limits"
  ]);
  if (state.voice.isVoiceMode) speakVoice(rateMsg);
  logTelemetryEvent("rate_recalculated", { newMonthlyRate: state.quote.billing.calculatedMonthly });
}

// =========================================================================
// BEHAVIORAL FRICTION INTERCEPTION & RUM TELEMETRY
// =========================================================================

function logTelemetryEvent(eventType, payload = {}) {
  const evt = {
    id: "evt-" + Date.now(),
    type: eventType,
    time: new Date().toLocaleTimeString(),
    sessionId: state.session.id,
    view: state.currentView,
    payload
  };
  state.session.events.unshift(evt);
  if (state.session.events.length > 50) state.session.events.pop();
  renderTelemetryUI();
}

function triggerProactiveAdvisor(frictionType, label) {
  state.session.advisorTriggerCount++;
  populateChatBubble();

  let msg = "";
  let quickReplies = [];

  if (frictionType === "dead_click") {
    state.session.deadClickCount++;
    msg = `💡 I noticed you are looking closely at **${label}**. Would you like me to explain what this limit covers and how it protects your assets?`;
    quickReplies = [
      "🚗 What is Bodily Injury 100/300?",
      "🛡️ How much liability coverage do I need?",
      "📞 Speak with an Agent"
    ];
  } else if (frictionType === "dwell_time") {
    msg = `⏱️ It looks like you have been reviewing your coverage options for a few moments. Can I help clarify the trade-offs between deductibles or optional riders?`;
    quickReplies = [
      "💰 $500 vs $1,000 deductible trade-off",
      "💧 What is Water Backup coverage?",
      "🚘 What is Loan or Lease (Gap) coverage?"
    ];
  }

  addMessage("agent", msg, quickReplies);
  if (state.voice.isVoiceMode) speakVoice(msg);
  logTelemetryEvent("proactive_trigger", { frictionType, label });
}

function recordDeadClick(label) {
  state.session.deadClickCount++;
  logTelemetryEvent("dead_click_intercepted", { element: label });
  triggerProactiveAdvisor("dead_click", label);
}

function renderTelemetryUI() {
  const dwellEl = document.getElementById("stat-dwell-time");
  const dcEl = document.getElementById("stat-dead-clicks");
  const advEl = document.getElementById("stat-advisor-triggers");
  const faqEl = document.getElementById("stat-faqs-asked");
  const rateEl = document.getElementById("stat-rate-calcs");
  const streamEl = document.getElementById("telemetry-event-stream");

  if (dwellEl) dwellEl.innerText = `${state.session.dwellSeconds}s`;
  if (dcEl) dcEl.innerText = state.session.deadClickCount;
  if (advEl) advEl.innerText = state.session.advisorTriggerCount;
  if (faqEl) faqEl.innerText = state.session.faqsAskedCount;
  if (rateEl) rateEl.innerText = state.session.rateCalcCount;

  if (streamEl) {
    streamEl.innerHTML = state.session.events.map(e => `
      <div class="flex justify-between items-center p-2 rounded-xl bg-white border border-slate-200 text-[11px] font-mono">
        <span class="text-blue-900 font-bold">${e.time} • ${e.type}</span>
        <span class="text-slate-500 truncate max-w-xs">${JSON.stringify(e.payload)}</span>
      </div>
    `).join("") || `<div class="text-slate-400 p-4 text-center">No telemetry events recorded yet.</div>`;
  }
}

// Track dwell seconds on active session
setInterval(() => {
  state.session.dwellSeconds++;
  const dwellEl = document.getElementById("stat-dwell-time");
  if (dwellEl) dwellEl.innerText = `${state.session.dwellSeconds}s`;
}, 1000);

// =========================================================================
// CUJ INTERACTIVE STUDIO RUNNER
// =========================================================================

async function initCUJStudio() {
  if (!state.cuj.list || state.cuj.list.length === 0) {
    try {
      const res = await fetch("data/cujs.json");
      state.cuj.list = await res.json();
    } catch (e) {
      console.warn("Could not load cujs.json, using defaults");
    }
  }

  const selector = document.getElementById("cuj-selector");
  if (selector && state.cuj.list && state.cuj.list.length > 0) {
    selector.innerHTML = state.cuj.list.map(c => `
      <option value="${c.id}" ${c.id === state.cuj.activeId ? "selected" : ""}>${c.id}: ${c.title}</option>
    `).join("");
  }

  selectCUJ(state.cuj.activeId);
}

function selectCUJ(id) {
  state.cuj.activeId = id;
  const cuj = state.cuj.list.find(c => c.id === id);
  if (!cuj) return;

  const selector = document.getElementById("cuj-selector");
  if (selector) selector.value = id;

  const detailCard = document.getElementById("cuj-detail-card");
  if (detailCard) {
    detailCard.innerHTML = `
      <div class="space-y-6">
        <div class="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
          <div class="flex justify-between items-start">
            <div>
              <span class="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-900 text-white">${cuj.id}</span>
              <h3 class="text-xl font-extrabold text-[#002F6C] mt-2">${cuj.title}</h3>
            </div>
            <button onclick="runCUJSimulation('${cuj.id}')" class="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition transform active:scale-95 flex items-center gap-1.5">
              <span>▶️ Run Simulation in Advisor</span>
            </button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div class="bg-white p-3 rounded-xl border border-slate-200">
              <span class="text-slate-500 font-bold block text-[10px] uppercase">Persona</span>
              <span class="font-semibold text-slate-900">${cuj.persona}</span>
            </div>
            <div class="bg-white p-3 rounded-xl border border-slate-200">
              <span class="text-slate-500 font-bold block text-[10px] uppercase">Friction Point</span>
              <span class="font-semibold text-red-700">${cuj.friction_point}</span>
            </div>
            <div class="bg-white p-3 rounded-xl border border-slate-200">
              <span class="text-slate-500 font-bold block text-[10px] uppercase">Interception Trigger</span>
              <span class="font-semibold text-blue-900">${cuj.trigger}</span>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <h4 class="text-sm font-bold text-slate-800">Synthesized Turn-by-Turn Dialogue Stream</h4>
          <div class="space-y-3">
            ${cuj.dialogue.map((step, idx) => {
              const isAgent = step.type === "agent";
              const isUser = step.type === "user";
              let bgClass = isAgent ? "bg-blue-50/70 border-blue-200" : isUser ? "bg-white border-slate-300" : "bg-slate-50 border-slate-200";
              let roleBadge = isAgent ? "🤖 Digital Advisor (AmFam CXAS)" : isUser ? "👤 Customer" : "⚡ System Trigger";
              let badgeStyle = isAgent ? "bg-blue-900 text-white" : isUser ? "bg-slate-800 text-white" : "bg-red-100 text-red-800";

              return `
                <div class="border ${bgClass} rounded-2xl p-4 space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${badgeStyle}">${roleBadge}</span>
                    <span class="text-[10px] text-slate-400 font-mono">Turn ${idx + 1}</span>
                  </div>
                  <p class="text-xs text-slate-800 font-medium leading-relaxed">${step.text}</p>
                  ${step.tool_call ? `
                    <div class="bg-blue-900/10 border border-blue-300 rounded-xl p-2.5 text-[11px] font-mono text-blue-950 flex items-center gap-2">
                      <span class="font-bold">⚡ Tool Executed:</span>
                      <code>${step.tool_call.name}(${JSON.stringify(step.tool_call.params || {})})</code>
                    </div>
                  ` : ""}
                  ${step.action ? `
                    <div class="text-[11px] font-bold text-red-700">Action: ${step.action}</div>
                  ` : ""}
                </div>
              `;
            }).join("")}
          </div>
        </div>
      </div>
    `;
  }
}

function runCUJSimulation(id) {
  const cuj = state.cuj.list.find(c => c.id === id);
  if (!cuj) return;

  populateChatBubble();
  resetSession();

  let delay = 300;
  cuj.dialogue.forEach((step, i) => {
    setTimeout(() => {
      if (step.type === "agent") {
        addMessage("agent", step.text, step.quick_replies || getSmartNextSuggestions(id));
        if (i === 1 && state.voice.isVoiceMode) speakVoice(step.text);
      } else if (step.type === "user") {
        addMessage("user", step.text);
      }
    }, delay);
    delay += 950;
  });

  logTelemetryEvent("cuj_simulation_executed", { cujId: id });
}

// =========================================================================
// FAQ KNOWLEDGE DIRECTORY
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
        <button onclick="populateChatBubble(); handleUserPrompt('${faq.question.replace(/'/g, "\\\'")}');" class="text-blue-600 hover:text-blue-800 text-[11px] font-bold shrink-0">
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

// Interactive Coverage Explainer
function explainCoverage(term) {
  populateChatBubble();
  handleUserPrompt(term);
}

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

  populateChatBubble();
  setTimeout(() => {
    const bindMsg = `🎉 Congratulations ${signerName}! Your American Family Auto & Home bundle policy (Ref: #AF-849204-TX) has been successfully bound. Your coverage begins at 12:01 AM on September 1, 2026.`;
    addMessage("agent", bindMsg, [
      "Download Policy Deck PDF",
      "View MyAmFam ID Cards",
      "What is paperless auto-pay?"
    ]);
    if (state.voice.isVoiceMode) speakVoice(bindMsg);
  }, 400);

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

  state.advisor.messages = getFreshSessionGreeting();
  renderAdvisorMessages();

  initFemaleVoice();
  initSpeechRecognition();
  startBubbleCountdown();
}

window.addEventListener("DOMContentLoaded", init);
