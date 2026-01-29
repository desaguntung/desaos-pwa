import AppShell from "@/components/layout/AppShell";
import "./admin.css";

export const metadata = {
  title: "Admin Panel - DesaOS",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      {children}
    </AppShell>
  );
}
