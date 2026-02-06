import { prisma } from '@/lib/prisma';

export default async function CekDbPage() {
  try {
    // Mencoba mengambil satu data dari tabel identitas_desa
    // Tabel ini dipilih karena merupakan data inti desa
    const data = await prisma.identitas_desa.findFirst();

    // Jika koneksi berhasil tapi data kosong
    if (!data) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 font-sans">
           <h1 className="text-3xl font-bold text-yellow-600 mb-4">KONEKSI DATABASE: TERHUBUNG (DATA KOSONG) ⚠️</h1>
           <p className="text-lg mb-4">Koneksi ke database berhasil, namun tabel <code className="bg-gray-200 px-2 py-1 rounded">identitas_desa</code> belum memiliki data.</p>
           <p>Silakan isi data desa terlebih dahulu atau jalankan seeder jika ada.</p>
        </div>
      );
    }

    // Jika berhasil mendapatkan data
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 font-sans bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <h1 className="text-4xl font-extrabold text-green-600 mb-6 tracking-tight text-center">KONEKSI DATABASE: SUKSES 🚀</h1>
        
        <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="bg-gray-100 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <h2 className="text-xl font-semibold">Data Sampel (identitas_desa)</h2>
          </div>
          <div className="p-6 overflow-auto max-h-[500px]">
            <pre className="text-sm font-mono whitespace-pre-wrap text-gray-700 dark:text-gray-300">
              {JSON.stringify(
                data, 
                (key, value) => (typeof value === 'bigint' ? value.toString() : value), 
                2
              )}
            </pre>
          </div>
        </div>
        
        <p className="mt-8 text-gray-500 text-sm">
          Halaman ini digenerate secara otomatis untuk testing koneksi Prisma.
        </p>
      </div>
    );

  } catch (error) {
    // Jika terjadi error koneksi atau query
    console.error("Database Connection Error:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 font-sans">
         <h1 className="text-3xl font-bold text-red-600 mb-4">KONEKSI DATABASE: ERROR ❌</h1>
         <div className="w-full max-w-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
           <p className="font-semibold text-red-800 dark:text-red-300 mb-2">Detail Error:</p>
           <pre className="text-sm font-mono text-red-700 dark:text-red-400 whitespace-pre-wrap overflow-auto">
             {error instanceof Error ? error.message : String(error)}
           </pre>
         </div>
         <p className="mt-4 text-gray-600">Pastikan database server berjalan dan credentials di .env sudah benar.</p>
      </div>
    );
  }
}
