import Link from "next/link";

// Icons use currentColor — color is set by the parent wrapper
function BeerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
      <rect x="3" y="8" width="12" height="12" rx="2" fill="currentColor" />
      <path d="M15 10 Q20 10 20 14 Q20 18 15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="9" cy="8" rx="6" ry="2.5" fill="currentColor" opacity="0.4" />
      <rect x="5.5" y="10.5" width="1.5" height="6.5" rx="0.75" fill="white" opacity="0.35" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
      <path d="M2 2h2.5l2.8 10h10.2l2.5-7H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10.5" cy="19" r="2" fill="currentColor" />
      <circle cx="17.5" cy="19" r="2" fill="currentColor" />
    </svg>
  );
}

function NutritionIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
      {/* Plate */}
      <circle cx="12" cy="13" r="8" fill="currentColor" />
      <circle cx="12" cy="13" r="5.5" fill="currentColor" opacity="0.2" />
      {/* Fork */}
      <line x1="8" y1="4" x2="8" y2="10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="8" y1="4" x2="8" y2="7" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" opacity="0.5" />
      {/* Knife */}
      <line x1="16" y1="4" x2="16" y2="10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 4 Q18 5.5 16 8" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

function WaveIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
      <rect x="1" y="9" width="2.5" height="6" rx="1.25" fill="currentColor" />
      <rect x="5" y="6" width="2.5" height="12" rx="1.25" fill="currentColor" />
      <rect x="9" y="3" width="2.5" height="18" rx="1.25" fill="currentColor" />
      <rect x="13" y="6" width="2.5" height="12" rx="1.25" fill="currentColor" />
      <rect x="17" y="9" width="2.5" height="6" rx="1.25" fill="currentColor" />
      <rect x="21" y="10.5" width="2" height="3" rx="1" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

function JobIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
      {/* Briefcase body */}
      <rect x="2" y="9" width="20" height="12" rx="2.5" fill="currentColor" />
      {/* Handle arch */}
      <path d="M8 9V7a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
      {/* Horizontal band */}
      <rect x="2" y="14.5" width="20" height="1.5" fill="white" opacity="0.2" />
    </svg>
  );
}

const appDefs = [
  {
    href: "/sip-log",
    name: "SipLog",
    description: "Track drinks & monitor your weekly intake",
    borderColors: "#fcd34d, #fde68a, #fef9c3, #fcd34d",
    iconBg: "#fef3c7",
    iconColor: "#b45309",
    iconShadow: "rgba(245,158,11,0.25)",
    cardTint: "rgba(254,243,199,0.5)",
    icon: <BeerIcon />,
    hideInCountries: ["IN"],
  },
  {
    href: "/cart-mate",
    name: "CartMate",
    description: "Manage your shopping list & bought items",
    borderColors: "#6ee7b7, #a7f3d0, #d1fae5, #6ee7b7",
    iconBg: "#d1fae5",
    iconColor: "#065f46",
    iconShadow: "rgba(16,185,129,0.25)",
    cardTint: "rgba(209,250,229,0.5)",
    icon: <CartIcon />,
  },
  {
    href: "/nutri-day",
    name: "NutriDay",
    description: "Daily meals, calories & burn for your family",
    borderColors: "#fda4af, #fecdd3, #ffe4e6, #fda4af",
    iconBg: "#ffe4e6",
    iconColor: "#be123c",
    iconShadow: "rgba(244,63,94,0.25)",
    cardTint: "rgba(255,228,230,0.5)",
    icon: <NutritionIcon />,
  },
  {
    href: "/vocal-lift",
    name: "VocalLift",
    description: "Remove vocals, convert to MP4 & download YouTube as MP3",
    borderColors: "#c4b5fd, #ddd6fe, #ede9fe, #c4b5fd",
    iconBg: "#ede9fe",
    iconColor: "#5b21b6",
    iconShadow: "rgba(124,58,237,0.25)",
    cardTint: "rgba(237,233,254,0.5)",
    icon: <WaveIcon />,
  },
  {
    href: "/job-pulse",
    name: "JobPulse",
    description: "Daily matches from LinkedIn, Indeed & more",
    borderColors: "#a5b4fc, #c7d2fe, #e0e7ff, #a5b4fc",
    iconBg: "#e0e7ff",
    iconColor: "#3730a3",
    iconShadow: "rgba(99,102,241,0.25)",
    cardTint: "rgba(224,231,255,0.5)",
    icon: <JobIcon />,
  },
];

function AppCard({ app, index }: { app: typeof appDefs[0]; index: number }) {
  return (
    <Link href={app.href} className="block group">
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
        <div
          className="rounded-[17px] flex items-center gap-4 px-4 py-[15px]"
          style={{ background: `linear-gradient(135deg, #ffffff 0%, ${app.cardTint} 100%)` }}
        >
          {/* Icon — light pastel bg, deep accent color */}
          <div
            className="w-[56px] h-[56px] rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
            style={{
              background: app.iconBg,
              color: app.iconColor,
              boxShadow: `0 4px 12px -2px ${app.iconShadow}`,
            }}
          >
            {app.icon}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold leading-tight tracking-tight" style={{ color: "#111827" }}>
              {app.name}
            </p>
            <p className="text-[12.5px] mt-[4px] leading-snug font-medium" style={{ color: "#6b7280" }}>
              {app.description}
            </p>
          </div>

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
