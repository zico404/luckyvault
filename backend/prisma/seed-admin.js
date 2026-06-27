const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'zicomighty@gmail.com';
  const password = '$_Zicomighty404';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role !== 'ADMIN') {
      await prisma.user.update({ where: { id: existing.id }, data: { role: 'ADMIN' } });
      console.log(`Updated ${email} to ADMIN role`);
    } else {
      console.log(`Admin ${email} already exists`);
    }
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      displayName: 'Zico Admin',
      role: 'ADMIN',
      isVerified: true,
    },
  });

  await prisma.wallet.create({
    data: { userId: user.id, balance: 0 },
  });

  console.log(`Admin user created: ${email} (id: ${user.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
