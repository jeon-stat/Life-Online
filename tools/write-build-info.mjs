import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const generatedDir = path.join(repoRoot, "src", "generated");
const publicDir = path.join(repoRoot, "public");

const formatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const parts = Object.fromEntries(
  formatter.formatToParts(new Date()).map(({ type, value }) => [type, value]),
);
const updatedAt = `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;
const label = `수정 ${updatedAt}`;

fs.mkdirSync(generatedDir, { recursive: true });
fs.mkdirSync(publicDir, { recursive: true });

fs.writeFileSync(
  path.join(generatedDir, "buildInfo.js"),
  `export const LAST_UPDATED_LABEL = ${JSON.stringify(label)};\n`,
);

fs.writeFileSync(
  path.join(publicDir, "build-info.json"),
  `${JSON.stringify({ updatedAt, label }, null, 2)}\n`,
);

console.log(`Wrote build info: ${label}`);
