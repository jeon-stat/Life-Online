import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const distDir = path.join(repoRoot, "dist");
const docsDir = path.join(repoRoot, "docs");
const legacyAppEntryNames = [
  "AppEntry-423fe7bd02e2640f1f6eb667ce43d3a6.js",
  "AppEntry-6b98cc00debc0c8f21e342558488593b.js",
];

function ensureDir(target) {
  fs.mkdirSync(target, { recursive: true });
}

function removeIfExists(target) {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
  }
}

function copyDir(source, target) {
  ensureDir(target);

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      copyDir(sourcePath, targetPath);
      continue;
    }

    ensureDir(path.dirname(targetPath));
    fs.copyFileSync(sourcePath, targetPath);
  }
}

function findCurrentAppEntryFile(rootDir) {
  const webDir = path.join(rootDir, "_expo", "static", "js", "web");
  if (!fs.existsSync(webDir)) {
    throw new Error(`web bundle folder not found: ${webDir}`);
  }

  const currentFile = fs
    .readdirSync(webDir)
    .filter((name) => /^AppEntry-[a-f0-9]+\.js$/.test(name))
    .sort()
    .at(-1);

  if (!currentFile) {
    throw new Error(`AppEntry bundle not found in: ${webDir}`);
  }

  return path.join(webDir, currentFile);
}

if (!fs.existsSync(distDir)) {
  throw new Error(`dist folder not found: ${distDir}`);
}

removeIfExists(path.join(docsDir, "_expo"));
removeIfExists(path.join(docsDir, "build-info.json"));
removeIfExists(path.join(docsDir, "index.html"));
removeIfExists(path.join(docsDir, "metadata.json"));
removeIfExists(path.join(docsDir, ".nojekyll"));

copyDir(distDir, docsDir);
fs.writeFileSync(path.join(docsDir, ".nojekyll"), "");

const currentAppEntryFile = findCurrentAppEntryFile(docsDir);
for (const legacyName of legacyAppEntryNames) {
  const legacyPath = path.join(docsDir, "_expo", "static", "js", "web", legacyName);
  fs.copyFileSync(currentAppEntryFile, legacyPath);
}

console.log("Synced dist -> docs for GitHub Pages.");
