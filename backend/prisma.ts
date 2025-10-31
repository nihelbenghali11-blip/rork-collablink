import { PrismaClient } from "./generated/prisma";

(function ensureEnvLoaded() {
  try {
    if (typeof process !== "undefined" && !process.env.DATABASE_URL) {
      // Try to load backend/.env manually without dotenv
      const fs = require("fs");
      const path = require("path");
      const envPath = path.resolve(process.cwd(), "backend/.env");
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf-8");
        content.split(/\r?\n/).forEach((line: string) => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) return;
          const eqIndex = trimmed.indexOf("=");
          if (eqIndex === -1) return;
          const key = trimmed.slice(0, eqIndex).trim();
          let value = trimmed.slice(eqIndex + 1).trim();
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = value;
          }
        });
        console.log("[backend] Loaded env from backend/.env");
      }
    }
  } catch (e) {
    console.warn("[backend] Failed to load backend/.env:", e);
  }
})();

const prisma = new PrismaClient();

export default prisma;
