# System & Feature Capsule Overview (`campus-web`)

Visual overview of how **Campus Web** (`Next.js` App Router + `src/proxy.ts` + feature capsules) connects to **Campus API**.

- Mermaid sources: [system-architecture.mmd](../diagrams/system-architecture.mmd), [campus-web-capsules.mmd](../diagrams/campus-web-capsules.mmd)

## 1. Web App Route Groups & Feature Capsules

```mermaid
flowchart TD
  Proxy["src/proxy.ts<br/>Edge Cookie & Role Gate"]

  subgraph PublicRoutes["Public & Auth Routes"]
    Marketing["(marketing)/page.tsx<br/>ProductLandingPage"]
    AuthPages["(auth)/login & register<br/>ModernAuthCard + GoogleOAuthButton"]
    Setup["(onboarding)/setup<br/>SetupWizard (5-step institutional onboarding)"]
    Callback["api/auth/callback/route.ts"]
  end

  subgraph WorkspaceRoutes["(workspace) Protected Routes"]
    Dash["/dashboard<br/>DiscoverDashboard + LinkCampusModal"]
    Acad["/academics<br/>AcademicsApp (15 Views + CampusAiDrawer)"]
    Chat["/chat<br/>ChatApp + ChatFeed + LiveKitVideoCall"]
    Copilot["/copilot<br/>CopilotApp + AgentReasoningView + AiConfigModal"]
    Freelance["/freelance<br/>FreelanceApp + Create/Detail Modals"]
    Admin["/admin<br/>AdminConsoleView + TelemetryGrid"]
    Settings["/settings<br/>Account & Campus Linking"]
  end

  subgraph SharedLib["Shared Client Infrastructure"]
    ApiTs["src/lib/api.ts<br/>Authenticated Axios Instance"]
    SocketTs["src/lib/socket.ts<br/>Socket.IO Client"]
    PermsTs["src/lib/permissions.ts<br/>RBAC Helpers"]
  end

  Proxy --> PublicRoutes
  Proxy --> WorkspaceRoutes
  AuthPages --> ApiTs
  Setup --> ApiTs
  Dash --> ApiTs
  Acad --> ApiTs
  Chat --> ApiTs
  Chat --> SocketTs
  Copilot --> ApiTs
  Freelance --> ApiTs
  Admin --> ApiTs
  WorkspaceRoutes --> PermsTs
```

## 2. Full Platform Integration

```mermaid
flowchart TB
  subgraph Clients["Client Applications"]
    direction LR
    Web["campus-web<br/>Next.js App Router + Edge Proxy"]
    Mobile["campus_mobile (Android .apk)<br/>Flutter + Riverpod + Dio"]
    Desktop["campus_mobile (Windows .exe)<br/>Flutter Desktop Runner"]
  end

  subgraph Edge["Proxy & Transport"]
    NextProxy["src/proxy.ts<br/>JWT Cookie Gate + /api Rewrite"]
    RestHTTP["HTTPS / REST API"]
    SocketIO["Socket.IO WebSockets"]
    WebRTC["LiveKit SFU Media"]
  end

  subgraph Backend["campus-api (NestJS + ThrottlerGuard)"]
    AppMod["AppModule"]
    IAM["IamModule<br/>JWT, OTP, OAuth, Profile"]
    Uni["UniversityModule<br/>Academics, Admin, Gmail Sync"]
    Chat["ChatModule<br/>Channels, DMs, Uploads, Gateway"]
    Freelance["FreelanceModule<br/>Gigs, Proposals, Escrow"]
    AI["AiModule<br/>AI Drawer Proxy & OCR"]
    Copilot["CopilotModule<br/>Triage Router + Daily Quota"]
    Prisma["PrismaService<br/>Multi-Schema ORM"]
  end

  subgraph Data["Databases & External Services"]
    direction LR
    PG[("Neon PostgreSQL<br/>Schemas: iam, university, chat, freelance")]
    Redis[("Upstash Redis<br/>OTP & Ephemeral Cache")]
    Resend["Resend Email API"]
    Gmail["Google Gmail OAuth/API"]
    LLM["Gemini / Groq / OpenAI"]
    LiveKitCloud["LiveKit Cloud"]
    Disk["Local uploads/ Storage"]
  end

  Web --> NextProxy
  NextProxy --> RestHTTP
  Web --> SocketIO
  Web --> WebRTC

  Mobile --> RestHTTP
  Mobile --> SocketIO
  Mobile --> WebRTC

  Desktop --> RestHTTP
  Desktop --> SocketIO
  Desktop --> WebRTC

  RestHTTP --> AppMod
  SocketIO --> Chat
  WebRTC --> LiveKitCloud

  AppMod --> IAM
  AppMod --> Uni
  AppMod --> Chat
  AppMod --> Freelance
  AppMod --> AI
  AppMod --> Copilot

  IAM --> Prisma
  Uni --> Prisma
  Chat --> Prisma
  Freelance --> Prisma
  Copilot --> Prisma

  Prisma --> PG
  IAM --> Redis
  IAM --> Resend
  Uni --> Gmail
  Chat --> Disk
  Chat --> LiveKitCloud
  AI --> LLM
  Copilot --> LLM
```
