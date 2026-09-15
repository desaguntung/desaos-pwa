import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import ConsoleSilencer from "@/components/ConsoleSilencer";

export const metadata: Metadata = {
  title: "DesaOS",
  description: "Village Information System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster position="top-center" richColors />
          <ConsoleSilencer />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
