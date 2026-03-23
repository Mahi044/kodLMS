const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.user.updateMany({
    where: { email: 'student@test.com' },
    data: { role: 'admin' }
  });
  console.log('Made test user an admin');
}
main().finally(() => prisma.$disconnect());
