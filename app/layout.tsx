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
    icon: appConfig.brand.logo,
  },
}

const tailwindFallbackConfig = `
  tailwind.config = {
    darkMode: 'class',
    theme: {
      extend: {
        fontFamily: { sans: ['Poppins', 'sans-serif'] },
        colors: {
          border: 'hsl(var(--border))',
          input: 'hsl(var(--input))',
          ring: 'hsl(var(--ring))',
          background: 'hsl(var(--background))',
          foreground: 'hsl(var(--foreground))',
          primary: {
            DEFAULT: 'hsl(var(--primary))',
            foreground: 'hsl(var(--primary-foreground))'
          },
          secondary: {
            DEFAULT: 'hsl(var(--secondary))',
            foreground: 'hsl(var(--secondary-foreground))'
          },
          destructive: {
            DEFAULT: 'hsl(var(--destructive))',
            foreground: 'hsl(var(--destructive-foreground))'
          },
          muted: {
            DEFAULT: 'hsl(var(--muted))',
            foreground: 'hsl(var(--muted-foreground))'
          },
          accent: {
            DEFAULT: 'hsl(var(--accent))',
            foreground: 'hsl(var(--accent-foreground))'
          },
          popover: {
            DEFAULT: 'hsl(var(--popover))',
            foreground: 'hsl(var(--popover-foreground))'
          },
          card: {
            DEFAULT: 'hsl(var(--card))',
            foreground: 'hsl(var(--card-foreground))'
          }
        },
        borderRadius: {
          lg: 'var(--radius)',
          md: 'calc(var(--radius) - 2px)',
          sm: 'calc(var(--radius) - 4px)'
        }
      }
    }
  }
`

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const jar = await cookies()
  const sessionToken = jar.get(SESSION_COOKIE)?.value
  await getUserBySession(sessionToken)

  return (
    <html lang="id" suppressHydrationWarning className="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: tailwindFallbackConfig }} />
        <script src="https://cdn.tailwindcss.com"></script>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
      </head>

      <body className={poppins.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AwaySessionGuard enabled={Boolean(sessionToken)} />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
