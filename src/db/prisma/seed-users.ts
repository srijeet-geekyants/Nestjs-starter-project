import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedUsers() {
  console.log('🌱 Seeding users...');

  // Hash password function
  const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  };

  // Default password for all seeded users (should be changed in production)
  const defaultPassword = 'SecurePass123!';
  const hashedPassword = await hashPassword(defaultPassword);

  // Tenant IDs (must exist - run seed-tenants first)
  const tenant1Id = '00000000-0000-0000-0000-000000000001';
  const tenant2Id = '00000000-0000-0000-0000-000000000002';

  // Verify tenants exist
  const tenant1 = await prisma.tenants.findUnique({ where: { id: tenant1Id } });
  const tenant2 = await prisma.tenants.findUnique({ where: { id: tenant2Id } });

  if (!tenant1) {
    throw new Error(`Tenant 1 (${tenant1Id}) does not exist. Please run seed-tenants first.`);
  }
  if (!tenant2) {
    throw new Error(`Tenant 2 (${tenant2Id}) does not exist. Please run seed-tenants first.`);
  }

  console.log(`✓ Tenants verified: ${tenant1.name}, ${tenant2.name}`);

  // 1) Create sample users for tenant 1 (using email as unique identifier)
  const owner1 = await prisma.users.upsert({
    where: { email: 'owner1@acme.com' },
    update: {
      password_hash: hashedPassword, // Update password hash if user exists
    },
    create: {
      id: uuidv4(),
      tenant_id: tenant1Id,
      email: 'owner1@acme.com',
      password_hash: hashedPassword,
      role: 'OWNER',
    },
  });

  console.log('✅ Owner 1 seeded:', owner1.email, `(${owner1.id})`);

  const admin1 = await prisma.users.upsert({
    where: { email: 'admin1@acme.com' },
    update: {
      password_hash: hashedPassword,
    },
    create: {
      id: uuidv4(),
      tenant_id: tenant1Id,
      email: 'admin1@acme.com',
      password_hash: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin 1 seeded:', admin1.email, `(${admin1.id})`);

  const user1 = await prisma.users.upsert({
    where: { email: 'user1@acme.com' },
    update: {
      password_hash: hashedPassword,
    },
    create: {
      id: uuidv4(),
      tenant_id: tenant1Id,
      email: 'user1@acme.com',
      password_hash: hashedPassword,
      role: 'USER',
    },
  });

  console.log('✅ User 1 seeded:', user1.email, `(${user1.id})`);

  // 2) Create sample users for tenant 2
  const owner2 = await prisma.users.upsert({
    where: { email: 'owner2@techinnovations.com' },
    update: {
      password_hash: hashedPassword,
    },
    create: {
      id: uuidv4(),
      tenant_id: tenant2Id,
      email: 'owner2@techinnovations.com',
      password_hash: hashedPassword,
      role: 'OWNER',
    },
  });

  console.log('✅ Owner 2 seeded:', owner2.email, `(${owner2.id})`);

  const user2 = await prisma.users.upsert({
    where: { email: 'user2@techinnovations.com' },
    update: {
      password_hash: hashedPassword,
    },
    create: {
      id: uuidv4(),
      tenant_id: tenant2Id,
      email: 'user2@techinnovations.com',
      password_hash: hashedPassword,
      role: 'USER',
    },
  });

  console.log('✅ User 2 seeded:', user2.email, `(${user2.id})`);

  console.log('✨ Users seeding completed!');
  console.log('\n📋 Seeded Users Summary:');
  console.log(`   Total Users: 5 (3 for ${tenant1.name}, 2 for ${tenant2.name})`);
  console.log(`\n🔑 Default password for all users: ${defaultPassword}`);
  console.log('   ⚠️  Please change passwords in production!');
}

seedUsers()
  .catch(e => {
    console.error('❌ Error seeding users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
