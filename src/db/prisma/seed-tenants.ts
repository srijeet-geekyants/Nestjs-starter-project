import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTenants() {
  console.log('🌱 Seeding tenants...');

  // 1) Create sample tenants (using fixed IDs for consistency)
  const tenant1Id = '00000000-0000-0000-0000-000000000001';
  const tenant2Id = '00000000-0000-0000-0000-000000000002';

  // Check if tenant exists, if not create
  let tenant1 = await prisma.tenants.findUnique({ where: { id: tenant1Id } });
  if (!tenant1) {
    tenant1 = await prisma.tenants.create({
      data: {
        id: tenant1Id,
        name: 'Acme Corporation',
        plan_code: 'STARTUP', // Must exist in plans table
      },
    });
    console.log('✅ Tenant 1 created:', tenant1.name, `(${tenant1.id})`);
  } else {
    console.log('  Tenant 1 already exists:', tenant1.name, `(${tenant1.id})`);
  }

  let tenant2 = await prisma.tenants.findUnique({ where: { id: tenant2Id } });
  if (!tenant2) {
    tenant2 = await prisma.tenants.create({
      data: {
        id: tenant2Id,
        name: 'Tech Innovations Ltd',
        plan_code: 'GROWTH', // Must exist in plans table
      },
    });
    console.log('✅ Tenant 2 created:', tenant2.name, `(${tenant2.id})`);
  } else {
    console.log('  Tenant 2 already exists:', tenant2.name, `(${tenant2.id})`);
  }

  console.log('✨ Tenants seeding completed!');
  console.log(`\n📋 Seeded Tenants: ${tenant1.name}, ${tenant2.name}`);
}

seedTenants()
  .catch(e => {
    console.error('❌ Error seeding tenants:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
