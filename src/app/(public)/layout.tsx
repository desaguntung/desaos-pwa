import "./public.css";

export const metadata = {
  title: "DesaOS - Portal Desa Digital",
  description: "Layanan Mandiri dan Informasi Desa",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
