import Link from "next/link";
import { GroceryList } from "@/components/groceries/GroceryList";

export default function GroceriesPage() {
  return (
    <div className="min-h-screen w-full bg-[#f8f9fc] overflow-x-hidden">
      <div className="fixed top-0 left-0 right-0 z-10 w-full" style={{ background: "#059669", paddingTop: "env(safe-area-inset-top)" }}>
        <div className="w-full px-2 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-3 text-white active:opacity-70 h-full px-3 py-2">
            <svg className="w-7 h-7 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-base font-semibold tracking-tight">CartMate</span>
          </Link>
        </div>
      </div>
      <div className="w-full px-4 pb-8" style={{ paddingTop: "calc(env(safe-area-inset-top) + 56px + 20px)" }}>
        <GroceryList />
      </div>
    </div>
  );
}
