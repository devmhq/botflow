import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? "demopass123";

async function seedSuperadmin() {
  const email = process.env.SUPERADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.SUPERADMIN_PASSWORD ?? "123123123";
  const name = process.env.SUPERADMIN_NAME ?? "Super Admin";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Superadmin already exists: ${email}`);
    return;
  }

  const hashed = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: { name, email, password: hashed, role: "SUPERADMIN", tenantId: null },
  });

  console.log(`Superadmin created: ${email}`);
}

/** Spreads seeded conversations across recent history so charts (daily chats, revenue) render non-flat demo data. */
function daysAgo(n: number, hour = 10, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, minute, 0, 0);
  return d;
}

type Msg = { role: "USER" | "ASSISTANT"; content: string; minuteOffset: number };

function msgs(pairs: [string, string][]): Msg[] {
  return pairs.map(([content, role], i) => ({
    role: role as "USER" | "ASSISTANT",
    content,
    minuteOffset: i * 2,
  }));
}

interface ConvoSpec {
  offsetDays: number;
  hour?: number;
  status: "OPEN" | "RESOLVED";
  visitorName?: string;
  visitorEmail?: string;
  turns: [string, string][]; // [content, "USER" | "ASSISTANT"]
}

function buildConversation(spec: ConvoSpec, chatbotId: string, tenantId: string) {
  const createdAt = daysAgo(spec.offsetDays, spec.hour ?? 10 + (spec.offsetDays % 7));
  const messages = msgs(spec.turns).map((m) => ({
    role: m.role,
    content: m.content,
    createdAt: new Date(createdAt.getTime() + m.minuteOffset * 60_000),
  }));
  return {
    visitorId: `visitor_${Math.random().toString(36).slice(2, 10)}`,
    visitorName: spec.visitorName,
    visitorEmail: spec.visitorEmail,
    status: spec.status,
    tenantId,
    chatbotId,
    createdAt,
    updatedAt: messages[messages.length - 1]?.createdAt ?? createdAt,
    messages: { create: messages },
  };
}

async function seedDemoTenants() {
  const marker = await prisma.tenant.findUnique({ where: { slug: "bella-vista-salon" } });
  if (marker) {
    console.log("Demo tenants already exist, skipping demo seed.");
    return;
  }

  const hashed = await bcrypt.hash(DEMO_PASSWORD, 12);

  // ── 1. Bella Vista Salon — GROWTH / ACTIVE ────────────────────────────────
  const salonBotId = crypto.randomUUID();
  const salonKnowledge = [
    "We're open Tuesday–Saturday, 9am–7pm. Closed Sundays and Mondays.",
    "Haircuts start at $45, color services start at $95, and balayage starts at $160. Prices vary by stylist level.",
    "We recommend booking 3-5 days in advance for weekend appointments. Walk-ins are welcome but subject to availability.",
    "Cancellations within 24 hours of your appointment incur a 50% fee. No-shows are charged the full service price.",
  ];
  const salonConvos: ConvoSpec[] = [
    {
      offsetDays: 1,
      status: "RESOLVED",
      visitorName: "Hannah Boyd",
      visitorEmail: "hannah.boyd@gmail.com",
      turns: [
        ["Hi! Do you have any openings for a haircut this Saturday?", "USER"],
        ["Hi Hannah! Yes, we have a few Saturday slots open. What time works best for you — morning or afternoon?", "ASSISTANT"],
        ["Afternoon would be great, maybe around 2pm?", "USER"],
        ["2pm on Saturday works. I've noted your request — our front desk will confirm and send you a reminder. Anything else I can help with?", "ASSISTANT"],
        ["Nope, that's all, thank you!", "USER"],
        ["You're welcome, see you Saturday!", "ASSISTANT"],
      ],
    },
    {
      offsetDays: 3,
      status: "RESOLVED",
      turns: [
        ["how much is balayage", "USER"],
        ["Balayage starts at $160 and can vary based on hair length and the stylist's level. Would you like me to help you book a consultation?", "ASSISTANT"],
        ["not right now just checking prices, thanks", "USER"],
        ["No problem at all — feel free to reach out whenever you're ready!", "ASSISTANT"],
      ],
    },
    {
      offsetDays: 5,
      status: "OPEN",
      visitorName: "Marcus Webb",
      visitorEmail: "mwebb92@outlook.com",
      turns: [
        ["I need to cancel my appointment tomorrow, will I be charged?", "USER"],
        ["Since it's within 24 hours, a 50% cancellation fee applies. Would you like to reschedule instead to avoid the fee?", "ASSISTANT"],
        ["ok let me check my schedule and get back to you", "USER"],
      ],
    },
    {
      offsetDays: 8,
      status: "RESOLVED",
      visitorName: "Priya Shah",
      turns: [
        ["what are your hours on sunday", "USER"],
        ["We're closed Sundays and Mondays — open Tuesday through Saturday, 9am to 7pm.", "ASSISTANT"],
        ["got it thanks", "USER"],
      ],
    },
    {
      offsetDays: 12,
      status: "RESOLVED",
      turns: [
        ["Can I do a walk-in for a trim today?", "USER"],
        ["Walk-ins are welcome! It'll depend on stylist availability, so there may be a short wait. Want me to check current availability?", "ASSISTANT"],
        ["yes please", "USER"],
        ["We currently have an opening in about 30 minutes. Come on by!", "ASSISTANT"],
      ],
    },
    {
      offsetDays: 17,
      status: "RESOLVED",
      visitorName: "Dana Ellis",
      visitorEmail: "dana.ellis@yahoo.com",
      turns: [
        ["do you guys do kids haircuts", "USER"],
        ["We do! Kids cuts (12 and under) are $25. Would you like to book a time?", "ASSISTANT"],
        ["yes, next tuesday afternoon if possible", "USER"],
        ["Noted — Tuesday afternoon for a kids haircut. Our team will confirm the exact time shortly.", "ASSISTANT"],
      ],
    },
  ];

  await prisma.tenant.create({
    data: {
      name: "Bella Vista Salon",
      slug: "bella-vista-salon",
      plan: "GROWTH",
      status: "ACTIVE",
      monthlyChatsUsed: salonConvos.length,
      users: {
        create: [{ name: "Sofia Martinez", email: "sofia@bellavistasalon.com", password: hashed, role: "ADMIN" }],
      },
      chatbots: {
        create: [
          {
            id: salonBotId,
            name: "Bella",
            businessType: "Salon",
            personality: "You are Bella, a warm and upbeat assistant for a hair salon. Keep answers short and friendly.",
            widgetColor: "#ec4899",
            widgetPosition: "bottom-right",
            welcomeMessage: "Hi! Welcome to Bella Vista Salon — how can I help you today?",
            status: "ACTIVE",
            allowedDomains: ["bellavistasalon.com", "www.bellavistasalon.com"],
            knowledgeItems: { create: salonKnowledge.map((content) => ({ content, sourceType: "text" })) },
          },
          {
            name: "Booking Assistant",
            businessType: "Salon",
            personality: "You are a focused booking assistant that helps visitors schedule salon appointments.",
            widgetColor: "#f472b6",
            widgetPosition: "bottom-right",
            status: "DRAFT",
            allowedDomains: [],
          },
        ],
      },
    },
  });

  const salonTenant = await prisma.chatbot.findUniqueOrThrow({ where: { id: salonBotId } });
  for (const c of salonConvos) {
    const data = buildConversation(c, salonBotId, salonTenant.tenantId);
    await prisma.conversation.create({ data });
  }

  console.log("Seeded: Bella Vista Salon");

  // ── 2. The Rustic Table — PRO / ACTIVE ────────────────────────────────────
  const rustyBotId = crypto.randomUUID();
  const reservationBotId = crypto.randomUUID();
  const rustyKnowledge = [
    "We're open for dinner Tuesday–Sunday, 5pm–10pm. Lunch is served Thursday–Saturday, 11:30am–2pm.",
    "Popular menu items include the braised short rib, wild mushroom risotto, and our seasonal tasting menu.",
    "We accept reservations for parties up to 8 online, and up to 20 by phone for private dining.",
    "We offer full-service catering for private events — minimum 15 guests, booked at least 2 weeks in advance.",
    "We can accommodate most dietary restrictions including vegetarian, vegan, and gluten-free with advance notice.",
  ];
  const rustyConvos: ConvoSpec[] = [
    {
      offsetDays: 2,
      status: "RESOLVED",
      visitorName: "Alan Foster",
      visitorEmail: "alan.foster@gmail.com",
      turns: [
        ["Table for 4 this Friday at 7pm?", "USER"],
        ["Let me check — Friday at 7pm for 4 guests is available! Would you like me to hold that reservation?", "ASSISTANT"],
        ["yes please", "USER"],
        ["You're all set for Friday at 7pm, party of 4. We'll see you then!", "ASSISTANT"],
      ],
    },
    {
      offsetDays: 4,
      status: "RESOLVED",
      turns: [
        ["do you have vegan options", "USER"],
        ["Yes, we have several vegan dishes and can adapt most menu items with advance notice. Would you like recommendations?", "ASSISTANT"],
        ["sure", "USER"],
        ["I'd suggest our roasted cauliflower steak or the wild mushroom risotto made without butter — both are excellent vegan options.", "ASSISTANT"],
      ],
    },
    {
      offsetDays: 9,
      status: "OPEN",
      visitorName: "Grace Kim",
      visitorEmail: "grace.kim88@icloud.com",
      turns: [
        ["Are you open for lunch on Sundays?", "USER"],
        ["We currently only serve lunch Thursday through Saturday. Sundays we're open for dinner only, 5pm to 10pm.", "ASSISTANT"],
        ["ok, what about a large group dinner reservation for 15 people", "USER"],
        ["For a party of 15, I'd recommend calling us directly so we can arrange private dining — would you like the number?", "ASSISTANT"],
      ],
    },
    {
      offsetDays: 15,
      status: "RESOLVED",
      turns: [
        ["What's on the tasting menu right now?", "USER"],
        ["Our current seasonal tasting menu features 5 courses highlighting local produce, including a foraged mushroom starter and pan-seared duck breast. Want me to send the full menu?", "ASSISTANT"],
        ["yes please email it", "USER"],
        ["I've flagged this for our team to send over the full tasting menu PDF to your email shortly.", "ASSISTANT"],
      ],
    },
    {
      offsetDays: 22,
      status: "RESOLVED",
      visitorName: "Tom Reyes",
      turns: [
        ["is there parking nearby", "USER"],
        ["There's a public lot directly behind the restaurant, plus street parking along Main St after 6pm.", "ASSISTANT"],
      ],
    },
  ];

  const reservationConvos: ConvoSpec[] = [
    {
      offsetDays: 1,
      status: "RESOLVED",
      visitorName: "Nicole Bryant",
      visitorEmail: "nicole.bryant@gmail.com",
      turns: [
        ["I'd like to book a table for 2 tomorrow night", "USER"],
        ["Sure thing! What time would you like tomorrow evening?", "ASSISTANT"],
        ["8pm", "USER"],
        ["Booked — table for 2 tomorrow at 8pm. Looking forward to seeing you!", "ASSISTANT"],
      ],
    },
    {
      offsetDays: 6,
      status: "RESOLVED",
      turns: [
        ["can i change my reservation time", "USER"],
        ["Of course — what's the new time you'd like, and can you confirm the name on the reservation?", "ASSISTANT"],
        ["it's under Foster, move it to 8:30 instead of 7", "USER"],
        ["Updated! Foster party moved to 8:30pm. See you then.", "ASSISTANT"],
      ],
    },
    {
      offsetDays: 11,
      status: "RESOLVED",
      visitorName: "Chris Owusu",
      turns: [
        ["Do you take walk-ins or is reservation required?", "USER"],
        ["Walk-ins are welcome based on availability, but we recommend reserving ahead for weekend evenings.", "ASSISTANT"],
      ],
    },
    {
      offsetDays: 19,
      status: "OPEN",
      visitorEmail: "eventplanner@corpco.com",
      turns: [
        ["Looking to book a private dining room for a 20-person work dinner next month", "USER"],
        ["We'd love to host that! Our private dining room fits up to 20 guests. Do you have a preferred date?", "ASSISTANT"],
        ["still finalizing the date, I'll follow up", "USER"],
      ],
    },
  ];

  await prisma.tenant.create({
    data: {
      name: "The Rustic Table",
      slug: "the-rustic-table",
      plan: "PRO",
      status: "ACTIVE",
      monthlyChatsUsed: rustyConvos.length + reservationConvos.length,
      users: {
        create: [
          { name: "James Carter", email: "james@rustictable.com", password: hashed, role: "ADMIN" },
          { name: "Priya Nair", email: "priya@rustictable.com", password: hashed, role: "MEMBER" },
        ],
      },
      chatbots: {
        create: [
          {
            id: rustyBotId,
            name: "Rusty",
            businessType: "Restaurant",
            personality: "You are Rusty, a knowledgeable and hospitable assistant for an upscale restaurant.",
            widgetColor: "#f59e0b",
            widgetPosition: "bottom-right",
            welcomeMessage: "Welcome to The Rustic Table! Ask me about our menu, hours, or reservations.",
            status: "ACTIVE",
            allowedDomains: ["rustictable.com"],
            knowledgeItems: { create: rustyKnowledge.map((content) => ({ content, sourceType: "text" })) },
          },
          {
            id: reservationBotId,
            name: "Reservations Bot",
            businessType: "Restaurant",
            personality: "You are a concise reservations assistant focused only on booking, modifying, and canceling tables.",
            widgetColor: "#0ea5e9",
            widgetPosition: "bottom-left",
            welcomeMessage: "Hi! I can help you book, change, or cancel a reservation.",
            status: "ACTIVE",
            allowedDomains: ["rustictable.com", "reservations.rustictable.com"],
          },
          {
            name: "Catering Inquiries",
            businessType: "Restaurant",
            personality: "You are a helpful assistant for catering and private event inquiries.",
            widgetColor: "#10b981",
            widgetPosition: "bottom-right",
            status: "DRAFT",
            allowedDomains: [],
          },
        ],
      },
    },
  });

  const rustyTenant = await prisma.chatbot.findUniqueOrThrow({ where: { id: rustyBotId } });
  for (const c of rustyConvos) {
    await prisma.conversation.create({ data: buildConversation(c, rustyBotId, rustyTenant.tenantId) });
  }
  for (const c of reservationConvos) {
    await prisma.conversation.create({ data: buildConversation(c, reservationBotId, rustyTenant.tenantId) });
  }

  console.log("Seeded: The Rustic Table");

  // ── 3. Bright Smile Dental — STARTER / ACTIVE ─────────────────────────────
  const dentalBotId = crypto.randomUUID();
  const dentalKnowledge = [
    "Our office is open Monday–Friday, 8am–5pm. We're closed on weekends and major holidays.",
    "We accept most major insurance plans including Delta Dental, Cigna, and MetLife. Call our front desk to verify your specific plan.",
    "For dental emergencies (severe pain, broken teeth, swelling), call our emergency line — we offer same-day emergency appointments.",
    "New patient visits include a full exam, X-rays, and cleaning, and typically take about 60-90 minutes.",
  ];
  const dentalConvos: ConvoSpec[] = [
    {
      offsetDays: 1,
      status: "OPEN",
      visitorName: "Katie Nguyen",
      visitorEmail: "katie.nguyen@gmail.com",
      turns: [
        ["I have really bad tooth pain, can I come in today?", "USER"],
        ["I'm sorry to hear that! We offer same-day emergency appointments — can you call our emergency line right away so we can get you seen?", "ASSISTANT"],
        ["ok will do, thank you", "USER"],
      ],
    },
    {
      offsetDays: 3,
      status: "RESOLVED",
      turns: [
        ["do you take delta dental insurance", "USER"],
        ["Yes, we accept Delta Dental! We recommend calling our front desk to confirm your specific plan's coverage details.", "ASSISTANT"],
      ],
    },
    {
      offsetDays: 7,
      status: "RESOLVED",
      visitorName: "Ben Sullivan",
      visitorEmail: "ben.sullivan@outlook.com",
      turns: [
        ["I'm a new patient, what should I expect at my first visit?", "USER"],
        ["Welcome! Your first visit includes a full exam, X-rays, and a cleaning — it typically takes 60-90 minutes. Would you like help scheduling?", "ASSISTANT"],
        ["yes, do you have anything next week?", "USER"],
        ["We have openings Tuesday and Thursday mornings next week. Which works better for you?", "ASSISTANT"],
        ["Thursday morning", "USER"],
        ["Great, I've noted Thursday morning for your new patient visit. Our team will confirm the exact time.", "ASSISTANT"],
      ],
    },
    {
      offsetDays: 14,
      status: "RESOLVED",
      turns: [
        ["what are your hours", "USER"],
        ["We're open Monday through Friday, 8am to 5pm. Closed weekends and major holidays.", "ASSISTANT"],
      ],
    },
    {
      offsetDays: 20,
      status: "RESOLVED",
      visitorName: "Laura Diaz",
      turns: [
        ["can kids come to this dentist too", "USER"],
        ["Absolutely, we see patients of all ages, including children. Would you like to schedule a visit?", "ASSISTANT"],
        ["yes for my son, he's 6", "USER"],
        ["Wonderful — we'll get him set up with a pediatric-friendly appointment. What days work best for you?", "ASSISTANT"],
      ],
    },
  ];

  await prisma.tenant.create({
    data: {
      name: "Bright Smile Dental",
      slug: "bright-smile-dental",
      plan: "STARTER",
      status: "ACTIVE",
      monthlyChatsUsed: dentalConvos.length,
      users: {
        create: [{ name: "Dr. Emily Chen", email: "emily@brightsmiledental.com", password: hashed, role: "ADMIN" }],
      },
      chatbots: {
        create: [
          {
            id: dentalBotId,
            name: "Dental Helper",
            businessType: "Dental",
            personality: "You are a calm, reassuring assistant for a dental office. Prioritize urgent care questions.",
            widgetColor: "#0ea5e9",
            widgetPosition: "bottom-right",
            welcomeMessage: "Hi! I'm here to help with appointments, insurance, or dental questions.",
            status: "ACTIVE",
            allowedDomains: ["brightsmiledental.com"],
            knowledgeItems: { create: dentalKnowledge.map((content) => ({ content, sourceType: "text" })) },
          },
        ],
      },
    },
  });

  const dentalTenant = await prisma.chatbot.findUniqueOrThrow({ where: { id: dentalBotId } });
  for (const c of dentalConvos) {
    await prisma.conversation.create({ data: buildConversation(c, dentalBotId, dentalTenant.tenantId) });
  }

  console.log("Seeded: Bright Smile Dental");

  // ── 4. Apex Auto Group — GROWTH / SUSPENDED (older activity only) ────────
  const autoBotId = crypto.randomUUID();
  const autoKnowledge = [
    "Our current inventory includes sedans, SUVs, and trucks from multiple manufacturers — ask about a specific make or model for availability.",
    "We offer in-house financing with approval for most credit situations, plus manufacturer financing promotions.",
    "Trade-ins are welcome — bring your vehicle in for a free appraisal, no appointment necessary.",
    "Our service department is open Monday–Saturday, 7am–6pm, for maintenance and repairs.",
  ];
  const autoConvos: ConvoSpec[] = [
    {
      offsetDays: 42,
      status: "RESOLVED",
      visitorName: "Rick Alvarez",
      visitorEmail: "rick.alvarez@gmail.com",
      turns: [
        ["Do you have any SUVs under 30k in stock?", "USER"],
        ["We have a few SUVs in that range, including a 2023 model with low mileage. Would you like me to have someone follow up with details?", "ASSISTANT"],
        ["yes please", "USER"],
        ["Great, I've passed this along to our sales team — they'll reach out shortly.", "ASSISTANT"],
      ],
    },
    {
      offsetDays: 50,
      status: "RESOLVED",
      turns: [
        ["can i trade in my old truck", "USER"],
        ["Yes! Bring it in anytime for a free appraisal — no appointment needed.", "ASSISTANT"],
      ],
    },
    {
      offsetDays: 58,
      status: "RESOLVED",
      visitorName: "Denise Ford",
      visitorEmail: "denise.ford@yahoo.com",
      turns: [
        ["what financing options do you have for someone with credit issues", "USER"],
        ["We work with a range of lenders and offer in-house financing for most credit situations. Would you like to speak with our finance team?", "ASSISTANT"],
        ["yes, can someone call me", "USER"],
        ["Absolutely, I've flagged this for our finance team to reach out to you.", "ASSISTANT"],
      ],
    },
    {
      offsetDays: 65,
      status: "RESOLVED",
      turns: [
        ["is the service department open on saturdays", "USER"],
        ["Yes, our service department is open Monday through Saturday, 7am to 6pm.", "ASSISTANT"],
      ],
    },
  ];

  await prisma.tenant.create({
    data: {
      name: "Apex Auto Group",
      slug: "apex-auto-group",
      plan: "GROWTH",
      status: "SUSPENDED",
      monthlyChatsUsed: 0,
      users: {
        create: [{ name: "Marcus Diaz", email: "marcus@apexauto.com", password: hashed, role: "ADMIN" }],
      },
      chatbots: {
        create: [
          {
            id: autoBotId,
            name: "Apex Assistant",
            businessType: "Auto Dealership",
            personality: "You are a knowledgeable assistant for a car dealership, helping with inventory, financing, and service questions.",
            widgetColor: "#1f2937",
            widgetPosition: "bottom-right",
            welcomeMessage: "Welcome to Apex Auto Group — ask me about inventory, financing, or service.",
            status: "INACTIVE",
            allowedDomains: ["apexauto.com"],
            knowledgeItems: { create: autoKnowledge.map((content) => ({ content, sourceType: "text" })) },
          },
        ],
      },
    },
  });

  const autoTenant = await prisma.chatbot.findUniqueOrThrow({ where: { id: autoBotId } });
  for (const c of autoConvos) {
    await prisma.conversation.create({ data: buildConversation(c, autoBotId, autoTenant.tenantId) });
  }

  console.log("Seeded: Apex Auto Group");

  // ── 5. Coastal Realty Group — STARTER / CANCELLED (old activity only) ────
  const realtyBotId = crypto.randomUUID();
  const realtyKnowledge = [
    "Our office is open Monday–Saturday, 9am–6pm. Listings can also be viewed anytime on our website.",
    "To schedule a showing, we just need the listing address and your preferred date/time — an agent will confirm within a few hours.",
    "Our agents specialize in coastal residential properties, from condos to single-family homes.",
  ];
  const realtyConvos: ConvoSpec[] = [
    {
      offsetDays: 70,
      status: "RESOLVED",
      visitorName: "Owen Kelly",
      visitorEmail: "owen.kelly@gmail.com",
      turns: [
        ["Can I schedule a showing for the condo on Ocean Ave?", "USER"],
        ["Sure! What date and time works best for you, and I'll have an agent confirm.", "ASSISTANT"],
        ["This Saturday morning if possible", "USER"],
        ["Noted — Saturday morning for the Ocean Ave condo. An agent will confirm shortly.", "ASSISTANT"],
      ],
    },
    {
      offsetDays: 84,
      status: "RESOLVED",
      turns: [
        ["what areas do your agents cover", "USER"],
        ["Our agents specialize in coastal residential properties across the surrounding area, from condos to single-family homes.", "ASSISTANT"],
      ],
    },
    {
      offsetDays: 91,
      status: "RESOLVED",
      visitorName: "Marina Lopez",
      turns: [
        ["are you open on sundays", "USER"],
        ["We're open Monday through Saturday, 9am to 6pm — closed Sundays. Our listings are viewable online anytime though!", "ASSISTANT"],
      ],
    },
  ];

  await prisma.tenant.create({
    data: {
      name: "Coastal Realty Group",
      slug: "coastal-realty-group",
      plan: "STARTER",
      status: "CANCELLED",
      monthlyChatsUsed: 0,
      users: {
        create: [{ name: "Nina Torres", email: "nina@coastalrealty.com", password: hashed, role: "ADMIN" }],
      },
      chatbots: {
        create: [
          {
            id: realtyBotId,
            name: "Realty Bot",
            businessType: "Real Estate",
            personality: "You are a friendly assistant for a real estate agency, helping visitors with showings and listings.",
            widgetColor: "#14b8a6",
            widgetPosition: "bottom-right",
            status: "INACTIVE",
            allowedDomains: [],
            knowledgeItems: { create: realtyKnowledge.map((content) => ({ content, sourceType: "text" })) },
          },
        ],
      },
    },
  });

  const realtyTenant = await prisma.chatbot.findUniqueOrThrow({ where: { id: realtyBotId } });
  for (const c of realtyConvos) {
    await prisma.conversation.create({ data: buildConversation(c, realtyBotId, realtyTenant.tenantId) });
  }

  console.log("Seeded: Coastal Realty Group");
  console.log(`\nDemo login password for all demo accounts: ${DEMO_PASSWORD}`);
}

async function main() {
  await seedSuperadmin();
  await seedDemoTenants();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
