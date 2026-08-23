import "server-only";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "olympiad.sqlite");

let db: Database.Database | null = null;

function migrate(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      trial_started_at INTEGER,
      trial_ends_at INTEGER,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS magic_links (
      token_hash TEXT PRIMARY KEY,
      email TEXT NOT NULL COLLATE NOCASE,
      expires_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS license_by_email (
      email TEXT PRIMARY KEY COLLATE NOCASE,
      license_key TEXT NOT NULL,
      tier TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_license_keys (
      user_id TEXT NOT NULL,
      license_key TEXT NOT NULL,
      instance_id TEXT,
      linked_at INTEGER NOT NULL,
      PRIMARY KEY (user_id, license_key),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_magic_links_expires ON magic_links(expires_at);

    CREATE TABLE IF NOT EXISTS support_threads (
      id TEXT PRIMARY KEY,
      visitor_id TEXT NOT NULL,
      visitor_email TEXT,
      page_path TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      escalated INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS support_messages (
      id TEXT PRIMARY KEY,
      thread_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      tags TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (thread_id) REFERENCES support_threads(id)
    );

    CREATE INDEX IF NOT EXISTS idx_support_threads_visitor ON support_threads(visitor_id);
    CREATE INDEX IF NOT EXISTS idx_support_messages_thread ON support_messages(thread_id);
  `);
}

export function getDb(): Database.Database {
  if (db) return db;
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  migrate(db);
  return db;
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}
