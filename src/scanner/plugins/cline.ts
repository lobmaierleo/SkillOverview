import { join } from "path";
import type { ScannerPlugin, DiscoveredSkill } from "../types.ts";
import { makeSkill } from "../helpers.ts";

export const clineScanner: ScannerPlugin = {
  toolId: "cline",
  toolName: "Cline",
  icon: "📋",

  async scanGlobal(_homeDir: string): Promise<DiscoveredSkill[]> {
    return [];
  },

  async scanProject(projectPath: string): Promise<DiscoveredSkill[]> {
    const skills: DiscoveredSkill[] = [];

    const rules = makeSkill(join(projectPath, ".clinerules"), "cline", "rules", "project", {
      name: ".clinerules",
      projectPath,
    });
    if (rules) skills.push(rules);

    return skills;
  },
};
