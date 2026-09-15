# design.md

The shared visual language behind `kkrll-next`, `good-looking`,
`you-live-like-this` and `dbd`. Code lives in `tokens.css` / `base.css` /
`motion.css`. This file is the *why* — the part that survives a rewrite.

---

## 0. Principles

Seven rules. Everything below is an application of one of them.

**Structure comes from alignment and hairlines, not from containers.**
A rule, a gutter and a consistent baseline do the work a card with a shadow
pretends to do. Reach for a border before a background; reach for a background
before a shadow; do not reach for a shadow — *for structure*. Shadow is
material, not hierarchy: it belongs inside the footprint of a thing you touch,
and nowhere else (§6.6). 

**The page is a document, not an application.**
Numbered sections, page furniture, label-left/value-right rows, dot leaders,
tabular figures. Information should look filed, not dashboarded. When a layout
decision is ambiguous, ask what a well-set printed page would do.

**Two grounds, nothing in between.**
Warm paper or near-black. Mid-greys are where the identity goes to die — a
`#888` background belongs to no one. The ramp exists to move *within* a ground,
never to drift toward the middle.

**Motion explains, it does not perform.**
Every animation answers "where did this come from?" or "what just changed?"
If it answers neither, delete it. See §3.

**Prefer the platform.**
If CSS can express it, CSS should express it — state, transitions, layout
relationships. A React state variable that exists only to add a class is a bug
with good manners. See §4.

**Tokens are shared, components are not.**
The four projects agree on colour, rhythm and timing. They disagree on almost
everything else, and forcing agreement would cost more than the duplication
saves.

**Controls that act on the same thing are one object.**
A group gets one outline, one container, one place on the page. Three keys with
three edges and three drops are three decisions the reader has to make; one
bank is none. Scattering related controls is the most common way a screen goes
wrong while every element on it passes.

### When they conflict

They do conflict — "prefer the platform" and "motion explains" disagree the
moment you want a menu to grow from the button that opened it, and
`@starting-style` has no opinion about `transform-origin`. Resolve in this
order, and stop at the first one that settles it:

1. **Correct and reachable.** Contrast, focus, keyboard, reduced motion. Never
   traded against anything below.
2. **The platform.** If CSS or an HTML element does it, that wins over a
   hand-rolled version that matches the principle more closely.
3. **The principle.** The seven above, in any order — they rarely fight.
4. **Consistency with the other three projects.** Real, but it loses to all of
   the above. Tokens are the contract; matching implementations are not.
5. **The reference board.** §6 is a mood, not a mandate. It lost once already
   (it argues for more monospace than most of these projects should use).

### Invariants

The principles above are prose, and prose can be agreed with while being
violated — every control on a ruined screen can pass every rule in this
document individually. These are the same rules stated as counts, so that a
violation is a thing you can point at, and mostly a thing you can grep for.

- **One control language.** Every button in an app is the same object. If you
  can point at two, the older one is a bug, not a legacy.
- **One type scale.** A size that is not on the scale means the scale was
  wrong, not that this case is special.
- **One focus signal per element.** Visible (§7), and singular.
- **One accent, used once** (§6.5). **One hairline weight** (§5). **Two
  grounds** (§0).
- **No literal colour.** Every colour is a token. A raw palette class —
  `text-red-500`, `#4ade80` — is the tell, and it greps.

**Half a migration is worse than none.** Two languages living in one view is
the failure no element-level rule catches: each control passes, the screen
fails, and the second language is now load-bearing for whoever arrives next.
Convert a view completely, or leave it alone and say which it is.

---

## 1. Colour

### The ramp rule

Every colour is a base plus three steps. **The numeric suffix is how much of
the base colour remains** — `-07` retains 70% and sits closest to base, `-03`
retains 30% and sits furthest.

| Token | Retains | Typical use |
|---|---|---|
| `--foreground` | 100% | body text, primary ink |
| `--foreground-07` | 70% | secondary text, captions |
| `--foreground-05` | 50% | tertiary text, disabled |
| `--foreground-03` | 30% | hairlines, placeholder |
| `--background` | 100% | page ground |
| `--background-07` | 70% | cards, raised surfaces |
| `--background-05` | 50% | borders, dividers |
| `--background-03` | 30% | strong rules, wells |

Read a suffix as **distance from base, never as lightness.** Under `.dark` the
hexes invert but every *relationship* holds, which is the entire point: a
component authored against `-07` keeps its place in the hierarchy in both
themes without a single dark-mode override.

