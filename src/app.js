/**
 * American Family Insurance - Official Finalization Page & Digital Coverage Advisor
 * Features:
 * - Fresh Session & Greeting on every Browser Refresh / Load
 * - Chat Bubble starts HIDDEN on load; Populates only after 10s countdown or when triggered
 * - Interactive Back-and-Forth Voice Mode (Speech Recognition STT + Natural Female Voice TTS)
 * - Microphone Mute / Unmute Toggle
 * - Session & Conversation Reset
 * - Policy Finalization Data perfectly aligned with AmFam FAQs (BI 100/300, etc.)
 */

// Application State
const state = {
  session: {
    id: "SES-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
    startTime: new Date().toLocaleTimeString()
  },

  // Chat Bubble State
  bubble: {
    isPopulated: false,
    isOpen: false, // Starts CLOSED & HIDDEN on page refresh
    countdownSeconds: 10, // 10-second timer
    timerId: null
  },

  // Voice Functionality State
  voice: {
    isVoiceMode: false,
    isListening: false,
    isSpeaking: false,
    isMuted: false,
    recognition: null,
    selectedVoice: null,
    interimText: ""
  },

  // Policy Finalization Model (Aligned strictly with Customer FAQs)
  policy: {
    quoteRef: "#AF-849204-TX",
    status: "Ready to Bind",
    effectiveDate: "September 1, 2026",
    customer: "Jane M. Doe",
    address: "1428 Elm Ridge Ct, Austin, TX 78701",
    auto: {
      vehicle: "2023 Honda CR-V EX-L",
      vin: "7FA...901",
      bodilyInjury: "$100,000 / $300,000 (100/300)", // Exactly matches FAQ
      propertyDamage: "$100,000",
      comprehensiveDeductible: "$500", // Exactly matches FAQ
      collisionDeductible: "$500", // Exactly matches FAQ
      uninsuredMotorist: "$100,000 / $300,000 (UM/UIM)",
      gapCoverage: "Included ($5/mo)",
      oemParts: "Included ($6/mo)",
      roadside: "Included (Costco Exec / AmFam)",
      termPremium: 584.00,
      termMonths: 6
    },
    home: {
      type: "Homeowners (HO-3)",
      location: "1428 Elm Ridge Ct, Austin, TX",
      dwellingA: "$380,000 (Coverage A - Replacement Cost)", // Exactly matches FAQ
      otherStructuresB: "$38,000 (10% of Dwelling)", // Exactly matches FAQ
      personalPropertyC: "$190,000 (50% Replacement Cost)", // Exactly matches FAQ
      lossOfUseD: "$150,000 (Standard Limit)", // Exactly matches FAQ
      personalLiabilityE: "$300,000", // Exactly matches FAQ
      medPaymentsF: "$3,000", // Exactly matches FAQ
      windHail: "1% of Dwelling ($3,800)", // Exactly matches FAQ
      allPeril: "$1,000 (AOP)", // Exactly matches FAQ
      waterBackup: "$10,000 Limit", // Exactly matches FAQ
      extendedReplacement: "25% Buffer ($95,000 Extra)", // Exactly matches FAQ
      termPremium: 1120.00,
      termMonths: 12
    },
    discounts: [
      { name: "Multi-Policy Bundle Discount (Auto + Home)", amount: -184.00 },
      { name: "Paperless & Autopay Enrollment", amount: -45.00 },
      { name: "Safe Driver (KnowYourDrive) & Home Security", amount: -68.00 }
    ],
    billing: {
      totalAnnualCost: 1704.00,
      frequency: "Monthly Installments",
      dueToday: 142.00,
      monthlyDraft: 142.00,
      payInFullOption: 1580.00,
      firstDraftDate: "Oct 1, 2026",
      paymentMethod: "Visa ending in 4821"
    }
  },

  // Advisor Messages
  advisor: {
    messages: []
  },

  faqs: []
};

