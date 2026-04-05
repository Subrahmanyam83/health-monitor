"use client";

import Link from "next/link";

function BeerIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7">
      <rect x="8" y="10" width="13" height="18" rx="3" fill="url(#b-body)" />
      <rect x="21" y="13" width="5" height="9" rx="2.5" fill="url(#b-handle)" />
      <rect x="8" y="6" width="13" height="5" rx="2" fill="url(#b-foam)" />
      <rect x="10.5" y="14" width="2" height="10" rx="1" fill="white" opacity="0.35" />
      <defs>
        <linearGradient id="b-body" x1="8" y1="10" x2="21" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fbbf24" /><stop offset="1" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="b-handle" x1="21" y1="13" x2="26" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fcd34d" /><stop offset="1" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="b-foam" x1="8" y1="6" x2="21" y2="11" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fefce8" /><stop offset="1" stopColor="#fef3c7" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7">
      <path d="M4 5h3.5l3.2 13h12l3-9H10.5" stroke="url(#c-line)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="14" cy="25" r="2.2" fill="url(#c-w1)" />
      <circle cx="22" cy="25" r="2.2" fill="url(#c-w2)" />
      <defs>
        <linearGradient id="c-line" x1="4" y1="5" x2="26" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34d399" /><stop offset="1" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="c-w1" x1="12" y1="23" x2="16" y2="27" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6ee7b7" /><stop offset="1" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="c-w2" x1="20" y1="23" x2="24" y2="27" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6ee7b7" /><stop offset="1" stopColor="#10b981" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function NutritionIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7">
      <ellipse cx="16" cy="19" rx="9" ry="9" fill="url(#n-bowl)" />
      <path d="M7 19 Q16 12 25 19" stroke="url(#n-rim)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <circle cx="12" cy="16" r="2.4" fill="url(#n-v1)" />
      <circle cx="17.5" cy="14.5" r="1.9" fill="url(#n-v2)" />
      <circle cx="21" cy="17.5" r="2.1" fill="url(#n-v3)" />
      <defs>
        <linearGradient id="n-bowl" x1="7" y1="15" x2="25" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fda4af" /><stop offset="1" stopColor="#f43f5e" />
        </linearGradient>
        <linearGradient id="n-rim" x1="7" y1="19" x2="25" y2="19" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fb7185" /><stop offset="1" stopColor="#e11d48" />
        </linearGradient>
        <linearGradient id="n-v1" x1="9.6" y1="13.6" x2="14.4" y2="18.4" gradientUnits="userSpaceOnUse">
          <stop stopColor="#bbf7d0" /><stop offset="1" stopColor="#16a34a" />
        </linearGradient>
        <linearGradient id="n-v2" x1="15.6" y1="12.6" x2="19.4" y2="16.4" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fde68a" /><stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="n-v3" x1="18.9" y1="15.4" x2="23.1" y2="19.6" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fed7aa" /><stop offset="1" stopColor="#ea580c" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function JobIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7">
      <rect x="5" y="12" width="22" height="15" rx="3" fill="url(#j-bg)" />
      <path d="M11 12V10a5 5 0 0 1 10 0v2" stroke="url(#j-strap)" strokeWidth="2.2" strokeLinecap="round" />
      <rect x="13" y="16" width="6" height="4" rx="1.5" fill="url(#j-buckle)" />
      <defs>
        <linearGradient id="j-bg" x1="5" y1="12" x2="27" y2="27" gradientUnits="userSpaceOnUse">
          <stop stopColor="#818cf8" /><stop offset="1" stopColor="#4f46e5" />
        </linearGradient>
        <linearGradient id="j-strap" x1="11" y1="10" x2="21" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a5b4fc" /><stop offset="1" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="j-buckle" x1="13" y1="16" x2="19" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e0e7ff" /><stop offset="1" stopColor="#a5b4fc" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const appDefs = [
  {
    href: "/alcohol",
    name: "Alcohol Tracker",
    description: "Track drinks & monitor your weekly intake",
    borderColors: "#f59e0b, #fbbf24, #fef08a, #f59e0b",
    iconBg: "linear-gradient(140deg, #fbbf24 0%, #f59e0b 100%)",
    iconShadow: "rgba(245,158,11,0.45)",
    cardTint: "rgba(254,243,199,0.5)",
    icon: <BeerIcon />,
    hideInCountries: ["IN"],
  },
  {
    href: "/groceries",
    name: "Groceries",
    description: "Manage your shopping list & bought items",
    borderColors: "#10b981, #34d399, #6ee7b7, #10b981",
    iconBg: "linear-gradient(140deg, #34d399 0%, #059669 100%)",
    iconShadow: "rgba(16,185,129,0.45)",
    cardTint: "rgba(209,250,229,0.5)",
    icon: <CartIcon />,
  },
  {
    href: "/nutrition",
    name: "My Nutrition",
    description: "Daily meals, calories & burn for your family",
    borderColors: "#f43f5e, #fb7185, #fda4af, #f43f5e",
    iconBg: "linear-gradient(140deg, #fb7185 0%, #f43f5e 100%)",
    iconShadow: "rgba(244,63,94,0.45)",
    cardTint: "rgba(255,228,230,0.5)",
    icon: <NutritionIcon />,
  },
  {
    href: "/jobs",
    name: "Job Finder",
    description: "Daily matches from LinkedIn, Indeed & more",
    borderColors: "#6366f1, #818cf8, #c7d2fe, #6366f1",
    iconBg: "linear-gradient(140deg, #818cf8 0%, #4f46e5 100%)",
    iconShadow: "rgba(99,102,241,0.45)",
    cardTint: "rgba(224,231,255,0.5)",
    icon: <JobIcon />,
  },
];

function AppCard({ app, index }: { app: typeof appDefs[0]; index: number }) {
  return (
    <Link href={app.href} className="block group">
      {/* Animated gradient border wrapper — CSS-only entrance, no JS state */}
      <div
        className={`card-enter card-delay-${index} p-[3px] rounded-[20px] transition-transform duration-300 ease-out group-hover:scale-[1.025] group-hover:-translate-y-1 group-active:scale-[0.97]`}
        style={{
          background: `linear-gradient(135deg, ${app.borderColors})`,
          backgroundSize: "300% 300%",
          animation: `cardEnter 0.45s cubic-bezier(0.34,1.56,0.64,1) both, gradientShift 4s ease infinite`,
          animationDelay: `${60 + index * 90}ms, 0ms`,
          boxShadow: `0 6px 24px -6px ${app.iconShadow}`,
        }}
      >
        {/* Card inner */}
        <div
          className="rounded-[17px] flex items-center gap-4 px-4 py-[15px]"
          style={{ background: `linear-gradient(135deg, #ffffff 0%, ${app.cardTint} 100%)` }}
        >
          {/* Icon with glow */}
          <div
            className="w-[56px] h-[56px] rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
            style={{
              background: app.iconBg,
              boxShadow: `0 6px 16px -3px ${app.iconShadow}`,
            }}
          >
            {app.icon}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold leading-tight tracking-tight" style={{ color: "#111827" }}>
              {app.name}
            </p>
            <p className="text-[12.5px] mt-[4px] leading-snug font-medium" style={{ color: "#6b7280" }}>
              {app.description}
            </p>
          </div>

          {/* Arrow badge */}
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:translate-x-1"
            style={{ background: "rgba(0,0,0,0.05)" }}
          >
            <svg className="w-4 h-4" style={{ color: "#9ca3af" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function HomeCards({ hideAlcohol }: { hideAlcohol: boolean }) {
  const visible = appDefs.filter((a) => !(hideAlcohol && a.hideInCountries?.length));
  return (
    <div className="flex flex-col gap-4">
      {visible.map((app, i) => (
        <AppCard key={app.href} app={app} index={i} />
      ))}
    </div>
  );
}
