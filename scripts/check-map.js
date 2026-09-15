const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function main() {
  const content = fs.readFileSync('scripts/seed-surat-templates.js', 'utf8');
  const formats = await prisma.$queryRawUnsafe('SELECT id, nama, url_surat FROM public.surat_formats ORDER BY id ASC;');
  console.log('Total Formats in DB:', formats.length);
  
  let missing = 0;
  formats.forEach(f => {
    const isMatched = content.includes(`  ${f.url_surat}: {`) || content.includes(`"${f.url_surat}": {`) || content.includes(`'${f.url_surat}': {`);
    console.log(`#${f.id}: ${f.nama} (${f.url_surat}) -> ${isMatched ? 'MATCHED' : 'MISSING'}`);
    if (!isMatched) missing++;
  });
  
  console.log(`\nTotal Missing from TEMPLATES_MAP: ${missing}/${formats.length}`);
  await prisma.$disconnect();
}
main();
