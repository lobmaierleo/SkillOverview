import { join } from "path";
import { existsSync, readdirSync } from "fs";
import type { ScannerPlugin, DiscoveredSkill } from "../types.ts";
import { makeSkill } from "../helpers.ts";

export const cursorScanner: ScannerPlugin = {
  toolId: "cursor",
  toolName: "Cursor",
  icon: "🖱️",

  async scanGlobal(_homeDir: string): Promise<DiscoveredSkill[]> {
    return []; // Cursor config is primarily project-level
  },

  async scanProject(projectPath: string): Promise<DiscoveredSkill[]> {
    const skills: DiscoveredSkill[] = [];

    // .cursorrules
    const rules = makeSkill(join(projectPath, ".cursorrules"), "cursor", "rules", "project", {
      name: ".cursorrules",
      projectPath,
    });
    if (rules) skills.push(rules);

    // .cursorignore
    const ignore = makeSkill(join(projectPath, ".cursorignore"), "cursor", "config", "project", {
      name: ".cursorignore",
      projectPath,
    });
    if (ignore) skills.push(ignore);

    // .cursor/rules/*.md and *.mdc
    const rulesDir = join(projectPath, ".cursor", "rules");
    if (existsSync(rulesDir)) {
      try {
        for (const entry of readdirSync(rulesDir)) {
          if (entry.endsWith(".md") || entry.endsWith(".mdc")) {
            const skill = makeSkill(join(rulesDir, entry), "cursor", "rules", "project", {
              name: `Cursor Rule: ${entry}`,
              projectPath,
            });
            if (skill) skills.push(skill);
          }
        }
      } catch { /* skip */ }
    }

    return skills;
  },
};