// Initial Fresh Session Greeting
function getFreshSessionGreeting() {
  return [
    {
      id: "msg-welcome",
      sender: "agent",
      text: "👋 Hi there! I'm your American Family Digital Coverage Advisor. How can I help you today? Ask me any question about auto & home coverage limits, deductibles, optional add-ons, or multi-policy bundling.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickReplies: [
        "🚗 What is Bodily Injury 100/300?",
        "🛡️ How do I choose between $500 and $1,000 deductible?",
        "🏠 What is Water Backup coverage?",
        "🎙️ Talk to Advisor (Voice Mode)"
      ]
    }
  ];
}

// Web Audio Chime Generator
function playSoftChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Note 1: E5
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
    gain1.gain.setValueAtTime(0.08, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);

    // Note 2: B5
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0.09, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.6);
  } catch (e) {}
}

// 10-Second Automated Timer for Glow & Jump
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
  const cdEl = document.getElementById('bubble-timer-badge');
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

// Populate Chat Bubble (Triggered after 10s or on user click)
function populateChatBubble() {
  state.bubble.isPopulated = true;
  updateCountdownDisplay();

  const container = document.getElementById('chat-bubble-container');
  const button = document.getElementById('chat-bubble-button');

  if (container) {
    container.classList.remove('hidden');
    container.classList.add('flex');
  }

  if (button) {
    button.classList.add('bubble-enter', 'bubble-glowing', 'bubble-jumping');
  }

  toggleAdvisor(true);
  playSoftChime();
  console.log("AmFam Digital Coverage Advisor chat bubble populated at 10.0 seconds with fresh session: " + state.session.id);
}

function resetBubbleTimer() {
  state.bubble.isPopulated = false;
  state.bubble.isOpen = false;
  
  const container = document.getElementById('chat-bubble-container');
  const panel = document.getElementById('advisor-chat-panel');
  const button = document.getElementById('chat-bubble-button');

  if (panel) panel.classList.add('hidden');
  if (button) button.classList.remove('bubble-glowing', 'bubble-jumping');
  if (container) {
    container.classList.add('hidden');
    container.classList.remove('flex');
  }

  startBubbleCountdown();
}

// Toggle Advisor Panel
function toggleAdvisor(forceOpen = null) {
  const container = document.getElementById('chat-bubble-container');
  const panel = document.getElementById('advisor-chat-panel');
  const button = document.getElementById('chat-bubble-button');

  // Ensure container is visible if opening
  if (container && forceOpen === true) {
    container.classList.remove('hidden');
    container.classList.add('flex');
  }

  if (forceOpen !== null) {
    state.bubble.isOpen = forceOpen;
  } else {
    state.bubble.isOpen = !state.bubble.isOpen;
  }

  if (state.bubble.isOpen) {
    if (panel) panel.classList.remove('hidden');
    if (button) button.classList.remove('bubble-jumping');
    renderAdvisorMessages();
  } else {
    if (panel) panel.classList.add('hidden');
    if (button && state.bubble.isPopulated) button.classList.add('bubble-jumping');
    stopSpeaking();
    stopListening();
  }
}

// RESET CONVERSATION & SESSION
function resetSession() {
  // Generate fresh session ID
  state.session.id = "SES-" + Math.random().toString(36).substring(2, 9).toUpperCase();
  state.session.startTime = new Date().toLocaleTimeString();

  // Stop active speech and listening
  stopSpeaking();
  stopListening();

  // Reset conversation to fresh initial welcome
  state.advisor.messages = [
    {
      id: "msg-reset-welcome",
      sender: "agent",
      text: "👋 Hi there! I'm your American Family Digital Coverage Advisor. How can I help you today? Ask me any question about auto & home coverage limits, deductibles, optional add-ons, or multi-policy bundling.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickReplies: [
        "🚗 What is Bodily Injury 100/300?",
        "🛡️ How do I choose between $500 and $1,000 deductible?",
        "🏠 What is Water Backup coverage?",
        "🎙️ Talk to Advisor (Voice Mode)"
      ]
    }
  ];

  renderAdvisorMessages();

  // Show visual toast confirmation
  showResetToast();
  playSoftChime();
}

function showResetToast() {
  const toast = document.getElementById('session-reset-toast');
  if (toast) {
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
  }
}

// =========================================================================
// TWO-WAY VOICE ENGINE (SPEECH RECOGNITION + NATURAL FEMALE VOICE TTS)
// =========================================================================

