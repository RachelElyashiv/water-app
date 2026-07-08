const URINE_COLORS = ["#F9F8EC","#F6F3C9","#F3EDA6","#EFE382","#EAD35B","#DDB63C","#C89226","#A96E1B"];
const HE_DAYS = ["א׳","ב׳","ג׳","ד׳","ה׳","ו׳","ש׳"];
const CIRC = 2 * Math.PI * 77;

let state = { goal_ml: 3000, days: {}, name: "", cups: [200,330,500,750],
  reminder_enabled: false, reminder_interval_min: 120, reminder_start: 8, reminder_end: 22 };
let today = { drinks: [], urine: [], pain: [] };
let editCups = [];
let authMode = "login";

const $ = (id) => document.getElementById(id);
const todayKey = () => new Date().toISOString().slice(0, 10);
const fmtL = (ml) => (ml / 1000).toFixed(ml % 1000 === 0 ? 1 : 2);
const getDay = (k) => Object.assign({ intake: 0, urine: [], pain: [] }, state.days[k] || {});
const fmtTime = (ts) => new Date(ts).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });

// ---------- api ----------
async function api(path, method = "GET", body) {
  const opts = { method, headers: {} };
  if (body !== undefined) { opts.headers["Content-Type"] = "application/json"; opts.body = JSON.stringify(body); }
  const res = await fetch("/api" + path, opts);
  let data = {};
  try { data = await res.json(); } catch {}
  if (!res.ok) throw new Error(data.error || "שגיאה בשרת");
  return data;
}

// ---------- toast ----------
let toastTimer = null;
function ping(msg) {
  const t = $("toast");
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
}

// ---------- auth ----------
function setAuthMode(mode) {
  authMode = mode;
  $("sw-login").classList.toggle("active", mode === "login");
  $("sw-register").classList.toggle("active", mode === "register");
  $("name-field").classList.toggle("hidden", mode === "login");
  $("au-submit").textContent = mode === "login" ? "התחברות" : "הרשמה";
  $("au-name").required = mode === "register";
  $("au-error").textContent = "";
  $("au-password").setAttribute("autocomplete", mode === "login" ? "current-password" : "new-password");
}
async function submitAuth(e) {
  e.preventDefault();
  $("au-error").textContent = "";
  const payload = { email: $("au-email").value, password: $("au-password").value, name: $("au-name").value };
  try { const { user } = await api("/" + authMode, "POST", payload); onLoggedIn(user); }
  catch (err) { $("au-error").textContent = err.message; }
  return false;
}
async function logout() { await api("/logout", "POST"); location.reload(); }

function applyUser(user) {
  Object.assign(state, {
    name: user.name, goal_ml: user.goal_ml, cups: user.cups,
    reminder_enabled: user.reminder_enabled, reminder_interval_min: user.reminder_interval_min,
    reminder_start: user.reminder_start, reminder_end: user.reminder_end,
  });
}
function onLoggedIn(user) {
  applyUser(user);
  $("auth-screen").classList.add("hidden");
  $("app-screen").classList.remove("hidden");
  $("userName").textContent = user.name;
  loadData();
}

// ---------- data ----------
async function loadData() {
  const [summary, todayData] = await Promise.all([api("/summary"), api("/today")]);
  state.goal_ml = summary.goal_ml;
  state.days = summary.days;
  today = todayData;
  render();
}

