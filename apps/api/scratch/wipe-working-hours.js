const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.workingHours.deleteMany({});
  console.log('WorkingHours cleared');
}
main().finally(() => prisma.$disconnect());
