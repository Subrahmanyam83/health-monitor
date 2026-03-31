# Skill: Data Storage

How to decide where to store data in MiniApps, and how to implement it.

## Decision Rule

**Use localStorage when:**
- Data is personal to one device (shopping lists, preferences, UI state)
- No need to sync across devices
- No sensitive data
- Examples: grocery list, master list categories

**Use GitHub API when:**
- Data must persist across devices and browsers
- Data is important enough to survive clearing the browser
- Examples: alcohol entries, any health tracking data

## localStorage Pattern

Always use a custom hook in `src/lib/use-your-feature.ts`:

```ts
"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "miniapps-your-feature";

function load() {
  if (typeof window === "undefined") return DEFAULT_VALUE;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_VALUE;
  } catch {
    return DEFAULT_VALUE;
  }
}

export function useYourFeature() {
  const [data, setData] = useState(DEFAULT_VALUE);

  useEffect(() => { setData(load()); }, []);

  const update = useCallback((updater) => {
    setData((prev) => {
      const next = updater(prev);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { data, update };
}
```

**Rules:**
- Always check `typeof window === "undefined"` before accessing localStorage (SSR safety)
- Always wrap in try/catch
- Use `miniapps-` prefix for all storage keys to avoid collisions
- Initialize state with `useEffect` not `useState(() => load())` to avoid hydration errors

## GitHub API Pattern

Used via `src/lib/github.ts` — `getFile(path)` and `updateFile(path, content, sha, message)`.

Data files live in `src/data/` and the path passed to GitHub must match the repo path exactly (e.g. `src/data/alcohol.json`).

Always store as JSON with a top-level `entries` array.
