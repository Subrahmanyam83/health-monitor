# Project Structure

## Overview
This is the MiniApps project — a hub of small personal apps built with Next.js.

---

## Folders

### `app/`
All the pages of the app. Each sub-folder is a separate mini app.
- `app/page.tsx` — Home screen (Rentala Mini Apps hub)
- `app/alcohol/` — Alcohol Consumption tracker
- `app/groceries/` — Grocery list app
  - `app/groceries/master/` — Master grocery list

### `components/`
Reusable UI pieces used by the pages.
- `components/alcohol/` — Components for the alcohol app
- `components/groceries/` — Components for the grocery app
- `components/ui/` — Generic UI components (buttons, cards, etc.)

### `lib/`
Shared logic and data hooks.
- `use-grocery-items.ts` — Manages the grocery list (stored in localStorage)
- `use-master-list.ts` — Manages the master grocery list (stored in localStorage)
- `github.ts` — Reads/writes data to GitHub (used by alcohol tracker)

### `data/`
JSON files used as a simple database.
- `alcohol.json` — Stores all alcohol entries

### `types/`
TypeScript type definitions shared across the app.

---

## AI Folder Structure

### `agents/`
Specialized AI agents — each is a markdown file that tells Claude how to handle a specific job.
- `new-app.md` — step-by-step scaffold guide for any new mini app
- `planner.md` — think through a feature fully before any code is written
- `code-reviewer.md` — review code after changes for mobile issues, bugs, bad patterns

### `skills/`
Reusable workflow instructions — patterns and conventions Claude should follow.
- Example: a `nextjs-patterns` skill that enforces how we write Next.js code in this project
- Skills are broader than agents — they define *how* to do things, not *what* to do

---

## How to Add a New Mini App
1. Create a folder under `app/your-app-name/`
2. Add a `page.tsx` with the header + back button pattern
3. Create components under `components/your-app-name/`
4. Add any shared logic to `lib/`
5. Link it from the home page in `app/page.tsx`
