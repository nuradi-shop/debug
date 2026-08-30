"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bot,
  History,
  Home,
  LogOut,
  Menu,
  ShieldCheck,
  ShoppingBag,
  User,
  Users,
  X,
} from "lucide-react"
import { appConfig } from "@/data/config"
import { logoutAction } from "@/app/actions/auth"

type AccountUser = {
  username: string
  email: string
}

export default function Navbar({
  user,
}: {
  user?: AccountUser | null
}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const homeHref = user ? "/store" : "/"
  const showBelanja = pathname.startsWith("/garansi") || pathname.startsWith("/account")

  const links = [
    { href: homeHref, label: "Home", icon: Home },
    { href: "/history", label: "Riwayat", icon: History },
    { href: "/garansi", label: "Garansi", icon: ShieldCheck },
  ]

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#070A10]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href={homeHref} className="click-motion flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
            <Bot className="h-5 w-5" />
          </span>

          <div className="leading-none">
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Panel Store</div>
            <div className="mt-1 text-base font-black tracking-tight text-white">{appConfig.nameHost}</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 rounded-2xl border border-white/8 bg-white/[0.025] p-1 md:flex">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="click-motion flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-white/5 hover:text-white">
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}

          <a href={appConfig.whatsappGroupLink} target="_blank" rel="noreferrer" className="click-motion flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-white/5 hover:text-white">
            <Users className="h-4 w-4" />
            Komunitas
          </a>

          {showBelanja && (
            <Link href="/store" className="click-motion flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-white/5 hover:text-white">
              <ShoppingBag className="h-4 w-4" />
              Belanja
            </Link>
          )}

          {user && (
            <>
              <Link href="/account" className="click-motion flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-white/5 hover:text-white">
                <User className="h-4 w-4" />
                Profil
              </Link>

              <form action={logoutAction}>
                <button type="submit" className="click-motion flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/10 hover:text-red-200">
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </form>
            </>
          )}
        </nav>

        <button onClick={() => setOpen(!open)} className="click-motion flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white md:hidden" aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/5 bg-[#090D14] px-4 py-4 md:hidden">
          <div className="grid gap-2">
            {links.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} className="click-motion flex items-center gap-3 rounded-xl border border-white/6 bg-white/[0.02] px-4 py-3 text-sm font-semibold text-slate-300">
                <Icon className="h-4 w-4 text-cyan-300" />
                {label}
              </Link>
            ))}

            <a href={appConfig.whatsappGroupLink} target="_blank" rel="noreferrer" className="click-motion flex items-center gap-3 rounded-xl border border-white/6 bg-white/[0.02] px-4 py-3 text-sm font-semibold text-slate-300">
              <Users className="h-4 w-4 text-cyan-300" />
              Komunitas
            </a>

            {showBelanja && (
              <Link href="/store" onClick={() => setOpen(false)} className="click-motion flex items-center gap-3 rounded-xl border border-white/6 bg-white/[0.02] px-4 py-3 text-sm font-semibold text-slate-300">
                <ShoppingBag className="h-4 w-4 text-cyan-300" />
                Belanja
              </Link>
            )}

            {user && (
              <>
                <Link href="/account" onClick={() => setOpen(false)} className="click-motion flex items-center gap-3 rounded-xl border border-white/6 bg-white/[0.02] px-4 py-3 text-sm font-semibold text-slate-300">
                  <User className="h-4 w-4 text-cyan-300" />
                  Profil
                </Link>

                <form action={logoutAction}>
                  <button type="submit" className="click-motion flex w-full items-center gap-3 rounded-xl border border-red-500/10 bg-red-500/[0.03] px-4 py-3 text-left text-sm font-semibold text-red-300">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
