const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const rows = await prisma.$queryRawUnsafe('SELECT id, nama, url_surat, kode_surat, form_isian FROM public.surat_formats ORDER BY id ASC;');
    console.log('Total format rows in DB:', rows.length);
    console.log(JSON.stringify(rows, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
