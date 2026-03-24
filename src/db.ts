import { Database } from "bun:sqlite";
import { join } from "path";
import { mkdirSync, existsSync } from "fs";
import type { DiscoveredSkill, SkillRecord, ScannerPlugin } from "./scanner/types.ts";

const DATA_DIR = join(process.env.HOME || "~", ".skill-vault");
const DB_PATH = join(DATA_DIR, "data.db");

let db: Database;

export function getDb(): Database {
  if (!db) {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.exec("PRAGMA journal_mode=WAL");
    db.exec("PRAGMA foreign_keys=ON");
    migrate();
  }
  return db;
}

function migrate() {
  const d = getDb();

  d.exec(`
    CREATE TABLE IF NOT EXISTS tools (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      added_at TEXT DEFAULT (datetime('now')),
      last_scanned_at TEXT
    );

    CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY,
      tool_id TEXT NOT NULL REFERENCES tools(id),
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      scope TEXT NOT NULL,
      file_path TEXT NOT NULL,
      project_id INTEGER REFERENCES projects(id),
      content TEXT NOT NULL,
      content_preview TEXT NOT NULL,
      metadata TEXT,
      file_size INTEGER NOT NULL,
      file_modified_at TEXT NOT NULL,
      scanned_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_skills_tool ON skills(tool_id);
    CREATE INDEX IF NOT EXISTS idx_skills_scope ON skills(scope);
    CREATE INDEX IF NOT EXISTS idx_skills_project ON skills(project_id);

    CREATE TABLE IF NOT EXISTS scans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      started_at TEXT NOT NULL,
      completed_at TEXT,
      status TEXT DEFAULT 'running',
      total_skills INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS preferences (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // FTS table - create only if not exists
  try {
    d.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS skills_fts USING fts5(
        name, content, content_preview,
        content='skills', content_rowid='rowid'
      );
    `);
  } catch {
    // FTS table already exists
  }
}

// --- Tools ---

export function upsertTools(plugins: ScannerPlugin[]) {
  const d = getDb();
  const stmt = d.prepare("INSERT OR REPLACE INTO tools (id, name, icon) VALUES (?, ?, ?)");
  for (const p of plugins) {
    stmt.run(p.toolId, p.toolName, p.icon);
  }
}

export function getTools() {
  return getDb().prepare(`
    SELECT t.id, t.name, t.icon, COUNT(s.id) as skillCount
    FROM tools t LEFT JOIN skills s ON t.id = s.tool_id
    GROUP BY t.id ORDER BY skillCount DESC
  `).all();
}

// --- Projects ---

export function getProjects() {
  return getDb().prepare(`
    SELECT p.*, COUNT(s.id) as skillCount
    FROM projects p LEFT JOIN skills s ON p.id = s.project_id
    GROUP BY p.id ORDER BY p.name
  `).all();
}

export function addProject(path: string, name: string) {
  return getDb().prepare("INSERT INTO projects (path, name) VALUES (?, ?) RETURNING *").get(path, name);
}

export function removeProject(id: number) {
  const d = getDb();
  d.prepare("DELETE FROM skills WHERE project_id = ?").run(id);
  d.prepare("DELETE FROM projects WHERE id = ?").run(id);
}

export function updateProjectScanTime(id: number) {
  getDb().prepare("UPDATE projects SET last_scanned_at = datetime('now') WHERE id = ?").run(id);
}

export function getProjectByPath(path: string) {
  return getDb().prepare("SELECT * FROM projects WHERE path = ?").get(path);
}

// --- Skills ---

function skillId(toolId: string, filePath: string): string {
  const hasher = new Bun.CryptoHasher("md5");
  hasher.update(`${toolId}:${filePath}`);
  return hasher.digest("hex");
}

