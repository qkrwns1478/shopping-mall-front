import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ModalProvider } from "@/context/ModalContext";
import { CartProvider } from "@/context/CartContext";
import "./globals.css";
import Script from "next/script";

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
        <Script 
          src="https://cdn.portone.io/v2/browser-sdk.js" 
          strategy="beforeInteractive" 
        />
        <ModalProvider>
          <CartProvider>
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </ModalProvider>
      </body>
    </html>
  );
}
