"use client";

import { useState, useEffect, useRef } from "react";
import { Exercise, ExerciseData, BodyPart } from "@/types/exercise";

const BODY_PARTS: BodyPart[] = ["back", "core", "hips", "legs", "arms", "shoulders", "chest", "nerve", "full body"];
const PHASES = ["Warm Up", "Release", "Activate", "Night"];

const PHASE_COLORS: Record<string, { bg: string; text: string }> = {
  "Warm Up":  { bg: "#fef3c7", text: "#b45309" },
  "Release":  { bg: "#dbeafe", text: "#1d4ed8" },
  "Activate": { bg: "#dcfce7", text: "#15803d" },
  "Night":    { bg: "#ede9fe", text: "#6d28d9" },
};

function BodyPartBadge({ part }: { part: string }) {
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#f3f4f6", color: "#6b7280" }}>
      {part}
    </span>
  );
}

function ImageLightbox({ src, alt, onClose, onReplace, onRemove }: {
  src: string;
  alt: string;
  onClose: () => void;
  onReplace: () => void;
  onRemove: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={onClose}
    >
      <div className="relative max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        {/* Top-right action buttons */}
        <div className="absolute -top-3 -right-3 z-10 flex gap-1.5">
          <button
            onClick={onReplace}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "#ea580c", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
            title="Replace image"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button
            onClick={onRemove}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "#ef4444", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
            title="Remove image"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
            title="Close"
          >
            <svg className="w-4 h-4" style={{ color: "#374151" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <img src={src} alt={alt} className="w-full rounded-2xl" style={{ maxHeight: "70vh", objectFit: "contain" }} />
        <p className="text-center text-white text-sm font-medium mt-3 opacity-80">{alt}</p>
      </div>
    </div>
  );
}

function AddImageModal({ onSave, onClose }: {
  onSave: (image: { imageBase64?: string; imageUrl?: string }) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const [url, setUrl] = useState("");
  const imgRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      onSave({ imageBase64: e.target?.result as string });
      onClose();
    };
    reader.readAsDataURL(file);
  };

  const handleUrl = () => {
    if (url.trim()) {
      onSave({ imageUrl: url.trim() });
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl bg-white p-5 pb-8 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold" style={{ color: "#111827" }}>Add Image</p>
          <button onClick={onClose}>
            <svg className="w-5 h-5" style={{ color: "#9ca3af" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl p-1 gap-1" style={{ background: "#f3f4f6" }}>
          {(["upload", "url"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: tab === t ? "#fff" : "transparent",
                color: tab === t ? "#111827" : "#9ca3af",
                boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
              }}>
              {t === "upload" ? "Upload photo" : "Paste URL"}
            </button>
          ))}
        </div>

        {tab === "upload" ? (
          <button
            onClick={() => imgRef.current?.click()}
            className="flex flex-col items-center gap-3 py-8 rounded-2xl border-2 border-dashed"
            style={{ borderColor: "#e5e7eb" }}
          >
            <svg className="w-8 h-8" style={{ color: "#d1d5db" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium" style={{ color: "#6b7280" }}>Tap to choose a photo</p>
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <input
              className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: "#e5e7eb", background: "#fafafa", color: "#111827" }}
              placeholder="https://example.com/image.jpg"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              autoFocus
            />
            <button
              onClick={handleUrl}
              disabled={!url.trim()}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", opacity: url.trim() ? 1 : 0.5 }}
            >
              Save
            </button>
          </div>
        )}

        <input ref={imgRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      </div>
    </div>
  );
}

function ExerciseCard({ ex, onDelete, onUpdateImage }: {
  ex: Exercise;
  onDelete: (id: string) => void;
  onUpdateImage: (id: string, image: { imageBase64?: string; imageUrl?: string }) => void;
}) {
  const [lightbox, setLightbox] = useState(false);
  const [addingImage, setAddingImage] = useState(false);
  const phase = ex.phase ? PHASE_COLORS[ex.phase] : null;
  const setsReps = ex.sets && ex.reps ? `${ex.sets} sets × ${ex.reps} reps` : ex.duration ?? "";
  const imageSrc = ex.imageBase64 ?? ex.imageUrl;
  const hasMedia = imageSrc || ex.videoUrl;

  return (
    <>
      {lightbox && imageSrc && (
        <ImageLightbox
          src={imageSrc}
          alt={ex.name}
          onClose={() => setLightbox(false)}
          onReplace={() => { setLightbox(false); setAddingImage(true); }}
          onRemove={() => { setLightbox(false); onUpdateImage(ex.id, { imageBase64: undefined, imageUrl: undefined }); }}
        />
      )}
      {addingImage && (
        <AddImageModal
          onSave={(img) => { onUpdateImage(ex.id, img); setAddingImage(false); }}
          onClose={() => setAddingImage(false)}
        />
      )}
      <div className="rounded-2xl bg-white p-4 flex gap-3" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
        {/* Thumbnail */}
        <div className="flex-shrink-0 relative w-14 h-14">
          <div
            className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center"
            style={{ background: "#fff7ed", cursor: "pointer" }}
            onClick={() => imageSrc ? setLightbox(true) : setAddingImage(true)}
          >
            {ex.videoUrl ? (
              <video src={ex.videoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
            ) : imageSrc ? (
              <img src={imageSrc} alt={ex.name} className="w-full h-full object-cover" />
            ) : (
              <>
                <span className="text-xl font-bold" style={{ color: "#ea580c" }}>{ex.order}</span>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-xl"
                  style={{ background: "rgba(234,88,12,0.15)" }}>
                  <svg className="w-5 h-5" style={{ color: "#ea580c" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-bold leading-tight" style={{ color: "#111827" }}>{ex.name}</p>
              {setsReps && <p className="text-xs mt-0.5 font-medium" style={{ color: "#ea580c" }}>{setsReps}</p>}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {phase && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: phase.bg, color: phase.text }}>
                  {ex.phase}
                </span>
              )}
              <button onClick={() => onDelete(ex.id)} className="p-1 rounded-lg transition-colors" style={{ color: "#d1d5db" }}
                onMouseOver={(e) => (e.currentTarget.style.color = "#ef4444")}
                onMouseOut={(e) => (e.currentTarget.style.color = "#d1d5db")}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          {ex.description && <p className="text-xs mt-1 leading-relaxed" style={{ color: "#6b7280" }}>{ex.description}</p>}
          {ex.bodyParts && ex.bodyParts.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {ex.bodyParts.map((p) => <BodyPartBadge key={p} part={p} />)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function AddExerciseForm({ onSave, onCancel }: { onSave: (data: Partial<Exercise>) => Promise<void>; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [bodyParts, setBodyParts] = useState<BodyPart[]>([]);
  const [phase, setPhase] = useState<string | undefined>();
  const [imageBase64, setImageBase64] = useState<string | undefined>();
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);

  const togglePart = (p: BodyPart) =>
    setBodyParts((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);

  const handleImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => { setImageBase64(e.target?.result as string); setImageUrl(""); };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await onSave({
      name: name.trim(),
      sets: sets ? Number(sets) : undefined,
      reps: reps ? Number(reps) : undefined,
      duration: duration || undefined,
      description: description || undefined,
      bodyParts,
      phase,
      imageBase64,
      imageUrl: imageUrl.trim() || undefined,
    });
    setSaving(false);
  };

  const input = "w-full border rounded-xl px-3 py-2.5 text-sm outline-none";
  const inputStyle = { borderColor: "#e5e7eb", background: "#fafafa", color: "#111827" };
  const previewSrc = imageBase64 ?? (imageUrl.trim() || undefined);

  return (
    <div className="rounded-2xl bg-white p-4 flex flex-col gap-3" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
      <p className="text-sm font-bold" style={{ color: "#111827" }}>Add Exercise</p>

      <input className={input} style={inputStyle} placeholder="Exercise name *" value={name} onChange={(e) => setName(e.target.value)} />

      <div className="grid grid-cols-2 gap-2">
        <input className={input} style={inputStyle} placeholder="Sets" type="number" min="1" value={sets} onChange={(e) => setSets(e.target.value)} />
        <input className={input} style={inputStyle} placeholder="Reps" type="number" min="1" value={reps} onChange={(e) => setReps(e.target.value)} />
      </div>

      <input className={input} style={inputStyle} placeholder="Duration (optional, e.g. 60 sec each side)" value={duration} onChange={(e) => setDuration(e.target.value)} />

      <textarea className={input} style={{ ...inputStyle, resize: "none" }} placeholder="Description (optional)" rows={2}
        value={description} onChange={(e) => setDescription(e.target.value)} />

      {/* Phase */}
      <div>
        <p className="text-xs font-semibold mb-1.5" style={{ color: "#9ca3af" }}>Phase (optional)</p>
        <div className="flex gap-2">
          {PHASES.map((p) => {
            const colors = PHASE_COLORS[p];
            const active = phase === p;
            return (
              <button key={p} onClick={() => setPhase(active ? undefined : p)}
                className="text-xs font-semibold px-2.5 py-1 rounded-full border transition-all"
                style={{
                  background: active ? colors.bg : "#f9fafb",
                  color: active ? colors.text : "#6b7280",
                  borderColor: active ? colors.text : "#e5e7eb",
                }}>
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* Body parts */}
      <div>
        <p className="text-xs font-semibold mb-1.5" style={{ color: "#9ca3af" }}>Body parts (optional)</p>
        <div className="flex flex-wrap gap-1.5">
          {BODY_PARTS.map((p) => (
            <button key={p} onClick={() => togglePart(p)}
              className="text-xs font-semibold px-2.5 py-1 rounded-full border transition-all"
              style={{
                background: bodyParts.includes(p) ? "#fff7ed" : "#f9fafb",
                color: bodyParts.includes(p) ? "#ea580c" : "#6b7280",
                borderColor: bodyParts.includes(p) ? "#ea580c" : "#e5e7eb",
              }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Image */}
      <div>
        <p className="text-xs font-semibold mb-1.5" style={{ color: "#9ca3af" }}>Image (optional)</p>
        {previewSrc ? (
          <div className="relative w-20 h-20 rounded-xl overflow-hidden">
            <img src={previewSrc} alt="preview" className="w-full h-full object-cover" />
            <button onClick={() => { setImageBase64(undefined); setImageUrl(""); }}
              className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.5)" }}>
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <button onClick={() => imgRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium"
              style={{ borderColor: "#e5e7eb", color: "#6b7280" }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Upload photo
            </button>
            <input
              className="w-full border rounded-xl px-3 py-2 text-xs outline-none"
              style={{ borderColor: "#e5e7eb", background: "#fafafa", color: "#111827" }}
              placeholder="Or paste image URL…"
              value={imageUrl}
              onChange={(e) => { setImageUrl(e.target.value); setImageBase64(undefined); }}
            />
          </div>
        )}
        <input ref={imgRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImage(f); }} />
      </div>

      <div className="flex gap-2 mt-1">
        <button onClick={handleSave} disabled={!name.trim() || saving}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity"
          style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", opacity: name.trim() && !saving ? 1 : 0.5 }}>
          {saving ? "Saving…" : "Save Exercise"}
        </button>
        <button onClick={onCancel}
          className="px-4 py-2.5 rounded-xl text-sm font-medium"
          style={{ background: "#f3f4f6", color: "#6b7280" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export function FitDayApp() {
  const [data, setData] = useState<ExerciseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/exercise")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setError("Failed to load exercises"))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (exercise: Partial<Exercise>) => {
    const res = await fetch("/api/exercise", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(exercise) });
    const result = await res.json();
    if (result.success) {
      setData((prev) => prev ? { ...prev, exercises: [...prev.exercises, result.exercise] } : prev);
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/exercise?id=${id}`, { method: "DELETE" });
    setData((prev) => prev ? { ...prev, exercises: prev.exercises.filter((e) => e.id !== id) } : prev);
  };

  const handleUpdateImage = async (id: string, image: { imageBase64?: string; imageUrl?: string }) => {
    const exercise = data?.exercises.find((e) => e.id === id);
    if (!exercise) return;
    await fetch("/api/exercise", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...exercise, ...image }),
    });
    setData((prev) => prev ? {
      ...prev,
      exercises: prev.exercises.map((e) => e.id === id ? { ...e, ...image } : e),
    } : prev);
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-10 h-10 rounded-full border-4 border-orange-100 border-t-orange-500 animate-spin" />
    </div>
  );

  if (error) return <p className="text-center py-8 text-sm" style={{ color: "#ef4444" }}>{error}</p>;

  const exercises = data?.exercises ?? [];
  const phases = PHASES;
  const ungrouped = exercises.filter((e) => !e.phase);
  const grouped = phases.map((phase) => ({ phase, items: exercises.filter((e) => e.phase === phase) })).filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col gap-4">
      {data?.routineName && (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-bold" style={{ color: "#111827" }}>{data.routineName}</p>
            <p className="text-xs" style={{ color: "#9ca3af" }}>{exercises.length} exercise{exercises.length !== 1 ? "s" : ""}</p>
          </div>
          {!adding && (
            <button onClick={() => setAdding(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add
            </button>
          )}
        </div>
      )}

      {adding && <AddExerciseForm onSave={handleAdd} onCancel={() => setAdding(false)} />}

      {exercises.length === 0 && !adding && (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "#fff7ed" }}>
            <svg className="w-8 h-8" style={{ color: "#f97316" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold" style={{ color: "#111827" }}>No exercises yet</p>
            <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>Build your personal routine</p>
          </div>
          <button onClick={() => setAdding(true)}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
            Add your first exercise
          </button>
        </div>
      )}

      {grouped.map(({ phase, items }) => (
        <div key={phase}>
          <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "#d1d5db" }}>{phase}</p>
          <div className="flex flex-col gap-3">
            {items.map((ex) => <ExerciseCard key={ex.id} ex={ex} onDelete={handleDelete} onUpdateImage={handleUpdateImage} />)}
          </div>
        </div>
      ))}

      {ungrouped.length > 0 && (
        <div className="flex flex-col gap-3">
          {ungrouped.map((ex) => <ExerciseCard key={ex.id} ex={ex} onDelete={handleDelete} onUpdateImage={handleUpdateImage} />)}
        </div>
      )}
    </div>
  );
}
