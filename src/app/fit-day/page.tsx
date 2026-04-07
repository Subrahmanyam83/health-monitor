import Link from "next/link";
import { FitDayApp } from "@/components/exercise/FitDayApp";

export default function FitDayPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fc]">
      <div className="sticky top-0 z-10" style={{ background: "#ea580c", paddingTop: "env(safe-area-inset-top)" }}>
        <div className="w-full max-w-md mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-white transition-colors active:opacity-70">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-semibold tracking-tight">FitDay</span>
          </Link>
        </div>
      </div>
      <div className="w-full max-w-md mx-auto px-4 py-5">
        <FitDayApp />
      </div>
    </main>
  );
}
