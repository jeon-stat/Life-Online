import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const distDir = path.join(repoRoot, "dist");
const docsDir = path.join(repoRoot, "docs");

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

console.log("Synced dist -> docs for GitHub Pages.");
