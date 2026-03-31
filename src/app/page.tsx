import Link from "next/link";
import { headers } from "next/headers";
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
    color: "#059669",
  },
];

export default async function Home() {
  const headersList = await headers();
  const hideAlcohol = headersList.get("x-hide-alcohol") === "1";

  const visibleApps = apps.filter(
    (app) => !(hideAlcohol && app.hideInCountries?.length)
  );

  return (
    <main className="min-h-screen bg-[#f8f9fc] flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10" style={{ background: "#4f46e5" }}>
        <div className="w-full max-w-md mx-auto px-4 h-14 flex items-center justify-center">
          <AnimatedTitle />
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
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: `${app.color}18` }}
                  >
                    {app.icon}
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
