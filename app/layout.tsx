import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { CreditsProvider } from "@/hooks/use-credits"
import { ClerkProvider } from "@clerk/nextjs"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "icon3d.ai | Create Animated 3D Icons",
  description: "Transform ideas into stunning animated 3D icons with AI",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className={inter.variable}>
        <body className="font-sans antialiased">
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <CreditsProvider>{children}</CreditsProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
