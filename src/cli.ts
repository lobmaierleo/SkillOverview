#!/usr/bin/env bun
import { startServer } from "./server.ts";
import { runFullScan } from "./scanner/index.ts";
import { getDb } from "./db.ts";

const args = process.argv.slice(2);

function showHelp() {
  console.log(`
  Skill Vault v0.1.0 - AI Coding Tool Skills Overview

  Usage:
    skill-vault                Start the web server
    skill-vault scan           Run a scan and print results
    skill-vault --help         Show this help

  Options:
    --port <number>    Server port (default: 7483)
    --no-open          Don't open browser automatically
    --version          Show version
`);
}

if (args.includes("--help") || args.includes("-h")) {
  showHelp();
  process.exit(0);
}

if (args.includes("--version") || args.includes("-v")) {
  console.log("0.1.0");
  process.exit(0);
}

// Initialize database
getDb();

if (args[0] === "scan") {
  console.log("Scanning for AI skills...");
  const count = await runFullScan();
  console.log(`Found ${count} skills.`);
  process.exit(0);
}

// Start server
const portIdx = args.indexOf("--port");
const port = portIdx >= 0 ? Number(args[portIdx + 1]) : 7483;
const noOpen = args.includes("--no-open");

// Run initial scan
console.log("Running initial scan...");
await runFullScan();

// Start HTTP server
startServer(port);

// Open browser
if (!noOpen) {
  Bun.spawn(["open", `http://localhost:${port}`]);
}
