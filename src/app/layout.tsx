"use client";

//import AccessibilityBar from "@/components/AccessibilityBar";
//import { AccessibilityProvider } from "@/context/Accessibility";
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
        {/* <AccessibilityProvider>
          <AccessibilityBar /> */}
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
        {/* </AccessibilityProvider> */}
      </body>
    </html>
  );
}
