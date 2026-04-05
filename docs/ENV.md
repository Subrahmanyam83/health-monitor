# Environment Variables

All variables live in `.env` at the project root. This file is gitignored — never commit it.

---

## Authentication — Clerk

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key, exposed to the browser. Identifies your Clerk application. |
| `CLERK_SECRET_KEY` | Clerk secret key, server-side only. Used to verify sessions and call Clerk's backend API. |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Path Clerk redirects unauthenticated users to. Set to `/sign-in`. |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | Where users land after sign-in when no specific redirect target is set. Set to `/`. |

Get these from [dashboard.clerk.com](https://dashboard.clerk.com) → your app → API Keys.

---

## GitHub Integration

| Variable | Description |
|---|---|
| `GITHUB_TOKEN` | Personal access token (PAT) used to authenticate GitHub API calls (e.g. reading/writing repo content). |
| `GITHUB_OWNER` | GitHub username or org that owns the target repository. Set to `Subrahmanyam83`. |
| `GITHUB_REPO` | Repository name to interact with. Set to `sunakshini-mini-apps`. |

Generate a PAT at GitHub → Settings → Developer settings → Personal access tokens.

---

## External APIs

| Variable | Description |
|---|---|
| `USDA_API_KEY` | API key for the USDA FoodData Central API. Used for nutritional data lookups. Get one at [fdc.nal.usda.gov](https://fdc.nal.usda.gov/api-guide.html). |
| `RAPIDAPI_KEY` | API key for RapidAPI. Used to call the JSearch API (`jsearch.p.rapidapi.com`) for job search functionality. |
