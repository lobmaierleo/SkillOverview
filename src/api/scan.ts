import { getScanStatus } from "../db.ts";
import { runFullScan, scanSingleProject, isScanning } from "../scanner/index.ts";

export async function handleStartScan(req: Request): Promise<Response> {
  if (isScanning()) {
    return Response.json({ error: "Scan already in progress" }, { status: 409 });
  }

  let projectId: number | undefined;
  try {
    const body = await req.json() as { projectId?: number };
    projectId = body.projectId;
  } catch { /* no body */ }

  // Run scan in background
  if (projectId) {
    scanSingleProject(projectId).catch(console.error);
  } else {
    runFullScan().catch(console.error);
  }

  return Response.json({ status: "started" });
}

export function handleScanStatus(): Response {
  return Response.json(getScanStatus());
}
