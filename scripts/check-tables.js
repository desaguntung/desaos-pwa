const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const totalPenduduk = await prisma.penduduk.count();
    const laki = await prisma.penduduk.count({ where: { jenis_kelamin_id: 1 } });
    const perempuan = await prisma.penduduk.count({ where: { jenis_kelamin_id: 2 } });
    const kepalaKeluarga = await prisma.penduduk.count({ where: { hubungan_keluarga_id: 1 } });

    console.log({ totalPenduduk, laki, perempuan, kepalaKeluarga });
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