> **Known inconsistency.** `good-looking` and `you-live-like-this` invert this
> on the *background* ramp only — there `-05` (`#f5f5f5`) sits closer to base
> than `-07` (`#e5e5e5`). Their foreground ramps are correct. Fix on migration.

### Contrast floors

The relationship survives the theme flip. **The contrast ratio does not** — and
because a suffix encodes distance rather than lightness, you cannot read
legibility off a token name. Measured against each theme's own `--background`:

| Token | Light | Dark | Safe for |
|---|---|---|---|
| `--foreground` | 15.0:1 | 16.9:1 | anything |
| `--foreground-07` | 13.8:1 | **3.7:1** | light: anything. dark: **large text only** (≥24px, or ≥19px bold) |
| `--foreground-05` | 10.7:1 | **2.2:1** | light: anything. dark: **non-text only** |
| `--foreground-03` | 7.4:1 | **1.7:1** | light: body text. dark: **hairlines only** |

The light ramp clears AAA at every step. The dark ramp is compressed hard at
the faint end, so the rule is asymmetric and there is no way to make it
otherwise without changing the hexes:

- **Body text in dark mode is `--foreground` or `--foreground-07`.** Nothing
  fainter, regardless of how it reads on the light side.
- **`-05` and `-03` are structure in dark mode**, not text. Placeholder text at
  1.7:1 is not low-emphasis, it is absent.
- Background steps are all under 3:1 against the ground in both themes, by
  design — they are surfaces and hairlines. Never put text on `-07` and assume
  the ramp protects you; check against the surface, not the page.

When a design wants faint text on dark, change the *size or weight*, not the
step.

### Palette

The warm **kkrll** palette is the shipped default; other projects override.

| Token | Light | Dark |
|---|---|---|
| `--background` | `#f1eadf` | `#0a0a0a` |
| `--background-07` | `#c8c1bb` | `#1f1f20` |
| `--background-05` | `#a6a29e` | `#3d3d3f` |
| `--background-03` | `#8a8580` | `#565658` |
| `--foreground` | `#171717` | `#ededed` |
| `--foreground-07` | `#1f1f20` | `#6b6a69` |
| `--foreground-05` | `#323235` | `#4b4a49` |
| `--foreground-03` | `#4a4a4d` | `#3a3938` |

`--background-semi`, `--background-07-semi` and `--background-05-semi` are the
same steps at 30% alpha, for insets and hairlines that must let the layer
beneath show through. Use these rather than `color-mix()` at call sites, so the
alpha stays consistent everywhere.

### Deriving a new palette

The shipped hexes are hand-tuned and stay hex. But the ramp rule *is*
lightness interpolation, so when you need a new palette, derive it in OKLCH and
paste the results — perceptually even steps, no midtone clumping, and none of
the guesswork that hand-picking a four-stop ramp involves:

```css
/* scratch, not shipped */
--l: 92%; --c: 0.018; --h: 76;          /* base: measure with a picker */
--background:    oklch(var(--l) var(--c) var(--h));
--background-07: oklch(calc(var(--l) - 12%) calc(var(--c) * 0.9) var(--h));
--background-05: oklch(calc(var(--l) - 22%) calc(var(--c) * 0.7) var(--h));
--background-03: oklch(calc(var(--l) - 30%) calc(var(--c) * 0.6) var(--h));
```

Chroma drops as lightness drops, or the steps read as increasingly saturated
rather than increasingly distant. Compute, eyeball, commit the hex.

### Overriding

Redeclare the **plain** var after importing, never the `--color-*` one — the
`@theme inline` mapping already points at the plain var, so touching
`--color-background` breaks the indirection that makes dark mode work.

```css
@import "tailwindcss";
@import "@kkrll/design/theme.css";

:root { --background: #ffffff; --background-07: #e5e5e5; }
.dark { --background: #0a0a0a; }
```

Dark mode is driven by a `.dark` class, not `prefers-color-scheme`, so the
theme can be toggled. `.dark` rather than `:root.dark` is deliberate: it
matches both `<html class="dark">` and a nested `<div class="dark">`, so a
subtree can be inverted without a second palette.

---

## 2. Type

The library ships **roles, not families** — `--font-sans-stack`,
`--font-mono-stack`, `--font-serif-stack`, mapped to Tailwind's `font-sans` /
`font-mono` / `font-serif`. Each project assigns real families.

### Choosing a voice

There is no house typeface. The primary voice follows what the project is
*about*; the other two roles stay available underneath it.

