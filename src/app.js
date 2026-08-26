/**
 * American Family Insurance - Official Finalization Page & Digital Coverage Advisor
 * With 5-Second Automated Glowing & Jumping Chat Bubble
 */

// Application State
const state = {
  // Chat Bubble State
  bubble: {
    isPopulated: false,
    isOpen: true, // Default open or toggleable, pops up with animation at 5s
    countdownSeconds: 5,
    timerId: null,
    isVoiceMode: false,
    isSpeaking: false
  },

  // Policy Finalization Model (Jane M. Doe - Austin, TX)
  policy: {
    quoteRef: "#AF-849204-TX",
    status: "Ready to Bind",
    effectiveDate: "September 1, 2026",
    customer: "Jane M. Doe",
    address: "1428 Elm Ridge Ct, Austin, TX 78701",
    auto: {
      vehicle: "2023 Honda CR-V EX-L",
      vin: "7FA...901",
      bodilyInjury: "$250k/$500k",
      propertyDamage: "$100k",
      comprehensiveDeductible: "$500",
      collisionDeductible: "$500",
      termPremium: 642.00,
      termMonths: 6
    },
    home: {
      type: "Homeowners (HO-3)",
      location: "1428 Elm Ridge Ct, Austin, TX",
      dwellingA: "$450k",
      personalLiability: "$300k",
      windHail: "1% ($4,500)",
      allPeril: "$1,500",
      waterBackup: "$25,000",
      termPremium: 1280.00,
      termMonths: 12
    },
    discounts: [
      { name: "Multi-Policy Bundle Discount (Auto + Home)", amount: -184.00 },
      { name: "Paperless & Autopay Enrollment", amount: -45.00 },
      { name: "Safe Driver (KnowYourDrive) & Home Security", amount: -68.00 }
    ],
    billing: {
      totalAnnualCost: 2271.00,
      frequency: "Monthly Installments",
      dueToday: 189.25,
      monthlyDraft: 189.25,
      firstDraftDate: "Oct 1, 2026",
      paymentMethod: "Visa ending in 4821"
    }
  },

  // Initial Advisor Messages Matching Screenshot & Customer FAQ Ground Truth
  advisor: {
    messages: [
      {
        id: "msg-1",
        sender: "user",
        text: "What is Bodily Injury 100/300?",
        time: "09:40 PM"
      },
      {
        id: "msg-2",
        sender: "agent",
        text: "The first number ($100,000) is the maximum paid per person injured; the second ($300,000) is the maximum paid per accident regardless of how many people are injured.",
        time: "09:40 PM",
        quickReplies: [
          "🚗 What is Bodily Injury 100/300?",
          "🛡️ How to choose deductible?",
          "🏠 What is Water Backup?",
          "📞 Speak with an Agent"
        ]
      },
      {
        id: "msg-3",
        sender: "user",
        text: "What is OEM Parts coverage?",
        time: "09:47 PM"
      },
      {
        id: "msg-4",
        sender: "agent",
        text: "OEM (Original Equipment Manufacturer) Parts coverage ensures your vehicle is repaired using factory-original parts rather than aftermarket alternatives. It is available for vehicles generally up to 11 model years old and requires Comprehensive or Collision coverage.",
        time: "09:47 PM",
        quickReplies: [
          "What is Loan or Lease (Gap) coverage?",
          "How to choose $500 vs $1000 deductible?",
          "Why is 1% Wind/Hail required?"
        ]
      }
    ]
  },

  faqs: []
};

// Web Audio Soft Chime Generator
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
  } catch (e) {
    console.log("AudioContext note", e);
  }
}

// 5-Second Automated Timer for Glow & Jump
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

  const button = document.getElementById('chat-bubble-button');
  const panel = document.getElementById('advisor-chat-panel');
  const callout = document.getElementById('chat-callout-teaser');

  if (button) {
    button.classList.add('bubble-enter', 'bubble-glowing', 'bubble-jumping');
  }

  // Open advisor panel automatically at 5 seconds with animation
  toggleAdvisor(true);
  playSoftChime();
  console.log("AmFam Digital Coverage Advisor chat bubble successfully triggered at 5.0 seconds!");
}

function resetBubbleTimer() {
  state.bubble.isPopulated = false;
  state.bubble.isOpen = false;
  
  const panel = document.getElementById('advisor-chat-panel');
  const button = document.getElementById('chat-bubble-button');

  if (panel) panel.classList.add('hidden');
  if (button) button.classList.remove('bubble-glowing', 'bubble-jumping');

  startBubbleCountdown();
}

// Toggle Advisor Panel
function toggleAdvisor(forceOpen = null) {
  const panel = document.getElementById('advisor-chat-panel');
  const button = document.getElementById('chat-bubble-button');

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

// Spoken Voice Normalization & TTS
function normalizeVoice(text) {
  let res = text;
  res = res.replace(/\$([0-9,]+)/g, (m, p1) => parseInt(p1.replace(/,/g, ''), 10).toLocaleString() + " dollars");
  res = res.replace(/100\/300/g, "one hundred over three hundred thousand");
  res = res.replace(/250\/500/g, "two hundred fifty over five hundred thousand");
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

  container.innerHTML = state.advisor.messages.map(m => {
    const isUser = m.sender === 'user';
    return `
      <div class="flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-3">
        <div class="${isUser ? 'bg-[#002F6C] text-white rounded-2xl rounded-tr-xs' : 'bg-white text-slate-800 border border-slate-200 rounded-2xl rounded-tl-xs shadow-xs'} px-4 py-2.5 max-w-[88%] text-xs leading-relaxed">
          <div class="flex justify-between items-start gap-2">
            <span>${m.text}</span>
            ${!isUser ? `
              <button onclick="speakVoice('${m.text.replace(/'/g, "\\'")}')" class="text-slate-400 hover:text-blue-600 p-0.5 shrink-0" title="Listen with Spoken Voice">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
              </button>
            ` : ''}
          </div>
          ${m.toolAction ? `
            <div class="mt-2 pt-2 border-t border-slate-100 text-[10px] font-mono text-blue-700 bg-blue-50 p-1.5 rounded">
              ⚡ ${m.toolAction}
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

  // Ensure advisor is open
  toggleAdvisor(true);

  addMessage('user', q);

  // Check for Human Escalation
  const lower = q.toLowerCase();
  if (lower.includes('agent') || lower.includes('human') || lower.includes('call') || lower.includes('speak') || lower.includes('commercial')) {
    setTimeout(() => {
      const resp = "I can connect you directly with a licensed American Family Insurance agent right now. Click below to call 1-800-MY-AMFAM (1-800-692-6326) or request a priority callback.";
      addMessage('agent', resp, ["📞 Call 1-800-MY-AMFAM", "Schedule Agent Callback", "Review Coverage Finalization"], "Action: trigger_escalation (1-800-692-6326)");
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
        "What is Water Backup?",
        "Speak with an Agent"
      ], `FAQ: ${match.category} • ${match.subcategory}`);
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

// Interactive Coverage Explainer Launcher (For Finalization Table items)
function explainCoverage(term) {
  toggleAdvisor(true);
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

  // Trigger Advisor Congratulations message
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

  renderAdvisorMessages();
  startBubbleCountdown();
}

window.addEventListener('DOMContentLoaded', init);
