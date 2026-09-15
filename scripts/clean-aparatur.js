const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    // Delete invalid orphan duplicate row (id: 2 with jabatan null)
    const del = await prisma.$queryRawUnsafe('DELETE FROM public.aparatur_desa WHERE id = 2 AND jabatan IS NULL;');
    console.log('Deleted orphan row:', del);

    const remaining = await prisma.$queryRawUnsafe('SELECT id, nama, nik, jabatan, jabatan_id, ttd_berhak, is_active, status FROM public.aparatur_desa;');
    console.log('Remaining aparatur rows:', remaining);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
