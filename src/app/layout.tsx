import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { dark } from "@clerk/themes";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import QueryProvider from "@/components/QueryProvider";
import NetworkStatusProvider from "@/components/NetworkStatusProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tailor Book",
  description: "One place to track measurements & orders.",
  metadataBase: new URL("https://tailor-book.vercel.app"),
  openGraph: {
    title: "Tailor Book",
    description: "One place to track measurements & orders.",
    images: [
      {
        url: "/og-image.png",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#22C55E",
          colorText: "white",
          colorBackground: "#1c1917",
        },
      }}
      // publishableKey=""
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} tracking-wide`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              <NetworkStatusProvider>
                <Navbar />
                <main className="px-4 py-3 overflow-x-hidden">{children}</main>
              </NetworkStatusProvider>
            </QueryProvider>
            <Toaster richColors />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
