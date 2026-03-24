import { join } from "path";
import { handleSkills, handleSkillDetail, handleSkillReveal } from "./api/skills.ts";
import { handleTools } from "./api/tools.ts";
import { handleGetProjects, handleAddProject, handleDeleteProject } from "./api/projects.ts";
import { handleStartScan, handleScanStatus } from "./api/scan.ts";
import { handleStats } from "./api/stats.ts";

const FRONTEND_DIR = join(import.meta.dir, "frontend");

function cors(res: Response): Response {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

async function handleApi(req: Request, url: URL): Promise<Response> {
  const path = url.pathname;
  const method = req.method;

  // Skills
  if (path === "/api/skills" && method === "GET") return handleSkills(url);

  const skillMatch = path.match(/^\/api\/skills\/([^/]+)$/);
  if (skillMatch && method === "GET") return handleSkillDetail(skillMatch[1]);

  const revealMatch = path.match(/^\/api\/skills\/([^/]+)\/reveal$/);
  if (revealMatch && method === "GET") return handleSkillReveal(revealMatch[1]);

  // Tools
  if (path === "/api/tools" && method === "GET") return handleTools();

  // Projects
  if (path === "/api/projects" && method === "GET") return handleGetProjects();
  if (path === "/api/projects" && method === "POST") return handleAddProject(req);

  const projectMatch = path.match(/^\/api\/projects\/(\d+)$/);
  if (projectMatch && method === "DELETE") return handleDeleteProject(projectMatch[1]);

  // Scan
  if (path === "/api/scan" && method === "POST") return handleStartScan(req);
  if (path === "/api/scan/status" && method === "GET") return handleScanStatus();

  // Stats
  if (path === "/api/stats" && method === "GET") return handleStats();

  return Response.json({ error: "Not found" }, { status: 404 });
}

async function serveStatic(pathname: string): Promise<Response> {
  let filePath = pathname === "/" ? "/index.html" : pathname;
  const fullPath = join(FRONTEND_DIR, filePath);

  const file = Bun.file(fullPath);
  if (await file.exists()) {
    return new Response(file);
  }

  // SPA fallback
  return new Response(Bun.file(join(FRONTEND_DIR, "index.html")));
}

export function startServer(port: number) {
  const server = Bun.serve({
    port,
    async fetch(req) {
      const url = new URL(req.url);

      if (req.method === "OPTIONS") {
        return cors(new Response(null, { status: 204 }));
      }

      if (url.pathname.startsWith("/api/")) {
        return cors(await handleApi(req, url));
      }

      return serveStatic(url.pathname);
    },
  });

  console.log(`\n  Skill Vault running at http://localhost:${server.port}\n`);
  return server;
}
