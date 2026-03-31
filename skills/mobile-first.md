# Skill: Mobile First

All UI in this project is built for iPhone first. Apply these rules on every component you write or edit.

## Inputs
- Always set `style={{ fontSize: "16px" }}` on every `<input>` and `<select>` — iOS zooms the page if font-size is below 16px
- Use `rounded-xl` or larger for input fields — easier to tap
- Minimum input height: `py-2.5` (comfortable thumb tap)

## Tap Targets
- Buttons must be at least 44x44px — use `h-11 w-11` minimum for icon-only buttons
- Back buttons must wrap both the arrow AND the label text in a single `<Link>` so the full area is tappable
- Use `active:scale-95` or `active:opacity-70` for tap feedback

## Layout
- Never use `max-w-md mx-auto` alone — pair with `w-full` and `overflow-x-hidden` to prevent horizontal scroll
- Use `fixed` (not `sticky`) for headers so they never scroll away on iOS
- Offset content below fixed header with `pt-20` (header is `h-14` + breathing room)
- Use `min-h-screen` on the page root

## Typography
- Page titles in headers: `text-base font-semibold` minimum
- Body text: `text-sm` minimum — never go below `text-xs` for readable content
- Labels and badges: `text-xs` is fine

## Scroll
- Never put `overflow` on the main container — let the body scroll naturally
- Add `pb-8` at the bottom of page content so last items aren't cut off by the browser chrome
