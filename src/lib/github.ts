const GITHUB_TOKEN = (process.env.APP_GITHUB_TOKEN ?? process.env.GITHUB_TOKEN)!;
const GITHUB_OWNER = process.env.GITHUB_OWNER!;
const GITHUB_REPO = process.env.GITHUB_REPO!;
const BASE_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents`;

interface GitHubFileResponse {
  content: string;
  sha: string;
  encoding: string;
}

export async function getFile(path: string): Promise<{ content: string; sha: string }> {
  const res = await fetch(`${BASE_URL}/${path}`, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`GitHub getFile failed: ${res.status} ${res.statusText}`);
  }

  const data: GitHubFileResponse = await res.json();
  const decoded = Buffer.from(data.content, "base64").toString("utf-8");
  return { content: decoded, sha: data.sha };
}

export async function getFileOrDefault<T>(
  path: string,
  defaultValue: T
): Promise<{ content: string; sha: string }> {
  try {
    return await getFile(path);
  } catch {
    return { content: JSON.stringify(defaultValue, null, 2), sha: "" };
  }
}

export async function updateFile(
  path: string,
  content: string,
  sha: string,
  message: string
): Promise<void> {
  const encoded = Buffer.from(content).toString("base64");

  const res = await fetch(`${BASE_URL}/${path}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, content: encoded, ...(sha ? { sha } : {}) }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub updateFile failed: ${res.status} ${err}`);
  }
}
