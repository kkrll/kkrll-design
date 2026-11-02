# @kkrll/design

Shared design tokens for the kkrll projects. CSS only — no build, no runtime,
no components. See **[design.md](./design.md)** for how to design with it.

## Install

```bash
bun add github:kkrll/kkrll-design
```

## Use

Tailwind v4 projects (`kkrll-next`, `good-looking`, `you-live-like-this`):

```css
@import "tailwindcss";
@import "@kkrll/design/theme.css";

/* your palette override + app-specific classes below */
```

Or `strict.css` in place of `theme.css` — the same, minus Tailwind's
defaults that design.md forbids (`text-sm`, `tracking-wide`, `shadow-lg`,
`text-red-500`, `ease-out`), so they fail to compile. Use it once a project
has migrated.

Projects without Tailwind (`dbd`) take tokens alone — the `@theme` block is
skipped as an unknown at-rule:

```css
@import "@kkrll/design/tokens.css";
```

Order matters: **after** `tailwindcss`, **before** your overrides.

## Files

| File | Contents |
|---|---|
| `theme.css` | Barrel — tokens, base, motion |
| `strict.css` | Barrel — `reset.css` first, then the same three |
| `reset.css` | Deletes forbidden Tailwind defaults. Internal: order matters |
| `tokens.css` | Colour ramps, type scale, font roles, motion timing, `@theme` mapping |
| `base.css` | Element defaults + `no-scrollbar` / `thin-scrollbar` utilities |
| `motion.css` | Keyframes, `animate-modal-*` utilities, reduced-motion policy |
| `bin/check.js` | `kkrll-check` — finds design.md floor violations |
| `references/` | The mood board. For people — not agent input |

## Check

```bash
bunx kkrll-check src        # file:line rule text; exits 1 only below the floor
```

Colour, tracking and icon findings fail the run. Off-scale sizes, radii,
shadows and call-site motion are listed under `reconsider:` and don't.
Exempt a line only with a
reason: `kkrll-ignore: <why>`; `--exempt` lists every exemption. Positive
letter-spacing cannot be exempted.

## Local development

**Vite projects** (`good-looking`, `you-live-like-this`, `dbd`) can symlink:

```bash
cd kkrll-design && bun link
cd ../good-looking && bun link @kkrll/design
```

**Not `kkrll-next`.** Turbopack resolves symlinks to their real path and
refuses anything above the Next project root, so `bun link` makes the dev
server panic outright:

```
FileSystemPath("").join("../kkrll-design/theme.css") leaves the filesystem root
```

The panic is fatal and survives removing the link — recovery is
`rm -rf node_modules/@kkrll .next` and a restart (`bun unlink` is not
implemented). Setting `turbopack.root` would fix it by putting every sibling
project in Turbopack's watch scope, which is not a trade worth making.

So for `kkrll-next`, iterate in `node_modules/@kkrll/design/` directly, copy
the result back to the repo, then push:

```bash
cp node_modules/@kkrll/design/*.css ../kkrll-design/
```

## Releasing

Consumers pin `github:kkrll/kkrll-design`, which tracks the default branch —
push to `main` and `bun update @kkrll/design` picks it up. Pin a tag
(`github:kkrll/kkrll-design#v0.2.0`) if a project needs to hold back.

## Migration

| Project | To do |
|---|---|
| `kkrll-next` | **Done.** Canonical. Keeps app-specific classes (`.nice-button`, `.px-default`, `.grid-1-to-3`, `.h-hero`) and its view-transition block. |
| `good-looking` | Fix inverted background ramp: `-05` (`#f5f5f5`) sits closer to base than `-07` (`#e5e5e5`). Alias `fade-in`/`fade-out` → `fadeIn`/`fadeOut`. Override palette to neutral. Keep `.markdown`, `--grid-template-columns-main`, `--breakpoint-xl`. |
| `you-live-like-this` | Same as good-looking, minus `.markdown`. Keep the `.tok-*` DSL editor tokens. |
| `dbd` | No Tailwind — import `tokens.css` only. Its journal aliases (`--bg`, `--ink`, `--muted`, `--rule`) already map onto the ramp; keep them. |

### Fixed on the way in

`kkrll-next` used `--background-07-semi` and `--background-semi` without ever
defining them, so `.nice-button`'s light-mode border
(`1px solid var(--background-07-semi)`) resolved to an invalid value and the
whole declaration was dropped — the button rendered borderless. Both are now
defined in `tokens.css`.
