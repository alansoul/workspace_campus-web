# Security, Edge Proxy & Operations (campus-web)

Production security controls and CI/CD reference for **Campus Web** (workspace_campus-web).

## 1. Edge & Client Controls

| Control Layer | Implementation | Source Reference |
| :--- | :--- | :--- |
| **Edge Cookie Gate** | Inspects 	oken, ccount_type, and user_role cookies on workspace routes | [proxy.ts](../../src/proxy.ts) |
| **API Proxy Rewrite** | Rewrites /api/:path* to Render API in production or localhost:4000 in dev | [next.config.ts](../../next.config.ts) |
| **RBAC Helpers** | Role permission guards for institutional and admin views | [permissions.ts](../../src/lib/permissions.ts) |

## 2. CI/CD Pipeline

Defined in [ci.yml](../../.github/workflows/ci.yml): pnpm lint (eslint) → pnpm tsc --noEmit → pnpm build (
ext build standalone).
