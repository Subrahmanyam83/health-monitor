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
      {/* Subtle top accent line */}
      <div className="h-[3px] w-full" style={{ background: "linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899, #f59e0b)" }} />

      {/* Header */}
      <div
        className="sticky top-0 z-20"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div className="w-full max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex flex-col items-start">
            <AnimatedTitle />
            {firstName && (
              <span className="text-[11px] font-medium tracking-wide mt-0.5" style={{ color: "#9ca3af" }}>
                Welcome back, {firstName}
              </span>
            )}
          </div>
          <UserButton />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="w-full max-w-md mx-auto px-4 py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-4" style={{ color: "#9ca3af" }}>
            Your Apps
          </p>
          <HomeCards hideAlcohol={hideAlcohol} />
        </div>
      </div>
    </main>
  );
}
