# Skill: Next.js Patterns

Project-specific conventions for how we write Next.js code in MiniApps.

## Project Stack
- Next.js 16, React 19, TypeScript
- Tailwind CSS v4 (OKLCH color system)
- shadcn/ui for base components
- Recharts for charts
- Framer Motion for animations
- All source code lives in `src/`

## File Structure for a New Mini App
```
src/app/your-app/
  page.tsx                  ← page shell (header + layout only)
  your-app/feature/
    page.tsx                ← sub-page if needed

src/components/your-app/
  MainComponent.tsx         ← all client logic lives here

src/lib/
  use-your-app-data.ts      ← data hook (localStorage or API)
```

## Page Shell Pattern
Every page follows this exact structure:
```tsx
// Server component (no "use client")
import Link from "next/link";
import { MainComponent } from "@/components/your-app/MainComponent";

export default function YourAppPage() {
  return (
    <div className="min-h-screen w-full bg-[#f8f9fc] overflow-x-hidden">
      <div className="fixed top-0 left-0 right-0 z-10 w-full" style={{ background: "#COLOR" }}>
        <div className="w-full px-2 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-3 text-white active:opacity-70 h-full px-3 py-2">
            <svg className="w-7 h-7 flex-shrink-0" ...back arrow... />
            <span className="text-base font-semibold tracking-tight">App Name</span>
          </Link>
        </div>
      </div>
      <div className="w-full px-4 pt-20 pb-8">
        <MainComponent />
      </div>
    </div>
  );
}
```

## Client vs Server
- Pages are server components by default — keep them as shells (header + layout only)
- Add `"use client"` only to components that need state, effects, or browser APIs
- Data hooks (`use-*.ts`) are always `"use client"`

## Path Alias
- Always use `@/` for imports — e.g. `@/components/ui/button`, `@/lib/utils`
- Never use relative paths like `../../components`

## Home Page Registration
When adding a new mini app, always add it to the apps array in `src/app/page.tsx`:
```tsx
{
  href: "/your-app",
  name: "Your App Name",
  description: "One line description",
  icon: "emoji",
  color: "#hexcolor",
}
```

## Styling Conventions
- Background color for all pages: `bg-[#f8f9fc]`
- Cards: `bg-white rounded-2xl shadow-sm border border-gray-100`
- Each mini app has its own accent color — use it consistently for headers and primary buttons