export function upsertSkill(skill: DiscoveredSkill, projectId: number | null = null) {
  const d = getDb();
  const id = skillId(skill.toolId, skill.filePath);

  d.prepare(`
    INSERT OR REPLACE INTO skills (id, tool_id, name, type, scope, file_path, project_id,
      content, content_preview, metadata, file_size, file_modified_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, skill.toolId, skill.name, skill.type, skill.scope, skill.filePath,
    projectId, skill.content, skill.contentPreview,
    skill.metadata ? JSON.stringify(skill.metadata) : null,
    skill.fileSize, skill.lastModified.toISOString()
  );

  // Update FTS
  try {
    d.prepare("INSERT OR REPLACE INTO skills_fts (rowid, name, content, content_preview) VALUES ((SELECT rowid FROM skills WHERE id = ?), ?, ?, ?)").run(id, skill.name, skill.content, skill.contentPreview);
  } catch {
    // FTS sync error, non-critical
  }

  return id;
}

export function clearSkillsForScope(scope: "global" | "project", projectId?: number) {
  const d = getDb();
  if (scope === "global") {
    d.prepare("DELETE FROM skills WHERE scope = 'global'").run();
  } else if (projectId !== undefined) {
    d.prepare("DELETE FROM skills WHERE project_id = ?").run(projectId);
  }
}

export function getSkills(filters: {
  q?: string;
  tool?: string;
  type?: string;
  scope?: string;
  project?: string;
  page?: number;
  limit?: number;
}) {
  const d = getDb();
  const conditions: string[] = [];
  const params: unknown[] = [];
  let usesFts = false;
  let ftsRowids: number[] = [];

  if (filters.q) {
    // Use FTS for search
    try {
      const ftsResults = d.prepare("SELECT rowid FROM skills_fts WHERE skills_fts MATCH ?").all(`${filters.q}*`) as { rowid: number }[];
      ftsRowids = ftsResults.map(r => r.rowid);
      if (ftsRowids.length === 0) {
        return { skills: [], total: 0 };
      }
      usesFts = true;
      conditions.push(`s.rowid IN (${ftsRowids.join(",")})`);
    } catch {
      // Fallback to LIKE
      conditions.push("(s.name LIKE ? OR s.content LIKE ?)");
      params.push(`%${filters.q}%`, `%${filters.q}%`);
    }
  }

  if (filters.tool) {
    conditions.push("s.tool_id = ?");
    params.push(filters.tool);
  }
  if (filters.type) {
    conditions.push("s.type = ?");
    params.push(filters.type);
  }
  if (filters.scope) {
    conditions.push("s.scope = ?");
    params.push(filters.scope);
  }
  if (filters.project) {
    conditions.push("s.project_id = ?");
    params.push(Number(filters.project));
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const offset = (page - 1) * limit;

  const total = (d.prepare(`SELECT COUNT(*) as count FROM skills s ${where}`).get(...params) as { count: number }).count;

  const skills = d.prepare(`
    SELECT s.*, t.name as tool_name, t.icon as tool_icon,
           p.name as project_name, p.path as project_path
    FROM skills s
    JOIN tools t ON s.tool_id = t.id
    LEFT JOIN projects p ON s.project_id = p.id
    ${where}
    ORDER BY s.name ASC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  return { skills, total, page, limit };
}

export function getSkillById(id: string): SkillRecord | null {
  return getDb().prepare(`
    SELECT s.*, t.name as tool_name, t.icon as tool_icon,
           p.name as project_name, p.path as project_path
    FROM skills s
    JOIN tools t ON s.tool_id = t.id
    LEFT JOIN projects p ON s.project_id = p.id
    WHERE s.id = ?
  `).get(id) as SkillRecord | null;
}

// --- Scans ---

export function startScan(): number {
  return (getDb().prepare("INSERT INTO scans (started_at) VALUES (datetime('now')) RETURNING id").get() as { id: number }).id;
}

export function completeScan(id: number, totalSkills: number) {
  getDb().prepare("UPDATE scans SET completed_at = datetime('now'), status = 'completed', total_skills = ? WHERE id = ?").run(totalSkills, id);
}

export function failScan(id: number, error: string) {
  getDb().prepare("UPDATE scans SET completed_at = datetime('now'), status = 'failed', total_skills = 0 WHERE id = ?").run(id);
}

export function getLastScan() {
  return getDb().prepare("SELECT * FROM scans ORDER BY id DESC LIMIT 1").get();
}

export function getScanStatus(): { scanning: boolean; lastScan: unknown } {
  const last = getLastScan() as { status: string } | null;
  return {
    scanning: last?.status === "running",
    lastScan: last || null,
  };
}

// --- Stats ---

export function getStats() {
  const d = getDb();
  const totalSkills = (d.prepare("SELECT COUNT(*) as c FROM skills").get() as { c: number }).c;
  const byTool = d.prepare("SELECT tool_id, COUNT(*) as count FROM skills GROUP BY tool_id").all();
  const byType = d.prepare("SELECT type, COUNT(*) as count FROM skills GROUP BY type").all();
  const byScope = d.prepare("SELECT scope, COUNT(*) as count FROM skills GROUP BY scope").all();
  const projectCount = (d.prepare("SELECT COUNT(*) as c FROM projects").get() as { c: number }).c;

  return { totalSkills, byTool, byType, byScope, projectCount };
}

// --- Preferences ---

export function getPref(key: string, defaultValue?: string): string | undefined {
  const row = getDb().prepare("SELECT value FROM preferences WHERE key = ?").get(key) as { value: string } | null;
  return row?.value ?? defaultValue;
}

export function setPref(key: string, value: string) {
  getDb().prepare("INSERT OR REPLACE INTO preferences (key, value) VALUES (?, ?)").run(key, value);
}
