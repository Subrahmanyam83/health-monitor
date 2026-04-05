"use client";

import { useState, useRef, useEffect } from "react";
import { JobProfile } from "@/lib/use-jobs";

function RoleTags({ roles, onChange }: { roles: string[]; onChange: (r: string[]) => void }) {
  const [input, setInput] = useState("");

  function add() {
    const trimmed = input.trim();
    if (!trimmed || roles.includes(trimmed)) return;
    onChange([...roles, trimmed]);
    setInput("");
  }

  return (
    <div className="space-y-1.5">
      <p className="text-xs text-gray-400">Will search for: <span className="text-gray-300">(tap × to remove)</span></p>
      <div className="flex flex-wrap gap-1.5">
        {roles.map((r) => (
          <span key={r} className="flex items-center gap-1 text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">
            {r}
            <button type="button" onClick={() => onChange(roles.filter((x) => x !== r))} className="text-purple-300 hover:text-purple-600 leading-none">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-1.5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="Add a title…"
          className="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-indigo-400"
          style={{ fontSize: "14px" }}
        />
        <button
          type="button"
          onClick={add}
          className="text-xs px-3 py-1.5 rounded-lg bg-purple-50 text-purple-600 font-medium active:bg-purple-100"
        >
          Add
        </button>
      </div>
    </div>
  );
}

type Props = {
  initial?: JobProfile | null;
  onSave: (profile: JobProfile) => Promise<void>;
};

export function ProfileSetup({ initial, onSave }: Props) {
  const [preferredLocations, setPreferredLocations] = useState<string[]>(initial?.preferredLocations ?? []);
  const [locationInput, setLocationInput] = useState("");
  const [cvText, setCvText] = useState(initial?.cvText ?? "");
  const [cvFileName, setCvFileName] = useState(initial?.cvFileName ?? "");
  const [fullName, setFullName] = useState(initial?.fullName ?? "");
  const [currentRole, setCurrentRole] = useState(initial?.currentRole ?? "");
  const [yearsOfExperience, setYearsOfExperience] = useState(initial?.yearsOfExperience ?? 0);
  const [skills, setSkills] = useState<string[]>(initial?.skills ?? []);
  const [preferredRoles, setPreferredRoles] = useState<string[]>(initial?.preferredRoles ?? []);
  const [parsing, setParsing] = useState(false);
  const [parseErr, setParseErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [debugLines, setDebugLines] = useState<string[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const locationDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (locationDebounce.current) clearTimeout(locationDebounce.current);
    if (!locationInput || locationInput.length < 2) { setLocationSuggestions([]); return; }
    locationDebounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/location-suggest?q=${encodeURIComponent(locationInput)}`);
        const json = await res.json();
        setLocationSuggestions((json.results ?? []).filter((s: string) => !preferredLocations.includes(s)));
      } catch { setLocationSuggestions([]); }
    }, 350);
    return () => { if (locationDebounce.current) clearTimeout(locationDebounce.current); };
  }, [locationInput, preferredLocations]);

  function addLocation(loc: string) {
    const trimmed = loc.trim();
    if (!trimmed || preferredLocations.includes(trimmed)) return;
    setPreferredLocations((prev) => [...prev, trimmed]);
    setLocationInput("");
    setLocationSuggestions([]);
  }

  function removeLocation(loc: string) {
    setPreferredLocations((prev) => prev.filter((l) => l !== loc));
  }

  async function handleCvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true);
    setParseErr("");
    try {
      const form = new FormData();
      form.append("cv", file);
      const res = await fetch("/api/jobs/parse-cv", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setCvText(json.text);
      setCvFileName(json.fileName);
      setSkills(json.skills ?? []);
      setPreferredRoles(json.preferredRoles ?? []);
      setDebugLines(json.debugLines ?? []);
      if (json.extractedName) setFullName(json.extractedName);
      if (json.extractedRole) setCurrentRole(json.extractedRole);
      if (json.extractedYears) setYearsOfExperience(json.extractedYears);
    } catch (err) {
      setParseErr(err instanceof Error ? err.message : "Failed to parse CV");
    } finally {
      setParsing(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave({ fullName, currentRole, yearsOfExperience, skills, preferredRoles, preferredLocations, cvText, cvFileName });
    } finally {
      setSaving(false);
    }
  }

  const isValid = cvText && preferredLocations.length > 0;

  return (
    <div className="space-y-4">
      {/* CV Upload */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div>
          <p className="text-sm font-semibold text-gray-700">Upload Your CV <span className="text-xs font-normal text-gray-400">(PDF)</span></p>
          <p className="text-xs text-gray-400 mt-0.5">We'll extract your name, role, experience and skills automatically</p>
        </div>
        <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleCvUpload} />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={parsing}
          className="w-full h-12 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-500 active:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {parsing ? (
            <><div className="w-4 h-4 rounded-full border-2 border-gray-200 border-t-indigo-500 animate-spin" /> Extracting from CV…</>
          ) : cvFileName ? (
            <><span>📄</span> {cvFileName} — <span className="text-indigo-500">Replace</span></>
          ) : (
            <><span>📎</span> Choose PDF</>
          )}
        </button>
        {parseErr && <p className="text-xs text-red-500">{parseErr}</p>}

        {cvText && !parsing && (
          <div className="space-y-2 pt-1">
            {fullName && <p className="text-xs text-gray-700 font-medium">👤 {fullName}</p>}
            {currentRole
              ? <p className="text-xs text-gray-600">💼 {currentRole}{yearsOfExperience ? ` · ${yearsOfExperience} yrs` : ""}</p>
              : (
                <div className="space-y-1">
                  <p className="text-xs text-orange-500">⚠ Couldn't detect your role — enter it below:</p>
                  <input
                    type="text"
                    value={currentRole}
                    onChange={(e) => setCurrentRole(e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full text-sm border border-orange-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-400"
                    style={{ fontSize: "16px" }}
                  />
                  {debugLines.length > 0 && (
                    <details className="mt-1">
                      <summary className="text-[10px] text-gray-400 cursor-pointer">Show raw CV lines (debug)</summary>
                      <div className="mt-1 bg-gray-50 rounded-lg p-2 max-h-48 overflow-y-auto">
                        {debugLines.map((line, i) => (
                          <p key={i} className="text-[10px] text-gray-500 font-mono leading-5">{i + 1}: {line}</p>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              )
            }
            {skills.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Skills found:</p>
                <div className="flex flex-wrap gap-1">
                  {skills.map((s) => (
                    <span key={s} className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            )}
            <RoleTags roles={preferredRoles} onChange={setPreferredRoles} />
          </div>
        )}
      </div>

      {/* Locations */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2">
        <label className="text-xs text-gray-500">Preferred Locations</label>

        {/* Added locations */}
        {preferredLocations.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {preferredLocations.map((loc) => (
              <span key={loc} className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-medium">
                📍 {loc}
                <button
                  type="button"
                  onClick={() => removeLocation(loc)}
                  className="ml-0.5 text-indigo-400 hover:text-indigo-700 leading-none"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Input with autocomplete */}
        <div className="relative">
          <input
            type="text"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLocation(locationInput); } }}
            onBlur={() => setTimeout(() => setLocationSuggestions([]), 150)}
            placeholder={preferredLocations.length > 0 ? "Add another location…" : "e.g. London, Remote, Hyderabad"}
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-400"
            style={{ fontSize: "16px" }}
          />
          {locationSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden">
              {locationSuggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onMouseDown={() => addLocation(s)}
                  className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 active:bg-indigo-100 border-b border-gray-50 last:border-0"
                >
                  📍 {s}
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="text-[10px] text-gray-400">Press Enter or pick a suggestion to add. Add multiple.</p>
      </div>

      <button
        onClick={handleSave}
        disabled={!isValid || saving}
        className="w-full h-12 rounded-2xl text-sm font-semibold text-white disabled:opacity-40 active:scale-95 transition-all"
        style={{ background: "#4f46e5" }}
      >
        {saving ? "Saving…" : initial ? "Update Profile" : "Save & Find Jobs"}
      </button>
    </div>
  );
}
