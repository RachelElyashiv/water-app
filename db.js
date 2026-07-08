import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { mkdirSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.DATA_DIR || join(__dirname, "data");
mkdirSync(dataDir, { recursive: true });

const db = new Database(join(dataDir, "water.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT UNIQUE NOT NULL,
    name          TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    goal_ml       INTEGER NOT NULL DEFAULT 3000,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS drinks (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    ml      INTEGER NOT NULL,
    day     TEXT NOT NULL,
    ts      INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS urine (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    color   INTEGER NOT NULL,
    day     TEXT NOT NULL,
    ts      INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS pain (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    level   INTEGER NOT NULL,
    note    TEXT NOT NULL DEFAULT '',
    day     TEXT NOT NULL,
    ts      INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS push_subscriptions (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL,
    endpoint   TEXT UNIQUE NOT NULL,
    p256dh     TEXT NOT NULL,
    auth       TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_drinks_user_day ON drinks(user_id, day);
  CREATE INDEX IF NOT EXISTS idx_urine_user_day  ON urine(user_id, day);
  CREATE INDEX IF NOT EXISTS idx_pain_user_day   ON pain(user_id, day);
  CREATE INDEX IF NOT EXISTS idx_push_user       ON push_subscriptions(user_id);
`);

// ---- lightweight migration: add columns to users if missing ----
const userCols = db.prepare("PRAGMA table_info(users)").all().map((c) => c.name);
const addColumn = (name, ddl) => {
  if (!userCols.includes(name)) db.exec(`ALTER TABLE users ADD COLUMN ${ddl}`);
};
addColumn("cups", "cups TEXT NOT NULL DEFAULT '[200,330,500,750]'");
addColumn("reminder_enabled", "reminder_enabled INTEGER NOT NULL DEFAULT 0");
addColumn("reminder_interval_min", "reminder_interval_min INTEGER NOT NULL DEFAULT 120");
addColumn("reminder_start", "reminder_start INTEGER NOT NULL DEFAULT 8");
addColumn("reminder_end", "reminder_end INTEGER NOT NULL DEFAULT 22");
addColumn("last_reminder_ts", "last_reminder_ts INTEGER NOT NULL DEFAULT 0");
addColumn("lang", "lang TEXT NOT NULL DEFAULT 'he'");

export default db;
