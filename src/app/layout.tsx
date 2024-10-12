"use client";

import Navbar from "@/components/Navbar";
import { AlertsWrapper } from "@/context/Alerts";
import { GlobalWrapper } from "@/context/Global";
import { ProcessWrapper } from "@/context/Process";

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
          <ProcessWrapper>
          <AlertsWrapper>
            <div style={{ padding: "15px" }}>{children}</div>
          </AlertsWrapper>
          </ProcessWrapper>
        </GlobalWrapper>
      </body>
    </html>
  );
}
