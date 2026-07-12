import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Database Seeding ---');

  // 1. Seed Roles
  const rolesToSeed = [
    {
      name: 'Fleet Manager',
      description: 'Fleet Manager role with administrative privileges to manage assets and roles',
    },
    {
      name: 'Driver',
      description: 'Driver role for vehicle operations and trip execution',
    },
    {
      name: 'Safety Officer',
      description: 'Safety Officer role for monitoring security compliance, incidents, and standards',
    },
    {
      name: 'Financial Analyst',
      description: 'Financial Analyst role for monitoring expenses, revenues, and reports',
    },
  ];

  console.log('Upserting Roles...');
  const seededRoles = [];
  for (const roleData of rolesToSeed) {
    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: { description: roleData.description },
      create: {
        name: roleData.name,
        description: roleData.description,
      },
    });
    seededRoles.push(role);
    console.log(`[Role] Upserted: "${role.name}"`);
  }

  // Find the 'Fleet Manager' role to assign to the admin
  const fleetManagerRole = seededRoles.find((r) => r.name === 'Fleet Manager');
  if (!fleetManagerRole) {
    throw new Error('Failed to find Fleet Manager role in database during seed.');
  }

  // 2. Seed Default Admin User
  const adminEmail = 'admin@transitops.com';
  const adminPasswordRaw = 'Admin@123';
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHashed = await bcrypt.hash(adminPasswordRaw, salt);

  console.log('\nUpserting Admin User...');
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'Admin User',
      password: adminPasswordHashed,
      roleId: fleetManagerRole.id,
    },
    create: {
      name: 'Admin User',
      email: adminEmail,
      password: adminPasswordHashed,
      roleId: fleetManagerRole.id,
    },
  });

  console.log(`[User] Upserted: "${adminUser.name}" (${adminUser.email})`);
  console.log(`Default Admin Password: "${adminPasswordRaw}"`);
  console.log('--- Seeding Completed Successfully ---');
}

main()
  .catch((error) => {
    console.error('Error seeding the database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
