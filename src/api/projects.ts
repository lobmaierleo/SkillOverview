import { existsSync, statSync } from "fs";
import { basename } from "path";
import { getProjects, addProject, removeProject, getProjectByPath } from "../db.ts";
import { scanSingleProject } from "../scanner/index.ts";

export function handleGetProjects(): Response {
  return Response.json({ projects: getProjects() });
}

export async function handleAddProject(req: Request): Promise<Response> {
  const body = await req.json() as { path: string };
  const path = body.path?.trim();

  if (!path) return Response.json({ error: "Path is required" }, { status: 400 });
  if (!existsSync(path)) return Response.json({ error: "Path does not exist" }, { status: 400 });

  try {
    const stat = statSync(path);
    if (!stat.isDirectory()) return Response.json({ error: "Path is not a directory" }, { status: 400 });
  } catch {
    return Response.json({ error: "Cannot access path" }, { status: 400 });
  }

  const existing = getProjectByPath(path);
  if (existing) return Response.json({ error: "Project already exists" }, { status: 409 });

  const name = basename(path);
  const project = addProject(path, name);

  // Scan the new project
  if (project && (project as { id: number }).id) {
    scanSingleProject((project as { id: number }).id).catch(() => {});
  }

  return Response.json({ project }, { status: 201 });
}

export async function handleDeleteProject(id: string): Promise<Response> {
  removeProject(Number(id));
  return Response.json({ success: true });
}
