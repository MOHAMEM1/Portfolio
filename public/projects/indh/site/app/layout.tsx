import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import ChatbotButton from "@/components/chatbot-button"

export const metadata: Metadata = {
  title: "INDH — Initiative Nationale pour le Développement Humain",
  description:
    "20 ans d'action pour le développement humain au Maroc. Découvrez les programmes, projets et résultats de l'INDH lancée par Sa Majesté le Roi Mohammed VI.",
  keywords: [
    "INDH",
    "Maroc",
    "Développement Humain",
    "Initiative Nationale",
    "Mohammed VI",
    "projets sociaux",
    "inclusion sociale",
  ],
  openGraph: {
    title: "INDH — Initiative Nationale pour le Développement Humain",
    description:
      "20 ans d'action pour le développement humain au Maroc. Découvrez les programmes, projets et résultats de l'INDH.",
    type: "website",
    locale: "fr_MA",
    siteName: "INDH Maroc",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <ChatbotButton />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
