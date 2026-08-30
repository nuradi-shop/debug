"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { MessageCircle, Share2 } from "lucide-react"
import { appConfig } from "@/data/config"

export function SocialMediaButton() {
  const [open, setOpen] = useState(false)
  return (
    <div className="fixed bottom-5 right-5 z-40">
      <AnimatePresence>
        {open && (
          <motion.a href={appConfig.socialMedia.whatsapp} target="_blank" rel="noreferrer" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-14 right-0 flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0D111A] px-4 py-3 text-xs font-semibold text-white shadow-2xl">
            <MessageCircle className="h-4 w-4 text-cyan-300" /> WhatsApp
          </motion.a>
        )}
      </AnimatePresence>
      <button onClick={() => setOpen(!open)} className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300 text-[#041017] shadow-[0_10px_35px_rgba(34,211,238,.25)]">
        <Share2 className="h-5 w-5" />
      </button>
    </div>
  )
}
