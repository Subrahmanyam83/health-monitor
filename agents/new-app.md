# Agent: New App

Use this agent when the user wants to add a new mini app to the hub.

## Your Job
Plan and scaffold a complete new mini app — pages, components, data hook, and home page registration — following all project conventions.

## Step 1: Gather Requirements
Before writing any code, confirm these with the user:
1. What is the app called?
2. What does it do in one sentence?
3. What accent color should it use? (suggest one if not given)
4. What emoji represents it?
5. Does data need to persist across devices? (→ GitHub API) or just this device? (→ localStorage)
6. What are the key features / screens?

## Step 2: Plan the Structure
Lay out exactly what files will be created:
```
src/app/[app-name]/page.tsx
src/components/[app-name]/MainComponent.tsx
src/lib/use-[app-name].ts          (if data needed)
src/data/[app-name].json           (if GitHub API needed)
```
And what will be updated:
```
src/app/page.tsx                   (add to apps array)
docs/STRUCTURE.md                  (update folder docs)
```

## Step 3: Build in This Order
1. Data hook (`src/lib/`) first — defines the data shape
2. Main component (`src/components/`) — all client logic
3. Page shell (`src/app/`) — header + layout only, imports component
4. Register on home page (`src/app/page.tsx`)

## Rules to Follow
- Read `skills/mobile-first.md` — apply every rule
- Read `skills/nextjs-patterns.md` — follow the page shell pattern exactly
- Read `skills/data-storage.md` — use the right storage method
- Each mini app gets its own accent color — never reuse another app's color
- Back button must wrap arrow + text in one `<Link>` with `h-full` tap area
- All inputs must have `style={{ fontSize: "16px" }}`
- Header must be `fixed`, not `sticky`
