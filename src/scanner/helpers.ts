import { readFileSync, statSync, existsSync, readdirSync, readlinkSync } from "fs";
import { join, basename, resolve } from "path";
import type { DiscoveredSkill, SkillType, SkillScope } from "./types.ts";

export function tryReadFile(path: string): string | null {
  try {
    if (!existsSync(path)) return null;
    return readFileSync(path, "utf-8");
  } catch {
    return null;
  }
}

export function fileStat(path: string): { size: number; mtime: Date } | null {
  try {
    const s = statSync(path);
    return { size: s.size, mtime: s.mtimeMs ? new Date(s.mtimeMs) : new Date() };
  } catch {
    return null;
  }
}

export function makeSkill(
  filePath: string,
  toolId: string,
  type: SkillType,
  scope: SkillScope,
  opts?: {
    name?: string;
    projectPath?: string;
    metadata?: Record<string, unknown>;
  }
): DiscoveredSkill | null {
  const content = tryReadFile(filePath);
  if (content === null || content.trim().length === 0) return null;

  const stat = fileStat(filePath);
  const name = opts?.name || basename(filePath);

  return {
    name,
    toolId,
    type,
    scope,
    filePath: resolve(filePath),
    projectPath: opts?.projectPath,
    content,
    contentPreview: content.slice(0, 200).replace(/\n/g, " ").trim(),
    metadata: opts?.metadata,
    fileSize: stat?.size || content.length,
    lastModified: stat?.mtime || new Date(),
  };
}

export function parseFrontmatter(content: string): { frontmatter: Record<string, unknown>; body: string } {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const fm: Record<string, unknown> = {};
  const lines = match[1].split("\n");

  let currentKey = "";
  let currentIndent = 0;
  let nestedObj: Record<string, unknown> | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const indent = line.length - line.trimStart().length;
    const kvMatch = trimmed.match(/^(\w[\w-]*):\s*(.*)$/);

    if (kvMatch && indent === 0) {
      if (nestedObj && currentKey) fm[currentKey] = nestedObj;
      nestedObj = null;
      currentKey = kvMatch[1];
      const val = kvMatch[2].trim();

      if (val === "") {
        nestedObj = {};
        currentIndent = indent;
      } else if (val === "true") fm[currentKey] = true;
      else if (val === "false") fm[currentKey] = false;
      else if (/^\d+$/.test(val)) fm[currentKey] = Number(val);
      else fm[currentKey] = val.replace(/^["']|["']$/g, "");
    } else if (kvMatch && indent > 0 && nestedObj) {
      const val = kvMatch[2].trim();
      nestedObj[kvMatch[1]] = val.replace(/^["']|["']$/g, "");
    } else if (trimmed.startsWith("- ") && currentKey) {
      const arr = (fm[currentKey] as string[]) || [];
      arr.push(trimmed.slice(2).trim());
      fm[currentKey] = arr;
    }
  }

  if (nestedObj && currentKey) fm[currentKey] = nestedObj;

  return { frontmatter: fm, body: match[2] };
}

export function listDir(dir: string): string[] {
  try {
    if (!existsSync(dir)) return [];
    return readdirSync(dir);
  } catch {
    return [];
  }
}

export function resolveSymlink(path: string): string {
  try {
    return readlinkSync(path);
  } catch {
    return path;
  }
}

export function globFiles(dir: string, patterns: string[]): string[] {
  const results: string[] = [];
  try {
    if (!existsSync(dir)) return results;
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isFile() || entry.isSymbolicLink()) {
        for (const pattern of patterns) {
          if (matchPattern(entry.name, pattern)) {
            results.push(fullPath);
            break;
          }
        }
      }
    }
  } catch { /* skip unreadable dirs */ }
  return results;
}

function matchPattern(name: string, pattern: string): boolean {
  if (pattern.startsWith("*.")) {
    return name.endsWith(pattern.slice(1));
  }
  return name === pattern;
}
