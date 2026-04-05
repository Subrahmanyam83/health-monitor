"use client";

import { useState, useRef } from "react";
import { JobProfile } from "@/lib/use-jobs";

type Props = {
  initial?: JobProfile | null;
  onSave: (profile: JobProfile) => Promise<void>;
};

export function ProfileSetup({ initial, onSave }: Props) {
  const [preferredLocation, setPreferredLocation] = useState(initial?.preferredLocation ?? "");
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
  const fileRef = useRef<HTMLInputElement>(null);

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
      await onSave({ fullName, currentRole, yearsOfExperience, skills, preferredRoles, preferredLocation, cvText, cvFileName });
    } finally {
      setSaving(false);
    }
  }

  const isValid = cvText && preferredLocation;

  return (
    <div className="space-y-4">
      {/* CV Upload — first */}
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
            {currentRole && <p className="text-xs text-gray-600">💼 {currentRole}{yearsOfExperience ? ` · ${yearsOfExperience} yrs` : ""}</p>}
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
            {preferredRoles.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Will search for:</p>
                <div className="flex flex-wrap gap-1">
                  {preferredRoles.map((r) => (
                    <span key={r} className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">{r}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Location only */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-1">
        <label className="text-xs text-gray-500">Preferred Location</label>
        <input
          type="text"
          value={preferredLocation}
          onChange={(e) => setPreferredLocation(e.target.value)}
          placeholder="e.g. Hyderabad, Remote, Bangalore"
          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-400"
          style={{ fontSize: "16px" }}
        />
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
