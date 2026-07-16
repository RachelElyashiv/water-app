const URINE_COLORS = ["#F9F8EC","#F6F3C9","#F3EDA6","#EFE382","#EAD35B","#DDB63C","#C89226","#A96E1B"];
const CIRC = 2 * Math.PI * 77;
const weekdayShort = (date) => new Intl.DateTimeFormat(currentLocale(), { weekday: "narrow" }).format(date);

let state = { goal_ml: 3000, days: {}, name: "", cups: [200,330,500,750],
  reminder_enabled: false, reminder_interval_min: 120, reminder_start: 8, reminder_end: 22 };
let today = { drinks: [], urine: [], pain: [] };
let editCups = [];
let authMode = "login";

const $ = (id) => document.getElementById(id);
const todayKey = () => new Date().toISOString().slice(0, 10);
const fmtL = (ml) => (ml / 1000).toFixed(ml % 1000 === 0 ? 1 : 2);
const getDay = (k) => Object.assign({ intake: 0, urine: [], pain: [] }, state.days[k] || {});
const fmtTime = (ts) => new Date(ts).toLocaleTimeString(currentLocale(), { hour: "2-digit", minute: "2-digit" });

// ---------- api ----------
async function api(path, method = "GET", body) {
  const opts = { method, headers: {} };
  if (body !== undefined) { opts.headers["Content-Type"] = "application/json"; opts.body = JSON.stringify(body); }
  const res = await fetch("/api" + path, opts);
  let data = {};
  try { data = await res.json(); } catch {}
  if (!res.ok) {
    const msg = data.code && TR["err_" + data.code] ? t("err_" + data.code) : data.error || t("err_generic");
    const err = new Error(msg);
    err.code = data.code;
    throw err;
  }
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
  $("au-submit").textContent = mode === "login" ? t("login") : t("register");
  $("au-name").required = mode === "register";
  $("au-error").textContent = "";
  $("au-password").setAttribute("autocomplete", mode === "login" ? "current-password" : "new-password");
}
async function submitAuth(e) {
  e.preventDefault();
  $("au-error").textContent = "";
  const payload = { email: $("au-email").value, password: $("au-password").value, name: $("au-name").value };
  try {
    const mode = authMode;
    const { user } = await api("/" + mode, "POST", payload);
    onLoggedIn(user);
    if (mode === "register") startOnboarding();
  } catch (err) { $("au-error").textContent = err.message; }
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

async function addDrink(ml) { await api("/drinks", "POST", { ml }); ping(t("toast_added", { ml })); await loadData(); }
async function undoDrink() { await api("/drinks/last", "DELETE"); ping(t("toast_undo")); await loadData(); }
async function delEntry(table, id) { await api(`/${table}/${id}`, "DELETE"); ping(t("toast_deleted")); await loadData(); }
async function logUrine(color) {
  await api("/urine", "POST", { color });
  ping(color <= 3 ? t("toast_urine_ok") : t("toast_urine_drk"));
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
  togglePain(false); ping(t("toast_pain")); await loadData();
}
async function saveGoal() {
  const goal = parseInt($("goalInput").value, 10);
  const data = await api("/goal", "PUT", { goal_ml: goal });
  state.goal_ml = data.goal_ml; ping(t("toast_goal")); render();
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
  if (!v || v <= 0 || v > 3000) { ping(t("cup_invalid")); return; }
  if (editCups.length >= 8) { ping(t("cup_max8")); return; }
  editCups.push(v); editCups = [...new Set(editCups)].sort((a, b) => a - b);
  $("newCup").value = ""; renderCupsEditor();
}
async function saveCups() {
  if (!editCups.length) { ping(t("cup_need_one")); return; }
  const { user } = await api("/settings", "PUT", { cups: editCups, lang: currentLang, ...reminderPayload() });
  applyUser(user); ping(t("toast_cups")); render();
}

// ---------- settings: water intake calculator ----------
let calcData = null; // { low, high, suggested } in ml
function renderCalcResult() {
  if (!calcData) return;
  $("calcRange").textContent = t("calc_result", {
    low: (calcData.low / 1000).toFixed(1),
    high: (calcData.high / 1000).toFixed(1),
  });
}
// shared hydration estimate — weight required; height/age/sex optional
function intakeRange({ weight, height = 0, age = 0, sex = "female", activity = "mid", climate = "temperate" }) {
  let bw = weight;
  if (height >= 120) {
    const ibw = (sex === "male" ? 50 : 45.5) + 0.9 * Math.max(0, height - 152); // Devine ideal weight
    if (weight > ibw) bw = ibw + 0.4 * (weight - ibw); // adjusted body weight for higher BMI
  }
  let lowF = 30, highF = 35;
  if (age >= 10) {
    if (age < 30) { lowF = 32; highF = 37; }
    else if (age < 55) { lowF = 30; highF = 35; }
    else if (age < 65) { lowF = 28; highF = 33; }
    else { lowF = 25; highF = 30; }
  }
  const actAdd = { low: 0, mid: 350, high: 700 }[activity] || 0;
  const climAdd = { temperate: 0, hot: 500 }[climate] || 0;
  const sexAdd = sex === "male" ? 250 : 0; // higher total body water in men
  const low = Math.round(bw * lowF + actAdd + climAdd + sexAdd);
  const high = Math.round(bw * highF + actAdd + climAdd + sexAdd);
  const suggested = Math.min(6000, Math.max(500, Math.round((low + high) / 2 / 100) * 100));
  return { low, high, suggested };
}

function calcIntake() {
  const w = parseInt($("calcWeight").value, 10);
  if (!w || w < 20 || w > 250) { ping(t("calc_need_weight")); return; }
  calcData = intakeRange({
    weight: w,
    height: parseInt($("calcHeight").value, 10) || 0,
    age: parseInt($("calcAge").value, 10) || 0,
    sex: $("calcSex").value,
    activity: $("calcActivity").value,
    climate: $("calcClimate").value,
  });
  renderCalcResult();
  $("calcResult").classList.remove("hidden");
}
async function applyCalcToGoal() {
  if (!calcData) return;
  $("goalInput").value = calcData.suggested;
  await saveGoal();
  // make the change unmistakable: scroll to the goal field and flash it
  const gi = $("goalInput");
  gi.scrollIntoView({ behavior: "smooth", block: "center" });
  gi.classList.remove("flash"); void gi.offsetWidth; gi.classList.add("flash");
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
  const { user } = await api("/settings", "PUT", { cups: editCups, lang: currentLang, ...payload });
  applyUser(user);
  ping(t("toast_rem"));
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
    $("remNote").textContent = t("rem_note_nosup"); return false;
  }
  const perm = await Notification.requestPermission();
  if (perm !== "granted") { $("remNote").textContent = t("rem_note_noperm"); return false; }
  const reg = await navigator.serviceWorker.ready;
  const { key } = await api("/vapidPublicKey");
  let sub = await reg.pushManager.getSubscription();
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(key) });
  await api("/push/subscribe", "POST", sub.toJSON());
  $("remNote").textContent = t("rem_note_active");
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
    out.push({ key: k, dow: weekdayShort(dt), intake: d.intake, urine: d.urine, pain: d.pain });
  }
  return out;
}

