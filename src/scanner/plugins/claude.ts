import { join } from "path";
import { existsSync, readdirSync, lstatSync, readlinkSync } from "fs";
import type { ScannerPlugin, DiscoveredSkill } from "../types.ts";
import { makeSkill, tryReadFile, parseFrontmatter, listDir } from "../helpers.ts";

export const claudeScanner: ScannerPlugin = {
  toolId: "claude-code",
  toolName: "Claude Code",
  icon: "🟠",

  async scanGlobal(homeDir: string): Promise<DiscoveredSkill[]> {
    const skills: DiscoveredSkill[] = [];
    const claudeDir = join(homeDir, ".claude");

    // CLAUDE.md
    const claudeMd = makeSkill(join(claudeDir, "CLAUDE.md"), "claude-code", "instruction", "global", {
      name: "Global CLAUDE.md",
    });
    if (claudeMd) skills.push(claudeMd);

    // settings.json
    const settingsPath = join(claudeDir, "settings.json");
    const settings = makeSkill(settingsPath, "claude-code", "config", "global", {
      name: "Claude Code Settings",
    });
    if (settings) {
      try {
        const parsed = JSON.parse(settings.content);
        settings.metadata = { enabledPlugins: parsed.enabledPlugins, model: parsed.model };
      } catch { /* ignore */ }
      skills.push(settings);
    }

    // Skills directory (symlinks)
    const skillsDir = join(claudeDir, "skills");
    for (const entry of listDir(skillsDir)) {
      const entryPath = join(skillsDir, entry);
      try {
        const stat = lstatSync(entryPath);
        let targetDir = entryPath;
        if (stat.isSymbolicLink()) {
          targetDir = readlinkSync(entryPath);
        }
        const skillMd = join(stat.isDirectory() || stat.isSymbolicLink() ? targetDir : entryPath, "SKILL.md");
        const skill = makeSkill(skillMd, "claude-code", "skill", "global", {
          name: `Skill: ${entry}`,
        });
        if (skill) {
          const { frontmatter } = parseFrontmatter(skill.content);
          if (frontmatter.name) skill.name = `Skill: ${frontmatter.name as string}`;
          skill.metadata = frontmatter;
          skills.push(skill);
        }
      } catch { /* skip */ }
    }

    return skills;
  },

  async scanProject(projectPath: string): Promise<DiscoveredSkill[]> {
    const skills: DiscoveredSkill[] = [];

    // Root CLAUDE.md
    const rootMd = makeSkill(join(projectPath, "CLAUDE.md"), "claude-code", "instruction", "project", {
      name: "CLAUDE.md",
      projectPath,
    });
    if (rootMd) skills.push(rootMd);

    // .claude/CLAUDE.md
    const dotClaudeMd = makeSkill(join(projectPath, ".claude", "CLAUDE.md"), "claude-code", "instruction", "project", {
      name: "CLAUDE.md (.claude/)",
      projectPath,
    });
    if (dotClaudeMd) skills.push(dotClaudeMd);

    // .claude/settings.json
    const settings = makeSkill(join(projectPath, ".claude", "settings.json"), "claude-code", "config", "project", {
      name: "Claude Project Settings",
      projectPath,
    });
    if (settings) skills.push(settings);

    return skills;
  },
};
