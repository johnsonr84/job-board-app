#!/usr/bin/env node
/**
 * Generates a copyable conventional commit message for staged files.
 * Run: npm run staged
 * Output is suitable for: git commit -m "$(npm run staged --silent)"
 */

import { execSync } from "child_process";

const STAGED = execSync("git diff --cached --name-only", { encoding: "utf-8" })
  .trim()
  .split("\n")
  .filter(Boolean);

if (STAGED.length === 0) {
  console.error("No staged files. Stage some files with git add.");
  process.exit(1);
}

function scopeFromPath(path) {
  const top = path.split("/")[0];
  const map = {
    app: "app",
    components: "ui",
    convex: "convex",
    lib: "lib",
  };
  return map[top] || top;
}

function typeFromPath(path) {
  const lower = path.toLowerCase();
  if (/\b(test|spec|\.test\.|\.spec\.)/.test(lower)) return "test";
  if (/\b(fix|bug|patch)\b/.test(lower)) return "fix";
  if (/^(deps|package\.json|lock)/.test(path) || lower.includes("config")) return "chore";
  if (/\b(doc|readme|\.md)\b/.test(lower)) return "docs";
  if (/\b(style|css|tailwind)\b/.test(lower)) return "style";
  if (/\b(refactor)\b/.test(lower)) return "refactor";
  return "feat";
}

function shortLabel(path) {
  const name = path.replace(/\.(tsx?|jsx?|css|json|md)$/, "").split("/").pop();
  if (name === "page") return path.split("/").slice(0, -1).join("/");
  if (name === "layout") return path.split("/").slice(0, -1).join("/");
  return name;
}

const scopes = [...new Set(STAGED.map(scopeFromPath))];
const types = [...new Set(STAGED.map(typeFromPath))];
const primaryType = types.includes("fix") ? "fix" : types.includes("chore") ? "chore" : types[0] ?? "feat";
const scope = scopes.length === 1 ? scopes[0] : null;

const bullets = STAGED.map((p) => `- ${shortLabel(p)}`).slice(0, 8);
const needBullets = STAGED.length > 1 && STAGED.length <= 10;

const scopePart = scope ? `(${scope})` : "";
const firstLine = `${primaryType}${scopePart}: update ${scope || "staged"} files`;

if (needBullets) {
  console.log([firstLine, "", ...bullets].join("\n"));
} else {
  console.log(firstLine);
}
