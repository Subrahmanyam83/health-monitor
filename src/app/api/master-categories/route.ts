import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getFile, getFileOrDefault, updateFile } from "@/lib/github";
import { MasterCategory } from "@/lib/use-master-list";

const SHARED_MASTER_PATH = "src/app/groceries/data/master-categories.json";
const PRIVILEGED_EMAILS = ["gibraltor999@gmail.com", "saineelimb1@gmail.com", "saineelimab1@gmail.com"];

async function getUserInfo() {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";
  const name = email.split("@")[0] ?? "unknown";
  return { email, name };
}

function getMasterPath(email: string, name: string) {
  // Privileged users share one master list — changes from either are visible to both
  if (PRIVILEGED_EMAILS.includes(email)) return SHARED_MASTER_PATH;
  return `src/app/groceries/users/${name}/master-categories.json`;
}

export async function GET() {
  try {
    const { email, name } = await getUserInfo();
    const path = getMasterPath(email, name);
    try {
      const { content } = await getFile(path);
      return NextResponse.json(JSON.parse(content));
    } catch {
      return NextResponse.json([]);
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load master categories" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { email, name } = await getUserInfo();
    const path = getMasterPath(email, name);
    const categories: MasterCategory[] = await req.json();
    const { sha } = await getFileOrDefault<MasterCategory[]>(path, []);
    await updateFile(path, JSON.stringify(categories, null, 2) + "\n", sha, "chore: update master categories");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save master categories" }, { status: 500 });
  }
}