async function addDrink(ml) { await api("/drinks", "POST", { ml }); ping(`נוספו ${ml} מ״ל`); await loadData(); }
async function undoDrink() { await api("/drinks/last", "DELETE"); ping("הרישום האחרון בוטל"); await loadData(); }
async function delEntry(table, id) { await api(`/${table}/${id}`, "DELETE"); ping("הרישום נמחק"); await loadData(); }
async function logUrine(color) {
  await api("/urine", "POST", { color });
  ping(color <= 3 ? "צבע תקין — המשך כך" : "צבע כהה — כדאי לשתות עכשיו");
  await loadData();
}
function togglePain(open) {
  $("painForm").classList.toggle("hidden", !open);
  $("painOpenBtn").classList.toggle("hidden", open);
}
async function logPain() {
  const level = +$("painRange").value;
  const note = $("painNote").value.trim();
  await api("/pain", "POST", { level, note });
  $("painNote").value = ""; $("painRange").value = 5; $("painLevelLabel").textContent = "5";
  togglePain(false); ping("אירוע הכאב תועד"); await loadData();
}
async function saveGoal() {
  const goal = parseInt($("goalInput").value, 10);
  const data = await api("/goal", "PUT", { goal_ml: goal });
  state.goal_ml = data.goal_ml; ping("היעד עודכן"); render();
}

// ---------- settings: cups ----------
function renderCupsEditor() {
  const box = $("cupsEditor");
  box.innerHTML = "";
  editCups.forEach((ml, i) => {
    const chip = document.createElement("div");
    chip.className = "cup-chip";
    chip.innerHTML = `<span>${ml} מ״ל</span>`;
    const x = document.createElement("button");
    x.textContent = "×"; x.title = "הסר";
    x.onclick = () => { editCups.splice(i, 1); renderCupsEditor(); };
    chip.appendChild(x);
    box.appendChild(chip);
  });
}
function addCup() {
  const v = parseInt($("newCup").value, 10);
  if (!v || v <= 0 || v > 3000) { ping("הכנס גודל תקין (עד 3000 מ״ל)"); return; }
  if (editCups.length >= 8) { ping("עד 8 גדלים"); return; }
  editCups.push(v); editCups = [...new Set(editCups)].sort((a, b) => a - b);
  $("newCup").value = ""; renderCupsEditor();
}
async function saveCups() {
  if (!editCups.length) { ping("צריך לפחות גודל אחד"); return; }
  const { user } = await api("/settings", "PUT", { cups: editCups, ...reminderPayload() });
  applyUser(user); ping("גדלי הכוסות נשמרו"); render();
}

// ---------- settings: reminders ----------
function reminderPayload() {
  return {
    reminder_enabled: $("remEnabled").checked,
    reminder_interval_min: parseInt($("remInterval").value, 10),
    reminder_start: parseInt($("remStart").value, 10),
    reminder_end: parseInt($("remEnd").value, 10),
  };
}
async function saveReminders() {
  const payload = reminderPayload();
  if (payload.reminder_enabled) {
    const ok = await enablePush();
    if (!ok) { $("remEnabled").checked = false; return; }
  }
  const { user } = await api("/settings", "PUT", { cups: editCups, ...payload });
  applyUser(user);
  ping("התזכורות נשמרו");
  render();
}

function urlBase64ToUint8Array(base64) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}
async function enablePush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    $("remNote").textContent = "הדפדפן הזה אינו תומך בתזכורות דחיפה."; return false;
  }
  const perm = await Notification.requestPermission();
  if (perm !== "granted") { $("remNote").textContent = "כדי לקבל תזכורות יש לאשר התראות בדפדפן."; return false; }
  const reg = await navigator.serviceWorker.ready;
  const { key } = await api("/vapidPublicKey");
  let sub = await reg.pushManager.getSubscription();
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(key) });
  await api("/push/subscribe", "POST", sub.toJSON());
  $("remNote").textContent = "התזכורות פעילות ✓";
  return true;
}

function renderSettings() {
  $("goalInput").value = state.goal_ml;
  editCups = [...state.cups];
  renderCupsEditor();
  $("remEnabled").checked = state.reminder_enabled;
  $("remInterval").value = state.reminder_interval_min;
  $("remStart").value = state.reminder_start;
  $("remEnd").value = state.reminder_end;
}

