# Runtime Flows & Sequence Diagrams (`campus-web`)

Key client-server interaction flows for authentication, Socket.IO/LiveKit real-time features, and AI Copilot orchestration.

- Mermaid sources: [auth-sequence.mmd](../diagrams/auth-sequence.mmd), [realtime-chat-livekit.mmd](../diagrams/realtime-chat-livekit.mmd), [ai-copilot-flow.mmd](../diagrams/ai-copilot-flow.mmd)

## 1. Authentication & Edge Proxy Gate

```mermaid
sequenceDiagram
  autonumber
  actor User as Student / Admin
  participant Client as Web (Next.js) / Flutter (Mobile & Desktop)
  participant Proxy as Next.js Proxy (Web Only)
  participant Auth as AuthController & AuthService
  participant DB as Neon Postgres (iam)
  participant Cache as Upstash Redis & Resend

  User->>Client: Enter institutional or personal email
  Client->>Auth: GET /api/auth/resolve-domain?email=...
  Auth->>DB: Query UniversityDomain
  DB-->>Auth: Domain verification & university status
  Auth-->>Client: Account type & login options

  alt OTP Registration / Verification
    Client->>Auth: POST /api/auth/request-otp
    Auth->>Cache: Store OTP + send via Resend
    User->>Client: Submit OTP & credentials
    Client->>Auth: POST /api/auth/verify-and-register
    Auth->>DB: Create User + PasswordCredential + Session
  else Email & Password Login
    Client->>Auth: POST /api/auth/login
    Auth->>DB: Verify Argon2 password & create Session
  end

  Auth-->>Client: Return accessToken + refreshToken + User profile
  Client->>Client: Store tokens (HTTP cookie on Web / SecureStorage on Flutter)

  Note over Client,Proxy: Authenticated Workspace Requests
  Client->>Proxy: Navigate to /academics or /admin (Web)
  Proxy->>Proxy: Parse JWT cookie & check universityId / role
  Client->>Auth: GET /api/auth/me (or PATCH /api/auth/me)
  Auth->>DB: Load/Update User profile
  Auth-->>Client: 200 OK { user }

  alt Access Token Expired (401)
    Client->>Auth: POST /api/auth/refresh (x-refresh-token)
    Auth->>DB: Validate Session & rotate tokens
    Auth-->>Client: New accessToken
    Client->>Auth: Retry original request transparently
  end
```

## 2. Real-Time Chat & LiveKit Video Calls

```mermaid
sequenceDiagram
  autonumber
  actor A as User A (Web / Flutter)
  actor B as User B (Web / Flutter)
  participant Socket as ChatGateway (Socket.IO)
  participant HTTP as ChatController & ChatService
  participant DB as Neon Postgres (chat)
  participant LK as LiveKit SFU

  A->>Socket: Connect with JWT handshake
  Socket->>Socket: Join user & channel rooms + sync presence
  Socket-->>B: Broadcast presence:sync (online status)

  A->>HTTP: POST /api/chat/upload (optional attachment <= 100MB)
  HTTP-->>A: File metadata & URL

  A->>Socket: Emit sendMessage (channelId, content, fileUrl)
  Socket->>DB: Persist ChatMessage
  Socket-->>A: Deliver message event
  Socket-->>B: Deliver message event

  Note over A,LK: Audio / Video Call Signaling
  A->>HTTP: GET /api/chat/livekit/token?room=...
  HTTP->>LK: Mint signed LiveKit participant token
  HTTP-->>A: Return LiveKit JWT + room URL
  A->>Socket: Emit call:offer / signal to Channel
  Socket-->>B: IncomingCallModal / notification
  B->>HTTP: GET /api/chat/livekit/token?room=...
  HTTP-->>B: Return LiveKit JWT
  A->>LK: Join WebRTC media room
  B->>LK: Join WebRTC media room
```

## 3. AI Copilot Orchestration

```mermaid
flowchart TD
  User(["Student / User"])
  WebUI["campus-web<br/>CopilotApp + useCopilotOrchestrator<br/>or CampusAiDrawer"]
  MobileUI["campus_mobile<br/>AI Copilot Sheet / Planned Feature"]
  Endpoint["POST /api/copilot/chat<br/>(or /api/ai/chat)"]
  Guard["JwtAuthGuard"]
  Quota{"Using System Key?"}
  QuotaCheck{"Daily Quota under 20?"}
  QuotaErr["Return quotaExceeded response<br/>Prompt BYOK or Local AI"]
  Triage["Triage Router<br/>classifyDomain(prompt)"]
  Academics["Fetch AttendanceRecord,<br/>Timetable & User Context"]
  General["Load User & University Context"]
  Scrub["PII Redaction & Prompt Synthesis"]
  Router{"Provider Selection"}
  SystemLLM["System Cascade<br/>(Gemini / Groq / OpenAI)"]
  BYOK["User BYOK Key<br/>(Gemini / Groq / OpenAI / HF)"]
  Reply["CopilotResponseDto<br/>content, agentSteps, citations, suggestedFollowUps"]

  User --> WebUI
  User --> MobileUI
  WebUI --> Endpoint
  MobileUI --> Endpoint
  Endpoint --> Guard
  Guard --> Quota

  Quota -- "Yes (system)" --> QuotaCheck
  Quota -- "No (BYOK)" --> Triage
  QuotaCheck -- "No" --> QuotaErr
  QuotaCheck -- "Yes" --> Triage

  Triage -- "ACADEMICS" --> Academics
  Triage -- "GENERAL / OTHER" --> General
  Academics --> Scrub
  General --> Scrub
  Scrub --> Router

  Router -- "system" --> SystemLLM
  Router -- "userApiKey" --> BYOK
  SystemLLM --> Reply
  BYOK --> Reply
  Reply --> WebUI
  Reply --> MobileUI
```