// ---------- render ----------
function render() {
  const GOAL = state.goal_ml;
  $("dateLabel").textContent = new Date().toLocaleDateString(currentLocale(), { weekday: "long", day: "numeric", month: "long" });
  $("goalSub").textContent = t("goal_sub", { goal: fmtL(GOAL) });
  $("ringGoal").textContent = t("ring_of", { goal: fmtL(GOAL) });

  // cups (dynamic)
  const cupsRow = $("cupsRow");
  cupsRow.innerHTML = "";
  const cupLabel = (ml) => (ml <= 250 ? t("cup_glass") : ml <= 400 ? t("cup_can") : ml <= 600 ? t("cup_bottle") : t("cup_bottle_lg"));
  state.cups.forEach((ml) => {
    const b = document.createElement("button");
    b.innerHTML = `<div class="ml">${ml} ${t("ml")}</div><div class="lbl">${cupLabel(ml)}</div>`;
    b.onclick = () => addDrink(ml);
    cupsRow.appendChild(b);
  });

  const day = getDay(todayKey());
  const intake = day.intake;
  const pct = Math.min(intake / GOAL, 1);

  const ring = $("ringFill");
  ring.setAttribute("stroke-dasharray", `${pct * CIRC} ${CIRC - pct * CIRC}`);
  ring.setAttribute("stroke", pct >= 1 ? "var(--good)" : "var(--water)");
  $("ringVal").textContent = fmtL(intake);
  $("ringDone").classList.toggle("hidden", pct < 1);

  const undo = $("undoBtn");
  if (intake > 0) { undo.classList.remove("hidden"); undo.textContent = t("undo_last"); }
  else undo.classList.add("hidden");

  renderTimeline();

  const last = day.urine.length ? day.urine[day.urine.length - 1].color : null;
  const row = $("urineRow");
  row.innerHTML = "";
  URINE_COLORS.forEach((col, i) => {
    const b = document.createElement("button");
    b.style.background = col;
    b.setAttribute("aria-label", `${t("urine_title")} ${i + 1}`);
    if (last === i + 1) b.classList.add("sel");
    b.onclick = () => logUrine(i + 1);
    row.appendChild(b);
  });
  const msg = $("urineMsg");
  if (last) {
    msg.classList.remove("hidden");
    msg.style.color = last <= 3 ? "var(--good)" : "var(--amber)";
    msg.textContent = last <= 3 ? t("urine_good") : last <= 5 ? t("urine_mid") : t("urine_dark");
  } else msg.classList.add("hidden");

  const ps = $("painSummary");
  if (day.pain.length) {
    ps.classList.remove("hidden");
    ps.textContent = t("pain_summary", { count: day.pain.length, level: day.pain[day.pain.length - 1].level });
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

  const L = t("brand_unit");
  $("monthStats").innerHTML = [
    { v: active.length ? fmtL(avg) + " " + L : "—", l: t("stat_avg") },
    { v: goalDays + "/30", l: t("stat_goal_days") },
    { v: avgU ?? "—", l: t("stat_urine_avg") },
    { v: painEvents, l: t("stat_pain") },
  ].map((s) => `<div class="stat"><div class="v">${s.v}</div><div class="l">${s.l}</div></div>`).join("");

  renderInsights(month, GOAL);

  window._report =
`${t("report_title")} — ${t("month_title")}
${t("name")}: ${state.name}
${new Date().toLocaleDateString(currentLocale())}
${t("tab_today")}: ${active.length}
${t("stat_avg")}: ${fmtL(avg)} ${L} (${t("goal_title")}: ${fmtL(GOAL)} ${L})
${t("stat_goal_days")}: ${goalDays}/30
${t("stat_urine_avg")}: ${avgU ?? "—"}
${t("stat_pain")}: ${painEvents}`;
  $("reportText").textContent = window._report;
}

// hydration-vs-pain insight: monthly calendar heatmap + comparison
function renderInsights(month, GOAL) {
  // --- calendar heatmap ---
  const cal = $("monthCalendar");
  const parse = (k) => { const [y, mo, da] = k.split("-").map(Number); return new Date(y, mo - 1, da); };
  const wkBase = new Date(2023, 0, 1); // a Sunday
  let html = '<div class="cal-grid">';
  for (let i = 0; i < 7; i++) {
    const d = new Date(wkBase); d.setDate(wkBase.getDate() + i);
    html += `<div class="cal-h">${weekdayShort(d)}</div>`;
  }
  const offset = parse(month[0].key).getDay();
  for (let i = 0; i < offset; i++) html += '<div class="cal-cell empty"></div>';
  month.forEach((d) => {
    const dt = parse(d.key);
    const ratio = GOAL > 0 ? d.intake / GOAL : 0;
    const hasPain = d.pain.length > 0;
    let cls = "cal-cell", style = "";
    if (d.intake <= 0) cls += " none";
    else if (ratio >= 1) cls += " full";
    else { style = ` style="background:rgba(79,179,199,${(0.3 + 0.6 * Math.min(ratio, 1)).toFixed(2)})"`; }
    if (hasPain) cls += " has-pain";
    html += `<div class="${cls}"${style} title="${d.key}${hasPain ? " ⚠" : ""}"><span class="cal-day">${dt.getDate()}</span>${hasPain ? '<span class="cal-pain">⚠</span>' : ""}</div>`;
  });
  html += "</div>";
  cal.innerHTML = html;

  // --- comparison ---
  const painDays = month.filter((d) => d.pain.length > 0 && d.intake > 0);
  const noPainDays = month.filter((d) => d.pain.length === 0 && d.intake > 0);
  const totalPain = month.reduce((s, d) => s + d.pain.length, 0);
  let text;
  if (totalPain === 0) text = t("insight_no_pain");
  else if (!painDays.length || !noPainDays.length) text = t("insight_need");
  else {
    const a = (painDays.reduce((s, d) => s + d.intake, 0) / painDays.length / 1000).toFixed(1);
    const b = (noPainDays.reduce((s, d) => s + d.intake, 0) / noPainDays.length / 1000).toFixed(1);
    text = t("insight_compare", { a, b }) + " " + (parseFloat(a) < parseFloat(b) ? t("insight_less") : t("insight_none_lnk"));
  }
  $("insightText").textContent = text;
}

function renderTimeline() {
  const box = $("timeline");
  const items = [
    ...today.drinks.map((d) => ({ ts: d.ts, table: "drinks", id: d.id, icon: "💧", text: `${d.ml} ${t("ml")}` })),
    ...today.urine.map((u) => ({ ts: u.ts, table: "urine", id: u.id, icon: "🎨", text: `${t("urine_title")} ${u.color}` })),
    ...today.pain.map((p) => ({ ts: p.ts, table: "pain", id: p.id, icon: "⚠️", text: `${t("pain_title")} ${p.level}/10${p.note ? " · " + p.note : ""}` })),
  ].sort((a, b) => b.ts - a.ts);

  if (!items.length) { box.innerHTML = `<div class="tl-empty">${t("no_entries_today")}</div>`; return; }
  box.innerHTML = "";
  items.forEach((it) => {
    const r = document.createElement("div");
    r.className = "tl-row";
    r.innerHTML = `<span class="tl-icon">${it.icon}</span>
      <span class="tl-text">${it.text}</span>
      <span class="tl-time">${fmtTime(it.ts)}</span>`;
    const del = document.createElement("button");
    del.className = "tl-del"; del.textContent = t("delete"); del.title = t("delete");
    del.onclick = () => delEntry(it.table, it.id);
    r.appendChild(del);
    box.appendChild(r);
  });
}

function copyReport() {
  if (navigator.clipboard) navigator.clipboard.writeText(window._report).then(() => ping(t("toast_copied")));
  else ping(t("toast_copy_no"));
}

// called by i18n.setLang when the language changes
function onLangChanged() {
  $("langSelectAuth").value = currentLang;
  $("langSelectApp").value = currentLang;
  if ($("obLang")) $("obLang").value = currentLang;
  if (!$("onboarding").classList.contains("hidden")) showObStep();
  if (!$("app-screen").classList.contains("hidden")) {
    renderSettings();
    renderCalcResult();
    render();
  } else {
    setAuthMode(authMode);
  }
}

// ---------- onboarding (first-time wizard) ----------
let obStep = 1;
const OB_STEPS = 3;
function startOnboarding() {
  obStep = 1;
  initLangSelector($("obLang"));
  $("obGoal").value = state.goal_ml || 3000;
  showObStep();
  $("onboarding").classList.remove("hidden");
}
function showObStep() {
  document.querySelectorAll(".ob-step").forEach((s) => s.classList.toggle("hidden", +s.dataset.step !== obStep));
  document.querySelectorAll(".ob-dots span").forEach((d, i) => d.classList.toggle("on", i === obStep - 1));
  $("obBack").style.visibility = obStep === 1 ? "hidden" : "visible";
  $("obNext").textContent = obStep === OB_STEPS ? t("ob_finish") : t("ob_next");
}
function obNav(dir) {
  if (dir > 0 && obStep === OB_STEPS) { obFinish(false); return; }
  obStep = Math.min(OB_STEPS, Math.max(1, obStep + dir));
  showObStep();
}
function obCalc() {
  const w = parseInt($("obWeight").value, 10);
  if (!w || w < 20 || w > 250) { ping(t("calc_need_weight")); return; }
  const r = intakeRange({ weight: w, activity: $("obActivity").value, climate: $("obClimate").value });
  $("obGoal").value = r.suggested;
  const gi = $("obGoal");
  gi.classList.remove("flash"); void gi.offsetWidth; gi.classList.add("flash");
}
async function obFinish(skipped) {
  const g = parseInt($("obGoal").value, 10);
  if (g) { $("goalInput").value = g; await saveGoal(); }
  if (!skipped && $("obRem").checked) {
    $("remEnabled").checked = true;
    $("remInterval").value = $("obInterval").value || 120;
    $("remStart").value = 8; $("remEnd").value = 22;
    await saveReminders();
  }
  localStorage.setItem("litho-onboarded", "1");
  $("onboarding").classList.add("hidden");
  ping(t("ob_done"));
}

// ---------- install (PWA) ----------
let deferredInstall = null;
const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstall = e;
  if (!isStandalone()) $("installBtn").classList.remove("hidden");
});
window.addEventListener("appinstalled", () => {
  deferredInstall = null;
  $("installBtn").classList.add("hidden");
});
async function promptInstall() {
  if (!deferredInstall) return;
  deferredInstall.prompt();
  await deferredInstall.userChoice;
  deferredInstall = null;
  $("installBtn").classList.add("hidden");
}
// iOS Safari has no beforeinstallprompt — show manual hint instead
(function iosInstallHint() {
  const ua = navigator.userAgent || "";
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
  if (isIOS && isSafari && !isStandalone()) $("iosHint").classList.remove("hidden");
})();

// ---------- boot ----------
if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});

initLangSelector($("langSelectAuth"));
initLangSelector($("langSelectApp"));
applyStaticTranslations();

(async function init() {
  try { const { user } = await api("/me"); onLoggedIn(user); }
  catch { $("auth-screen").classList.remove("hidden"); setAuthMode("login"); }
})();
