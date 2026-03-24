import { join } from "path";
import type { ScannerPlugin, DiscoveredSkill } from "../types.ts";
import { makeSkill, tryReadFile, parseFrontmatter, listDir } from "../helpers.ts";

export const geminiScanner: ScannerPlugin = {
  toolId: "gemini-cli",
  toolName: "Gemini CLI",
  icon: "💎",

  async scanGlobal(homeDir: string): Promise<DiscoveredSkill[]> {
    const skills: DiscoveredSkill[] = [];
    const geminiDir = join(homeDir, ".gemini");

    // GEMINI.md
    const md = makeSkill(join(geminiDir, "GEMINI.md"), "gemini-cli", "instruction", "global", {
      name: "Global GEMINI.md",
    });
    if (md) skills.push(md);

    // settings.json
    const settings = makeSkill(join(geminiDir, "settings.json"), "gemini-cli", "config", "global", {
      name: "Gemini Settings",
    });
    if (settings) skills.push(settings);

    // skills/*/SKILL.md
    const skillsDir = join(geminiDir, "skills");
    for (const entry of listDir(skillsDir)) {
      const skillMd = join(skillsDir, entry, "SKILL.md");
      const skill = makeSkill(skillMd, "gemini-cli", "skill", "global", {
        name: `Skill: ${entry}`,
      });
      if (skill) {
        const { frontmatter } = parseFrontmatter(skill.content);
        if (frontmatter.name) skill.name = frontmatter.name as string;
        skill.metadata = frontmatter;
        skills.push(skill);
      }
    }

    // antigravity/mcp_config.json
    const mcpConfig = makeSkill(join(geminiDir, "antigravity", "mcp_config.json"), "gemini-cli", "mcp", "global", {
      name: "MCP Configuration",
    });
    if (mcpConfig) {
      try {
        const parsed = JSON.parse(mcpConfig.content);
        mcpConfig.metadata = { serverCount: Object.keys(parsed.mcpServers || parsed.servers || {}).length };
      } catch { /* ignore */ }
      skills.push(mcpConfig);
    }

    return skills;
  },

  async scanProject(projectPath: string): Promise<DiscoveredSkill[]> {
    const skills: DiscoveredSkill[] = [];

    const md = makeSkill(join(projectPath, "GEMINI.md"), "gemini-cli", "instruction", "project", {
      name: "GEMINI.md",
      projectPath,
    });
    if (md) skills.push(md);

    return skills;
  },
};
