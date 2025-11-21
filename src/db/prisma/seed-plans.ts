import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPlans() {
  console.log('🌱 Seeding plans...');

  // Seed STARTUP plan
  const startupPlan = await prisma.plans.upsert({
    where: { code: 'STARTUP' },
    update: {},
    create: {
      code: 'STARTUP',
      name: 'Startup Plan',
      api_limit: 10000, // 10,000 API calls per month
      event_limit: 50000, // 50,000 events per month
      webhook_limit: 1000, // 1,000 webhooks per month
      max_users: 10, // Max 10 users
      overage_per_1000_minor: BigInt(100), // ₹0.10 (10 paise) per 1000 events over limit
      soft_limit_ratio: 0.8, // 80% soft limit ratio
    },
  });

  console.log('✅ STARTUP plan seeded:', startupPlan);

  // Seed GROWTH plan
  const growthPlan = await prisma.plans.upsert({
    where: { code: 'GROWTH' },
    update: {},
    create: {
      code: 'GROWTH',
      name: 'Growth Plan',
      api_limit: 100000, // 100,000 API calls per month
      event_limit: 500000, // 500,000 events per month
      webhook_limit: 10000, // 10,000 webhooks per month
      max_users: 50, // Max 50 users
      overage_per_1000_minor: BigInt(80), // ₹0.08 (8 paise) per 1000 events over limit
      soft_limit_ratio: 0.85, // 85% soft limit ratio
    },
  });

  console.log('✅ GROWTH plan seeded:', growthPlan);

  console.log('✨ Plans seeding completed!');
}

seedPlans()
  .catch(e => {
    console.error('❌ Error seeding plans:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
