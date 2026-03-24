import { getStats } from "../db.ts";

export function handleStats(): Response {
  return Response.json(getStats());
}