// ---------- tabs ----------
function setTab(id) {
  ["today", "trends", "report", "settings"].forEach((t) => {
    $("view-" + t).classList.toggle("hidden", t !== id);
    $("tab-" + t).classList.toggle("active", t === id);
  });
  if (id === "settings") renderSettings();
  render();
}

function lastNDays(n) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const dt = new Date(); dt.setDate(dt.getDate() - i);
    const k = dt.toISOString().slice(0, 10);
    const d = getDay(k);
    out.push({ key: k, dow: HE_DAYS[dt.getDay()], intake: d.intake, urine: d.urine, pain: d.pain });
  }
  return out;
}

// ---------- render ----------
function render() {
  const GOAL = state.goal_ml;
  $("dateLabel").textContent = new Date().toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" });
  $("goalSub").textContent = `היעד היומי: ${fmtL(GOAL)} ליטר צריכה — בהתאם להנחיה הרפואית שקיבלת`;
  $("ringGoal").textContent = `מתוך ${fmtL(GOAL)} ליטר`;

  // cups (dynamic)
  const cupsRow = $("cupsRow");
  cupsRow.innerHTML = "";
  const cupLabel = (ml) => (ml <= 250 ? "כוס" : ml <= 400 ? "פחית" : ml <= 600 ? "בקבוק" : "בקבוק גדול");
  state.cups.forEach((ml) => {
    const b = document.createElement("button");
    b.innerHTML = `<div class="ml">${ml} מ״ל</div><div class="lbl">${cupLabel(ml)}</div>`;
    b.onclick = () => addDrink(ml);
    cupsRow.appendChild(b);
  });

  const t = getDay(todayKey());
  const intake = t.intake;
  const pct = Math.min(intake / GOAL, 1);

  const ring = $("ringFill");
  ring.setAttribute("stroke-dasharray", `${pct * CIRC} ${CIRC - pct * CIRC}`);
  ring.setAttribute("stroke", pct >= 1 ? "var(--good)" : "var(--water)");
  $("ringVal").textContent = fmtL(intake);
  $("ringDone").classList.toggle("hidden", pct < 1);

  const undo = $("undoBtn");
  if (intake > 0) { undo.classList.remove("hidden"); undo.textContent = "ביטול הרישום האחרון"; }
  else undo.classList.add("hidden");

  renderTimeline();

  const last = t.urine.length ? t.urine[t.urine.length - 1].color : null;
  const row = $("urineRow");
  row.innerHTML = "";
  URINE_COLORS.forEach((col, i) => {
    const b = document.createElement("button");
    b.style.background = col;
    b.setAttribute("aria-label", `צבע ${i + 1}`);
    if (last === i + 1) b.classList.add("sel");
    b.onclick = () => logUrine(i + 1);
    row.appendChild(b);
  });
  const msg = $("urineMsg");
  if (last) {
    msg.classList.remove("hidden");
    msg.style.color = last <= 3 ? "var(--good)" : "var(--amber)";
    msg.textContent = last <= 3 ? "מצוין — רמת ההידרציה טובה" : last <= 5 ? "בינוני — הוסף כוס מים בשעה הקרובה" : "כהה — שתה 500 מ״ל בהקדם";
  } else msg.classList.add("hidden");

  const ps = $("painSummary");
  if (t.pain.length) {
    ps.classList.remove("hidden");
    ps.textContent = `תועדו היום ${t.pain.length} אירועים (עוצמה אחרונה: ${t.pain[t.pain.length - 1].level})`;
  } else ps.classList.add("hidden");

  // week chart
  const week = lastNDays(7);
  const chart = $("weekChart");
  const scaleMax = Math.max(4000, GOAL + 1000);
  chart.innerHTML = `<div class="goal-line" style="bottom:${150 * (GOAL / scaleMax)}px"></div>`;
  week.forEach((d) => {
    const h = Math.max(Math.min(d.intake / scaleMax, 1) * 150, 3);
    const color = d.intake === 0 ? "var(--line)" : d.intake >= GOAL ? "var(--good)" : "var(--water)";
    const col = document.createElement("div");
    col.className = "bar-col";
    col.innerHTML = `<div class="bar-val">${d.intake ? fmtL(d.intake) : ""}</div>
      <div class="bar" style="height:${h}px;background:${color}"></div>
      <div class="bar-day">${d.dow}</div>`;
    chart.appendChild(col);
  });

  // month stats + report
  const month = lastNDays(30);
  const active = month.filter((d) => d.intake > 0);
  const avg = active.length ? Math.round(active.reduce((s, d) => s + d.intake, 0) / active.length) : 0;
  const goalDays = month.filter((d) => d.intake >= GOAL).length;
  const painEvents = month.reduce((s, d) => s + d.pain.length, 0);
  const uAll = month.flatMap((d) => d.urine.map((u) => u.color));
  const avgU = uAll.length ? (uAll.reduce((s, c) => s + c, 0) / uAll.length).toFixed(1) : null;

  $("monthStats").innerHTML = [
    { v: active.length ? fmtL(avg) + " ל׳" : "—", l: "צריכה יומית ממוצעת" },
    { v: goalDays + "/30", l: "ימים בהם הושג היעד" },
    { v: avgU ?? "—", l: "צבע שתן ממוצע (1–8)" },
    { v: painEvents, l: "אירועי כאב" },
  ].map((s) => `<div class="stat"><div class="v">${s.v}</div><div class="l">${s.l}</div></div>`).join("");

  window._report =
`דוח הידרציה — 30 הימים האחרונים
שם: ${state.name}
תאריך הפקה: ${new Date().toLocaleDateString("he-IL")}
ימי תיעוד: ${active.length}
צריכה יומית ממוצעת: ${fmtL(avg)} ליטר (יעד: ${fmtL(GOAL)} ל׳)
ימים בהם הושג היעד: ${goalDays} מתוך 30
צבע שתן ממוצע (סולם 1–8): ${avgU ?? "לא תועד"}
אירועי כאב שתועדו: ${painEvents}`;
  $("reportText").textContent = window._report;
}

