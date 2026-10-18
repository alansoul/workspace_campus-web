# 🌌 Northstar Workspace — Campus Web

> **The all-in-one connected campus workspace for students, developers, and colleges[cite: 11, 24].**  
> Live Platform: [workspace-campus-web.vercel.app](https://workspace-campus-web.vercel.app)[cite: 24]

---

## 📖 The Story Behind the Platform
<!-- ✍️ THIS IS THE MAIN SECTION DAMINI WRITES -->
Modern university life is scattered across disconnected tools[cite: 10, 11]. Official circulars get buried in emails, group projects fight for attention in informal chats, and students taking on campus freelance work face uncertain payment terms[cite: 8, 10, 23]. 

Northstar Workspace brings every aspect of daily student and developer life under an authenticated campus roof[cite: 11, 24]:
- Instant peer chat & WebRTC video lounges[cite: 11, 24].
- Academic matrix, daily timetables, and circular feeds[cite: 8, 11, 20].
- Server-side Google Gemini academic copilot[cite: 11, 24].
- Milestone escrow vault for campus freelancing[cite: 23, 24].

---

## 🚀 Key Modules

### 💬 Northstar Circle
- Low-latency real-time text chat channels powered by WebSockets[cite: 11, 24].
- 1-to-1 and group WebRTC voice & video lounges with screen sharing[cite: 11, 24].
- Role-based moderation and direct file uploads[cite: 11, 24].

### 🧠 Campus AI Copilot (Powered by Google Gemini)
- Integrated reasoning assistant for code reviews, exam prep, and coursework[cite: 11, 24].
- Configurable reasoning depth (Low, Medium, High) with server-side API security[cite: 11, 24].

### 🎓 Campus Academics
- Daily class schedule and timetable tracking[cite: 11, 20].
- Automated notice ingestion filtered strictly for campus announcements[cite: 8, 11, 20].
- Real-time attendance ledger with warning thresholds[cite: 8, 11, 20].

### 💼 Freelance Hub & Escrow Vault
- Template-driven agreements for prototypes, UI sprints, and bug bounties[cite: 23, 24].
- Smart milestone vault that locks project funds until deliverables are verified[cite: 23, 24].

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide React
- **Real-Time:** WebSockets (Socket.IO), WebRTC
- **Backend Architecture:** NestJS, Prisma ORM, Neon PostgreSQL
- **Authentication:** HttpOnly JWT Session Tokens, Google OAuth 2.0

## 👥 Authors & Team

- **Rohan Singh Bhandari** — Fullstack Architecture, Real-Time Systems & Security
- **Damini** — Product Concept, Narrative & Documentation