import express from "express";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import webpush from "web-push";
import crypto from "crypto";
import os from "os";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import db from "./db.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.DATA_DIR || join(__dirname, "data");
mkdirSync(dataDir, { recursive: true });

const app = express();
const PORT = process.env.PORT || 3000;
const PROD = process.env.NODE_ENV === "production";

// ---------- secrets (persisted so sessions survive restarts) ----------
function persisted(file, generate) {
  const path = join(dataDir, file);
  if (existsSync(path)) return JSON.parse(readFileSync(path, "utf8"));
  const val = generate();
  writeFileSync(path, JSON.stringify(val));
  return val;
}
const JWT_SECRET = process.env.JWT_SECRET || persisted("secret.json", () => crypto.randomBytes(48).toString("hex"));
const vapid = process.env.VAPID_PUBLIC_KEY
  ? { publicKey: process.env.VAPID_PUBLIC_KEY, privateKey: process.env.VAPID_PRIVATE_KEY }
  : persisted("vapid.json", () => webpush.generateVAPIDKeys());
webpush.setVapidDetails("mailto:hydration@example.com", vapid.publicKey, vapid.privateKey);

app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());
app.use(express.static(join(__dirname, "public")));

// ---------- helpers ----------
const dayFromTs = (ts) => new Date(ts).toISOString().slice(0, 10);
const makeToken = (user) => jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "30d" });
function setAuthCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: PROD,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}
const publicUser = (u) => ({
  name: u.name,
  email: u.email,
  goal_ml: u.goal_ml,
  cups: JSON.parse(u.cups),
  reminder_enabled: !!u.reminder_enabled,
  reminder_interval_min: u.reminder_interval_min,
  reminder_start: u.reminder_start,
  reminder_end: u.reminder_end,
});

function auth(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "לא מחובר" });
  try {
    const { id } = jwt.verify(token, JWT_SECRET);
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    if (!user) return res.status(401).json({ error: "משתמש לא נמצא" });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "החיבור פג — התחבר מחדש" });
  }
}

// ---------- simple in-memory rate limiter for auth ----------
const attempts = new Map(); // ip -> { count, resetAt }
function rateLimit(req, res, next) {
  const ip = req.ip || "unknown";
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || now > rec.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return next();
  }
  if (rec.count >= 15)
    return res.status(429).json({ error: "יותר מדי ניסיונות — נסה שוב בעוד מספר דקות" });
  rec.count++;
  next();
}

// ---------- auth routes ----------
app.post("/api/register", rateLimit, (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const name = String(req.body.name || "").trim();
  const password = String(req.body.password || "");
  if (!email || !name || password.length < 6)
    return res.status(400).json({ error: "יש למלא שם, אימייל וסיסמה בת 6 תווים לפחות" });
  if (db.prepare("SELECT id FROM users WHERE email = ?").get(email))
    return res.status(409).json({ error: "כתובת האימייל כבר רשומה" });

  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare("INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)").run(email, name, hash);
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);
  setAuthCookie(res, makeToken(user));
  res.json({ user: publicUser(user) });
});

app.post("/api/login", rateLimit, (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!row || !bcrypt.compareSync(password, row.password_hash))
    return res.status(401).json({ error: "אימייל או סיסמה שגויים" });
  setAuthCookie(res, makeToken(row));
  res.json({ user: publicUser(row) });
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ ok: true });
});

app.get("/api/me", auth, (req, res) => res.json({ user: publicUser(req.user) }));

app.put("/api/goal", auth, (req, res) => {
  const goal = Math.max(500, Math.min(6000, parseInt(req.body.goal_ml, 10) || 3000));
  db.prepare("UPDATE users SET goal_ml = ? WHERE id = ?").run(goal, req.user.id);
  res.json({ goal_ml: goal });
});

