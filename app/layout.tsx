import type React from "react"
import type { Metadata } from "next"
import { cookies } from "next/headers"
import { Poppins } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AwaySessionGuard } from "@/components/away-session-guard"
import { appConfig } from "@/data/config"
import { getUserBySession, SESSION_COOKIE } from "@/lib/auth"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: `${appConfig.nameHost} - Pterodactyl Panel`,
  description: "Beli panel Pterodactyl dengan mudah dan cepat",
  icons: {
    icon: "/itzky.png",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const jar = await cookies()
  const user = await getUserBySession(jar.get(SESSION_COOKIE)?.value)

  return (
    <html lang="id" suppressHydrationWarning className="dark">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
      </head>
      <body className={poppins.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AwaySessionGuard enabled={Boolean(user)} />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