| Project | Subject | Primary voice |
|---|---|---|
| `good-looking` (ships as **The Bicycle42**) | Shader image & video editor — passes, parameters, values | **Mono**, widest exposure of the set |
| `kkrll-next` | Portfolio — writing, projects, posters | **Sans.** Neutral subject, neutral voice |
| `dbd` | Journal — long reading sessions | **Serif**, set for continuous text |
| `you-live-like-this` | DSL editor — syntax, tokens, structure | **Mono.** Code is the content |

Mono is a voice, not the default — two of four land there because two of four
are instruments. It earns exposure where the content is instrumental
(specifications, parameters, state, syntax, output) and recedes to labels and
figures where the content is prose. Serif earns it where someone reads for
minutes rather than scans for seconds.

### Families

| Project | Sans | Serif | Mono |
|---|---|---|---|
| kkrll-next | Geist (next/font) | Recia | Geist Mono (next/font) |
| good-looking | Supreme | Sentient | JetBrains Mono |
| you-live-like-this | Supreme | Sentient | JetBrains Mono |
| dbd | Geist (local) | Sentient | JetBrains Mono |

> **next/font trap.** In `kkrll-next`, `--font-geist-sans` is generated by
> `next/font` with a hashed family name and injected via the class on `<body>`.
> Never redeclare it in CSS — a hardcoded `"Geist"` silently shadows the real
> hashed name and you get the fallback, with no error anywhere.

### Conventions (guidance, not shipped CSS)

Headings differ enough between projects that `base.css` deliberately sets
neither their size nor their case. The house style, where you want it:

- **Uppercase mono** for small labels, metadata and `h2`/`h3` — in the projects
  where mono is *not* the primary voice. Where it **is**, the signal is
  material and position rather than case — a label is ink on the ground, a
  control is a key — and the app sets lowercase throughout. Case alone cannot
  separate a label from mono content, because the content is already mono.
- **Sentence case** for `h1` and body.
- Secondary text = `--foreground-07`, `0.875rem`, uppercase.
- **Tabular figures** (`font-variant-numeric: tabular-nums`) on anything in a
  column — prices, dates, counts, coordinates. Non-negotiable; it is most of
  what makes a data row look typeset rather than rendered.

---

## 3. Motion

### Tokens

Shipped in `motion.css`, so call sites stop hardcoding `0.2s ease-out`:

| Token | Value | For |
|---|---|---|
| `--duration-micro` | `80ms` | press, hover, colour |
| `--duration-exit` | `150ms` | anything leaving |
| `--duration-enter` | `200ms` | anything arriving |
| `--duration-slow` | `300ms` | page and view transitions |
| `--ease-entrance` | `cubic-bezier(.32,.72,0,1)` | arrivals |
| `--ease-exit` | `cubic-bezier(.4,0,1,1)` | departures |
| `--ease-micro` | `cubic-bezier(.65,0,.35,1)` | returns to origin |
| `--ease-spring` | `linear(…)` | one per screen, at most |

Travel distance is **24px**, always — one number, so a fade-in from any edge
travels the same distance and matches the default gutter.

### Craft

**Exits are faster than entrances.** 150ms out, 200ms in. Leaving should get
out of the way; arriving should feel placed. Easing follows: arrivals
decelerate into position, departures accelerate away.

**Motion originates where the user acted.** A menu grows from the button that
opened it, not from the centre of the screen. `transform-origin` is a design
decision, not a default — set it deliberately or the element appears from
nowhere and explains nothing.

**Everything must be interruptible.** If a user can close a thing mid-open,
the close must start from wherever the open got to. This is why transitions
beat keyframe animations for state: a `transition` interpolates from the
current computed value for free, a `@keyframes` restarts from `from`. Use
keyframes only for motion with no state to return to.

**Never animate on load.** Entrance animations on first paint delay content to
decorate its arrival. Animate on *change* — route, state, interaction.

**Do not animate layout.** `transform` and `opacity` only. Animating `height`,
`width`, `top` or `margin` triggers layout on every frame; when you genuinely
need height, `interpolate-size: allow-keywords` lets `height: auto` transition
without the JS measurement dance.

### Mechanics

Enter *and* exit in pure CSS, no mount flag:

```css
dialog {
    opacity: 1;
    transition: opacity var(--duration-enter) var(--ease-entrance),
                display var(--duration-enter) allow-discrete;
}
@starting-style { dialog[open] { opacity: 0; } }
dialog:not([open]) { opacity: 0; }
```

`@starting-style` supplies the "before" state an element has never had, and
`transition-behavior: allow-discrete` keeps `display` around until the exit
finishes — together they replace the `isOpen` / `isClosing` state pair that
usually drives this.

