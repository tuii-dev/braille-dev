import { PrismaClient, TenantRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a tenant first
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Default Tenant',
    },
  });

  // Create users and connect them to the tenant
  await prisma.user.create({
    data: {
      email: 'testuser@example.com',
      name: 'Test User',
      tenants: {
        connect: { id: tenant.id }
      },
      userTenantRoles: {
        create: {
          role: TenantRole.ADMIN,
          tenant: { connect: { id: tenant.id } }
        }
      }
    },
  });

  await prisma.user.create({
    data: {
      email: 'sean@buildersbrisbane.com',
      name: 'Sean',
      tenants: {
        connect: { id: tenant.id }
      },
      userTenantRoles: {
        create: {
          role: TenantRole.ADMIN,
          tenant: { connect: { id: tenant.id } }
        }
      }
    },
  });

  // Add more seed data as needed for other models
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