// Initialize Natural Female Voice
function initFemaleVoice() {
  if (!('speechSynthesis' in window)) return;

  function loadVoice() {
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    // Search for high-quality natural female voices
    const femaleVoice = voices.find(v => 
      v.name.includes("Google US English") ||
      v.name.includes("Samantha") ||
      v.name.includes("Victoria") ||
      v.name.includes("Karen") ||
      v.name.includes("Jenny") ||
      v.name.includes("Aria") ||
      v.name.includes("Zira") ||
      (v.lang.startsWith("en") && v.name.toLowerCase().includes("female"))
    ) || voices.find(v => v.lang === "en-US") || voices[0];

    state.voice.selectedVoice = femaleVoice;
    console.log("Selected Natural Female Voice:", femaleVoice ? femaleVoice.name : "Default");
  }

  loadVoice();
  window.speechSynthesis.onvoiceschanged = loadVoice;
}

// Voice Recognition (Speech-to-Text) Initialization
function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn("SpeechRecognition not supported in this browser");
    return;
  }

  const rec = new SpeechRecognition();
  rec.continuous = false;
  rec.interimResults = true;
  rec.lang = 'en-US';

  rec.onstart = () => {
    state.voice.isListening = true;
    updateVoiceUI();
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

    state.voice.interimText = interim;
    updateVoiceUI();

    if (finalTranscript.trim()) {
      state.voice.interimText = "";
      stopListening();
      handleUserPrompt(finalTranscript.trim());
    }
  };

  rec.onerror = (event) => {
    console.warn("Speech recognition error:", event.error);
    state.voice.isListening = false;
    updateVoiceUI();
  };

  rec.onend = () => {
    state.voice.isListening = false;
    updateVoiceUI();
  };

  state.voice.recognition = rec;
}

// Toggle Voice Mode (Turns Continuous Speech On / Off)
function toggleVoiceMode() {
  state.voice.isVoiceMode = !state.voice.isVoiceMode;
  
  const voiceBtn = document.getElementById('voice-mode-toggle-btn');
  if (voiceBtn) {
    if (state.voice.isVoiceMode) {
      voiceBtn.classList.add('text-emerald-400', 'bg-blue-900/60');
      voiceBtn.classList.remove('text-blue-200');
    } else {
      voiceBtn.classList.remove('text-emerald-400', 'bg-blue-900/60');
      voiceBtn.classList.add('text-blue-200');
      stopSpeaking();
      stopListening();
    }
  }

  updateVoiceUI();

  if (state.voice.isVoiceMode && !state.voice.isMuted) {
    startListening();
  }
}

// Toggle Microphone Mute / Unmute
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
  if (state.voice.isMuted || !state.voice.recognition || state.voice.isSpeaking) return;
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
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  state.voice.isSpeaking = false;
  updateVoiceUI();
}

// Speak Voice using Natural Female Voice (Text-to-Speech)
function speakVoice(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  // Stop listening while speaking to prevent echo
  stopListening();

  const utterance = new SpeechSynthesisUtterance(normalizeVoice(text));
  utterance.rate = 1.02; // Warm, polite, natural conversational pace
  utterance.pitch = 1.08; // Natural feminine pitch

  if (state.voice.selectedVoice) {
    utterance.voice = state.voice.selectedVoice;
  }

  state.voice.isSpeaking = true;
  updateVoiceUI();

  // WHEN AGENT FINISHES SPEAKING: AUTOMATICALLY RESUME LISTENING (CONTINUOUS TWO-WAY VOICE)
  utterance.onend = () => {
    state.voice.isSpeaking = false;
    updateVoiceUI();
    
    // Automatically listen for user reply if Voice Mode is on and not muted
    if (state.voice.isVoiceMode && !state.voice.isMuted) {
      setTimeout(startListening, 450);
    }
  };

  utterance.onerror = () => {
    state.voice.isSpeaking = false;
    updateVoiceUI();
  };

  window.speechSynthesis.speak(utterance);
}

