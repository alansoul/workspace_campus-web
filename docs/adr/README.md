# Architecture Decision Records (ADRs)

Concise engineering decisions documenting *why* Northstar Campus is structured as it is.

---

## ADR-001: 3-Repo Polyrepo Architecture Across Backend, Web, and Flutter

- **Status:** Accepted
- **Context:** The platform spans a NestJS backend (`workspace_campus-api`), a Next.js web workspace (`workspace_campus-web`), and a cross-platform Flutter client (`campus_mobile` → `workspace_campus-mobile`) with distinct toolchains (`pnpm`/Node vs. Dart/Flutter/Gradle/CMake), release cadences, and hosting targets (Render, Vercel, APK/EXE artifacts).
- **Decision:** Maintain separate GitHub repositories per runtime target (`workspace_campus-api`, `workspace_campus-web`, `workspace_campus-mobile`) while documenting cross-system contracts centrally.
- **Consequences:** Independent CI pipelines (`oxlint`+`vitest`, `eslint`+`tsc`+`next build`, `flutter test`/`build`) stay fast and decoupled; API contract alignment is tracked via Postman v3 collections (`campus-api/postman/`) and shared docs.

---

## ADR-002: PostgreSQL Multi-Schema Isolation via Prisma

- **Status:** Accepted
- **Context:** Identity (`User`, `University`, `Session`), academics (`Timetable`, `AttendanceRecord`, `Exam`), messaging (`Channel`, `ChatMessage`), and student marketplace (`Gig`, `EscrowTransaction`) coexist in one Neon PostgreSQL cluster.
- **Decision:** Enable Prisma multi-schema (`schemas = ["iam", "university", "freelance", "chat"]`) in `campus-api/prisma/schema/base.prisma` with domain-split `.prisma` files and `onDelete: SetNull` on `User.university`.
- **Consequences:** Strong logical domain boundaries without cross-database distributed transaction complexity, while preventing accidental cascade deletion of student accounts when an institution record changes.

---

## ADR-003: Split Socket.IO Signaling & LiveKit SFU for Real-Time Calls

- **Status:** Accepted
- **Context:** Campus channels require low-latency text chat, online presence, and multi-participant audio/video calls across browsers and native clients.
- **Decision:** Handle chat persistence, presence (`presence:sync`), and call invitations (`call:offer`, `call:answer`, `call:reject`, `call:end`) over Socket.IO (`ChatGateway`), while offloading media streams to LiveKit Cloud using short-lived (4h) JWTs minted by `GET /api/chat/livekit/token`.
- **Consequences:** NestJS remains stateless for heavy WebRTC media routing while retaining authoritative identity and room authorization.

---

## ADR-004: Dual AI Architecture (Stateless Drawer Proxy + Stateful Copilot Orchestrator)

- **Status:** Accepted
- **Context:** Users need both quick page-aware assistance inside Academics (`CampusAiDrawer` → `/api/ai/chat`) and deeper campus-grounded reasoning (`/copilot` → `/api/copilot/chat`).
- **Decision:** Keep `AiModule` as a rate-limited stateless proxy (`20/min`) and introduce `CopilotModule` for domain triage (`classifyDomain`), database grounding (`AttendanceRecord`), a 20-query/day shared system quota, and BYOK fallback across Gemini, Groq, OpenAI, and Hugging Face.
- **Consequences:** Students get grounded answers without exhausting shared API budgets, with clear upgrade/BYOK paths.

---

## ADR-005: Single Flutter Codebase Targeting Android (`.apk`) and Windows (`.exe`)

- **Status:** Accepted
- **Context:** Native mobile and desktop apps share identical authentication (`AuthRepository`, `AuthInterceptor`), storage (`FlutterSecureStorage`), and API endpoints (`ApiEndpoints`).
- **Decision:** Use a single Flutter project (`campus_mobile/`) targeting both `android/` and `windows/` while keeping UI layouts cleanly separated by viewport/platform inside `lib/features/`.
- **Consequences:** Zero duplication of networking, models, and Riverpod state management across `.apk` and `.exe` builds.
