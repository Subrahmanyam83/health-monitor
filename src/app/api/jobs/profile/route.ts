import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getFileOrDefault, updateFile, getFile } from "@/lib/github";
import { JobsData } from "@/lib/use-jobs";

const DEFAULT_DATA: JobsData = { profile: null, appliedJobs: [] };

async function getUserPath() {
  const user = await currentUser();
  const name = user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ?? "unknown";
  return `src/app/jobs/users/${name}/data.json`;
}

export async function GET() {
  try {
    const path = await getUserPath();
    const { content, sha } = await getFileOrDefault<JobsData>(path, DEFAULT_DATA);
    return NextResponse.json({ data: JSON.parse(content), sha });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const path = await getUserPath();
    const { data, sha } = await req.json() as { data: JobsData; sha: string };
    await updateFile(path, JSON.stringify(data, null, 2) + "\n", sha, "Update jobs data");
    const { sha: newSha } = await getFile(path);
    return NextResponse.json({ success: true, sha: newSha });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
