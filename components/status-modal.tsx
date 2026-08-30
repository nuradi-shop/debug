"use client"

import { useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, CheckCircle2, Clock3, ExternalLink, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CopyButton } from "./copy-button"
import { pterodactylConfig } from "@/data/config"

interface StatusModalProps {
  isOpen: boolean
  onClose: () => void
  type: "success" | "error" | "info" | "loading"
  title: string
  message: string
  panelDetails?: { username: string; password: string; serverId: number | null; type?: "panel-bot" | "admin-panel"; userId?: number } | null
}

export function StatusModal({ isOpen, onClose, type, title, message, panelDetails }: StatusModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = previous }
  }, [isOpen])

  const icon = type === "success"
    ? <CheckCircle2 className="h-5 w-5" />
    : type === "error"
      ? <AlertCircle className="h-5 w-5" />
      : type === "loading"
        ? <Loader2 className="h-5 w-5 animate-spin" />
        : <Clock3 className="h-5 w-5" />

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[80] grid place-items-center p-4">
          <motion.button
            type="button"
            aria-label="Tutup modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#02040A]/80 backdrop-blur-md"
            onClick={type === "loading" ? undefined : onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 16, scale: .98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: .98 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-[26px] border border-cyan-300/15 bg-[#0A1020] shadow-[0_30px_100px_rgba(0,0,0,.55)]"
          >
            <div className="h-1 bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400" />
            <div className="p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${
                  type === "error" ? "border-rose-400/20 bg-rose-400/10 text-rose-300" : "border-cyan-300/20 bg-cyan-300/10 text-cyan-200"
                }`}>
                  {icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-black text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{message}</p>
                </div>
                {type !== "loading" && (
                  <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-600 hover:bg-white/5 hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {panelDetails && (
                <div className="mt-5 space-y-3 rounded-2xl border border-white/8 bg-[#070B15] p-4">
                  <Detail label="URL Panel" value={pterodactylConfig.domain} />
                  <Detail label="Username" value={panelDetails.username} />
                  <Detail label="Password" value={panelDetails.password} />
                  {panelDetails.type === "admin-panel" || panelDetails.serverId === null ? (
                    <Detail label="Hak Akses" value="Administrator" />
                  ) : (
                    <Detail label="Server ID" value={String(panelDetails.serverId)} />
                  )}
                  <a href={pterodactylConfig.domain} target="_blank" rel="noopener noreferrer" className="mt-2 flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 to-sky-400 text-sm font-black text-[#041017]">
                    <ExternalLink className="h-4 w-4" /> Buka Panel
                  </a>
                </div>
              )}

              {type !== "loading" && (
                <Button onClick={onClose} className="mt-5 h-11 w-full rounded-xl bg-white/8 font-bold text-white hover:bg-white/12">
                  Tutup
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">{label}</span>
        <CopyButton text={value} />
      </div>
      <div className="break-all rounded-xl border border-white/6 bg-black/20 px-3 py-2 font-mono text-xs text-slate-300">{value}</div>
    </div>
  )
}
