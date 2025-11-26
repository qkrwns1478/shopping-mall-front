import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ModalProvider } from "@/context/ModalContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "MUNSIKSA",
  description: "Spring Boot & Next.js Shopping Mall",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head></head>
      <body className="flex flex-col min-h-screen">
        <ModalProvider>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </ModalProvider>
      </body>
    </html>
  );
}
