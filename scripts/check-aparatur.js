const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const keys = Object.keys(prisma).filter(k => !k.startsWith('$') && !k.startsWith('_'));
    console.log('Available Prisma models:', keys);
    
    // Check raw SQL query to see all tables in public schema
    const tables = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`;
    console.log('Public tables:', tables.map(t => t.table_name));

    const aparaturCols = await prisma.$queryRaw`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'aparatur_desa';`;
    console.log('aparatur_desa columns:', aparaturCols);

    const aparaturRows = await prisma.$queryRaw`SELECT * FROM public.aparatur_desa LIMIT 5;`;
    console.log('aparatur_desa rows:', aparaturRows);

    const identitasRows = await prisma.$queryRaw`SELECT * FROM public.identitas_desa LIMIT 1;`;
    console.log('identitas_desa rows:', identitasRows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
