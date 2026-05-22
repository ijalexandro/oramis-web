import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Oramis",
  description:
    "Oramis convierte conversaciones en ventas: responde consultas, recomienda productos, arma carritos y deriva oportunidades comerciales.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Oramis",
    description:
      "Convertí conversaciones en ventas con un vendedor automático para WhatsApp.",
    url: "https://www.oramis.ai",
    siteName: "Oramis",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
