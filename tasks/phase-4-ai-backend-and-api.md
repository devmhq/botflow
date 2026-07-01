# Phase 4 — AI Backend & API Routes

- [ ] 4.1 — Create lib/prisma.ts — Prisma client singleton
- [ ] 4.2 — Create lib/claude.ts — Anthropic SDK wrapper with streaming helper
- [ ] 4.3 — Create lib/embeddings.ts — Embedding generation and vector search utility (pgvector cosine similarity)
- [ ] 4.4 — Create lib/stripe.ts — Stripe client and plan limits constants
- [ ] 4.5 — Create lib/utils.ts — Shared utility functions
- [ ] 4.6 — Build POST /api/chat — Main chat route (lookup bot, check domain, check limits, load history, RAG search, stream Claude response, save conversation)
- [ ] 4.7 — Build GET /api/widget-config — Return bot config for widget initialization
- [ ] 4.8 — Build POST /api/knowledge — Ingest text or PDF, chunk, embed, store in KnowledgeItem
- [ ] 4.9 — Build GET /api/conversations and POST /api/conversations
- [ ] 4.10 — Build PATCH /api/conversations/[id] — Mark resolved, update lead info
- [ ] 4.11 — Build GET /api/analytics — Aggregated stats for a tenant
- [ ] 4.12 — Build POST /api/tenants and PATCH /api/tenants/[id] — Superadmin tenant management
- [ ] 4.13 — Build POST /api/bots and PATCH /api/bots/[id] — Chatbot CRUD
- [ ] 4.14 — Build POST /api/billing/portal — Stripe Customer Portal session
- [ ] 4.15 — Build POST /api/billing/webhook — Stripe webhook handler (subscription events)