Custom properties are not animatable until they are typed. `@property` fixes
that, which is what makes gradient and shadow animation possible at all:

```css
@property --glow { syntax: "<color>"; inherits: false; initial-value: transparent; }
```

View transitions are wired **per project** — transition names are
app-specific. Map these keyframes onto your own names; always guard with
`@media (prefers-reduced-motion: no-preference)`.

### Reduced motion

**Reduce ≠ remove.** Stripping all motion hides state changes; the point is to
remove vestibular triggers, not feedback.

| | Under `prefers-reduced-motion: reduce` |
|---|---|
| Travel / translate | → 0. Element appears in place. |
| Scale, parallax, spin | Removed entirely. |
| Opacity | **Kept**, clamped to `--duration-micro`. |
| Colour and border | Kept, unchanged. |
| Auto-playing loops | Stopped. |

Every state change keeps *some* transition, however brief, so the change stays
perceptible. Write the reduced case as the branch you author, not as an
afterthought appended to the file.

`motion.css` implements this for every keyframe it ships: under `reduce` the
travel keyframes are redefined as opacity-only and the `animate-modal-*`
utilities clamp to `--duration-micro`. Redefining a `@keyframes` inside a media
query replaces the earlier definition wholesale, so consumers inherit the
policy without touching their call sites. App-level animation still has to opt
in for itself.

---

## 4. Modern CSS

Reach for these before reaching for JavaScript. Each one below replaces
something one of the four projects currently does by hand.

| Use | Instead of |
|---|---|
| `@starting-style` + `allow-discrete` | mount/unmount flags for enter-exit |
| `:has()` | a parent `className` set from a child's state |
| `@container` | `useDebounce` on resize to pick a layout |
| `interpolate-size: allow-keywords` | measuring `scrollHeight` to animate open |
| `field-sizing: content` | an input that resizes via JS |
| `text-wrap: balance` / `pretty` | manual `<br>` and orphan-hunting |
| `popover` + `[popovertarget]` | a portal, a focus trap and an outside-click listener |
| `light-dark()` | a duplicated `.dark` block *for one-off values only* |

Two cautions. `light-dark()` reads `color-scheme`, not `.dark`, so it will
**not** follow a class toggle on a subtree — local values only, never
`tokens.css`. And `corner-shape` degrades silently to plain `border-radius`,
so never gate layout on it.

---

## 5. Shape & spacing

- **Spacing:** 8px base. `8 / 16 / 24 / 32` covers nearly everything. 24px is
  the default gutter, and matches the motion travel distance.
- **Radii:** `8px` for controls, `24px` for large surfaces (modals, sheets),
  `100rem` for pills. Nested corners are concentric — an inner radius is the
  outer radius minus the padding between them, so a `24px` panel with `16px`
  of padding holds an `8px` child. Anything else reads as a mistake even when
  nobody can say why.
- **Corners:** `corner-shape: superellipse(1.333)` globally — continuous
  curvature, closer to a drawn corner than to an arc.
- **Rules:** hairlines are `--background-05` (or `--foreground-03` on dark
  ground). One weight only. A second rule weight means the hierarchy should
  have been expressed with space instead.

---

## 6. References

### Lineage