// ---------- settings: cups + reminders ----------
app.put("/api/settings", auth, (req, res) => {
  const b = req.body || {};
  let cups = Array.isArray(b.cups) ? b.cups.map((n) => parseInt(n, 10)).filter((n) => n > 0 && n <= 3000) : null;
  if (cups && cups.length) cups = [...new Set(cups)].sort((a, b) => a - b).slice(0, 8);
  const enabled = b.reminder_enabled ? 1 : 0;
  const interval = Math.max(30, Math.min(360, parseInt(b.reminder_interval_min, 10) || 120));
  const start = Math.max(0, Math.min(23, parseInt(b.reminder_start, 10)));
  const end = Math.max(1, Math.min(24, parseInt(b.reminder_end, 10)));

  db.prepare(
    `UPDATE users SET
      cups = COALESCE(?, cups),
      reminder_enabled = ?, reminder_interval_min = ?, reminder_start = ?, reminder_end = ?
     WHERE id = ?`
  ).run(cups && cups.length ? JSON.stringify(cups) : null, enabled, interval, start, end, req.user.id);

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  res.json({ user: publicUser(user) });
});

// ---------- push subscriptions ----------
app.get("/api/vapidPublicKey", (req, res) => res.json({ key: vapid.publicKey }));

app.post("/api/push/subscribe", auth, (req, res) => {
  const s = req.body || {};
  if (!s.endpoint || !s.keys?.p256dh || !s.keys?.auth)
    return res.status(400).json({ error: "מנוי לא תקין" });
  db.prepare(
    `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth, created_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(endpoint) DO UPDATE SET user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth`
  ).run(req.user.id, s.endpoint, s.keys.p256dh, s.keys.auth, Date.now());
  res.json({ ok: true });
});

app.post("/api/push/unsubscribe", auth, (req, res) => {
  if (req.body?.endpoint) db.prepare("DELETE FROM push_subscriptions WHERE endpoint = ?").run(req.body.endpoint);
  res.json({ ok: true });
});

// ---------- data routes ----------
app.post("/api/drinks", auth, (req, res) => {
  const ml = parseInt(req.body.ml, 10);
  if (!ml || ml <= 0 || ml > 5000) return res.status(400).json({ error: "כמות לא תקינה" });
  const ts = Date.now();
  db.prepare("INSERT INTO drinks (user_id, ml, day, ts) VALUES (?, ?, ?, ?)").run(req.user.id, ml, dayFromTs(ts), ts);
  res.json({ ok: true });
});

app.delete("/api/drinks/last", auth, (req, res) => {
  const day = dayFromTs(Date.now());
  const last = db.prepare("SELECT id FROM drinks WHERE user_id = ? AND day = ? ORDER BY ts DESC LIMIT 1").get(req.user.id, day);
  if (last) db.prepare("DELETE FROM drinks WHERE id = ?").run(last.id);
  res.json({ ok: true });
});

app.post("/api/urine", auth, (req, res) => {
  const color = parseInt(req.body.color, 10);
  if (!(color >= 1 && color <= 8)) return res.status(400).json({ error: "ערך צבע לא תקין" });
  const ts = Date.now();
  db.prepare("INSERT INTO urine (user_id, color, day, ts) VALUES (?, ?, ?, ?)").run(req.user.id, color, dayFromTs(ts), ts);
  res.json({ ok: true });
});

app.post("/api/pain", auth, (req, res) => {
  const level = parseInt(req.body.level, 10);
  const note = String(req.body.note || "").trim().slice(0, 500);
  if (!(level >= 1 && level <= 10)) return res.status(400).json({ error: "עוצמה לא תקינה" });
  const ts = Date.now();
  db.prepare("INSERT INTO pain (user_id, level, note, day, ts) VALUES (?, ?, ?, ?, ?)").run(req.user.id, level, note, dayFromTs(ts), ts);
  res.json({ ok: true });
});

