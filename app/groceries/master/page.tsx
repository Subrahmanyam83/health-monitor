import Link from "next/link";
import { MasterList } from "@/components/groceries/MasterList";

export default function MasterListPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fc]">
      {/* Header */}
      <div className="sticky top-0 z-10" style={{ background: "#059669" }}>
        <div className="w-full max-w-md mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/groceries" className="text-emerald-200 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-sm font-semibold text-white tracking-tight">Master List</span>
          <span className="text-xs text-emerald-200 ml-auto">Tap + to add to your list</span>
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-md mx-auto px-4 py-5">
        <MasterList />
      </div>
    </main>
  );
}
