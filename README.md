# @kkrll/design

Shared design tokens for the kkrll projects. CSS only — no build, no runtime,
no components. See **[design.md](./design.md)** for the rules behind it.

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

Projects without Tailwind (`dbd`) take tokens alone — the `@theme` block is
skipped as an unknown at-rule:

```css
@import "@kkrll/design/tokens.css";
```

Order matters: **after** `tailwindcss`, **before** your overrides.

## Files

| File | Contents |
|---|---|
| `theme.css` | Barrel — imports all three below |
| `tokens.css` | Colour ramps, type roles, `@theme` mapping |
| `base.css` | Element defaults + `no-scrollbar` / `thin-scrollbar` utilities |
| `motion.css` | Keyframes + `animate-modal-*` utilities |

## Local development

To iterate on tokens without pushing:

```bash
cd kkrll-design && bun link
cd ../kkrll-next && bun link @kkrll/design
```

`bun unlink` to go back to the pinned GitHub version.

## Releasing

Consumers pin `github:kkrll/kkrll-design`, which tracks the default branch —
push to `master` and `bun update @kkrll/design` picks it up. Pin a tag
(`github:kkrll/kkrll-design#v0.2.0`) if a project needs to hold back.
