const REPO_OWNER = "jeon-stat";
const REPO_NAME = "Life-Online";
const CONTENT_PATH = "public/config/layout-config.json";
const BRANCH = "main";

function toBase64(value) {
  if (typeof window !== "undefined" && typeof window.btoa === "function") {
    return window.btoa(unescape(encodeURIComponent(value)));
  }

  return "";
}

export async function saveLayoutConfigToGitHub({ token, content }) {
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const readResponse = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${CONTENT_PATH}?ref=${BRANCH}`,
    { headers },
  );

  if (!readResponse.ok) {
    throw new Error("github_read_failed");
  }

  const existing = await readResponse.json();

  const writeResponse = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${CONTENT_PATH}`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message: "Update layout config",
        content: toBase64(content),
        sha: existing.sha,
        branch: BRANCH,
      }),
    },
  );

  if (!writeResponse.ok) {
    throw new Error("github_write_failed");
  }

  return writeResponse.json();
}
