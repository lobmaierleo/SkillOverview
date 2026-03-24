export interface ScannerPlugin {
  toolId: string;
  toolName: string;
  icon: string;
  scanGlobal(homeDir: string): Promise<DiscoveredSkill[]>;
  scanProject(projectPath: string): Promise<DiscoveredSkill[]>;
}

export type SkillType = "instruction" | "skill" | "rules" | "config" | "mcp";
export type SkillScope = "global" | "project";

export interface DiscoveredSkill {
  name: string;
  toolId: string;
  type: SkillType;
  scope: SkillScope;
  filePath: string;
  projectPath?: string;
  content: string;
  contentPreview: string;
  metadata?: Record<string, unknown>;
  fileSize: number;
  lastModified: Date;
}

export interface ToolInfo {
  id: string;
  name: string;
  icon: string;
  skillCount?: number;
}

export interface ProjectInfo {
  id: number;
  path: string;
  name: string;
  addedAt: string;
  lastScannedAt: string | null;
  skillCount?: number;
}

export interface ScanStatus {
  scanning: boolean;
  lastScan: {
    id: number;
    startedAt: string;
    completedAt: string | null;
    status: string;
    totalSkills: number;
  } | null;
}

export interface SkillRecord {
  id: string;
  tool_id: string;
  name: string;
  type: SkillType;
  scope: SkillScope;
  file_path: string;
  project_id: number | null;
  content: string;
  content_preview: string;
  metadata: string | null;
  file_size: number;
  file_modified_at: string;
  scanned_at: string;
  tool_name?: string;
  tool_icon?: string;
  project_name?: string;
  project_path?: string;
}
