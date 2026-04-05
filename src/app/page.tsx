import { headers } from "next/headers";
import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { AnimatedTitle } from "@/components/AnimatedTitle";
import { HomeCards } from "@/components/HomeCards";

export default async function Home() {
  const [headersList, user] = await Promise.all([headers(), currentUser()]);
  const hideAlcohol = headersList.get("x-hide-alcohol") === "1";
  const firstName = user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress?.split("@")[0];

  return (
    <main className="min-h-screen flex flex-col" style={{ background: "#f0f2f5" }}>
      {/* 4px rainbow top accent */}
      <div
        className="h-1 w-full flex-shrink-0"
        style={{ background: "linear-gradient(90deg, #6366f1 0%, #8b5cf6 25%, #ec4899 50%, #f59e0b 75%, #10b981 100%)" }}
      />

      {/* Sticky header */}
      <div
        className="sticky top-0 z-20 flex-shrink-0"
        style={{
          background: "#c5cdd9",
          borderBottom: "1.5px solid #b4bdc9",
          boxShadow: "0 2px 8px rgba(0,0,0,0.09)",
        }}
      >
        <div className="w-full max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex flex-col items-start">
            <AnimatedTitle />
            {firstName && (
              <span className="text-[11px] font-semibold tracking-wide mt-[2px]" style={{ color: "#9ca3af" }}>
                Welcome back, {firstName}
              </span>
            )}
          </div>
          <UserButton />
        </div>
      </div>

      {/* Page content */}
      <div className="flex-1">
        <div className="w-full max-w-md mx-auto px-4 pt-6 pb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] mb-5" style={{ color: "#c4c9d4" }}>
            Your Apps
          </p>
          <HomeCards hideAlcohol={hideAlcohol} />
        </div>
      </div>
    </main>
  );
}
