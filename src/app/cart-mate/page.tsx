import Link from "next/link";
import { GroceryList } from "@/components/groceries/GroceryList";

export default function GroceriesPage() {
  return (
    <div className="min-h-screen w-full bg-[#f8f9fc] overflow-x-hidden">
      <div style={{ height: "env(safe-area-inset-top)", background: "#059669", flexShrink: 0 }} />
      <div className="fixed left-0 right-0 z-10 w-full" style={{ top: "env(safe-area-inset-top)", background: "#059669" }}>
        <div className="w-full px-2 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-3 text-white active:opacity-70 h-full px-3 py-2">
            <svg className="w-7 h-7 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-base font-semibold tracking-tight">CartMate</span>
          </Link>
        </div>
      </div>
      <div className="w-full px-4 pt-20 pb-8">
        <GroceryList />
      </div>
    </div>
  );
}
