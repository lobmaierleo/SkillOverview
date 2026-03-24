import { homedir } from "os";
import type { ScannerPlugin, DiscoveredSkill } from "./types.ts";
import {
  upsertTools, upsertSkill, clearSkillsForScope,
  getProjects, updateProjectScanTime, startScan,
  completeScan, failScan, getProjectByPath,
} from "../db.ts";

import { claudeScanner } from "./plugins/claude.ts";
import { agentsScanner } from "./plugins/agents.ts";
import { geminiScanner } from "./plugins/gemini.ts";
import { cursorScanner } from "./plugins/cursor.ts";
import { copilotScanner } from "./plugins/copilot.ts";
import { windsurfScanner } from "./plugins/windsurf.ts";
import { aiderScanner } from "./plugins/aider.ts";
import { clineScanner } from "./plugins/cline.ts";

export const plugins: ScannerPlugin[] = [
  claudeScanner,
  agentsScanner,
  geminiScanner,
  cursorScanner,
  copilotScanner,
  windsurfScanner,
  aiderScanner,
  clineScanner,
];

let scanning = false;

export function isScanning(): boolean {
  return scanning;
}

export async function runFullScan(): Promise<number> {
  if (scanning) throw new Error("Scan already in progress");
  scanning = true;

  const scanId = startScan();
  let totalSkills = 0;

  try {
    upsertTools(plugins);
    const home = homedir();

    // Clear global skills and rescan
    clearSkillsForScope("global");

    // Scan global for all plugins in parallel
    const globalResults = await Promise.all(
      plugins.map(p => p.scanGlobal(home).catch(() => [] as DiscoveredSkill[]))
    );

    for (const skills of globalResults) {
      for (const skill of skills) {
        upsertSkill(skill);
        totalSkills++;
      }
    }

    // Scan all registered projects
    const projects = getProjects() as { id: number; path: string }[];
    for (const project of projects) {
      clearSkillsForScope("project", project.id);

      const projectResults = await Promise.all(
        plugins.map(p => p.scanProject(project.path).catch(() => [] as DiscoveredSkill[]))
      );

      for (const skills of projectResults) {
        for (const skill of skills) {
          upsertSkill(skill, project.id);
          totalSkills++;
        }
      }

      updateProjectScanTime(project.id);
    }

    completeScan(scanId, totalSkills);
    console.log(`Scan complete: ${totalSkills} skills found`);
  } catch (err) {
    failScan(scanId, String(err));
    console.error("Scan failed:", err);
  } finally {
    scanning = false;
  }

  return totalSkills;
}

export async function scanSingleProject(projectId: number): Promise<number> {
  if (scanning) throw new Error("Scan already in progress");
  scanning = true;

  let totalSkills = 0;
  const scanId = startScan();

  try {
    upsertTools(plugins);
    const projects = getProjects() as { id: number; path: string }[];
    const project = projects.find(p => p.id === projectId);
    if (!project) throw new Error(`Project ${projectId} not found`);

    clearSkillsForScope("project", project.id);

    const results = await Promise.all(
      plugins.map(p => p.scanProject(project.path).catch(() => [] as DiscoveredSkill[]))
    );

    for (const skills of results) {
      for (const skill of skills) {
        upsertSkill(skill, project.id);
        totalSkills++;
      }
    }

    updateProjectScanTime(project.id);
    completeScan(scanId, totalSkills);
  } catch (err) {
    failScan(scanId, String(err));
  } finally {
    scanning = false;
  }

  return totalSkills;
}
