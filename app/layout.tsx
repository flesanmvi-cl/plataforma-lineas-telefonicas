import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed, Barlow_Semi_Condensed } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-barlow",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

const barlowSemi = Barlow_Semi_Condensed({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-barlow-semi",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nombre Plataforma · Grupo Flesan",
  description: "Mockup base de plataforma — Grupo Flesan.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#E30613" },
    { media: "(prefers-color-scheme: dark)", color: "#0F0F0F" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es-CL"
      suppressHydrationWarning
      className={`${barlow.variable} ${barlowCondensed.variable} ${barlowSemi.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "var(--color-surface)",
                color: "var(--color-text)",
                border: "1px solid var(--color-border)",
                borderRadius: "0",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
