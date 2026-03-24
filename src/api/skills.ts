import { getSkills, getSkillById } from "../db.ts";

export function handleSkills(url: URL): Response {
  const filters = {
    q: url.searchParams.get("q") || undefined,
    tool: url.searchParams.get("tool") || undefined,
    type: url.searchParams.get("type") || undefined,
    scope: url.searchParams.get("scope") || undefined,
    project: url.searchParams.get("project") || undefined,
    page: url.searchParams.get("page") ? Number(url.searchParams.get("page")) : undefined,
    limit: url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined,
  };

  const result = getSkills(filters);
  return Response.json(result);
}

export function handleSkillDetail(id: string): Response {
  const skill = getSkillById(id);
  if (!skill) return Response.json({ error: "Skill not found" }, { status: 404 });
  return Response.json({ skill });
}

export async function handleSkillReveal(id: string): Promise<Response> {
  const skill = getSkillById(id);
  if (!skill) return Response.json({ error: "Skill not found" }, { status: 404 });

  try {
    Bun.spawn(["open", "-R", skill.file_path]);
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Could not reveal file" }, { status: 500 });
  }
}
