import Link from "next/link";

interface FooterColumnProps {
  title: string;
  links: { label: string; href: string }[];
}

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-[12px] font-semibold text-[--apple-text-dark] tracking-wide mb-1">{title}</h3>
      <ul className="space-y-2 list-none m-0 p-0">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-[12px] text-[--apple-text-gray] hover:text-[--apple-text-dark] hover:underline transition-colors block"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[--apple-bg-gray] text-[--apple-text-gray] pt-10 pb-6 text-[12px]">
      <div className="apple-container px-4 md:px-6 lg:px-8 max-w-[1024px] mx-auto">


        {/* Links Grid - 5 Columns */}
        <nav className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-8 mb-8 items-start" aria-label="Direktori Desa">
          {/* Column 1: Profil Desa */}
          <div className="space-y-6">
            <FooterColumn 
              title="Profil Desa" 
              links={[
                { label: "Tentang Desa", href: "/identitas-desa" },
                { label: "Sejarah Desa", href: "#" },
                { label: "Visi & Misi", href: "#" },
                { label: "Struktur Organisasi", href: "#" },
                { label: "Geografis & Demografi", href: "#" },
                { label: "Peta Desa", href: "#" },
              ]} 
            />
          </div>

          {/* Column 2: Pemerintahan */}
          <div className="space-y-6">
            <FooterColumn 
              title="Pemerintahan" 
              links={[
                { label: "Perangkat Desa", href: "/pemerintah-desa" },
                { label: "Lembaga Desa", href: "/lembaga-desa" },
                { label: "BPD", href: "#" },
                { label: "LPM", href: "#" },
                { label: "Keputusan Kades", href: "#" },
              ]} 
            />
             <FooterColumn 
              title="Transparansi" 
              links={[
                { label: "Keuangan Desa", href: "#" },
                { label: "Pembangunan", href: "#" },
              ]} 
            />
          </div>

          {/* Column 3: Potensi Desa */}
          <div className="space-y-6">
            <FooterColumn 
              title="Potensi Desa" 
              links={[
                { label: "Pertanian & Perkebunan", href: "#" },
                { label: "Peternakan", href: "#" },
                { label: "UMKM Desa", href: "#" },
                { label: "Destinasi Wisata", href: "#" },
                { label: "Produk Unggulan", href: "#" },
              ]} 
            />
          </div>

          {/* Column 4: Informasi Publik */}
          <div className="space-y-6">
            <FooterColumn 
              title="Informasi Publik" 
              links={[
                { label: "Berita & Artikel", href: "/artikel/dinamis" },
                { label: "Agenda Desa", href: "#" },
                { label: "Galeri Foto", href: "#" },
                { label: "Statistik Kependudukan", href: "/statistik/kependudukan" },
                { label: "Pengumuman", href: "#" },
              ]} 
            />
          </div>

          {/* Column 5: Layanan & Bantuan */}
          <div className="space-y-6">
            <FooterColumn 
              title="Layanan & Bantuan" 
              links={[
                { label: "Layanan Surat", href: "/surat/permohonan" },
                { label: "Pengaduan Masyarakat", href: "#" },
                { label: "Kontak Pemerintah", href: "#" },
                { label: "Lokasi Kantor", href: "#" },
              ]} 
            />
          </div>
        </nav>

        {/* Footer Bottom */}
        <section className="pt-8 border-t border-zinc-300">
          <div className="mb-2 text-[12px] text-[--apple-text-gray]">
             Website Resmi <Link href="/" className="text-blue-600 hover:underline">Pemerintah Desa</Link>.
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-2">
            <div className="order-2 md:order-1 flex flex-col md:flex-row gap-4 text-[12px] text-[--apple-text-gray]">
              <div>
                Hak cipta © {currentYear} DesaOS. Seluruh hak cipta dilindungi undang-undang.
              </div>
              <div className="hidden md:flex flex-wrap gap-x-4">
                <Link href="#" className="hover:text-[--apple-text-dark] hover:underline border-r border-zinc-300 pr-4 last:border-0">Kebijakan Privasi</Link>
                <Link href="#" className="hover:text-[--apple-text-dark] hover:underline border-r border-zinc-300 pr-4 last:border-0">Ketentuan Layanan</Link>
                <Link href="#" className="hover:text-[--apple-text-dark] hover:underline border-r border-zinc-300 pr-4 last:border-0">Peta Situs</Link>
              </div>
            </div>
            
            <div className="order-1 md:order-2 text-[12px]">
              <Link href="#" className="hover:underline text-[--apple-text-dark]">Indonesia</Link>
            </div>
          </div>
        </section>
      </div>
    </footer>
  );
}
