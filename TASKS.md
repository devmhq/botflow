# TASK LIST — BOTFLOW SAAS
========================

## PHASE 1: FOUNDATION

- [x] 1.1 — Initialize Next.js 14 project with TypeScript and App Router
- [x] 1.2 — Install and configure Tailwind CSS and shadcn/ui
- [x] 1.3 — Set up Prisma with PostgreSQL schema (Tenant, User, Chatbot, KnowledgeItem, Conversation, enums)
- [x] 1.4 — Enable pgvector extension on PostgreSQL instance
- [x] 1.5 — Configure NextAuth.js v5 with credentials provider + bcrypt + JWT sessions
- [x] 1.6 — Write middleware.ts to protect /superadmin/* and /dashboard/* routes
- [x] 1.7 — Create .env.local with all required environment variables
- [x] 1.8 — Write prisma/seed.ts to seed the superadmin user
- [x] 1.9 — Run prisma migrate dev and prisma db seed

---

## PHASE 2: SUPERADMIN DASHBOARD

- [x] 2.1 — Build /superadmin layout (sidebar, header, wrapper)
- [x] 2.2 — Build /superadmin page — Overview (KPI tiles, recent signups, platform health)
- [x] 2.3 — Build /superadmin/tenants — All clients table (name, plan badge, status badge, chatbot count, actions)
- [x] 2.4 — Add Create New Tenant modal with form on /superadmin/tenants
- [x] 2.5 — Build /superadmin/tenants/[id] — Tenant detail page (info card, usage stats, chatbot list, change plan, danger zone)
- [x] 2.6 — Build /superadmin/analytics — Platform analytics (daily chats line chart, tenants by plan donut, revenue bar chart)
- [x] 2.7 — Build /superadmin/settings — System settings (API key management, email template editor, plan limits editor)

---

## PHASE 3: CLIENT (ADMIN) DASHBOARD

- [x] 3.1 — Build /dashboard layout (sidebar, header, wrapper, dark mode toggle)
- [x] 3.2 — Build /dashboard page — Home (welcome banner, KPI tiles, quick actions, recent conversations)
- [x] 3.3 — Build /dashboard/bots — My chatbots list (status toggle, create new bot button)
- [x] 3.4 — Build /dashboard/bots/new — Bot setup wizard Step 1 (basic info: name, business type, personality)
- [x] 3.5 — Build /dashboard/bots/new — Bot setup wizard Step 2 (knowledge base: paste FAQ or upload PDF)
- [x] 3.6 — Build /dashboard/bots/new — Bot setup wizard Step 3 (appearance: color, position, welcome message, avatar)
- [x] 3.7 — Build /dashboard/bots/[id] — Bot detail & settings (tabs: General, Knowledge Base, Appearance, Domains)
- [x] 3.8 — Build /dashboard/bots/[id]/embed — Embed code page (script tag, copy button, install instructions, test widget)
- [x] 3.9 — Build /dashboard/conversations — Conversations table with slide-over panel and filters
- [x] 3.10 — Build /dashboard/analytics — Analytics page (date range picker, KPI row, 3 charts)
- [x] 3.11 — Build /dashboard/settings — Account settings (business info, password change, team members, notifications)
- [x] 3.12 — Build /dashboard/billing — Billing page (plan card, usage meter, upgrade buttons, billing history, Stripe portal link)

---

## PHASE 4: AI BACKEND & API ROUTES

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

---

## PHASE 5: EMBEDDABLE WIDGET

- [x] 5.1 — Scaffold widget/botflow-widget.js — standalone vanilla JS file structure
- [x] 5.2 — Implement widget launcher button (pill-shaped, avatar, "Chat with us" text)
- [x] 5.3 — Implement chat window (320×480, open/close animation, shadow DOM or scoped CSS)
- [x] 5.4 — Implement lead capture form (name + email, shown before first message)
- [x] 5.5 — Implement message rendering (user right-aligned indigo, bot left-aligned gray, timestamps)
- [x] 5.6 — Implement SSE streaming response rendering (tokens appear one by one)
- [x] 5.7 — Implement typing indicator (3 animated dots)
- [x] 5.8 — Implement conversation persistence via localStorage
- [x] 5.9 — Implement mobile responsive behaviour (full screen on mobile)
- [x] 5.10 — Implement widget initialization flow (async load → fetch config → inject DOM → handle messages)

---

## PHASE 6: BILLING (STRIPE)

- [x] 6.1 — Define PLAN_LIMITS constants (Starter / Growth / Pro — chats, bots, team members)
- [x] 6.2 — Integrate Stripe Checkout for new subscriptions
- [x] 6.3 — Integrate Stripe Customer Portal for plan changes and payment methods
- [x] 6.4 — Handle webhook events: checkout.session.completed, subscription.updated, subscription.deleted
- [x] 6.5 — Enforce monthly chat limits — return 429 with upgrade prompt when exceeded

---

## PHASE 7: LANDING PAGE

- [x] 7.1 — Build Hero section (headline, subheadline, CTA buttons, live demo widget)
- [x] 7.2 — Build Social proof section ("Trusted by X businesses" logos/count)
- [x] 7.3 — Build How it works section (3 steps)
- [x] 7.4 — Build Features section (6 feature cards with icons)
- [x] 7.5 — Build Industry use cases section (tabs: Salon / Restaurant / Dental / Auto Dealership)
- [x] 7.6 — Build Pricing section (3 plan cards with feature comparison table)
- [x] 7.7 — Build Testimonials section (3 quote cards)
- [x] 7.8 — Build CTA section (email input + "Start free trial" button)
- [x] 7.9 — Build Footer (links, social, legal)

---

## PHASE 8: AUTH PAGES

- [x] 8.1 — Build /login page (email + password form, error states, link to register)
- [x] 8.2 — Build /register page (name, email, password, business name — creates Tenant + Admin user)

---

## PHASE 9: POLISH & PRODUCTION READINESS

- [ ] 9.1 — Implement dark mode (Tailwind dark: prefix, localStorage toggle, dashboard toggle button)
- [ ] 9.2 — Add skeleton loaders to all data-fetching pages
- [ ] 9.3 — Add empty states to all list/table pages
- [ ] 9.4 — Add toast notifications (sonner) for all success/error actions
- [ ] 9.5 — Audit all forms for zod validation and react-hook-form integration
- [ ] 9.6 — Audit all API routes for proper HTTP status codes and try/catch
- [ ] 9.7 — Add JSDoc comments to all lib/ functions
- [ ] 9.8 — Final UI review against design standards (typography, spacing, color system)
- [ ] 9.9 — Verify no hardcoded secrets — all env vars referenced from process.env
- [ ] 9.10 — Write vercel.json / deployment config and confirm Vercel-ready build
