export type BodyPart = "back" | "core" | "hips" | "legs" | "arms" | "shoulders" | "chest" | "nerve" | "full body";

export type Exercise = {
  id: string;
  name: string;
  sets?: number;
  reps?: number;
  duration?: string;      // e.g. "60 sec each side"
  description?: string;
  bodyParts?: BodyPart[];
  phase?: string;         // e.g. "Warm Up", "Release", "Activate"
  imageBase64?: string;   // optional user-uploaded image (base64)
  imageUrl?: string;      // optional external image URL
  videoBase64?: string;   // optional user-uploaded video (base64)
  videoUrl?: string;      // optional video clip URL (loops silently)
  order: number;
};

export type ExerciseData = {
  routineName: string;
  exercises: Exercise[];
};
