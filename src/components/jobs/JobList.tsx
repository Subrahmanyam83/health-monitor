"use client";

import { useState, useEffect } from "react";
import { Job, JobProfile, AppliedJob } from "@/lib/use-jobs";

type Props = {
  profile: JobProfile;
  appliedJobs: AppliedJob[];
  onApply: (job: Job) => Promise<void>;
};

const SOURCE_COLORS: Record<string, string> = {
  LinkedIn: "#0a66c2",
  Indeed: "#003a9b",
  Glassdoor: "#0caa41",
  default: "#6366f1",
};

export function JobList({ profile, appliedJobs, onApply }: Props) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeRole, setActiveRole] = useState(profile.preferredRoles[0] ?? "");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (activeRole) fetchJobs(activeRole);
  }, [activeRole]);

  async function fetchJobs(role: string) {
    setLoading(true);
    setError("");
    setJobs([]);
    try {
      const res = await fetch(
        `/api/jobs/search?q=${encodeURIComponent(role)}&location=${encodeURIComponent(profile.preferredLocation)}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setJobs(json.jobs ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  const appliedIds = new Set(appliedJobs.map((a) => a.jobId));

  return (
    <div className="space-y-4">
      {/* Role selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {profile.preferredRoles.map((role) => (
          <button
            key={role}
            onClick={() => setActiveRole(role)}
            className="flex-shrink-0 h-8 px-3 rounded-full text-xs font-medium transition-all"
            style={{
              background: activeRole === role ? "#4f46e5" : "#ede9fe",
              color: activeRole === role ? "white" : "#4f46e5",
            }}
          >
            {role}
          </button>
        ))}
        <button
          onClick={() => fetchJobs(activeRole)}
          className="flex-shrink-0 h-8 px-3 rounded-full text-xs font-medium bg-gray-100 text-gray-500 active:bg-gray-200"
        >
          🔄 Refresh
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-7 h-7 rounded-full border-2 border-gray-200 border-t-indigo-500 animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 rounded-2xl p-4 text-sm text-red-600 text-center">
          {error.includes("RAPIDAPI_KEY") ? (
            <div className="space-y-1">
              <p className="font-semibold">RapidAPI key not configured</p>
              <p className="text-xs text-red-400">Add RAPIDAPI_KEY to your .env and Vercel settings</p>
            </div>
          ) : error}
        </div>
      )}

      {!loading && jobs.length === 0 && !error && (
        <div className="text-center py-12 text-gray-400 text-sm">No jobs found. Try refreshing.</div>
      )}

      <div className="space-y-3">
        {jobs.map((job) => {
          const isApplied = appliedIds.has(job.id);
          const isExpanded = expanded === job.id;
          const sourceColor = SOURCE_COLORS[job.source] ?? SOURCE_COLORS.default;

          return (
            <div key={job.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 leading-snug">{job.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{job.company}</p>
                  </div>
                  <span
                    className="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                    style={{ background: sourceColor }}
                  >
                    {job.source}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-400">
                  {job.location && <span>📍 {job.location}</span>}
                  {job.salary && <span>💰 {job.salary}</span>}
                  {job.postedAt && <span>🕐 {new Date(job.postedAt).toLocaleDateString("en-IN")}</span>}
                </div>

                {isExpanded && (
                  <p className="text-xs text-gray-600 leading-relaxed border-t border-gray-50 pt-2 mt-2">
                    {job.description}
                  </p>
                )}

                <button
                  onClick={() => setExpanded(isExpanded ? null : job.id)}
                  className="text-xs text-indigo-400 active:opacity-70"
                >
                  {isExpanded ? "Show less" : "Show description"}
                </button>
              </div>

              <div className="flex border-t border-gray-50">
                <a
                  href={job.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onApply(job)}
                  className="flex-1 py-2.5 text-xs font-semibold text-center transition-colors active:bg-indigo-50"
                  style={{ color: isApplied ? "#9ca3af" : "#4f46e5" }}
                >
                  {isApplied ? "✓ Applied" : "Apply Now →"}
                </a>
                <div className="w-px bg-gray-50" />
                <a
                  href={`https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(job.company)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 text-xs font-medium text-center text-gray-400 active:bg-gray-50"
                >
                  View Company
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Applied jobs */}
      {appliedJobs.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Applied ({appliedJobs.length})</p>
          {appliedJobs.map((a) => (
            <div key={a.jobId} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3">
              <span className="text-green-500 text-sm">✓</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700 truncate">{a.title}</p>
                <p className="text-xs text-gray-400">{a.company} · {new Date(a.appliedAt).toLocaleDateString("en-IN")}</p>
              </div>
              <a href={a.applyUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400">Open</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
