import Providers from "@/store/providers";
import React from "react";
import "./globals.css";
import { Footer } from "./footer";
import { Header } from "./header";

export const metadata = {
  title: "CareConnect - Connecting you to care, one appointment at a time.",
  description:
    "CareConnect is a modern healthcare appointment management platform that seamlessly connects patients with medical professionals for consultations, follow-ups, and specialist care — ensuring simple, secure, and efficient appointment scheduling.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="flex flex-col min-h-screen bg-gray-100">
        <Providers>
          <Header />

          {/* Main content should grow to push footer down */}
          <main className="flex-1">{children}</main>

          <Footer />
        </Providers>
      </body>
    </html>
  );
}
