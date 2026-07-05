import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";
import { analyzeArticle } from "../src/lib/analysis";
import { dedupeHash } from "../src/lib/monitoring/dedupe";

const db = new PrismaClient();

const BRAND = "Northwind";

const PUBLICATIONS = [
  { name: "TechCrunch", da: 93, country: "US", language: "en" },
  { name: "Reuters", da: 95, country: "GB", language: "en" },
  { name: "The Verge", da: 90, country: "US", language: "en" },
  { name: "Financial Times", da: 92, country: "GB", language: "en" },
  { name: "Bloomberg", da: 94, country: "US", language: "en" },
  { name: "Wired", da: 88, country: "US", language: "en" },
  { name: "The Guardian", da: 94, country: "GB", language: "en" },
  { name: "Forbes", da: 92, country: "US", language: "en" },
  { name: "BBC News", da: 95, country: "GB", language: "en" },
  { name: "Business Insider", da: 90, country: "US", language: "en" },
];

const AUTHORS = [
  "Sarah Chen", "Michael Torres", "Aisha Bello", "David Kim", "Elena Rossi",
  "James O'Brien", "Priya Nair", "Lucas Meyer", "Fatima Zahra", "Tom Wallace",
];

const POSITIVE_TITLES = [
  `${BRAND} reports record quarterly revenue driven by strong product launch`,
  `${BRAND} wins industry innovation award for its new AI platform`,
  `Investors praise ${BRAND} as shares surge on expansion news`,
  `${BRAND} CEO celebrated for visionary leadership and sustainable growth`,
  `${BRAND} launches breakthrough feature to widespread acclaim`,
  `${BRAND} partnership drives impressive growth in emerging markets`,
  `Customers show strong loyalty as ${BRAND} tops satisfaction rankings`,
  `${BRAND} milestone: platform reaches 10 million active users`,
];

const NEGATIVE_TITLES = [
  `${BRAND} faces criticism after major service outage disrupts customers`,
  `Lawsuit alleges ${BRAND} mishandled user data in privacy breach`,
  `${BRAND} shares drop amid investigation into accounting practices`,
  `Analysts warn of decline as ${BRAND} announces layoffs`,
  `${BRAND} recall sparks backlash and consumer complaints`,
  `Regulators fine ${BRAND} over compliance concerns`,
  `${BRAND} under fire following controversial executive statement`,
  `Data breach at ${BRAND} exposes customer records, raising security concerns`,
];

const NEUTRAL_TITLES = [
  `${BRAND} announces changes to its executive board`,
  `${BRAND} to present at upcoming industry conference`,
  `${BRAND} updates pricing structure for enterprise customers`,
  `Analysts weigh in on ${BRAND}'s market position`,
  `${BRAND} publishes annual sustainability report`,
  `${BRAND} opens new regional office to support customers`,
  `Interview: ${BRAND} executive discusses industry trends`,
  `${BRAND} releases update to its flagship product`,
];

const COMPETITOR_TITLES = [
  `Globex unveils new platform to challenge market leaders`,
  `Initech expands into European market with fresh funding`,
  `Globex CEO outlines ambitious growth strategy`,
  `Initech faces criticism over recent product delays`,
  `Globex reports steady quarterly earnings`,
];

