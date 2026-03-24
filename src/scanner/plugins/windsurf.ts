import { join } from "path";
import type { ScannerPlugin, DiscoveredSkill } from "../types.ts";
import { makeSkill } from "../helpers.ts";

export const windsurfScanner: ScannerPlugin = {
  toolId: "windsurf",
  toolName: "Windsurf",
  icon: "🏄",

  async scanGlobal(_homeDir: string): Promise<DiscoveredSkill[]> {
    return [];
  },

  async scanProject(projectPath: string): Promise<DiscoveredSkill[]> {
    const skills: DiscoveredSkill[] = [];

    const rules = makeSkill(join(projectPath, ".windsurfrules"), "windsurf", "rules", "project", {
      name: ".windsurfrules",
      projectPath,
    });
    if (rules) skills.push(rules);

    return skills;
  },
};
