"use client";

import { useState, useEffect, useCallback } from "react";

export type JobProfile = {
  fullName: string;
  currentRole: string;
  yearsOfExperience: number;
  skills: string[];
  preferredRoles: string[];
  preferredLocations: string[];
  cvText: string;
  cvFileName?: string;
};

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  applyUrl: string;
  source: string;
  postedAt: string;
  salary?: string;
};

export type AppliedJob = {
  jobId: string;
  title: string;
  company: string;
  appliedAt: string;
  applyUrl: string;
};

export type JobsData = {
  profile: JobProfile | null;
  appliedJobs: AppliedJob[];
};

const DEFAULT_DATA: JobsData = {
  profile: null,
  appliedJobs: [],
};

export function useJobs() {
  const [data, setData] = useState<JobsData | null>(null);
  const [sha, setSha] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/jobs/profile");
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData(json.data);
      setSha(json.sha);
    } catch {
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const saveProfile = useCallback(async (profile: JobProfile) => {
    const next: JobsData = { ...(data ?? DEFAULT_DATA), profile };
    const res = await fetch("/api/jobs/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: next, sha }),
    });
    if (!res.ok) throw new Error("Failed to save");
    const json = await res.json();
    setSha(json.sha);
    setData(next);
  }, [data, sha]);

  const markApplied = useCallback(async (job: Job) => {
    if (!data) return;
    const already = data.appliedJobs.some((a) => a.jobId === job.id);
    if (already) return;
    const applied: AppliedJob = {
      jobId: job.id,
      title: job.title,
      company: job.company,
      appliedAt: new Date().toISOString(),
      applyUrl: job.applyUrl,
    };
    const next: JobsData = { ...data, appliedJobs: [applied, ...data.appliedJobs] };
    const res = await fetch("/api/jobs/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: next, sha }),
    });
    if (!res.ok) throw new Error("Failed to save");
    const json = await res.json();
    setSha(json.sha);
    setData(next);
  }, [data, sha]);

  return { data, loading, error, fetchData, saveProfile, markApplied };
}
