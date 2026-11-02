# design.md

The shared visual language of `kkrll-next`, `good-looking`,
`you-live-like-this` and `dbd`. Code: `@kkrll/design`
([github.com/kkrll/kkrll-design](https://github.com/kkrll/kkrll-design)) —
install and import in the [README](https://github.com/kkrll/kkrll-design#readme).

**Before building, read §0. Before calling it done, run §6.**

---

## 0. Rules

Every rule is a value or a count, so a violation is something you can point
at. ✓ = `kkrll-check` finds it.

### Copy — *every string earns its place*

1. Delete any string that repeats what is already on screen: a subtitle
   restating the title, help text under an obvious field, "Welcome to…".
2. Never explain the interface inside the interface. If it needs a sentence,
   change the interface.
3. Labels are 1–3 words, no closing punctuation.
4. Empty state: one line. Error: one sentence — what happened, what to do.
5. When unsure, delete.

### Type — *one scale, no tracking*

6. Five sizes: `micro` 10 · `control` 12 · `ui` 14 · `lead` 16 ·
   `display` 24–32. Fixed in rem; only `display` is fluid (§1). Never
   `text-sm`, never `text-[11px]`, never a `clamp()` of your own. ✓
7. **Letter-spacing is 0. Never positive — no reason exempts it.** Not on
   uppercase, not on small labels, not on mono. `text-display` carries its
   own −0.02em; that is the only tracking in the system. If text looks
   cramped at 0, the case or size is wrong. ✓
8. `tabular-nums` on anything in a column.
9. Headings are an outline. Never skip a level to get a smaller size.
10. Sentence case. Uppercase only for small mono labels in a project whose
    voice is not mono (§5) — and at 0 tracking, like everything else.
11. **Off the scale only when the hierarchy doesn't set the size** — the
    text belongs to something else on the page: chart ticks and axis labels,
    labels inside a drawing, slider values, indexes, a preview of a
    user-chosen size. Declare it once as a named token with its reason, never
    inline:
    `--text-tick: 9px; /* kkrll-ignore: plot ticks, one per 9px grid row */`.
    "Fits", "denser" and "looks better" are not reasons; they mean the layout
    is wrong. ✓

### Icons — *drawn, sized, one grid*

12. Inline `<svg>` only. Never a character (`×` `→` `✕` `▾`), an emoji or an
    icon font. ✓
13. `viewBox="0 0 24 24"`, rendered at 16, 20 or 24 — set by `width` and
    `height` attributes, not only CSS. An unsized svg is 300×150 until CSS
    lands. ✓
14. 16 beside text, 20 inside a control, 24 alone.
15. `fill="none" stroke="currentColor" stroke-width="1.5"` — at 16px that is
    exactly a 1px line, the hairline weight.
16. `aria-hidden="true"` on the svg; an icon-only button carries
    `aria-label`. `flex-shrink: 0`.

### Colour — *two grounds, one accent*

17. Every colour is a token. No hex, no `text-red-500`, no `bg-white`. ✓
18. Warm paper or near-black. No mid-grey ground.
19. One accent, used once per screen.
20. Never colour alone — pair state with an icon, weight or position.
21. Text clears 4.5:1 against the surface it sits on. In dark mode that means
    `--foreground` for anything under 24px (§2).

### Structure — *alignment and hairlines, not containers*

22. Border before background, background before shadow. Shadow only inside
    something you touch. ✓
23. One hairline: 1px `--background-05`.
24. Spacing 8 · 16 · 24 · 32. Gutter 24.
25. Radii 8 (control) · 24 (surface) · pill. Inner radius = outer − padding.
    No `rounded-[…]`. ✓
26. Controls acting on the same thing are one object: one outline, one place.
27. One control language. If you can point at two kinds of button, the older
    one is a bug.

### Motion — *explains, never performs*

28. Tokens only (§1). No `duration-300`, no `ease-out`. ✓
29. `transform` and `opacity` only. Never on first paint.
30. Exits 150ms, entrances 200ms. Motion starts where the user acted —
    set `transform-origin`.
31. Interruptible: `transition` for state, `@keyframes` only for motion with
    no state to return to.
32. Reduced motion removes travel, keeps opacity at `--duration-micro`.

### Platform — *if CSS or HTML does it, use that*

33. `<button>`, `<dialog>`, `popover`, `<a href>` — never a `role` on a `<div>`.
34. One visible `:focus-visible` signal per element. Never `outline: none`
    without a replacement.
35. Touch targets 44px, padding included.
36. No React state that only toggles a class — `:has()`, `@starting-style`.
37. Paint the result of the user's last action first; everything else waits.
    Coalesce high-frequency events — one paint per frame.

### Conflicts and migration

Resolve in order, stop at the first that settles it: **correct and
reachable** → **the platform** → **these rules** → **consistency across
projects** → **the reference board**.

Convert a view completely or leave it alone, and say which. Two languages in
one view is the failure no single rule catches.

---

## 1. Scales

| Type | Size | Line | |
|---|---|---|---|
| `text-micro` | 10px | 1.4 | metadata, counts |
| `text-control` | 12px | 1.4 | buttons, inputs, labels |
| `text-ui` | 14px | 1.5 | interface body |
| `text-lead` | 16px | 1.5 | reading body |
| `text-display` | 24–32px | 1.1 | one per screen, −0.02em, fluid |

| Motion | Value | For |
|---|---|---|
| `--duration-micro` | 80ms | press, hover, colour |
| `--duration-exit` | 150ms | leaving |
| `--duration-enter` | 200ms | arriving |
| `--duration-slow` | 300ms | page and view transitions |
| `--ease-entrance` | `cubic-bezier(.32,.72,0,1)` | arrivals |
| `--ease-exit` | `cubic-bezier(.4,0,1,1)` | departures |
| `--ease-micro` | `cubic-bezier(.65,0,.35,1)` | returns to origin |
| `--ease-spring` | `linear(…)` | one per screen, at most |

`display` is `clamp(1.5rem, 1.1rem + 1.6vw, 2rem)`: 24px at a 400px window,
32px from 900px. The rest are fixed — interface text that changes with the
window makes controls jump, and a phone needs the same size, not a smaller
one. A fluid size keeps a rem term, or it stops growing when the reader zooms.

Travel is 24px, always. All of the above are plain `:root` vars, so `dbd`
gets them without Tailwind; `text-*` and `ease-*` are also utilities.

---

## 2. Colour

Every colour is a base plus three steps. **The suffix is how much of the base
remains** — `-07` is closest, `-03` furthest. It is distance, not lightness
and not legibility: under `.dark` the hexes invert, the contrast does not.

| Token | Light | Dark | Contrast L / D | Use |
|---|---|---|---|---|
| `--foreground` | `#171717` | `#ededed` | 15.0 / 16.9 | all text |
| `--foreground-07` | `#1f1f20` | `#6b6a69` | 13.8 / **3.7** | secondary; dark ≥24px only |
| `--foreground-05` | `#323235` | `#4b4a49` | 10.7 / **2.2** | dark: non-text only |
| `--foreground-03` | `#4a4a4d` | `#3a3938` | 7.4 / **1.7** | dark: hairlines only |
| `--background` | `#f1eadf` | `#0a0a0a` | — | ground |
| `--background-07` | `#c8c1bb` | `#1f1f20` | 1.5 / 1.2 | raised surface |
| `--background-05` | `#a6a29e` | `#3d3d3f` | 2.1 / 1.8 | hairlines |
| `--background-03` | `#8a8580` | `#565658` | 3.1 / 2.7 | strong rules, wells |

Contrast is against each theme's `--background`. Text on a surface is checked
against the surface. Faint text on dark: change size or weight, not the step.

`--background-semi`, `-07-semi`, `-05-semi` are the same steps at 30% alpha,
for layers that must show what is beneath.

**Override** the plain var after importing, never `--color-*`:

```css
:root { --background: #ffffff; }
.dark { --background: #0a0a0a; }
```

`:root` declares, `.dark` only overrides — a token introduced only in `.dark`
is invalid in light mode. `.dark` sets `color-scheme: dark`, so it works on a
subtree, and `light-dark()` follows it.

**New palette:** derive the steps in OKLCH (lightness −12 / −22 / −30%, chroma
×0.9 / 0.7 / 0.6), eyeball, commit hex.

---

## 3. Motion

Enter and exit in CSS, no mount flag:

```css
dialog {
    transition: opacity var(--duration-enter) var(--ease-entrance),
                display var(--duration-enter) allow-discrete;
}
@starting-style { dialog[open] { opacity: 0; } }
dialog:not([open]) { opacity: 0; }
```

`motion.css` ships the keyframes in §6's list. Under reduced motion it
redefines them as opacity-only and clamps the `animate-modal-*` utilities to
`--duration-micro`; app-level durations must clamp themselves. The modal
utilities are keyframe-based and animate blur — kept for `kkrll-next`; new
modals use `<dialog>` as above.

Long work during an animation: split by time, not count — check
`performance.now()` against the frame start, yield with
`requestAnimationFrame`.

---

## 4. Platform

| Use | Instead of |
|---|---|
| `@starting-style` + `allow-discrete` | mount/unmount flags |
| `:has()` | a parent class set from a child's state |
| `@container` | a resize listener picking a layout |
| `interpolate-size: allow-keywords` | measuring `scrollHeight` |
| `field-sizing: content` | JS-resized inputs |
| `text-wrap: balance` / `pretty` | manual `<br>` |
| `popover` + `[popovertarget]` | portal, focus trap, outside-click listener |
| `showModal()` | `role="dialog"` + `aria-modal` on a `<div>` |

`corner-shape: superellipse(1.333)` is global and degrades to a plain radius.
Never gate layout on it.

---

## 5. Voice

The library ships font **roles**; each project assigns families.

| Project | Voice | Sans | Serif | Mono |
|---|---|---|---|---|
| `good-looking` (The Bicycle42) | **Mono** | Supreme | Sentient | JetBrains Mono |
| `you-live-like-this` | **Mono** | Supreme | Sentient | JetBrains Mono |
| `kkrll-next` | **Sans** | Geist | Recia | Geist Mono |
| `dbd` | **Serif** | Geist | Sentient | JetBrains Mono |

Mono where the content is instrumental, serif where people read for minutes.
In a mono-voiced app, label vs. content is told by material and position, not
case.

`kkrll-next`: never redeclare `--font-geist-sans` in CSS — it shadows
next/font's hashed name and silently falls back.

---

## 6. Check

```bash
bunx kkrll-check src
```

Prints `file:line rule text` for every ✓ rule in §0 and exits 1. Exempt a line
only with a reason: `kkrll-ignore: <why>`. Exemptions are counted in every run;
`--exempt` lists them with their reasons — read that list in review. Positive
letter-spacing, a wide tracking utility, or tracking hidden in a `var()`
cannot be exempted.

It cannot see the rest. Before done, look once for each:

- a string that could be deleted (1–5)
- two kinds of button, or one action split across places (26–27)
- text under 24px in `-07` on dark, or any text on a raised surface (21)
- a second accent (19)
- motion with no origin, or on first paint (29–30)

Projects on `strict.css` cannot compile the forbidden Tailwind defaults at
all; arbitrary values (`text-[10px]`) still need the check.

**Ships:** colour ramps and `-semi` steps, `--overlay`, `--brand-*` · type
scale · font roles · motion tokens · keyframes `fadeIn` `fadeOut`
`fadeInFromBottom` `fadeOutToBottom` `fadeOutToTop` `fadeInToLeft`
`fadeOutToLeft` `fadeInToRight` `fadeOutToRight` `modalOpen` `modalClose`
`modalOverlayOpen` `modalOverlayClose` · `animate-modal-*` · `no-scrollbar`
`thin-scrollbar`. Check here before writing another `fadeIn`.

---

## 7. References

[Rauno Freiberg](https://interactions.rauno.me) (rules with reasons) ·
[Emil Kowalski](https://animations.dev) (motion) ·
[Jhey Tompkins](https://jhey.dev) (CSS first) ·
[Vercel Geist](https://vercel.com/geist) (the ramp as contract).

`references/` is the board — a mood, not a mandate: printed-document
furniture, data set as ornament, warm paper or near-black, one accent,
softness only at the controls. It argues for more mono than most of these
projects should use.
