import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, relative } from "node:path";

const root = process.cwd();
const outputFlag = process.argv.indexOf("--out");
const output = resolve(root, outputFlag >= 0 ? process.argv[outputFlag + 1] : "dist");
const excludedNames = new Set([".git", ".github", "node_modules", "dist", "supabase", "scripts", ".env", ".env.local"]);
const outputRootName = relative(root, output).split(/[\\/]/).filter(Boolean)[0];

const parseDotenv = async () => {
  const localFile = resolve(root, ".env.local");
  if (!existsSync(localFile)) return {};
  const text = await readFile(localFile, "utf8");
  return Object.fromEntries(text.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith("#") && line.includes("=")).map((line) => {
    const index = line.indexOf("=");
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim().replace(/^("|')|("|')$/g, "");
    return [key, value];
  }));
};

const localValues = await parseDotenv();
const config = {
  url: process.env.SUPABASE_URL || localValues.SUPABASE_URL || "",
  publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY || localValues.SUPABASE_PUBLISHABLE_KEY || ""
};

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
const sourceEntries = await readdir(root, { withFileTypes: true });
await Promise.all(sourceEntries
  .filter((entry) => !excludedNames.has(entry.name) && entry.name !== outputRootName)
  .map((entry) => cp(resolve(root, entry.name), resolve(output, entry.name), { recursive: true })));

const safeJson = (value) => JSON.stringify(value).replace(/</g, "\\u003c");
const runtimeConfig = `/* Generated at build time. Publishable key only; RLS protects data. */\nwindow.CINEVERSE_SUPABASE_CONFIG = Object.freeze({\n  url: ${safeJson(config.url)},\n  publishableKey: ${safeJson(config.publishableKey)}\n});\n`;
await writeFile(resolve(output, "assets", "runtime-config.js"), runtimeConfig, "utf8");
await writeFile(resolve(output, ".nojekyll"), "", "utf8");

if (config.url && config.publishableKey) {
  console.log("GitHub Pages artifact built with public Supabase configuration.");
} else {
  console.log("GitHub Pages artifact built without Supabase configuration; the safe sample fallback will remain active.");
}
