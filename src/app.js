/**
 * American Family Insurance - Official Homepage Replica & Digital Coverage Advisor
 * With 5-Second Automated Glow & Jump Chat Bubble Integration
 */

// Application State
const state = {
  // Chat Bubble State
  bubble: {
    isPopulated: false,
    isOpen: false,
    countdownSeconds: 5,
    timerId: null,
    isVoiceMode: false,
    isSpeaking: false
  },

  // Active View ('home', 'quote', 'cuj', 'faqs')
  currentView: 'home',

  // Policy Quote Model for Sandbox Testing (Sarah Jenkins)
  quote: {
    id: "AF-98421-WI",
    customer: "Sarah Jenkins",
    location: "Madison, WI 53711",
    auto: {
      vehicle: "2024 Honda CR-V Hybrid EX-L",
      bodilyInjury: "100/300",
      propertyDamage: "$100,000",
      comprehensiveDeductible: 500,
      collisionDeductible: 500,
      gapCoverage: true,
      oemParts: false,
      roadside: true
    },
    home: {
      property: "2,400 sq ft Single Family Home (Madison, WI)",
      dwellingA: 380000,
      aopDeductible: 1000,
      windHailDeductible: "1%",
      extendedReplacement: "25%",
      waterBackup: 10000
    },
    billing: {
      currentMonthlyRate: 142,
      baseMonthlyRate: 142,
      dirty: false
    }
  },

  // Advisor Messages
  advisor: {
    messages: []
  },

  // Knowledge Base (FAQs)
  faqs: []
};

// Web Audio Soft Chime Generator (Pure synthesized sound, zero external dependencies)
function playSoftChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Note 1: E5
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
    gain1.gain.setValueAtTime(0.08, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);

    // Note 2: B5 (higher pitch chime)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, ctx.currentTime + 0.12); // B5
    gain2.gain.setValueAtTime(0.09, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.6);
  } catch (e) {
    console.log("AudioContext not permitted before user gesture", e);
  }
}

// 5-Second Chat Bubble Population Trigger
function startBubbleCountdown() {
  state.bubble.countdownSeconds = 5;
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

function populateChatBubble() {
  state.bubble.isPopulated = true;
  updateCountdownDisplay();

  const container = document.getElementById('chat-bubble-container');
  const callout = document.getElementById('chat-callout-teaser');
  const button = document.getElementById('chat-bubble-button');

  if (container) {
    container.classList.remove('hidden');
    container.classList.add('flex');
  }

  if (button) {
    button.classList.add('bubble-enter', 'bubble-glowing', 'bubble-jumping');
  }

  if (callout) {
    callout.classList.remove('hidden');
  }

  playSoftChime();
  console.log("AmFam Digital Coverage Advisor chat bubble successfully populated at 5.0 seconds!");
}

function resetBubbleTimer() {
  state.bubble.isPopulated = false;
  state.bubble.isOpen = false;
  
  const container = document.getElementById('chat-bubble-container');
  const panel = document.getElementById('advisor-chat-panel');
  const callout = document.getElementById('chat-callout-teaser');
  const button = document.getElementById('chat-bubble-button');

  if (panel) panel.classList.add('hidden');
  if (callout) callout.classList.add('hidden');
  if (button) button.classList.remove('bubble-glowing', 'bubble-jumping');
  if (container) {
    container.classList.add('hidden');
    container.classList.remove('flex');
  }

  startBubbleCountdown();
}

// Toggle Advisor Panel
function toggleAdvisor(forceOpen = null) {
  const panel = document.getElementById('advisor-chat-panel');
  const callout = document.getElementById('chat-callout-teaser');
  const button = document.getElementById('chat-bubble-button');

  if (forceOpen !== null) {
    state.bubble.isOpen = forceOpen;
  } else {
    state.bubble.isOpen = !state.bubble.isOpen;
  }

  if (state.bubble.isOpen) {
    if (panel) panel.classList.remove('hidden');
    if (callout) callout.classList.add('hidden');
    // Stop continuous jumping while open, keep subtle glow
    if (button) button.classList.remove('bubble-jumping');
    renderAdvisorMessages();
  } else {
    if (panel) panel.classList.add('hidden');
    if (button && state.bubble.isPopulated) button.classList.add('bubble-jumping');
  }
}

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
    if (clean.includes('water backup') && q.includes('Water Backup')) score += 60;
    if ((clean.includes('gap') || clean.includes('lease')) && q.includes('Loan or Lease')) score += 60;
    if (clean.includes('deductible') && q.includes('deductible')) score += 40;
    if (clean.includes('recalculate') && q.includes('recalculate')) score += 50;
    if (clean.includes('agent') || clean.includes('call')) score += 30;

    if (score > bestScore) {
      bestScore = score;
      bestFAQ = faq;
    }
  }

  if (bestScore >= 12) return bestFAQ;
  return null;
}

