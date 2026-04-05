import { JobsHome } from "@/components/jobs/JobsHome";

export default function JobsPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fc] flex flex-col">
      <div className="sticky top-0 z-10" style={{ background: "#4f46e5" }}>
        <div className="w-full max-w-md mx-auto px-4 h-14 flex items-center gap-3">
          <a href="/" className="text-white/70 active:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </a>
          <p className="text-white font-bold text-lg">💼 Jobs</p>
        </div>
      </div>
      <div className="flex-1 w-full max-w-md mx-auto px-4 py-6">
        <JobsHome />
      </div>
    </main>
  );
}
