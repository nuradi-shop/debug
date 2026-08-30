"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { KeyRound, Server, ShoppingBag, Users } from "lucide-react"
import type { StoreCategory } from "@/data/store-categories"

interface StatsData {
  totalUsers: number
  totalServers: number
  totalPurchases: number
  codeSold: number
}

export function StatsSection({ category }: { category: StoreCategory }) {
  const [stats, setStats] = useState<StatsData>({ totalUsers: 0, totalServers: 0, totalPurchases: 0, codeSold: 0 })

  useEffect(() => {
    fetch("/api/stats", { cache: "no-store" }).then((r) => r.json()).then(setStats).catch(() => {})
  }, [category])

  const items = category === "redfinger"
    ? [
        { icon: ShoppingBag, label: "Total Transaksi", value: stats.totalPurchases },
        { icon: KeyRound, label: "Code Terjual", value: stats.codeSold },
      ]
    : [
        { icon: Users, label: "Pengguna", value: stats.totalUsers },
        { icon: Server, label: "Server Aktif", value: stats.totalServers },
        { icon: ShoppingBag, label: "Transaksi", value: stats.totalPurchases },
      ]

  return (
    <section className="border-b border-white/5 bg-[#070A10] py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className={`grid gap-3 ${category === "redfinger" ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
          {items.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div key={item.label} initial={{ opacity: 0, scale: .98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * .08 }} className="rounded-3xl border border-white/7 bg-gradient-to-br from-white/[0.035] to-transparent p-6">
                <div className="flex items-center justify-between">
                  <div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">{item.label}</p><p className="mt-2 text-4xl font-black tracking-tight text-white">{item.value}</p></div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/5 text-cyan-200"><Icon className="h-5 w-5" /></div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
