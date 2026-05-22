import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";

const html = await readFile(new URL("./index.html", import.meta.url), "utf8");

assert.match(html, /귀여운 3D 사람 캐릭터/);
assert.match(html, /내 캐릭터/);
assert.match(html, /버튼을 누르면 캐릭터가 성장합니다/);

console.log("test-version html ok");
