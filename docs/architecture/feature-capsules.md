# Feature Capsules Architecture


Campus Web enforces modular **Feature Capsules** (`src/features/*`) to maintain isolation between complex academic and social domains.


---


## 🎯 Architectural Intent


Monolithic web frontends frequently degrade into tightly coupled component trees where state, services, and UI utilities cross-contaminate. Campus Web solves this using Domain-Driven Feature Capsules:
1. **Zero Domain Bleed:** Features (`academics`, `chat`, `freelance`) never directly import private internal state or UI subcomponents from one another.
2. **Predictable Capsule Topology:** Every feature capsule follows an identical interior structure.
3. **Decoupled Shell Integration:** Features are mounted into route shells (`src/app/(workspace)/*`) through top-level coordinator components.


---


## 🏗️ Standard Capsule Anatomy


Every feature capsule conforms to the following directory structure:


```text
src/features/<capsule-name>/
├── ui/                     # Presentation components and views
│   ├── components/         # Reusable capsule-specific UI elements
│   ├── modals/             # Contextual popups and dialog forms
│   └── views/              # Full-screen view layouts rendered within the capsule
├── hooks/                  # Custom React hooks managing local capsule state
├── services/               # Typed HTTP clients interacting with backend endpoints
├── types/                  # Authoritative TypeScript domain interfaces
└── data/                   # Fallback initializers, default presets, and constants