| | |
|---|---|
| [Rauno Freiberg — Interaction Guidelines](https://interactions.rauno.me) | The rigour: interaction rules stated as rules, with reasons |
| [Emil Kowalski — animations.dev](https://animations.dev) | Motion craft, easing, interruptibility (§3) |
| [Jhey Tompkins](https://jhey.dev) | Modern CSS as first resort rather than last (§4) |
| [Vercel Geist](https://vercel.com/geist) | Token architecture, the ramp-as-contract idea |

### The board

`references/` holds the visual source. What it argues, strongest first:

1. **Monospace as a full voice** — setting whole pages, not just code and
   labels. The board is heavier on mono than most of these projects should be;
   an available register, not a default. See §2.
2. **The printed document** — section numbers, page numbers, dot leaders,
   asterisk rules. Furniture that says a thing was *typeset*.
3. **Data as ornament** — coordinates, FCC IDs, durations, specifications, set
   as decoration and aligned in columns. Never behind a "details" toggle.
4. **Warm paper or near-black**, nothing between.
5. **One accent, used once.** Punctuation, not a palette.
6. **Softness only at the controls.** Pills and blur belong to things you
   touch; structure stays square and ruled.

---

## 7. Accessible by default

Most of this is free if you take "prefer the platform" (§0) seriously — the platform
ships focus management, semantics and keyboard handling, and every hand-rolled
replacement loses some of it.

- **Contrast** — see §1. The dark ramp is the one that bites.
- **Focus must be visible.** Never `outline: none` without a replacement.
  `:focus-visible` gives keyboard users a ring and leaves mouse users alone;
  that is the whole reason it exists, so there is no reason to suppress it.
- **Elements before roles.** `<button>`, `<dialog>`, `<nav>`, `<a href>`. A
  `<div role="button" tabIndex={0} onKeyDown={…}>` is four things to get wrong
  in place of one that is already right — and `role="dialog"` + `aria-modal`
  on a `<div>` still gives you no top layer, no focus trap and no inert
  background, all of which `showModal()` hands over for free.
- **Headings are an outline, not a size picker.** Never skip a level to get
  smaller text. `base.css` sets no heading sizes precisely so this stays a
  markup decision.
- **Hit targets** are 44px minimum on touch, padding included.
- **Reduced motion** — see §3. Reduce, do not remove.
- **Never colour alone.** State that is only a hue is state some readers do not
  have; pair it with an icon, a rule, weight or position.

---

## 8. What ships

`theme.css` is the barrel; `tokens.css` alone works without Tailwind.

| | |
|---|---|
| **Colour** | `--background` / `--foreground` × `-07` `-05` `-03`; `--background-semi`, `--background-07-semi`, `--background-05-semi`; `--overlay`, `--overlay-dark`; `--brand-light`, `--brand-dark`, `--brand-text`, `--brand-bg` |
| **Type roles** | `--font-sans-stack`, `--font-mono-stack`, `--font-serif-stack` → `font-sans` / `font-mono` / `font-serif` |
| **Motion** | `--duration-micro` `-exit` `-enter` `-slow`; `--ease-entrance` `-exit` `-micro` `-spring` |
| **Keyframes** | `fadeIn`, `fadeOut`, `fadeInFromBottom`, `fadeOutToBottom`, `fadeOutToTop`, `fadeInToLeft`, `fadeOutToLeft`, `fadeInToRight`, `fadeOutToRight`, `modalOpen`, `modalClose`, `modalOverlayOpen`, `modalOverlayClose` |
| **Utilities** | `animate-modal-open` / `-close` / `-overlay-open` / `-overlay-close`; `no-scrollbar`, `thin-scrollbar` |
| **Base elements** | `body`, `p`, `a`, `h1`–`h3` (`text-wrap` only), `button:hover`, `::selection`, global `corner-shape` |

Keyframes are shipped bare and unbound — the **names** of view transitions are
app-specific, so mapping them is each project's job (§3). Check this table
before writing another `fadeIn`.

> Tailwind v4 tree-shakes unused `@theme` variables. A token you reference only
> from JS or a template string will not be in the output; one plain
> `var(--token)` anywhere in your CSS keeps it alive.

---

## 9. Rejected

Not stylistic preferences — each is something one of these projects shipped,
and each has a replacement above.

| Don't | Because | Instead |
|---|---|---|
| `shadow-2xl`, or any shadow for structure | Depth is not hierarchy | A hairline (§0) |
| `rounded-[56px]`, `rounded-[44px]` | Off-grid, and breaks nesting | 8 / 24 / `100rem` (§5) |
| `duration-300`, `ease-out` at call sites | Retuning means grepping | Motion tokens (§3) |
| `setTimeout` matched to a CSS duration | Two sources of truth; they drift | `onAnimationEnd` / `transitionend` |
| Hand-built modals, dropdowns, tooltips | Loses the top layer, focus trap, Escape | `<dialog>`, `popover` (§4) |
| `role="button"` on a `<div>` | Reimplements `<button>`, worse | The element (§7) |
| Lining figures in a column of numbers | Columns fail to align; reads rendered | `tabular-nums` (§2) |
| Faint text via `-05` / `-03` on dark | 2.2:1 and 1.7:1 — not low-emphasis, gone | Change size or weight (§1) |
| Introducing a token inside `.dark` | Invalid-at-computed-value in light: the fill silently does not paint, while the ink chosen *for* it stays — white on white | `:root` declares, `.dark` only overrides (§1) |
| `aria-pressed` for a filled look on a one-shot action | Announces a switch that never switches | A class, and a timer (§7) |
| React state that only toggles a class | The platform already tracks it | `:has()`, `@starting-style` (§4) |
| Entrance animation on first paint | Delays content to decorate it | Animate on change (§3) |
| A second hairline weight | Hierarchy wanted space, not another rule | Space (§5) |
| Mid-grey grounds | Belongs to no one | Two grounds (§0) |

---

Migration notes for the individual projects live in the
[README](./README.md#migration).
