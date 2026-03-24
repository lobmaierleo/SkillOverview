import { getTools } from "../db.ts";

export function handleTools(): Response {
  return Response.json({ tools: getTools() });
}
