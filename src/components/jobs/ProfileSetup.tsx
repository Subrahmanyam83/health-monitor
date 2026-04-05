"use client";

import { useState, useRef } from "react";
import { JobProfile } from "@/lib/use-jobs";

type Props = {
  initial?: JobProfile | null;
  onSave: (profile: JobProfile) => Promise<void>;
};

export function ProfileSetup({ initial, onSave }: Props) {
  const [fullName, setFullName] = useState(initial?.fullName ?? "");
  const [currentRole, setCurrentRole] = useState(initial?.currentRole ?? "");
  const [yearsOfExperience, setYearsOfExperience] = useState(String(initial?.yearsOfExperience ?? ""));
  const [skillsInput, setSkillsInput] = useState(initial?.skills?.join(", ") ?? "");
  const [rolesInput, setRolesInput] = useState(initial?.preferredRoles?.join(", ") ?? "");
  const [preferredLocation, setPreferredLocation] = useState(initial?.preferredLocation ?? "");
  const [cvText, setCvText] = useState(initial?.cvText ?? "");
  const [cvFileName, setCvFileName] = useState(initial?.cvFileName ?? "");
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
    } catch (err) {
      setParseErr(err instanceof Error ? err.message : "Failed to parse CV");
    } finally {
      setParsing(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave({
        fullName,
        currentRole,
        yearsOfExperience: Number(yearsOfExperience),
        skills: skillsInput.split(",").map((s) => s.trim()).filter(Boolean),
        preferredRoles: rolesInput.split(",").map((s) => s.trim()).filter(Boolean),
        preferredLocation,
        cvText,
        cvFileName,
      });
    } finally {
      setSaving(false);
    }
  }

  const isValid = fullName && currentRole && skillsInput && rolesInput;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
        <p className="text-sm font-semibold text-gray-700">Your Profile</p>

        {[
          { label: "Full Name", value: fullName, set: setFullName, placeholder: "e.g. Subrahmanyam Rentala" },
          { label: "Current Role", value: currentRole, set: setCurrentRole, placeholder: "e.g. Senior Software Engineer" },
          { label: "Years of Experience", value: yearsOfExperience, set: setYearsOfExperience, placeholder: "e.g. 10", type: "number" },
          { label: "Preferred Location", value: preferredLocation, set: setPreferredLocation, placeholder: "e.g. Hyderabad, Remote" },
        ].map(({ label, value, set, placeholder, type }) => (
          <div key={label} className="space-y-1">
            <label className="text-xs text-gray-500">{label}</label>
            <input
              type={type ?? "text"}
              value={value}
              onChange={(e) => set(e.target.value)}
              placeholder={placeholder}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-400"
              style={{ fontSize: "16px" }}
            />
          </div>
        ))}

        <div className="space-y-1">
          <label className="text-xs text-gray-500">Key Skills <span className="text-gray-400">(comma separated)</span></label>
          <input
            type="text"
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            placeholder="e.g. React, Node.js, Python, AWS"
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-400"
            style={{ fontSize: "16px" }}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-500">Preferred Job Titles <span className="text-gray-400">(comma separated)</span></label>
          <input
            type="text"
            value={rolesInput}
            onChange={(e) => setRolesInput(e.target.value)}
            placeholder="e.g. Engineering Manager, Tech Lead, CTO"
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-400"
            style={{ fontSize: "16px" }}
          />
        </div>
      </div>

      {/* CV Upload */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <p className="text-sm font-semibold text-gray-700">Upload CV <span className="text-xs font-normal text-gray-400">(PDF)</span></p>
        <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleCvUpload} />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={parsing}
          className="w-full h-11 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-500 active:bg-gray-50 transition-all flex items-center justify-center gap-2"
        >
          {parsing ? (
            <><div className="w-4 h-4 rounded-full border-2 border-gray-200 border-t-indigo-500 animate-spin" /> Parsing CV…</>
          ) : cvFileName ? (
            <><span>📄</span> {cvFileName} — <span className="text-indigo-500">Replace</span></>
          ) : (
            <><span>📎</span> Choose PDF</>
          )}
        </button>
        {parseErr && <p className="text-xs text-red-500">{parseErr}</p>}
        {cvText && !parsing && (
          <p className="text-xs text-green-600">✓ CV parsed — {cvText.length} characters extracted</p>
        )}
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
