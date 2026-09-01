import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, relative } from "node:path";

const root = process.cwd();
const outputFlag = process.argv.indexOf("--out");
const output = resolve(root, outputFlag >= 0 ? process.argv[outputFlag + 1] : "dist");
const excludedNames = new Set([".git", ".github", "node_modules", "dist", "supabase", "scripts", ".env", ".env.local"]);
const outputRootName = relative(root, output).split(/[\\/]/).filter(Boolean)[0];
const assetVersion = process.env.GITHUB_SHA || "local";

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
const readConfigValue = (...names) => names.map((name) => process.env[name] || localValues[name]).find(Boolean) || "";
const config = {
  // Supabase Connect uses NEXT_PUBLIC_* names. Previous names remain only as
  // an upgrade fallback for local builds and existing GitHub Variables.
  url: readConfigValue("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL"),
  publishableKey: readConfigValue("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "SUPABASE_PUBLISHABLE_KEY")
};

const requiresSupabaseConfig = process.env.CINEVERSE_REQUIRE_SUPABASE_CONFIG === "true";
if (requiresSupabaseConfig && (!config.url || !config.publishableKey)) {
  const missing = [
    !config.url && "NEXT_PUBLIC_SUPABASE_URL",
    !config.publishableKey && "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
  ].filter(Boolean).join(", ");
  throw new Error(`GitHub Pages deployment stopped: missing required GitHub Variable(s): ${missing}. Add them to Repository Variables or the github-pages environment, then run the workflow again.`);
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
const sourceEntries = await readdir(root, { withFileTypes: true });
await Promise.all(sourceEntries
  .filter((entry) => !excludedNames.has(entry.name) && entry.name !== outputRootName)
  .map((entry) => cp(resolve(root, entry.name), resolve(output, entry.name), { recursive: true })));

const versionedAssetPattern = /(assets\/(?:runtime-config|supabase-client|cineverse-repository|film-data|app)\.js)(?:\?v=[^"'\s>]*)?/g;
const rewriteAssetVersions = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  await Promise.all(entries.map(async (entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      await rewriteAssetVersions(path);
      return;
    }
    if (!entry.isFile() || !entry.name.endsWith(".html")) return;
    const html = await readFile(path, "utf8");
    const rewritten = html.replace(versionedAssetPattern, `$1?v=${assetVersion}`);
    if (rewritten !== html) await writeFile(path, rewritten, "utf8");
  }));
};

// Every Pages deployment gets a unique asset URL. This prevents browsers from
// keeping an earlier, blank runtime-config.js after Supabase Variables change.
await rewriteAssetVersions(output);

const safeJson = (value) => JSON.stringify(value).replace(/</g, "\\u003c");
const runtimeConfig = `/* Generated at build time. Publishable key only; RLS protects data. */\nwindow.CINEVERSE_SUPABASE_CONFIG = Object.freeze({\n  url: ${safeJson(config.url)},\n  publishableKey: ${safeJson(config.publishableKey)}\n});\n`;
await writeFile(resolve(output, "assets", "runtime-config.js"), runtimeConfig, "utf8");
await writeFile(resolve(output, ".nojekyll"), "", "utf8");

if (config.url && config.publishableKey) {
  console.log("GitHub Pages artifact built with public Supabase configuration.");
} else {
  console.log("GitHub Pages artifact built without Supabase configuration; the safe sample fallback will remain active.");
}
