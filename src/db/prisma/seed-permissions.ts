import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function seedPermissions() {
  console.log('🌱 Seeding permissions and roles...');

  const tenantId = process.env['SEED_TENANT_ID'] ?? '00000000-0000-0000-0000-000000000001';

  // 1) Create core permissions
  const permissions = [
    { code: 'documents.read', description: 'Read documents' },
    { code: 'documents.write', description: 'Create / update documents' },
    { code: 'billing.read', description: 'View billing data' },
  ];

  for (const p of permissions) {
    await prisma.permissions.upsert({
      where: { code: p.code },
      update: {},
      create: { id: uuidv4(), code: p.code, description: p.description },
    });
  }

  console.log('✅ Permissions seeded');

  // 2) Create built-in roles for tenant
  const builtRoles = [
    { code: 'OWNER', name: 'Owner' },
    { code: 'ADMIN', name: 'Admin' },
    { code: 'USER', name: 'User' },
  ];

  for (const r of builtRoles) {
    // Check if role exists first (using findFirst for composite unique constraint)
    const existingRole = await prisma.roles.findFirst({
      where: { tenant_id: tenantId, code: r.code },
    });

    if (existingRole) {
      // Role already exists, skip creation
      console.log(`  Role ${r.code} already exists for tenant`);
    } else {
      // Create new role using valid columns: tenant_id, code, name, built_in
      await prisma.roles.create({
        data: {
          id: uuidv4(),
          tenant_id: tenantId,
          code: r.code,
          name: r.name,
          built_in: true,
        },
      });
      console.log(`✅ Role ${r.code} created`);
    }
  }

  console.log('✅ Built-in roles seeded');

  // 3) Attach all permissions to OWNER role
  const owner = await prisma.roles.findFirst({
    where: { tenant_id: tenantId, code: 'OWNER' },
  });

  if (owner) {
    const allPerms = await prisma.permissions.findMany();

    for (const perm of allPerms) {
      await prisma.role_permissions.upsert({
        where: {
          role_id_permission_id: { role_id: owner.id, permission_id: perm.id },
        },
        update: {},
        create: {
          role_id: owner.id,
          permission_id: perm.id,
        },
      });
    }

    console.log(`✅ All permissions attached to OWNER role (${allPerms.length} permissions)`);
  }

  console.log('✨ Permissions and roles seeding completed!');
}

seedPermissions()
  .catch(e => {
    console.error('❌ Error seeding permissions:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
