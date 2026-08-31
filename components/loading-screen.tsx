"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Bot } from "lucide-react"
import { appConfig } from "@/data/config"

export function LoadingScreen() {
  const [loading, setLoading] = useState(true)
  useEffect(() => { const t = setTimeout(() => setLoading(false), 900); return () => clearTimeout(t) }, [])

  return (
    <AnimatePresence>
      {loading && (
        <motion.div exit={{ opacity: 0 }} className="fixed inset-0 z-[100] grid place-items-center bg-[#05070B]">
          <div className="text-center">
            <motion.div animate={{ rotate: [0, 6, -6, 0], scale: [1, 1.05, 1] }} transition={{ duration: 1, repeat: Infinity }} className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
              <Bot className="h-7 w-7" />
            </motion.div>
            <div className="mt-4 text-sm font-black tracking-wide text-white">{appConfig.nameHost}</div>
            <div className="mt-2 text-[10px] uppercase tracking-[0.22em] text-slate-700">Preparing store</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
