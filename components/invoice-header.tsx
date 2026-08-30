"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Bot } from "lucide-react"
import { cn } from "@/lib/utils"
import { appConfig } from "@/data/config"

export function InvoiceHeader() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 border-b border-transparent px-4 py-3 transition-all md:px-6", scrolled && "border-cyan-300/10 bg-[#070B15]/90 backdrop-blur-xl")}>
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-cyan-200">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 bg-white/[0.03]"><ArrowLeft className="h-4 w-4" /></span>
          Kembali
        </Link>
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/5 text-cyan-200"><Bot className="h-4 w-4" /></span>
          <span className="text-sm font-black text-white">{appConfig.nameHost}</span>
        </div>
      </div>
    </header>
  )
}
