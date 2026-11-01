# Clean Genetics

React + Vite + Tailwind storefront with an AI grow assistant (Gemini).

## Run locally

1. `npm install`
2. Create `.env.local` with `GEMINI_API_KEY=your_key`
3. `npm run dev` (or `npm run build && npm run preview`)

## Design system (index.css + tailwind.config.js)

- **Aurora backdrop** – animated multi-hue gradient orbs + grid + grain (`<Aurora/>`)
- **Liquid glass** – `.glass`, `.glass-strong`, `.glass-bar`; legacy zinc/black utilities are re-skinned as glass globally
- **Spectral palette** – mint → cyan → violet → fuchsia → amber; each strain family owns a colour (Indica violet, Sativa amber, Hybrid emerald) in `lib/strainTheme.ts`
- **Generative strain art** – `<StrainArt/>` builds a unique mesh-gradient artwork from the product id
- **Typography** – Inter (UI), Instrument Serif italic (accent words), JetBrains Mono (numbers); self-hosted via Fontsource
- **Motion/UX** – scroll reveals, count-up stats, 3D card tilt, cursor spotlight, sliding nav indicator, ⌘K / Ctrl+K command palette, in-app toasts & dialogs (`lib/ui.ts`) instead of alert/prompt/confirm
