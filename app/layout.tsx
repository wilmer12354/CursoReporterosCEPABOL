import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Curso Reporteros CEPABOL",
  description: "Página de curso interactiva con videos y preguntas paso a paso",
  icons: {
    icon: "/logo-cepabol.webp",
    shortcut: "/logo-cepabol.webp",
    apple: "/logo-cepabol.webp"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