// generic per-entry delete (ownership enforced)
for (const table of ["drinks", "urine", "pain"]) {
  app.delete(`/api/${table}/:id`, auth, (req, res) => {
    const id = parseInt(req.params.id, 10);
    const info = db.prepare(`DELETE FROM ${table} WHERE id = ? AND user_id = ?`).run(id, req.user.id);
    if (!info.changes) return res.status(404).json({ error: "רשומה לא נמצאה" });
    res.json({ ok: true });
  });
}

// today's individual entries (for timeline)
app.get("/api/today", auth, (req, res) => {
  const day = dayFromTs(Date.now());
  const uid = req.user.id;
  res.json({
    drinks: db.prepare("SELECT id, ml, ts FROM drinks WHERE user_id = ? AND day = ? ORDER BY ts").all(uid, day),
    urine: db.prepare("SELECT id, color, ts FROM urine WHERE user_id = ? AND day = ? ORDER BY ts").all(uid, day),
    pain: db.prepare("SELECT id, level, note, ts FROM pain WHERE user_id = ? AND day = ? ORDER BY ts").all(uid, day),
  });
});

// aggregated day summaries
app.get("/api/summary", auth, (req, res) => {
  const uid = req.user.id;
  const drinks = db.prepare("SELECT day, SUM(ml) AS ml FROM drinks WHERE user_id = ? GROUP BY day").all(uid);
  const urine = db.prepare("SELECT day, color, ts FROM urine WHERE user_id = ? ORDER BY ts").all(uid);
  const pain = db.prepare("SELECT day, level, note, ts FROM pain WHERE user_id = ? ORDER BY ts").all(uid);
  const map = {};
  const ensure = (d) => (map[d] ||= { intake: 0, urine: [], pain: [] });
  for (const r of drinks) ensure(r.day).intake = r.ml;
  for (const r of urine) ensure(r.day).urine.push({ color: r.color, ts: r.ts });
  for (const r of pain) ensure(r.day).pain.push({ level: r.level, note: r.note, ts: r.ts });
  res.json({ goal_ml: req.user.goal_ml, days: map });
});

// ---------- reminder scheduler ----------
function sendPush(userId, payload) {
  const subs = db.prepare("SELECT * FROM push_subscriptions WHERE user_id = ?").all(userId);
  for (const s of subs) {
    webpush
      .sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(payload))
      .catch((err) => {
        if (err.statusCode === 404 || err.statusCode === 410)
          db.prepare("DELETE FROM push_subscriptions WHERE id = ?").run(s.id);
      });
  }
}

function checkReminders() {
  const now = Date.now();
  const hour = new Date().getHours();
  const users = db.prepare("SELECT * FROM users WHERE reminder_enabled = 1").all();
  for (const u of users) {
    if (hour < u.reminder_start || hour >= u.reminder_end) continue;
    if (now - u.last_reminder_ts < u.reminder_interval_min * 60 * 1000) continue;
    const day = dayFromTs(now);
    const row = db.prepare("SELECT COALESCE(SUM(ml),0) AS ml FROM drinks WHERE user_id = ? AND day = ?").get(u.id, day);
    if (row.ml >= u.goal_ml) continue; // goal met, no nag
    const remaining = ((u.goal_ml - row.ml) / 1000).toFixed(1);
    sendPush(u.id, { title: "זמן לשתות מים 💧", body: `נותרו ${remaining} ליטר עד היעד היומי. הוסף כוס עכשיו.` });
    db.prepare("UPDATE users SET last_reminder_ts = ? WHERE id = ?").run(now, u.id);
  }
}
setInterval(checkReminders, 60 * 1000);

// ---------- start ----------
app.listen(PORT, () => {
  const nets = os.networkInterfaces();
  let lan = null;
  for (const list of Object.values(nets))
    for (const n of list || []) if (n.family === "IPv4" && !n.internal) lan = n.address;
  console.log(`\n  יומן ההידרציה רץ:`);
  console.log(`    במחשב הזה:   http://localhost:${PORT}`);
  if (lan) console.log(`    מהטלפון:     http://${lan}:${PORT}   (באותה רשת Wi-Fi)`);
  console.log("");
});
