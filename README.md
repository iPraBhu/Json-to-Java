
# json-to-pojo

<<<<<<< HEAD
[![CI](https://github.com/your-org/json-to-pojo/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/json-to-pojo/actions/workflows/ci.yml)
[![CodeQL](https://github.com/your-org/json-to-pojo/actions/workflows/codeql.yml/badge.svg)](https://github.com/your-org/json-to-pojo/actions/workflows/codeql.yml)
=======
>>>>>>> 8231c00246857faefb23ba5752e31242c31ded3b
[![Coverage](https://img.shields.io/badge/coverage-68%25-yellow.svg)](#-testing)
[![Bundle Size](https://img.shields.io/badge/bundle-0.60_MB-blue.svg)](#-architecture-overview)
[![Website](https://img.shields.io/badge/live-json2java.adevguide.com-0f172a.svg?logo=googlechrome&logoColor=white)](https://json2java.adevguide.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**JSON Schema/Example → Java POJOs, no backend required.** Generate clean Java models in your browser with Monaco-powered editing, shadcn UI, and a Web Worker pipeline. Deployed live at [json2java.adevguide.com](https://json2java.adevguide.com/).

---


## ✨ Highlights
- **Zero server** – everything runs locally in the browser.
- **Dual input** – infer from raw JSON or feed in full JSON Schemas.
- **Rich options** – Lombok, Jackson/Gson/Moshi annotations, collection & numeric strategies, null handling, nested classes, enums, and more.
- **Responsive** – generation works in a dedicated Web Worker with timeout and payload size guardrails.
- **Instant previews** – Monaco-based Java viewer, file tree, and ZIP download of all generated classes.
- **Accessible UI** – Tailwind + shadcn components, keyboard navigation, dark/light theme toggle.

## 🌐 Quick Links
- **Live app**: https://json2java.adevguide.com/
- **Report a bug / Security contact**: [hello@pratik-bhuite.com](mailto:hello@pratik-bhuite.com)
- **Contributing guide**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **Security policy**: [SECURITY.md](SECURITY.md)

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` to use the app.

### Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and build production bundle |
| `npm run preview` | Preview the built app |
| `npm run lint` | Lint TS/TSX files |
| `npm run typecheck` | Run TypeScript without emit |
| `npm run test` | Vitest + RTL with coverage |
| `npm run audit` | npm security audit |

## 🧠 Architecture Overview

```
src/
├── App.tsx              # Main layout + orchestration
├── components/          # UI primitives & feature widgets (Monaco editor, outputs)
├── core/                # Generator pipeline: inference, naming, emission
├── hooks/useGeneratorWorker.ts # Worker bridge with timeout management
├── lib/                 # Utilities (Trusted Types, schema validation, downloads)
├── state/               # Zustand stores for theme + generator options
└── workers/             # Web Worker entry (generation off the main thread)
```

Key libraries:
- **React + TypeScript + Vite**
- **Tailwind CSS**, **shadcn/ui**, **lucide-react**
- **Monaco Editor**, **AJV**, **Zod**, **JSZip**
- **Zustand** for state, **Vitest + RTL** for testing

## 🔒 Security & Privacy
- Trusted Types policy initialization (`src/lib/trustedTypes.ts`).
- JSON input capped at 2 MB; heavy work stays in Web Worker.
- Blob download URLs are revoked immediately after use.
- No analytics, telemetry, or network calls required.
- See [SECURITY.md](SECURITY.md) for disclosure guidance.

## 📦 Continuous Delivery
- **CI**: lint → typecheck → tests → build → audit (GitHub Actions).
- **CodeQL**: weekly static analysis scan.
- **Dependabot**: weekly dependency updates for npm modules and GitHub Actions.

## ☁️ Deploying

### Cloudflare Pages (Recommended)
1. Push this repo to your Git hosting provider.
2. In Cloudflare Pages: **Create project → Connect to Git → select repo**.
3. Build command: `npm run build` · Output directory: `dist`.
4. Deploy. Optionally add your custom domain and enable preview deployments.

Because the site is fully static, any CDN or static host that supports a build step can serve it. Just run `npm run build` and upload the contents of `dist/`.

## 🤝 Contributing
We enthusiastically welcome contributions! Please read:
- [CONTRIBUTING.md](CONTRIBUTING.md)
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

Submit issues or PRs to improve the generator, UI polish, or docs.

## 📫 Contact
Questions, bugs, or security reports? Email **hello@pratik-bhuite.com**.

## 📄 License
Released under the [MIT License](LICENSE).
