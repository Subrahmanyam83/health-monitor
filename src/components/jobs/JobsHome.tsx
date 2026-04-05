"use client";

import { useState } from "react";
import { useJobs, Job } from "@/lib/use-jobs";
import { ProfileSetup } from "./ProfileSetup";
import { JobList } from "./JobList";

export function JobsHome() {
  const { data, loading, error, fetchData, saveProfile, markApplied } = useJobs();
  const [editingProfile, setEditingProfile] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-7 h-7 rounded-full border-2 border-gray-200 border-t-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-2xl p-4 text-center space-y-2">
        <p className="text-sm text-red-600">{error}</p>
        <button onClick={fetchData} className="text-xs text-red-500 underline">Retry</button>
      </div>
    );
  }

  // No profile yet — show setup
  if (!data?.profile || editingProfile) {
    return (
      <div className="space-y-4">
        {editingProfile && (
          <button
            onClick={() => setEditingProfile(false)}
            className="flex items-center gap-1.5 text-sm text-gray-500 active:opacity-70 h-11 pr-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}
        {!editingProfile && (
          <div className="bg-indigo-50 rounded-2xl p-6 text-center space-y-3 border border-indigo-100">
            <div className="text-4xl">💼</div>
            <p className="text-sm font-semibold text-gray-700">Find your next job</p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Set up your profile once. We'll search LinkedIn, Indeed, Glassdoor and more daily — showing you the best matches.
            </p>
          </div>
        )}
        <ProfileSetup
          initial={data?.profile}
          onSave={async (profile) => {
            await saveProfile(profile);
            setEditingProfile(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Profile summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-800">{data.profile.fullName}</p>
            <p className="text-xs text-gray-400">{data.profile.currentRole} · {data.profile.yearsOfExperience} yrs exp</p>
            <p className="text-xs text-gray-400 mt-0.5">📍 {data.profile.preferredLocations.join(" · ")}</p>
          </div>
          <button
            onClick={() => setEditingProfile(true)}
            className="h-8 px-3 rounded-xl text-xs font-medium bg-indigo-50 text-indigo-600 active:scale-95 transition-all"
          >
            Edit profile
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {data.profile.skills.slice(0, 6).map((skill) => (
            <span key={skill} className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
              {skill}
            </span>
          ))}
          {data.profile.skills.length > 6 && (
            <span className="text-[10px] text-gray-400">+{data.profile.skills.length - 6} more</span>
          )}
        </div>
      </div>

      {/* Job listings */}
      <JobList
        profile={data.profile}
        appliedJobs={data.appliedJobs}
        onApply={async (job: Job) => { await markApplied(job); }}
      />

      <div className="pb-8" />
    </div>
  );
}
