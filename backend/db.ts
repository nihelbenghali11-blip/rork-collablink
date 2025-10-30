import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { type Database, type ID, type User } from "./types";

const DATA_PATH = join(process.cwd(), "backend", "data.json");

const now = () => new Date().toISOString();

const initial: Database = {
  users: [],
  campaigns: [],
  campaign_platforms: [],
  collaborators: [],
  conversations: [],
  messages: [],
  attachments: [],
  ratings: [],
  audit_logs: [],
};

let db: Database = initial;

function load() {
  try {
    if (existsSync(DATA_PATH)) {
      const raw = readFileSync(DATA_PATH, "utf-8");
      db = JSON.parse(raw) as Database;
    } else {
      persist();
    }
  } catch (e) {
    console.error("Failed to load DB", e);
    db = initial;
  }
}

function persist() {
  try {
    writeFileSync(DATA_PATH, JSON.stringify(db, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to persist DB", e);
  }
}

load();

export const id = (): ID =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

export function getDB() {
  return db;
}

export function saveDB() {
  persist();
}

export function logAudit(user_id: ID, action: string, entity: string, entity_id: ID) {
  db.audit_logs.push({ id: id(), user_id, action, entity, entity_id, created_at: now() });
}

export function upsertUser(u: Omit<User, "created_at" | "updated_at"> & Partial<Pick<User, "created_at" | "updated_at">>) {
  const existing = db.users.find((x) => x.id === u.id);
  if (existing) {
    const updated = { ...existing, ...u, updated_at: now() } as User;
    const idx = db.users.findIndex((x) => x.id === u.id);
    db.users[idx] = updated;
  } else {
    const created = { ...u, created_at: u.created_at ?? now(), updated_at: now() } as User;
    db.users.push(created);
  }
  persist();
}
