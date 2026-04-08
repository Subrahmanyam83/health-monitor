import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getFileOrDefault, updateFile } from "@/lib/github";
import { ExerciseData, Exercise } from "@/types/exercise";

const DEFAULT_DATA: ExerciseData = { routineName: "My Routine", exercises: [] };

// Lower Back Relief Routine pre-seeded for the designated user
const SEED_DATA: ExerciseData = {
  routineName: "Lower Back Relief Routine",
  exercises: [
    { id: "1", name: "Cat-Cow", sets: 2, reps: 10, duration: "~2 min", description: "Lubricates facet joints & wakes up spinal muscles", bodyParts: ["back", "core"], phase: "Warm Up", order: 1, imageUrl: "https://cdn.motra.com/exercise-assets/6ac6cd50cf/thumbnailOriginal.jpg" },
    { id: "2", name: "Child's Pose", duration: "60 sec × 2 rounds (~2 min)", description: "Decompresses the lumbar spine & releases the low back", bodyParts: ["back", "hips", "nerve"], phase: "Warm Up", order: 2, imageUrl: "https://cdn.motra.com/exercise-assets/aab3357282/thumbnailOriginal.jpg" },
    { id: "3", name: "Supta Virasana", duration: "90 sec × 1–2 rounds (~2 min)", description: "Lengthens hip flexors to relieve anterior pelvic tilt", bodyParts: ["hips", "legs"], phase: "Release", order: 3, imageUrl: "https://cdn.motra.com/exercise-assets/60cbedf9ba/thumbnailOriginal.jpg" },
    { id: "4", name: "Reclined Spinal Twist", duration: "45 sec each side (~2 min)", description: "Releases QL & paraspinal tension along the spine", bodyParts: ["back", "nerve"], phase: "Release", order: 4, imageUrl: "https://cdn.motra.com/exercise-assets/888c3ffbd4/thumbnailOriginal.jpg" },
    { id: "5", name: "Single Knee-to-Chest + Marching", sets: 2, reps: 10, duration: "~3 min", description: "Decompresses lumbar & trains deep core (TVA) stability", bodyParts: ["back", "core", "nerve"], phase: "Release", order: 5, imageUrl: "https://cdn.motra.com/exercise-assets/da199823bf/thumbnailOriginal.jpg" },
    { id: "6", name: "Dead Pigeon (Figure-4)", duration: "60 sec each side (~2 min)", description: "Releases piriformis off the sciatic nerve", bodyParts: ["hips", "nerve", "back"], phase: "Release", order: 6, imageUrl: "https://cdn.motra.com/exercise-assets/08be8279ad/thumbnailOriginal.jpg" },
    { id: "7", name: "Supine Spinal Twist with Quad Stretch", duration: "45 sec each side (~2 min)", description: "Combines hip & spinal release — doubles SI joint decompression", bodyParts: ["back", "hips", "nerve"], phase: "Release", order: 7, imageUrl: "https://cdn.motra.com/exercise-assets/3034788555/thumbnailOriginal.jpg" },
    { id: "8", name: "Glute Bridge", sets: 3, reps: 12, duration: "~3 min", description: "Activates glutes so the lower back stops compensating", bodyParts: ["legs", "back", "core"], phase: "Activate", order: 8, imageUrl: "https://cdn.motra.com/exercise-assets/0b90543c13/thumbnailOriginal.jpg" },
  ],
};

const SEED_EMAIL = "gibraltor999@gmail.com";

async function getUserInfo() {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";
  const name = email.split("@")[0] ?? "unknown";
  return { email, name };
}

function getDataPath(name: string) {
  return `src/app/fit-day/users/${name}/data.json`;
}

export async function GET() {
  try {
    const { email, name } = await getUserInfo();
    const path = getDataPath(name);
    const { content } = await getFileOrDefault<ExerciseData>(path, DEFAULT_DATA);
    const data: ExerciseData = JSON.parse(content);

    // Seed gibraltor999 with the back pain routine on first load (read-only, persisted on first write)
    if (email === SEED_EMAIL && data.exercises.length === 0) {
      return NextResponse.json(SEED_DATA);
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch exercises" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name } = await getUserInfo();
    const path = getDataPath(name);
    const { content, sha } = await getFileOrDefault<ExerciseData>(path, DEFAULT_DATA);
    const data: ExerciseData = JSON.parse(content);

    const exercise: Exercise = {
      id: new Date().toISOString(),
      name: body.name,
      sets: body.sets ?? undefined,
      reps: body.reps ?? undefined,
      duration: body.duration ?? undefined,
      description: body.description ?? undefined,
      bodyParts: body.bodyParts ?? [],
      phase: body.phase ?? undefined,
      imageBase64: body.imageBase64 ?? undefined,
      imageUrl: body.imageUrl ?? undefined,
      order: data.exercises.length + 1,
    };

    data.exercises.push(exercise);
    await updateFile(path, JSON.stringify(data, null, 2) + "\n", sha, `Add exercise: ${exercise.name}`);
    return NextResponse.json({ success: true, exercise });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to add exercise" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { name } = await getUserInfo();
    const path = getDataPath(name);
    const { content, sha } = await getFileOrDefault<ExerciseData>(path, DEFAULT_DATA);
    const data: ExerciseData = JSON.parse(content);

    const idx = data.exercises.findIndex((e) => e.id === body.id);
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    data.exercises[idx] = { ...data.exercises[idx], ...body };
    await updateFile(path, JSON.stringify(data, null, 2) + "\n", sha, `Update exercise: ${body.name}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update exercise" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const { name } = await getUserInfo();
    const path = getDataPath(name);
    const { content, sha } = await getFileOrDefault<ExerciseData>(path, DEFAULT_DATA);
    const data: ExerciseData = JSON.parse(content);

    data.exercises = data.exercises.filter((e) => e.id !== id);
    await updateFile(path, JSON.stringify(data, null, 2) + "\n", sha, `Delete exercise ${id}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete exercise" }, { status: 500 });
  }
}
