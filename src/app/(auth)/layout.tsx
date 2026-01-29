export const metadata = {
  title: "Login - DesaOS",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-full bg-body-bg">
      {children}
    </div>
  );
}