function renderTimeline() {
  const box = $("timeline");
  const items = [
    ...today.drinks.map((d) => ({ ts: d.ts, table: "drinks", id: d.id, icon: "💧", text: `${d.ml} מ״ל` })),
    ...today.urine.map((u) => ({ ts: u.ts, table: "urine", id: u.id, icon: "🎨", text: `צבע שתן ${u.color}` })),
    ...today.pain.map((p) => ({ ts: p.ts, table: "pain", id: p.id, icon: "⚠️", text: `כאב ${p.level}/10${p.note ? " · " + p.note : ""}` })),
  ].sort((a, b) => b.ts - a.ts);

  if (!items.length) { box.innerHTML = `<div class="tl-empty">עדיין אין רישומים היום</div>`; return; }
  box.innerHTML = "";
  items.forEach((it) => {
    const r = document.createElement("div");
    r.className = "tl-row";
    r.innerHTML = `<span class="tl-icon">${it.icon}</span>
      <span class="tl-text">${it.text}</span>
      <span class="tl-time">${fmtTime(it.ts)}</span>`;
    const del = document.createElement("button");
    del.className = "tl-del"; del.textContent = "מחק"; del.title = "מחיקה";
    del.onclick = () => delEntry(it.table, it.id);
    r.appendChild(del);
    box.appendChild(r);
  });
}

function copyReport() {
  if (navigator.clipboard) navigator.clipboard.writeText(window._report).then(() => ping("הדוח הועתק"));
  else ping("ההעתקה אינה נתמכת בדפדפן זה — סמן והעתק ידנית");
}

// ---------- boot ----------
if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});

(async function init() {
  try { const { user } = await api("/me"); onLoggedIn(user); }
  catch { $("auth-screen").classList.remove("hidden"); setAuthMode("login"); }
})();
