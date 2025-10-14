# json-to-pojo

Convert JSON samples or JSON Schemas into production-ready Java POJO classes directly in your browser. This React + TypeScript application runs entirely on the client and can be deployed on GitHub Pages with zero backend infrastructure.

## Features
- Monaco-powered JSON and schema editors with validation and example loaders
- Web Worker backed generation pipeline to keep the UI responsive
- Advanced options: Lombok, Jackson/Gson/Moshi annotations, collection/date/null strategies, enum generation, nested classes, and more
- Instant preview of generated `.java` files with syntax highlighting
- One-click ZIP download crafted client-side with JSZip
- Enterprise-grade security defaults: strict CSP, Trusted Types, zero telemetry, and no external network calls

## Tech Stack
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui + lucide-react icons
- Monaco Editor, AJV, Zod, JSZip
- Zustand for state, Vitest + React Testing Library for automated tests
- GitHub Actions (CI, CodeQL, Pages deploy) & Dependabot automation

## Getting Started

```bash
npm install
npm run dev
```

Open <http://localhost:5173> in your browser. All generation logic executes locally; no API keys or backends required.

### Scripts
- `npm run dev` – start the Vite development server
- `npm run build` – type-check and build for production
- `npm run preview` – preview the production build
- `npm run lint` – lint TypeScript/TSX files
- `npm run format` – format code and docs with Prettier
- `npm run typecheck` – stand-alone TypeScript check
- `npm run test` – run Vitest with coverage
- `npm run audit` – npm security audit
- `npm run deploy` – build and publish to GitHub Pages (uses `gh-pages`)

## Deployment

1. Set the repository name in `vite.config.ts` and the GitHub URL in `AppHeader`.
2. Push the code to GitHub.
3. Enable GitHub Pages from the repository settings (deploy from GitHub Actions).
4. GitHub Actions workflow `deploy.yml` builds and publishes the site automatically on pushes to `main`.

For manual deployment:
```bash
npm run deploy
```
This command builds the site with the correct base path and uploads `dist/` to the `gh-pages` branch.

## Security & Privacy
- Trusted Types policy initialization in `src/lib/trustedTypes.ts`
- No analytics, telemetry, or external network requests
- JSON input capped at 2 MB and processed inside a dedicated Web Worker
- Drag-and-drop navigation is disabled; file downloads use safe Blob URLs with automatic revocation

See [`SECURITY.md`](SECURITY.md) and [`PRIVACY.md`](PRIVACY.md) for detailed guidance.

## Testing
```bash
npm run test
```
Vitest runs unit tests for the generators, worker bridge, and UI smoke coverage. Coverage reports are emitted to `coverage/`.

## Contributing
Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) and follow the [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md). We welcome bug reports, feature suggestions, and pull requests that improve the developer experience.

## License
[MIT](LICENSE)
