const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const aparatur = await prisma.$queryRawUnsafe('SELECT * FROM public.aparatur_desa');
    console.log('--- APARATUR_DESA ROWS ---');
    console.log(aparatur);

    const formats = await prisma.$queryRawUnsafe('SELECT id, nama, url_surat, kode_surat, LENGTH(template) as tpl_len FROM public.surat_formats LIMIT 15');
    console.log('--- SURAT_FORMATS ROWS ---');
    console.log(formats);

    const domisili = await prisma.$queryRawUnsafe("SELECT id, nama, url_surat, kode_surat, template FROM public.surat_formats WHERE nama ILIKE '%domisili%' OR url_surat ILIKE '%domisili%'");
    console.log('--- DOMISILI FORMATS ---');
    console.log(domisili);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
