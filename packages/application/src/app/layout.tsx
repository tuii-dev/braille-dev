import { Suspense } from "react";
import type { Metadata } from "next";

import { cookies } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Braille - AI Document Processing",
  description: "AI Document Processing",
};

import { ThemeProvider } from "@/components/theme";
import { ShellServer } from "@/app/(components)";

type RootLayoutProps = {
  children: React.ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  const theme =
    cookies().get("braille:darkmode")?.value === "true" ? "dark" : "light";

  return (
    <ThemeProvider theme={theme}>
      <ShellServer>
        <Suspense fallback={<div data-suspense-fallback></div>}>
          {children}
        </Suspense>
      </ShellServer>
    </ThemeProvider>
  );
}
