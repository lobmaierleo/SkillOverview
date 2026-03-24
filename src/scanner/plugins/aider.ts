import { join } from "path";
import type { ScannerPlugin, DiscoveredSkill } from "../types.ts";
import { makeSkill } from "../helpers.ts";

export const aiderScanner: ScannerPlugin = {
  toolId: "aider",
  toolName: "Aider",
  icon: "🤖",

  async scanGlobal(homeDir: string): Promise<DiscoveredSkill[]> {
    const skills: DiscoveredSkill[] = [];

    const config = makeSkill(join(homeDir, ".aider.conf.yml"), "aider", "config", "global", {
      name: "Aider Global Config",
    });
    if (config) skills.push(config);

    return skills;
  },

  async scanProject(projectPath: string): Promise<DiscoveredSkill[]> {
    const skills: DiscoveredSkill[] = [];

    const config = makeSkill(join(projectPath, ".aider.conf.yml"), "aider", "config", "project", {
      name: ".aider.conf.yml",
      projectPath,
    });
    if (config) skills.push(config);

    const ignore = makeSkill(join(projectPath, ".aiderignore"), "aider", "config", "project", {
      name: ".aiderignore",
      projectPath,
    });
    if (ignore) skills.push(ignore);

    return skills;
  },
};
