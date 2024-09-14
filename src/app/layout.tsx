"use client";

import Navbar from "@/components/Navbar";
import { GlobalWrapper } from "@/context/Global";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body>
        <Navbar />
        <GlobalWrapper>
          <div style={{ padding: "15px" }}>{children}</div>
        </GlobalWrapper>
      </body>
    </html>
  );
}
