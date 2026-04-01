import Link from "next/link";
import { headers } from "next/headers";
import { currentUser } from "@clerk/nextjs/server";
import { AnimatedTitle } from "@/components/AnimatedTitle";

const apps = [
  {
    href: "/alcohol",
    name: "Alcohol Consumption",
    description: "Track your drinks and monitor weekly alcohol intake",
    icon: "🍺",
    color: "#4f46e5",
    hideInCountries: ["IN"],
  },
  {
    href: "/groceries",
    name: "Groceries",
    description: "Manage your shopping list and track bought items",
    icon: "🛒",
    color: "#2563eb",
  },
  {
    href: "/nutrition",
    name: "My Nutrition",
    description: "Track daily meals, calories and burn suggestions for your family",
    icon: "🥗",
    color: "#16a34a",
  },
];

export default async function Home() {
  const [headersList, user] = await Promise.all([headers(), currentUser()]);
  const hideAlcohol = headersList.get("x-hide-alcohol") === "1";
  const firstName = user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress?.split("@")[0];

  const visibleApps = apps.filter(
    (app) => !(hideAlcohol && app.hideInCountries?.length)
  );

  return (
    <main className="min-h-screen bg-[#f8f9fc] flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10" style={{ background: "#4f46e5" }}>
        <div className="w-full max-w-md mx-auto px-4 py-2 flex flex-col items-center justify-center">
          <AnimatedTitle />
          {firstName && (
            <span className="text-[11px] text-white/60 font-medium tracking-wide mt-0.5">Welcome, {firstName}</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="w-full max-w-md mx-auto px-4 py-6">
          <div className="flex flex-col gap-3">
            {visibleApps.map((app) => (
              <Link key={app.href} href={app.href}>
                <div className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform">
                  <div
                    className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-0.5 flex-shrink-0"
                    style={{ background: app.color }}
                  >
                    <span className="text-2xl leading-none">{app.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{app.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-snug">{app.description}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
