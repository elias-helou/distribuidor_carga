"use client";

import MyNavbar from "@/components/Navbar";
import { GlobalWrapper } from "@/context/Global";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body>
        <MyNavbar />
        <GlobalWrapper>
          <div style={{ padding: "15px" }}>{children}</div>
        </GlobalWrapper>
      </body>
    </html>
  );
}
