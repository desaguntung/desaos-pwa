const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    try {
      const pamong = await prisma.$queryRawUnsafe('SELECT * FROM public.pamong;');
      console.log('pamong table:', pamong);
    } catch(e) { console.log('No pamong table'); }

    try {
      const pamong_desa = await prisma.$queryRawUnsafe('SELECT * FROM public.pamong_desa;');
      console.log('pamong_desa table:', pamong_desa);
    } catch(e) { console.log('No pamong_desa table'); }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
