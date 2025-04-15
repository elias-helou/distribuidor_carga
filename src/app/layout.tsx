"use client";

import Navbar from "@/components/Navbar";
import { VLibras } from "@/components/VLibras";
import { AlertsWrapper } from "@/context/Alerts";
import { AlgorithmWrapper } from "@/context/Algorithm";
import { GlobalWrapper } from "@/context/Global";
import { ProcessWrapper } from "@/context/Process";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body style={{ margin: 0 }}>
        <Navbar />
        <GlobalWrapper>
          <ProcessWrapper>
            <AlgorithmWrapper>
              <AlertsWrapper>
                <div style={{ padding: "15px" }}>{children}</div>
              </AlertsWrapper>
            </AlgorithmWrapper>
          </ProcessWrapper>
        </GlobalWrapper>
        <VLibras forceOnload />
      </body>
    </html>
  );
}
