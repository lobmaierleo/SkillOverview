import { join } from "path";
import { existsSync, readdirSync } from "fs";
import type { ScannerPlugin, DiscoveredSkill } from "../types.ts";
import { makeSkill, globFiles } from "../helpers.ts";

export const copilotScanner: ScannerPlugin = {
  toolId: "github-copilot",
  toolName: "GitHub Copilot",
  icon: "🐙",

  async scanGlobal(homeDir: string): Promise<DiscoveredSkill[]> {
    const skills: DiscoveredSkill[] = [];

    // Check multiple IDE paths
    const ideDirs = ["intellij", "vscode", "xcode"];
    const copilotDir = join(homeDir, ".config", "github-copilot");

    for (const ide of ideDirs) {
      const ideDir = join(copilotDir, ide);
      const files = globFiles(ideDir, ["*.md"]);
      for (const file of files) {
        const skill = makeSkill(file, "github-copilot", "instruction", "global", {
          name: `Copilot: ${file.split("/").pop()}`,
        });
        if (skill) skills.push(skill);
      }
    }

    return skills;
  },

  async scanProject(projectPath: string): Promise<DiscoveredSkill[]> {
    const skills: DiscoveredSkill[] = [];

    // .github/copilot-instructions.md
    const instructions = makeSkill(
      join(projectPath, ".github", "copilot-instructions.md"),
      "github-copilot", "instruction", "project",
      { name: "Copilot Instructions", projectPath }
    );
    if (instructions) skills.push(instructions);

    return skills;
  },
};