const CONTENT_SNIPPETS = [
  "The company outlined its strategy during a briefing with analysts and journalists, pointing to strong demand across its core markets and a growing pipeline of enterprise customers. Executives emphasized investment in artificial intelligence and cloud infrastructure.",
  "According to people familiar with the matter, the developments could reshape the competitive landscape. Industry observers noted that the move signals a broader shift in how organizations approach technology, data and customer trust.",
  "In a statement, a spokesperson said the organization remains committed to transparency and to serving its customers. The response comes amid heightened scrutiny from regulators and increased attention from the media and the public.",
  "Market reaction was closely watched, with commentators debating the long-term implications for revenue, brand reputation and leadership. The report highlighted both opportunities and risks facing the sector over the coming year.",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDateWithin(days: number): Date {
  const now = Date.now();
  const offset = Math.random() * days * 86_400_000;
  return new Date(now - offset);
}

async function main() {
  console.log("🌱 Seeding MediaPulse AI...");

  // Clean (order matters for FKs).
  await db.$transaction([
    db.message.deleteMany(),
    db.conversation.deleteMany(),
    db.articleKeyword.deleteMany(),
    db.entity.deleteMany(),
    db.alertEvent.deleteMany(),
    db.notification.deleteMany(),
    db.article.deleteMany(),
    db.alert.deleteMany(),
    db.competitor.deleteMany(),
    db.keyword.deleteMany(),
    db.source.deleteMany(),
    db.report.deleteMany(),
    db.product.deleteMany(),
    db.brand.deleteMany(),
    db.department.deleteMany(),
    db.invitation.deleteMany(),
    db.membership.deleteMany(),
    db.auditLog.deleteMany(),
    db.session.deleteMany(),
    db.verificationToken.deleteMany(),
    db.organization.deleteMany(),
    db.user.deleteMany(),
  ]);

  const password = await hashPassword("Password123!");

  const org = await db.organization.create({
    data: {
      name: "Northwind Communications",
      slug: "northwind",
      website: "https://northwind.example.com",
      industry: "Technology",
      country: "United States",
      description: "Corporate communications & PR team for Northwind.",
      plan: "ENTERPRISE",
      logoUrl: "/logo.svg",
      monitoringConfig: JSON.stringify({ frequency: "HOURLY", languages: ["en"], countries: ["US", "GB"] }),
    },
  });

  const roles = [
    { email: "admin@mediapulse.ai", name: "Alex Admin", role: "ADMINISTRATOR", jobTitle: "Head of Communications" },
    { email: "manager@mediapulse.ai", name: "Morgan Manager", role: "ORG_MANAGER", jobTitle: "Communications Manager" },
    { email: "comms@mediapulse.ai", name: "Casey Comms", role: "COMMS_OFFICER", jobTitle: "Communications Officer" },
    { email: "analyst@mediapulse.ai", name: "Riley Analyst", role: "ANALYST", jobTitle: "Media Analyst" },
    { email: "viewer@mediapulse.ai", name: "Vic Viewer", role: "VIEWER", jobTitle: "Stakeholder" },
  ];

  let adminId = "";
  for (const r of roles) {
    const user = await db.user.create({
      data: {
        email: r.email,
        name: r.name,
        passwordHash: password,
        jobTitle: r.jobTitle,
        emailVerified: new Date(),
        isSuperAdmin: r.role === "ADMINISTRATOR",
        memberships: { create: { organizationId: org.id, role: r.role } },
      },
    });
    if (r.role === "ADMINISTRATOR") adminId = user.id;
  }

  // Department, brand, product.
  const dept = await db.department.create({ data: { organizationId: org.id, name: "Corporate Communications" } });
  const brand = await db.brand.create({ data: { organizationId: org.id, name: BRAND, description: "Flagship brand" } });
  await db.product.create({ data: { organizationId: org.id, brandId: brand.id, name: "Northwind Cloud" } });

  // Sources.
  const sources = await Promise.all(
    PUBLICATIONS.map((p) =>
      db.source.create({
        data: {
          organizationId: org.id,
          name: p.name,
          type: "RSS",
          url: `https://example.com/rss/${p.name.toLowerCase().replace(/\s+/g, "-")}`,
          country: p.country,
          language: p.language,
          domainAuthority: p.da,
          lastFetchedAt: new Date(),
        },
      })
    )
  );
  // A live Google News source template for real collection demos.
  await db.source.create({
    data: {
      organizationId: org.id,
      name: "Google News (live)",
      type: "GOOGLE_NEWS",
      url: "en-US",
      country: "US",
      language: "en",
      domainAuthority: 80,
    },
  });

  // Keywords.
  const keywordDefs = [
    { term: BRAND, type: "COMPANY", priority: "CRITICAL" },
    { term: "Northwind Cloud", type: "PRODUCT", priority: "HIGH" },
    { term: "Jordan Rivera", type: "CEO", priority: "HIGH" },
    { term: "Project Aurora", type: "CAMPAIGN", priority: "MEDIUM" },
    { term: "cloud computing", type: "INDUSTRY", priority: "LOW" },
  ];
  const keywords = await Promise.all(
    keywordDefs.map((k) =>
      db.keyword.create({
        data: {
          organizationId: org.id,
          term: k.term,
          type: k.type,
          priority: k.priority,
          language: "en",
          frequency: "HOURLY",
          includeKeywords: JSON.stringify([]),
          excludeKeywords: JSON.stringify([]),
          lastRunAt: new Date(),
        },
      })
    )
  );

  // Competitors.
  const competitors = await Promise.all([
    db.competitor.create({ data: { organizationId: org.id, name: "Globex", website: "https://globex.example.com", keywords: JSON.stringify(["Globex"]) } }),
    db.competitor.create({ data: { organizationId: org.id, name: "Initech", website: "https://initech.example.com", keywords: JSON.stringify(["Initech"]) } }),
  ]);

  // Articles — a realistic mix over the last 30 days.
  const articleCount = 220;
  let created = 0;
  for (let i = 0; i < articleCount; i++) {
    const roll = Math.random();
    let title: string;
    let competitorId: string | null = null;

    if (roll < 0.15) {
      title = pick(COMPETITOR_TITLES);
      competitorId = title.includes("Globex") ? competitors[0].id : competitors[1].id;
    } else if (roll < 0.5) {
      title = pick(POSITIVE_TITLES);
    } else if (roll < 0.75) {
      title = pick(NEUTRAL_TITLES);
    } else {
      title = pick(NEGATIVE_TITLES);
    }

    const pub = pick(PUBLICATIONS);
    const source = sources.find((s) => s.name === pub.name)!;
    const content = `${pick(CONTENT_SNIPPETS)} ${pick(CONTENT_SNIPPETS)}`;
    const publishedAt = randomDateWithin(30);
    const url = `https://example.com/${pub.name.toLowerCase().replace(/\s+/g, "-")}/article-${i}`;
    const hash = dedupeHash(url, title);
    const analysis = analyzeArticle({ title, content });
    const matched = keywords.filter((k) => `${title} ${content}`.toLowerCase().includes(k.term.toLowerCase()));

    await db.article.create({
      data: {
        organizationId: org.id,
        sourceId: source.id,
        competitorId,
        dedupeHash: hash,
        title,
        author: pick(AUTHORS),
        publication: pub.name,
        url,
        imageUrl: null,
        content,
        excerpt: content.slice(0, 280),
        language: "en",
        country: pub.country,
        publishedAt,
        sentiment: analysis.sentiment,
        sentimentScore: analysis.sentimentScore,
        confidence: analysis.confidence,
        riskLevel: analysis.riskLevel,
        category: analysis.category,
        readingTime: analysis.readingTime,
        reach: (pub.da ?? 50) * 1000 + Math.floor(Math.random() * 20000),
        topics: JSON.stringify(analysis.topics),
        aiSummary: analysis.aiSummary,
        suggestedPr: analysis.suggestedPr,
        suggestedPost: analysis.suggestedPost,
        analyzedAt: new Date(),
        entities: { create: analysis.entities.slice(0, 5).map((e) => ({ name: e.name, type: e.type, salience: e.salience })) },
        keywords: { create: matched.map((k) => ({ keywordId: k.id })) },
      },
    });
    created++;
  }

  // Alerts.
  const alerts = await Promise.all([
    db.alert.create({ data: { organizationId: org.id, name: "Negative sentiment watch", type: "NEGATIVE_SENTIMENT", condition: JSON.stringify({ threshold: -0.2 }), channels: JSON.stringify(["EMAIL", "BROWSER"]) } }),
    db.alert.create({ data: { organizationId: org.id, name: "Competitor activity", type: "COMPETITOR_ACTIVITY", condition: JSON.stringify({}), channels: JSON.stringify(["BROWSER"]) } }),
    db.alert.create({ data: { organizationId: org.id, name: "Breaking news", type: "BREAKING_NEWS", condition: JSON.stringify({}), channels: JSON.stringify(["EMAIL", "BROWSER", "DIGEST_DAILY"]) } }),
    db.alert.create({ data: { organizationId: org.id, name: "Keyword spike", type: "KEYWORD_SPIKE", condition: JSON.stringify({ threshold: 8 }), channels: JSON.stringify(["EMAIL"]) } }),
  ]);

  // A few triggered alert events + notifications.
  const negativeArticles = await db.article.findMany({ where: { organizationId: org.id, sentiment: "NEGATIVE" }, take: 4, orderBy: { publishedAt: "desc" } });
  for (const a of negativeArticles) {
    await db.alertEvent.create({ data: { alertId: alerts[0].id, title: "Negative coverage detected", message: `"${a.title.slice(0, 120)}"`, severity: a.riskLevel === "CRITICAL" ? "CRITICAL" : "HIGH", articleId: a.id } });
    await db.notification.create({ data: { organizationId: org.id, title: "Negative coverage detected", body: a.title.slice(0, 120), type: "ALERT", link: `/articles/${a.id}` } });
  }

  await db.notification.create({ data: { organizationId: org.id, title: "Welcome to MediaPulse AI", body: "Your workspace is ready. Explore the dashboard to get started.", type: "SYSTEM", link: "/dashboard" } });

  // A sample AI conversation.
  const convo = await db.conversation.create({ data: { organizationId: org.id, userId: adminId, title: "Coverage summary" } });
  await db.message.create({ data: { conversationId: convo.id, role: "user", content: "Summarize today's coverage." } });
  await db.message.create({ data: { conversationId: convo.id, role: "assistant", content: "Coverage today is predominantly positive, led by product-launch and revenue stories. A small number of negative items relate to service reliability — recommend monitoring closely." } });

  console.log(`✅ Seed complete: 1 org, ${roles.length} users, ${created} articles, ${keywords.length} keywords, ${competitors.length} competitors, ${alerts.length} alerts.`);
  console.log("🔑 Login: admin@mediapulse.ai / Password123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