// Spoken Voice Text Normalization
function normalizeVoice(text) {
  let res = text;
  res = res.replace(/\$100,000/g, "one hundred thousand dollars");
  res = res.replace(/\$300,000/g, "three hundred thousand dollars");
  res = res.replace(/\$380,000/g, "three hundred eighty thousand dollars");
  res = res.replace(/\$500/g, "five hundred dollars");
  res = res.replace(/\$1,000/g, "one thousand dollars");
  res = res.replace(/\$([0-9,]+)/g, (m, p1) => parseInt(p1.replace(/,/g, ''), 10).toLocaleString() + " dollars");
  res = res.replace(/100\/300/g, "one hundred over three hundred thousand dollars");
  res = res.replace(/1-800-MY-AMFAM/g, "one eight hundred, my am fam");
  res = res.replace(/1-800-692-6326/g, "one eight hundred, six nine two, six three two six");
  res = res.replace(/AOP/g, "All Other Perils");
  res = res.replace(/UM\/UIM/g, "Uninsured and Underinsured Motorist");
  return res;
}

// Update Voice UI Elements
function updateVoiceUI() {
  const banner = document.getElementById('voice-status-banner');
  const micBtn = document.getElementById('voice-mic-main-btn');
  const muteBtn = document.getElementById('voice-mute-btn');
  const statusText = document.getElementById('voice-status-text');
  const interimEl = document.getElementById('voice-interim-display');

  if (!banner) return;

  if (state.voice.isVoiceMode) {
    banner.classList.remove('hidden');
  } else {
    banner.classList.add('hidden');
    return;
  }

  // Update Mute Button State
  if (muteBtn) {
    if (state.voice.isMuted) {
      muteBtn.innerHTML = `🔇 <span>Unmute</span>`;
      muteBtn.className = "bg-amber-600 hover:bg-amber-700 text-white px-2 py-1 rounded text-[10px] font-bold transition flex items-center gap-1";
    } else {
      muteBtn.innerHTML = `🎙️ <span>Mute</span>`;
      muteBtn.className = "bg-blue-800 hover:bg-blue-700 text-blue-100 px-2 py-1 rounded text-[10px] font-semibold transition flex items-center gap-1";
    }
  }

  // Status Text & Visual Indicators
  if (statusText) {
    if (state.voice.isSpeaking) {
      statusText.innerHTML = `<span class="voice-bar w-1 bg-amber-400 rounded"></span><span class="voice-bar w-1 bg-amber-400 rounded"></span><span class="text-amber-300 font-semibold">Speaking response...</span>`;
    } else if (state.voice.isMuted) {
      statusText.innerHTML = `<span class="text-amber-300">🔇 Microphone Muted</span>`;
    } else if (state.voice.isListening) {
      statusText.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span><span class="text-emerald-300 font-semibold">Listening... Speak now</span>`;
    } else {
      statusText.innerHTML = `<span class="text-blue-200">Voice Mode Ready</span>`;
    }
  }

  // Mic Pulse Indicator on Main Input
  if (micBtn) {
    if (state.voice.isListening && !state.voice.isMuted) {
      micBtn.className = "p-2 rounded-xl text-white bg-emerald-600 mic-listening-active transition shrink-0 shadow-xs";
    } else if (state.voice.isMuted) {
      micBtn.className = "p-2 rounded-xl text-white bg-amber-600 transition shrink-0 shadow-xs";
    } else {
      micBtn.className = "p-2 rounded-xl text-blue-100 bg-blue-800 hover:bg-blue-700 transition shrink-0 shadow-xs";
    }
  }

  // Interim Speech Transcription Display
  if (interimEl) {
    if (state.voice.interimText) {
      interimEl.innerText = `"${state.voice.interimText}..."`;
      interimEl.classList.remove('hidden');
    } else {
      interimEl.classList.add('hidden');
    }
  }
}

// =========================================================================
// FAQ KNOWLEDGE BASE MATCHING & ADVISOR MESSAGING
// =========================================================================

// Deterministic FAQ Knowledge Base Search
function searchFAQ(query) {
  if (!query || !state.faqs || state.faqs.length === 0) return null;
  const clean = query.toLowerCase().trim();
  const tokens = clean.split(/\s+/).filter(t => t.length > 2);

  let best = null;
  let bestScore = 0;

  for (const faq of state.faqs) {
    let score = 0;
    const q = faq.question.toLowerCase();
    const a = faq.answer.toLowerCase();

    if (q === clean) return faq;
    if (q.includes(clean)) score += 50;

    tokens.forEach(t => {
      if (q.includes(t)) score += 15;
      if (a.includes(t)) score += 5;
    });

    if (clean.includes('100/300') && q.includes('100/300')) score += 60;
    if (clean.includes('bodily') && q.includes('Bodily Injury')) score += 50;
    if (clean.includes('property damage') && q.includes('Property Damage')) score += 50;
    if (clean.includes('water backup') && q.includes('Water Backup')) score += 60;
    if ((clean.includes('gap') || clean.includes('loan') || clean.includes('lease')) && q.includes('Loan or Lease')) score += 60;
    if (clean.includes('oem') && q.includes('OEM')) score += 60;
    if (clean.includes('wind') && q.includes('Wind/Hail')) score += 60;
    if (clean.includes('all-perils') || clean.includes('aop')) score += 60;
    if (clean.includes('dwelling') && q.includes('Dwelling')) score += 50;
    if (clean.includes('deductible') && q.includes('deductible')) score += 40;
    if (clean.includes('recalculate') && q.includes('recalculate')) score += 50;
    if (clean.includes('paying monthly') || clean.includes('paying in full')) score += 50;
    if (clean.includes('agent') || clean.includes('call')) score += 30;

    if (score > bestScore) {
      bestScore = score;
      bestFAQ = faq;
    }
  }

  if (bestScore >= 12) return bestFAQ;
  return null;
}

// Add Advisor Message
function addMessage(sender, text, quickReplies = [], toolAction = null) {
  state.advisor.messages.push({
    id: 'm-' + Date.now(),
    sender,
    text,
    quickReplies,
    toolAction,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });
  renderAdvisorMessages();
}

function renderAdvisorMessages() {
  const container = document.getElementById('advisor-messages-list');
  if (!container) return;

  container.innerHTML = state.advisor.messages.map(m => {
    const isUser = m.sender === 'user';
    return `
      <div class="flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-3">
        <div class="${isUser ? 'bg-[#002F6C] text-white rounded-2xl rounded-tr-xs' : 'bg-white text-slate-800 border border-slate-200 rounded-2xl rounded-tl-xs shadow-xs'} px-4 py-2.5 max-w-[88%] text-xs leading-relaxed">
          <div class="flex justify-between items-start gap-2">
            <span>${m.text}</span>
            ${!isUser ? `
              <button onclick="speakVoice('${m.text.replace(/'/g, "\\'")}')" class="text-slate-400 hover:text-blue-600 p-0.5 shrink-0" title="Listen with Natural Female Voice">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
              </button>
            ` : ''}
          </div>
        </div>
        <span class="text-[10px] text-slate-400 px-1 mt-0.5">${m.time}</span>
        ${m.quickReplies && m.quickReplies.length > 0 ? `
          <div class="flex flex-wrap gap-1.5 mt-1.5">
            ${m.quickReplies.map(qr => `
              <button onclick="handleUserPrompt('${qr.replace(/'/g, "\\'")}')" class="text-[11px] bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 px-2.5 py-1 rounded-full font-medium transition">
                ${qr}
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  setTimeout(() => {
    container.scrollTop = container.scrollHeight;
  }, 50);
}

// SMART CONTEXTUAL NEXT QUESTION SUGGESTIONS
function getSmartNextSuggestions(topicOrKey = "", query = "") {
  const clean = (topicOrKey || query || "").toLowerCase();

  // Auto Liability & Limits
  if (clean.includes("bodily") || clean.includes("liability") || clean.includes("100/300") || clean.includes("um") || clean.includes("uim") || clean.includes("property_damage")) {
    return [
      "🚗 How much liability coverage do I need?",
      "🛡️ What is Comprehensive vs Collision?",
      "💰 How to choose deductible ($500 vs $1,000)?",
      "🔗 How much do I save by bundling?"
    ];
  }

  // Physical Damage & Deductibles
  if (clean.includes("comprehensive") || clean.includes("collision") || clean.includes("deductible") || clean.includes("physical_damage")) {
    return [
      "🚘 What is Loan or Lease (Gap) coverage?",
      "🛞 What is Emergency Roadside Assistance (ERA)?",
      "🔄 How do I recalculate rate after changing deductible?",
      "💵 Monthly installments vs paying in full?"
    ];
  }

  // Auto Add-Ons & Endorsements
  if (clean.includes("gap") || clean.includes("roadside") || clean.includes("era") || clean.includes("oem") || clean.includes("rental") || clean.includes("pip") || clean.includes("medical")) {
    return [
      "✨ What is New Car Replacement?",
      "🩺 What is Medical Expense / PIP?",
      "🔄 How do I recalculate my updated rate?",
      "📞 Speak with an Agent"
    ];
  }

  // Home Core Coverages
  if (clean.includes("dwelling") || clean.includes("structures") || clean.includes("personal_property") || clean.includes("loss_of_use") || clean.includes("replacement_cost") || clean.includes("coverage_a")) {
    return [
      "🏠 Replacement Cost vs Depreciated Value?",
      "🌪️ What is Wind/Hail Deductible?",
      "💧 What is Water Backup coverage?",
      "🔌 What is Service Line coverage?"
    ];
  }

  // Home Endorsements & Perils
  if (clean.includes("water_backup") || clean.includes("service_line") || clean.includes("equipment") || clean.includes("mold") || clean.includes("earthquake") || clean.includes("ordinance")) {
    return [
      "⚡ What is Equipment Breakdown?",
      "🛡️ Extended Replacement Cost (25% or 50%)?",
      "🔗 How does bundling auto and home save money?",
      "📞 Speak with an Agent"
    ];
  }

  // Bundling, Underwriting, Billing & DNQ
  if (clean.includes("bundl") || clean.includes("rate") || clean.includes("underwrit") || clean.includes("dnq") || clean.includes("payment") || clean.includes("quote") || clean.includes("leave")) {
    return [
      "🏢 Who underwrites APEX Auto and Home?",
      "💳 What payment methods are accepted?",
      "💾 Is my quote saved if I leave the page?",
      "✅ Next steps to finalize quote"
    ];
  }

  // Human Escalation
  if (clean.includes("agent") || clean.includes("human") || clean.includes("escalat") || clean.includes("call") || clean.includes("claim")) {
    return [
      "📞 Call 1-800-MY-AMFAM (1-800-692-6326)",
      "📅 Schedule Agent Callback",
      "🚗 Return to Auto Coverages",
      "🏠 Return to Home Coverages"
    ];
  }

  // Default / Initial Welcome Suggestions
  return [
    "🚗 What is Bodily Injury 100/300?",
    "🛡️ How do I choose between $500 and $1,000 deductible?",
    "🏠 What is Water Backup coverage?",
    "🔗 How much do I save by bundling?"
  ];
}

// ESCALATION MODAL HANDLERS
function openClickToCallModal() {
  const modal = document.getElementById('click-to-call-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeClickToCallModal() {
  const modal = document.getElementById('click-to-call-modal');
  if (modal) modal.classList.add('hidden');
}

function openScheduleCallbackModal() {
  const modal = document.getElementById('schedule-callback-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeScheduleCallbackModal() {
  const modal = document.getElementById('schedule-callback-modal');
  if (modal) modal.classList.add('hidden');
}

function submitCallbackRequest() {
  const name = document.getElementById('cb-name')?.value || 'Sarah Jenkins';
  const phone = document.getElementById('cb-phone')?.value || '(608) 555-0194';
  const time = document.getElementById('cb-time')?.value || 'Afternoon (12:00 PM - 4:00 PM CST)';
  
  closeScheduleCallbackModal();
  
  const confirmMsg = `✅ Priority callback scheduled! A licensed American Family specialist will call ${name} at ${phone} during the ${time} window with your quote details (Ref: #AF-98421-WI) ready.`;
  addMessage('agent', confirmMsg, getSmartNextSuggestions('escalation'));
  if (state.voice.isVoiceMode) speakVoice(confirmMsg);
}

// User Prompt Handler — Direct Integration with Live CXAS Agent
async function handleUserPrompt(text) {
  if (!text || !text.trim()) return;
  const q = text.trim();

  // If user triggers voice mode chip
  if (q.includes("Voice Mode") || q.includes("Talk to Advisor")) {
    if (!state.voice.isVoiceMode) toggleVoiceMode();
    return;
  }

  // Intercept Click-to-Call Actions
  if (q.includes("Call 1-800") || q.includes("Call Now")) {
    openClickToCallModal();
    return;
  }

  // Intercept Schedule Callback Actions
  if (q.includes("Schedule Agent Callback") || q.includes("Schedule Callback")) {
    openScheduleCallbackModal();
    return;
  }

  toggleAdvisor(true);
  addMessage('user', q);

  // Check for Human Escalation Intent
  const lower = q.toLowerCase();
  const isEscalation = lower.includes('agent') || lower.includes('human') || lower.includes('call') || lower.includes('speak') || lower.includes('commercial') || lower.includes('claim');

  // Try calling the live CXAS agent on GCP
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: state.session.id,
        message: q
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.status === 'success' && data.reply) {
        const matchedKey = data.tool_calls?.[0]?.args?.question_key || (isEscalation ? "agent" : q);
        const smartSuggestions = getSmartNextSuggestions(matchedKey, q);

        addMessage('agent', data.reply, smartSuggestions);
        if (state.voice.isVoiceMode) speakVoice(data.reply);
        return;
      }
    }
  } catch (err) {
    console.warn("Live CXAS API call failed, using deterministic in-browser engine:", err);
  }

  // Fallback to local deterministic FAQ engine
  if (isEscalation) {
    const resp = "I can connect you directly with a licensed American Family Insurance specialist right now. You can call us at 1-800-MY-AMFAM (1-800-692-6326) or request a priority callback.";
    addMessage('agent', resp, getSmartNextSuggestions("agent", q));
    if (state.voice.isVoiceMode) speakVoice(resp);
    return;
  }

  const match = searchFAQ(q);
  if (match) {
    addMessage('agent', match.answer, getSmartNextSuggestions(match.question_key || match.category, q));
    if (state.voice.isVoiceMode) speakVoice(match.answer);
  } else {
    const fallback = "I'm your Digital Coverage Advisor. I can explain auto & home coverages, liability limits, deductibles, and discounts. How can I help you today?";
    addMessage('agent', fallback, getSmartNextSuggestions("default", q));
    if (state.voice.isVoiceMode) speakVoice(fallback);
  }
}

// Interactive Coverage Explainer Launcher (For Finalization Table items)
function explainCoverage(term) {
  // Ensure chat container is visible when user clicks an explanation
  populateChatBubble();
  handleUserPrompt(term);
}

// Confirm & Bind Policy Handler
function confirmAndBindPolicy() {
  const nameInp = document.getElementById('sig-name-input');
  const agreeCheck = document.getElementById('sig-agree-check');
  
  if (!agreeCheck.checked) {
    alert("Please check the declaration box agreeing to the Terms of Service & Electronic Delivery before binding.");
    return;
  }

  const signerName = nameInp ? nameInp.value : "Jane M. Doe";
  const modal = document.getElementById('bind-success-modal');
  const modalSigner = document.getElementById('bind-modal-signer');
  if (modalSigner) modalSigner.innerText = signerName;
  if (modal) modal.classList.remove('hidden');

  setTimeout(() => {
    addMessage('agent', `🎉 Congratulations ${signerName}! Your American Family Auto & Home bundle policy (Ref: #AF-849204-TX) has been successfully bound. Your coverage begins at 12:01 AM on September 1, 2026.`, [
      "Download Policy Deck PDF",
      "View MyAmFam ID Cards",
      "What is paperless auto-pay?"
    ]);
  }, 400);
}

function closeBindModal() {
  const modal = document.getElementById('bind-success-modal');
  if (modal) modal.classList.add('hidden');
}

// Initialize on page load
async function init() {
  try {
    const res = await fetch('data/faqs.json');
    state.faqs = await res.json();
  } catch (e) {
    console.log("Loaded fallback inline FAQs");
  }

  // Set clean initial session greeting on page load (NO technical session ID text)
  state.advisor.messages = getFreshSessionGreeting();
  renderAdvisorMessages();

  // Setup Voice Engine
  initFemaleVoice();
  initSpeechRecognition();

  // Start 5-Second Countdown
  startBubbleCountdown();
}

window.addEventListener('DOMContentLoaded', init);