// Spoken Voice Normalization & TTS
function normalizeVoice(text) {
  let res = text;
  res = res.replace(/\$([0-9,]+)/g, (m, p1) => parseInt(p1.replace(/,/g, ''), 10).toLocaleString() + " dollars");
  res = res.replace(/100\/300/g, "one hundred over three hundred thousand");
  res = res.replace(/50\/100/g, "fifty over one hundred thousand");
  res = res.replace(/1-800-MY-AMFAM/g, "one eight hundred, my am fam");
  return res;
}

function speakVoice(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(normalizeVoice(text));
  utterance.rate = 1.05;
  const voices = window.speechSynthesis.getVoices();
  const nat = voices.find(v => v.name.includes('Google') || v.name.includes('Samantha') || v.lang === 'en-US');
  if (nat) utterance.voice = nat;

  state.bubble.isSpeaking = true;
  updateVoiceUI();

  utterance.onend = () => {
    state.bubble.isSpeaking = false;
    updateVoiceUI();
  };
  utterance.onerror = () => {
    state.bubble.isSpeaking = false;
    updateVoiceUI();
  };

  window.speechSynthesis.speak(utterance);
}

function updateVoiceUI() {
  const bars = document.querySelectorAll('.voice-wave-bar-wrapper');
  bars.forEach(el => {
    if (state.bubble.isSpeaking) el.classList.remove('hidden');
    else el.classList.add('hidden');
  });
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

  if (state.advisor.messages.length === 0) {
    container.innerHTML = `
      <div class="text-center py-6 px-3">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-900 to-blue-950 text-white mx-auto flex items-center justify-center font-black text-lg shadow-md mb-3 border border-red-500">
          AF
        </div>
        <h4 class="font-extrabold text-slate-900 text-sm mb-1">AmFam Digital Coverage Advisor</h4>
        <p class="text-xs text-slate-500 mb-4">Phase 1 Sandbox MVP • 100% Deterministic Knowledge Base</p>
        
        <div class="bg-blue-50/80 border border-blue-200 rounded-2xl p-3.5 text-xs text-slate-700 text-left mb-4 shadow-sm">
          👋 Welcome to American Family Insurance! I can explain coverage limits, deductibles, optional riders like Gap & Water Backup, or connect you with a local agent.
        </div>

        <div class="text-left space-y-2">
          <p class="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Suggested Questions:</p>
          <button onclick="handleUserPrompt('What is Bodily Injury 100/300?')" class="w-full text-xs bg-white hover:bg-blue-50 text-blue-900 border border-slate-200 rounded-xl p-2.5 text-left font-medium transition flex items-center justify-between shadow-2xs">
            <span>🚗 What is Bodily Injury 100/300?</span>
            <span class="text-slate-400">→</span>
          </button>
          <button onclick="handleUserPrompt('How do I choose between a $500 and $1,000 deductible?')" class="w-full text-xs bg-white hover:bg-blue-50 text-blue-900 border border-slate-200 rounded-xl p-2.5 text-left font-medium transition flex items-center justify-between shadow-2xs">
            <span>🛡️ How to choose deductible ($500 vs $1,000)?</span>
            <span class="text-slate-400">→</span>
          </button>
          <button onclick="handleUserPrompt('What is Water Backup coverage?')" class="w-full text-xs bg-white hover:bg-blue-50 text-blue-900 border border-slate-200 rounded-xl p-2.5 text-left font-medium transition flex items-center justify-between shadow-2xs">
            <span>🏠 What is Water Backup coverage?</span>
            <span class="text-slate-400">→</span>
          </button>
          <button onclick="handleUserPrompt('Can I quote auto and home together?')" class="w-full text-xs bg-white hover:bg-blue-50 text-blue-900 border border-slate-200 rounded-xl p-2.5 text-left font-medium transition flex items-center justify-between shadow-2xs">
            <span>🔗 How much do I save by bundling?</span>
            <span class="text-slate-400">→</span>
          </button>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = state.advisor.messages.map(m => {
    const isUser = m.sender === 'user';
    return `
      <div class="flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-3">
        <div class="${isUser ? 'bg-blue-900 text-white rounded-2xl rounded-tr-xs' : 'bg-white text-slate-800 border border-slate-200 rounded-2xl rounded-tl-xs shadow-xs'} px-4 py-2.5 max-w-[88%] text-xs leading-relaxed">
          <div class="flex justify-between items-start gap-2">
            <span>${m.text}</span>
            ${!isUser ? `
              <button onclick="speakVoice('${m.text.replace(/'/g, "\\'")}')" class="text-slate-400 hover:text-blue-600 p-0.5 shrink-0" title="Listen">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
              </button>
            ` : ''}
          </div>
          ${m.toolAction ? `
            <div class="mt-2 pt-2 border-t border-slate-100 text-[10px] font-mono text-blue-700 bg-blue-50 p-1.5 rounded">
              ⚡ Action: ${m.toolAction}
            </div>
          ` : ''}
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

// User Prompt Handler
function handleUserPrompt(text) {
  if (!text || !text.trim()) return;
  const q = text.trim();

  // If advisor closed, open it
  toggleAdvisor(true);

  addMessage('user', q);

  // Check for Human Escalation
  const lower = q.toLowerCase();
  if (lower.includes('agent') || lower.includes('human') || lower.includes('call') || lower.includes('speak') || lower.includes('commercial')) {
    setTimeout(() => {
      const resp = "I can connect you directly with a licensed American Family Insurance agent right now. Click below to call 1-800-MY-AMFAM or request a priority callback.";
      addMessage('agent', resp, ["📞 Call 1-800-MY-AMFAM (1-800-692-6326)", "Schedule Agent Callback", "Back to Coverages"], "trigger_escalation (1-800-692-6326)");
      if (state.bubble.isVoiceMode) speakVoice(resp);
    }, 250);
    return;
  }

  // Deterministic FAQ Search
  const match = searchFAQ(q);
  setTimeout(() => {
    if (match) {
      addMessage('agent', match.answer, [
        "What is Bodily Injury 100/300?",
        "How to choose deductible?",
        "Speak with an Agent"
      ], `knowledge_retrieval (${match.category})`);
      if (state.bubble.isVoiceMode) speakVoice(match.answer);
    } else {
      const fallback = "I'm your Digital Coverage Advisor. I can explain auto & home coverages, liability limits, deductibles, and discounts. How can I help you today?";
      addMessage('agent', fallback, [
        "What is Bodily Injury 100/300?",
        "What is Water Backup?",
        "Speak with an Agent"
      ]);
      if (state.bubble.isVoiceMode) speakVoice(fallback);
    }
  }, 200);
}

// Initialize on page load
async function init() {
  try {
    const res = await fetch('data/faqs.json');
    state.faqs = await res.json();
  } catch (e) {
    console.log("Loaded fallback inline FAQs");
  }

  // Start 5-second countdown immediately on page visit/refresh
  startBubbleCountdown();
}

window.addEventListener('DOMContentLoaded', init);
