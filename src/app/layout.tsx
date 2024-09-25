"use client";

import Navbar from "@/components/Navbar";
import { AlertsWrapper } from "@/context/Alerts";
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
          <AlertsWrapper>
            <div style={{ padding: "15px" }}>{children}</div>
          </AlertsWrapper>
        </GlobalWrapper>
      </body>
    </html>
  );
}
