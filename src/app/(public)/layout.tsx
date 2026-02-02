import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import MobileNavDock from "@/components/mobile/MobileNavDock";
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
    <div className="min-h-screen flex flex-col bg-[#F5F5F7] font-sans">
      <div className="hidden md:block">
        <Navbar />
      </div>
      <main className="flex-1 pt-0 md:pt-[44px]">
        {children}
      </main>
      <div className="hidden md:block">
        <Footer />
      </div>
      <div className="block md:hidden">
        <MobileNavDock />
      </div>
    </div>
  );
}
