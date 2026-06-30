import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://autocred-oficina.vercel.app"),
  title: {
    default: "OficinaPro — Sistema de gestão para oficinas mecânicas",
    template: "%s · OficinaPro",
  },
  description: "Ordens de serviço, orçamentos profissionais em PDF, controle de pagamento e relatórios. O sistema completo para sua oficina mecânica.",
  keywords: ["sistema para oficina mecânica", "ordem de serviço", "gestão de oficina", "orçamento de oficina", "software para mecânica"],
  openGraph: {
    title: "OficinaPro — Sistema de gestão para oficinas mecânicas",
    description: "Ordens de serviço, orçamentos em PDF, controle de pagamento e relatórios em um só lugar.",
    type: "website",
    locale: "pt_BR",
    siteName: "OficinaPro",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
