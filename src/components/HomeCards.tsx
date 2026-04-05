"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function BeerIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6">
      <rect x="8" y="10" width="13" height="18" rx="3" fill="url(#beer-body)" />
      <rect x="21" y="13" width="5" height="9" rx="2.5" fill="url(#beer-handle)" />
      <rect x="8" y="6" width="13" height="5" rx="2" fill="url(#beer-foam)" />
      <rect x="10.5" y="14" width="1.8" height="9" rx="0.9" fill="white" opacity="0.3" />
      <defs>
        <linearGradient id="beer-body" x1="8" y1="10" x2="21" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fbbf24" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="beer-handle" x1="21" y1="13" x2="26" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fcd34d" />
          <stop offset="1" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="beer-foam" x1="8" y1="6" x2="21" y2="11" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fefce8" />
          <stop offset="1" stopColor="#fef3c7" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6">
      <path d="M4 5h3.5l3.2 13h12l3-9H10.5" stroke="url(#cart-stroke)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="14" cy="25" r="2" fill="url(#cart-wheel1)" />
      <circle cx="22" cy="25" r="2" fill="url(#cart-wheel2)" />
      <defs>
        <linearGradient id="cart-stroke" x1="4" y1="5" x2="26" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34d399" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="cart-wheel1" x1="12" y1="23" x2="16" y2="27" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6ee7b7" />
          <stop offset="1" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="cart-wheel2" x1="20" y1="23" x2="24" y2="27" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6ee7b7" />
          <stop offset="1" stopColor="#10b981" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function NutritionIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6">
      <ellipse cx="16" cy="19" rx="9" ry="9" fill="url(#bowl-body)" />
      <path d="M7 19 Q16 12 25 19" stroke="url(#bowl-rim)" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="12" cy="16" r="2.2" fill="url(#veg1)" />
      <circle cx="17" cy="14.5" r="1.8" fill="url(#veg2)" />
      <circle cx="21" cy="17" r="2" fill="url(#veg3)" />
      <defs>
        <linearGradient id="bowl-body" x1="7" y1="15" x2="25" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fda4af" />
          <stop offset="1" stopColor="#f43f5e" />
        </linearGradient>
        <linearGradient id="bowl-rim" x1="7" y1="19" x2="25" y2="19" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fb7185" />
          <stop offset="1" stopColor="#e11d48" />
        </linearGradient>
        <linearGradient id="veg1" x1="9.8" y1="13.8" x2="14.2" y2="18.2" gradientUnits="userSpaceOnUse">
          <stop stopColor="#bbf7d0" />
          <stop offset="1" stopColor="#16a34a" />
        </linearGradient>
        <linearGradient id="veg2" x1="15.2" y1="12.7" x2="18.8" y2="16.3" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fde68a" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="veg3" x1="19" y1="15" x2="23" y2="19" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fed7aa" />
          <stop offset="1" stopColor="#ea580c" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function JobIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6">
      <rect x="5" y="12" width="22" height="15" rx="3" fill="url(#job-bg)" />
      <path d="M11 12V10a5 5 0 0 1 10 0v2" stroke="url(#job-strap)" strokeWidth="2.2" strokeLinecap="round" />
      <rect x="13" y="16" width="6" height="4" rx="1.5" fill="url(#job-buckle)" />
      <defs>
        <linearGradient id="job-bg" x1="5" y1="12" x2="27" y2="27" gradientUnits="userSpaceOnUse">
          <stop stopColor="#818cf8" />
          <stop offset="1" stopColor="#4f46e5" />
        </linearGradient>
        <linearGradient id="job-strap" x1="11" y1="10" x2="21" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a5b4fc" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="job-buckle" x1="13" y1="16" x2="19" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e0e7ff" />
          <stop offset="1" stopColor="#a5b4fc" />
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
    iconBg: "linear-gradient(135deg, #fef9c3 0%, #fde68a 100%)",
    iconBorder: "#fcd34d",
    accentColor: "#f59e0b",
    icon: <BeerIcon />,
    hideInCountries: ["IN"],
  },
  {
    href: "/groceries",
    name: "Groceries",
    description: "Manage your shopping list & bought items",
    iconBg: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
    iconBorder: "#6ee7b7",
    accentColor: "#10b981",
    icon: <CartIcon />,
  },
  {
    href: "/nutrition",
    name: "My Nutrition",
    description: "Daily meals, calories & burn for your family",
    iconBg: "linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%)",
    iconBorder: "#fda4af",
    accentColor: "#f43f5e",
    icon: <NutritionIcon />,
  },
  {
    href: "/jobs",
    name: "Job Finder",
    description: "Daily matches from LinkedIn, Indeed & more",
    iconBg: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
    iconBorder: "#a5b4fc",
    accentColor: "#6366f1",
    icon: <JobIcon />,
  },
];

function AppCard({ app, index }: { app: typeof appDefs[0]; index: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 70);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <Link href={app.href} className="block group">
      <div
        className="relative rounded-2xl transition-all duration-200 ease-out
          group-hover:-translate-y-[2px] group-hover:shadow-md group-active:scale-[0.98]"
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 10px rgba(0,0,0,0.04)",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.35s ease, transform 0.35s ease, box-shadow 0.2s ease, translate 0.2s ease",
        }}
      >
        {/* Left accent bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
          style={{ background: app.accentColor }}
        />

        <div className="flex items-center gap-4 pl-5 pr-4 py-[14px]">
          {/* Icon */}
          <div
            className="w-[48px] h-[48px] rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: app.iconBg,
              border: `1.5px solid ${app.iconBorder}`,
            }}
          >
            {app.icon}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold leading-tight" style={{ color: "#111827" }}>
              {app.name}
            </p>
            <p className="text-[12px] mt-[3px] leading-snug" style={{ color: "#6b7280" }}>
              {app.description}
            </p>
          </div>

          {/* Chevron */}
          <svg
            className="w-[18px] h-[18px] flex-shrink-0 transition-transform duration-200 group-hover:translate-x-[2px]"
            style={{ color: "#d1d5db" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

export function HomeCards({ hideAlcohol }: { hideAlcohol: boolean }) {
  const visible = appDefs.filter((a) => !(hideAlcohol && a.hideInCountries?.length));

  return (
    <div className="flex flex-col gap-3">
      {visible.map((app, i) => (
        <AppCard key={app.href} app={app} index={i} />
      ))}
    </div>
  );
}
