# design.md

How to design for the kkrll projects. Code: `@kkrll/design`
([README](https://github.com/kkrll/kkrll-design#readme)).

## Before

- **Goal.** Who opens this, when, and why? What must they leave with?
- **Structure.** What to highlight, what to group, what to drop.
- **Register.** From the purpose: visually interesting (landing), strictly
  functional (start page, settings), or explanatory (onboarding). What are
  the points of interest, and how is each introduced?

Expressive pages (landing, portfolio) need a creative brief from the author:
audience, message, voice, visuals. If there isn't one, ask before building —
don't invent the positioning.

## After

- Does it serve the goal?
- Is it as interesting as its purpose needs — no more?
- Is it on brand?
- What serves neither the goal nor the focus? Remove it.

## Brand

`theme.css` after Tailwind, or `tokens.css` alone without it. Override the
plain var (`--background`), never `--color-*`. Dark mode is the `.dark` class:
follow the system by default, let the user override.

Each colour is a base plus three steps; the suffix is how much of the base
remains (`-07` closest, `-03` furthest). Contrast against `--background`:

| Token | Light | Dark | |
|---|---|---|---|
| `--foreground` | 15.0 | 16.9 | any text |
| `--foreground-07` | 13.8 | 3.7 | dark: ≥24px text only |
| `--foreground-05` | 10.7 | 2.2 | dark: not text |
| `--foreground-03` | 7.4 | 1.7 | dark: not text |
| `--background-07` / `-05` / `-03` | | | surfaces and rules |

Light is warm paper (`#f1eadf`), dark is near-black (`#0a0a0a`). One accent
per project: override `--accent`.

Type: `text-micro` 10 · `control` 12 · `ui` 14 · `lead` 16 · `display` 24–32.
Motion: `--duration-micro` 80 · `-exit` 150 · `-enter` 200 · `-slow` 300, with
`--ease-entrance`, `-exit`, `-micro`.

| Project | Sans | Serif | Mono |
|---|---|---|---|
| kkrll-next | Geist | Recia | Geist Mono |
| good-looking | Supreme | Sentient | JetBrains Mono |
| you-live-like-this | Supreme | Sentient | JetBrains Mono |
| dbd | Geist | Sentient | JetBrains Mono |

In `kkrll-next`, never redeclare `--font-geist-sans` in CSS — it shadows
next/font's hashed name and silently falls back.

## Floor

- Colours from tokens, never literals.
- Letter-spacing 0, never positive.
- Icons are inline SVG on a 24 grid, sized 16 / 20 / 24. No glyphs or emoji.
- Text clears 4.5:1 against its surface.
- Native elements (`<button>`, `<dialog>`, `<a href>`); visible focus.

`bunx kkrll-check src` finds the first three. It also lists off-scale sizes,
radii, shadows and call-site motion to reconsider — those are not failures.
