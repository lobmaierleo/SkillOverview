import { join } from "path";
import type { ScannerPlugin, DiscoveredSkill } from "../types.ts";
import { makeSkill, tryReadFile, parseFrontmatter, listDir } from "../helpers.ts";

export const agentsScanner: ScannerPlugin = {
  toolId: "agents-registry",
  toolName: "Agent Skills",
  icon: "🔧",

  async scanGlobal(homeDir: string): Promise<DiscoveredSkill[]> {
    const skills: DiscoveredSkill[] = [];
    const agentsDir = join(homeDir, ".agents");

    // .skill-lock.json
    const lockContent = tryReadFile(join(agentsDir, ".skill-lock.json"));
    if (lockContent) {
      try {
        const lock = JSON.parse(lockContent);
        const lockSkill = makeSkill(join(agentsDir, ".skill-lock.json"), "agents-registry", "config", "global", {
          name: "Skill Lock Registry",
          metadata: { skillCount: Object.keys(lock.skills || {}).length, version: lock.version },
        });
        if (lockSkill) skills.push(lockSkill);
      } catch { /* ignore */ }
    }

    // skills/*/SKILL.md
    const skillsDir = join(agentsDir, "skills");
    for (const entry of listDir(skillsDir)) {
      const skillMd = join(skillsDir, entry, "SKILL.md");
      const skill = makeSkill(skillMd, "agents-registry", "skill", "global", {
        name: entry,
      });
      if (skill) {
        const { frontmatter } = parseFrontmatter(skill.content);
        if (frontmatter.name) skill.name = frontmatter.name as string;
        skill.metadata = frontmatter;
        skills.push(skill);
      }
    }

    return skills;
  },

  async scanProject(_projectPath: string): Promise<DiscoveredSkill[]> {
    return []; // Agent skills are global only
  },
};
