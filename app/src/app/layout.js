import Providers from "@/store/providers";
import React from "react";

export const metadata = {
  title: "CareConnect - Connecting you to care, one appointment at a time.",
  description:
    "CareConnect is a modern healthcare appointment management platform that seamlessly connects patients with medical professionals for consultations, follow-ups, and specialist care — ensuring simple, secure, and efficient appointment scheduling.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
