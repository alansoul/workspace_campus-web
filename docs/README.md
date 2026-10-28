# Campus Web — Documentation Hub


Welcome to the internal engineering documentation and architecture hub for **Campus Web** (`campus-web`), the Next.js 15 / React 19 client workspace for the Campus academic platform.


---


## 📚 Documentation Index


### 1. Architecture Blueprints (`docs/architecture/`)
* **[Feature Capsules Architecture](architecture/feature-capsules.md):** Domain-Driven Design (DDD) encapsulation dividing workspace modules into isolated capsules (`academics`, `chat`, `freelance`, `auth`, `admin`, `marketing`, `setup-wizard`).
* **[Campus AI Drawer & Multimodal Copilot](architecture/ai-drawer-ui.md):** Technical design of the resizable AI drawer (), OS clipboard image paste (`Ctrl + V`), Base64 serialization, and client-side PII privacy shield.
* **[Real-Time Sync & LiveKit WebRTC](architecture/realtime-web-sync.md):** Bi-directional messaging architecture, Socket.IO client hydration, presence synchronization, and LiveKit WebRTC audio/video call overlays.
* **[Edge Proxy & Authentication Flow](architecture/edge-proxy-auth.md):** Vercel edge rewrite proxy (`src/proxy.ts`), browser CORS elimination, and HTTP-only JWT cookie propagation.


### 2. Developer Guides (`docs/dev/`)
* **[Local Setup & Environment Matrix](dev/local-setup.md):** Step-by-step developer onboarding, runtime dependencies, `.env.local` reference, and dual-port routing (`3000`  `4000`).
* **[Frontend Testing Guide](dev/testing-guide.md):** Vitest + React Testing Library harness, testing React hooks, component unit tests, and CI/CD verification workflows.


---


## 🧭 Repository Quick Links
* **[Authoritative Component Dictionary (`FILE_MAP.md`)](../FILE_MAP.md):** Exhaustive index of every component, hook, modal, and service in `campus-web`.
* **[Root Showcase & Story (`README.md`)](../README.md):** High-level product overview, UX pillars, and feature summaries.