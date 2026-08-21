const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const teaseMsg = document.getElementById("teaseMsg");
const btnRow = document.getElementById("btnRow");
const planForm = document.getElementById("planForm");
const dateInput = document.getElementById("dateInput");
const placeInput = document.getElementById("placeInput");
const confirmDate = document.getElementById("confirmDate");
const confirmPlace = document.getElementById("confirmPlace");
const restartBtn = document.getElementById("restartBtn");
const whatsappBtn = document.getElementById("whatsappBtn");
const telegramBtn = document.getElementById("telegramBtn");

/* ── WhatsApp settings ─────────────────────────────────
   Put your phone number here (with country code, digits only,
   e.g. "919876543210") so the message opens directly in YOUR chat.
   Leave it as "" to pick the chat manually in WhatsApp. */
const WHATSAPP_NUMBER = "";

const screens = {
  question: document.getElementById("screen-question"),
  plan: document.getElementById("screen-plan"),
  confirm: document.getElementById("screen-confirm"),
};

function showScreen(name) {
  Object.values(screens).forEach((s) => s.classList.remove("active"));
  screens[name].classList.add("active");
}

/* ---------- Screen 1: runaway No button ---------- */
const teases = [
  "Nope! Try again 😜",
  "The button is too shy 🙈",
  "Wrong button, cutie! 💅",
  "Nice try~ but nope 😚",
  "It's evading you on purpose 😹",
  "There's only one right answer 💖",
  "Catch me if you can! 🏃‍♀️💨",
  "Okay okay, just click Yes already 🥺",
];

let teaseIndex = 0;
let runCount = 0;

function pointerPos(e) {
  if (e.touches && e.touches.length) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  return { x: e.clientX ?? -9999, y: e.clientY ?? -9999 };
}

function moveNoButton(e) {
  const pad = 16;
  const btnW = noBtn.offsetWidth || 120;
  const btnH = noBtn.offsetHeight || 50;

  // first escape: move OUT of the card into <body>, otherwise the card's
  // backdrop-filter + overflow clip the fixed-positioned button (it vanishes)
  if (!noBtn.classList.contains("runaway")) {
    const rect = noBtn.getBoundingClientRect();
    document.body.appendChild(noBtn);
    noBtn.classList.add("runaway");
    noBtn.style.top = rect.top + "px";
    noBtn.style.left = rect.left + "px";
  }

  const maxX = Math.max(window.innerWidth - btnW - pad, pad);
  const maxY = Math.max(window.innerHeight - btnH - pad, pad);

  const p = pointerPos(e);

  // pick a spot that's far away from the cursor
  let x = maxX / 2;
  let y = maxY / 2;
  for (let i = 0; i < 12; i++) {
    x = pad + Math.random() * (maxX - pad);
    y = pad + Math.random() * (maxY - pad);
    if (Math.hypot(p.x - x, p.y - y) > 180) break;
  }

  noBtn.style.left = x + "px";
  noBtn.style.top = y + "px";

  teaseMsg.textContent = teases[teaseIndex % teases.length];
  teaseIndex++;
  runCount++;

  // shrink + tilt while fleeing; Yes grows more confident!
  const shrink = Math.max(0.55, 1 - runCount * 0.05);
  const tilt = (Math.random() * 24 - 12).toFixed(1);
  noBtn.style.transform = `rotate(${tilt}deg) scale(${shrink})`;
  yesBtn.style.transform = `scale(${Math.min(1.35, 1 + runCount * 0.05)})`;
}

["mouseenter", "touchstart", "click"].forEach((evt) => {
  noBtn.addEventListener(evt, (e) => {
    e.preventDefault();
    moveNoButton(e);
  });
});

// also flee when the pointer gets close (desktop hover sneak attacks)
document.addEventListener("mousemove", (e) => {
  if (!noBtn.classList.contains("runaway")) return;
  const r = noBtn.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
  if (dist < 90) moveNoButton(e);
});

function resetNoButton() {
  noBtn.classList.remove("runaway");
  noBtn.style.cssText = "";
  runCount = 0;
  teaseIndex = 0;
  teaseMsg.textContent = "";
  yesBtn.style.transform = "";
  btnRow.appendChild(noBtn);
}

yesBtn.addEventListener("click", () => {
  resetNoButton();
  setMinDate();
  showScreen("plan");
});

/* ---------- Screen 2: planning ---------- */
function setMinDate() {
  const today = new Date();
  const iso = today.toISOString().split("T")[0];
  dateInput.min = iso;
  dateInput.value = iso;
}

/* ---------- WhatsApp message ---------- */
let lastWhatsappMessage = "";

function buildWhatsappMessage(dateStr, place) {
  return [
    "💌 *IT'S A DATE — OFFICIALLY!* 💌",
    "",
    "Yayyy!! I said YES! 🥰",
    "Here's our magical date, all planned by me:",
    "",
    `🗓️ *When:* ${dateStr}`,
    `📍 *Where:* ${place}`,
    "",
    "✨ Dress code: your adorable self",
    "🦋 Vibe: butterflies, giggles & zero chill",
    "🍰 PS: dessert is on YOU — no escape 😌",
    "",
    "Attendance is mandatory — my heart insists 💘",
    "",
    "See you there~ 🐾💕",
  ].join("\n");
}

function openWhatsapp(message) {
  const base = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}`
    : "https://api.whatsapp.com/send";
  window.open(`${base}?text=${encodeURIComponent(message)}`, "_blank");
}

function openTelegram(message) {
  window.open(
    `https://t.me/share/url?url=${encodeURIComponent(" ")}&text=${encodeURIComponent(message)}`,
    "_blank"
  );
}

planForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const picked = new Date(dateInput.value + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!dateInput.value || picked < today) {
    teaseMsg.textContent = "";
    alert("Please pick a date that's today or in the future! 🗓️💕");
    return;
  }

  const formatted = picked.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  confirmDate.textContent = formatted;
  confirmPlace.textContent = placeInput.value.trim() || "Somewhere magical ✨";

  lastWhatsappMessage = buildWhatsappMessage(formatted, confirmPlace.textContent);

  showScreen("confirm");
  launchConfettiHearts();
});

whatsappBtn.addEventListener("click", () => {
  if (lastWhatsappMessage) openWhatsapp(lastWhatsappMessage);
});

telegramBtn.addEventListener("click", () => {
  if (lastWhatsappMessage) openTelegram(lastWhatsappMessage);
});

/* ---------- Screen 3 ---------- */
restartBtn.addEventListener("click", () => {
  placeInput.value = "";
  resetNoButton();
  showScreen("question");
});

/* ---------- floating hearts ---------- */
const heartsBg = document.getElementById("heartsBg");
const floatChars = [
  "💗", "💖", "💕", "💞",
  "🧸", "🐰", "🐻", "🐼", "🦄", "🐷", "🐥",
  "🌸", "🎀",
];

function spawnHeart() {
  const h = document.createElement("span");
  h.className = "heart";
  h.textContent = floatChars[Math.floor(Math.random() * floatChars.length)];
  h.style.left = Math.random() * 100 + "vw";
  h.style.fontSize = 14 + Math.random() * 22 + "px";
  const dur = 6 + Math.random() * 8;
  h.style.animationDuration = dur + "s";
  h.style.animationDelay = Math.random() * 4 + "s";
  heartsBg.appendChild(h);
  setTimeout(() => h.remove(), (dur + 5) * 1000);
}

setInterval(spawnHeart, 900);
for (let i = 0; i < 8; i++) spawnHeart();

function launchConfettiHearts() {
  for (let i = 0; i < 25; i++) setTimeout(spawnHeart, i * 80);
}
