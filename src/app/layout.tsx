import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Script from "next/script";
// import "./globals.css";

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
      <head>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.5.0/font/bootstrap-icons.css" rel="stylesheet" />
      </head>
      <body>
        <Header />
        {children}
        <Footer />

        <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
