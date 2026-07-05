# Phase 4 — AI Backend & API Routes

- [x] 4.1 — Create lib/prisma.ts — Prisma client singleton
- [x] 4.2 — Create lib/claude.ts — Anthropic SDK wrapper with streaming helper
- [x] 4.3 — Create lib/embeddings.ts — Embedding generation and vector search utility (pgvector cosine similarity)
- [x] 4.4 — Create lib/stripe.ts — Stripe client and plan limits constants
- [x] 4.5 — Create lib/utils.ts — Shared utility functions
- [x] 4.6 — Build POST /api/chat — Main chat route (lookup bot, check domain, check limits, load history, RAG search, stream Claude response, save conversation)
- [x] 4.7 — Build GET /api/widget-config — Return bot config for widget initialization
- [x] 4.8 — Build POST /api/knowledge — Ingest text or PDF, chunk, embed, store in KnowledgeItem
- [x] 4.9 — Build GET /api/conversations and POST /api/conversations
- [x] 4.10 — Build PATCH /api/conversations/[id] — Mark resolved, update lead info
- [x] 4.11 — Build GET /api/analytics — Aggregated stats for a tenant
- [x] 4.12 — Build POST /api/tenants and PATCH /api/tenants/[id] — Superadmin tenant management
- [x] 4.13 — Build POST /api/bots and PATCH /api/bots/[id] — Chatbot CRUD
- [x] 4.14 — Build POST /api/billing/portal — Stripe Customer Portal session
- [x] 4.15 — Build POST /api/billing/webhook — Stripe webhook handler (subscription events)
