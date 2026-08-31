"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatRupiah } from "@/lib/utils"
import { plans } from "@/data/plans"
import type { StoreCategory } from "@/data/store-categories"
import type { RedfingerProductWithStock } from "@/data/redfinger-products"
import { Cloud, Cpu, Database, HardDrive, Loader2 } from "lucide-react"

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  planId: string
  onConfirm: () => void
  isLoading: boolean
  category: StoreCategory
  redfingerProduct?: RedfingerProductWithStock
}

export function ConfirmationDialog({ open, onOpenChange, planId, onConfirm, isLoading, category, redfingerProduct }: ConfirmationDialogProps) {
  const plan = category === "redfinger" ? undefined : plans.find((p) => p?.id === planId)
  if (category === "redfinger" && !redfingerProduct) return null
  if (category !== "redfinger" && !plan) return null

  const name = category === "redfinger" ? redfingerProduct!.name : plan!.name
  const price = category === "redfinger" ? redfingerProduct!.price : plan!.price
  const description = category === "redfinger" ? redfingerProduct!.description : plan!.description

  return (
    <Dialog open={open} onOpenChange={(value) => !isLoading && onOpenChange(value)}>
      <DialogContent className="overflow-hidden border-cyan-300/15 bg-[#0A1020] p-0 text-white shadow-[0_30px_100px_rgba(0,0,0,.55)] sm:max-w-md">
        <div className="h-1 bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400" />
        <div className="p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white">Konfirmasi pembelian</DialogTitle>
            <DialogDescription className="text-slate-500">Periksa produk sebelum masuk ke proses pembayaran.</DialogDescription>
          </DialogHeader>

          <div className="mt-5 rounded-[22px] border border-white/8 bg-[#070B15] p-4">
            <h3 className="text-sm font-black text-white">{name}</h3>
            <p className="mt-1 text-2xl font-black text-cyan-200">{formatRupiah(price)}</p>

            {category === "redfinger" ? (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Mini icon={<Cloud className="h-3.5 w-3.5" />} label="Masa Aktif" value={redfingerProduct!.duration} />
                <Mini icon={<Database className="h-3.5 w-3.5" />} label="Stok" value={`${redfingerProduct!.stock} tersedia`} />
              </div>
            ) : plan!.category === "admin-panel" ? (
              <div className="mt-4 rounded-xl border border-violet-300/10 bg-violet-300/[0.035] p-3 text-xs text-slate-400">Akses Administrator Pterodactyl</div>
            ) : (
              <div className="mt-4 grid grid-cols-3 gap-2">
                <Mini icon={<Database className="h-3.5 w-3.5" />} label="RAM" value={plan!.memory === 0 ? "∞" : `${plan!.memory} MB`} />
                <Mini icon={<HardDrive className="h-3.5 w-3.5" />} label="Disk" value={plan!.disk === 0 ? "∞" : `${plan!.disk} MB`} />
                <Mini icon={<Cpu className="h-3.5 w-3.5" />} label="CPU" value={plan!.cpu === 0 ? "∞" : `${plan!.cpu}%`} />
              </div>
            )}

            <p className="mt-4 text-xs leading-5 text-slate-500">{description}</p>
          </div>

          <DialogFooter className="mt-5 gap-2 sm:gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading} className="w-full rounded-xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.07] sm:w-auto">Batal</Button>
            <Button type="button" onClick={onConfirm} disabled={isLoading} className="w-full rounded-xl bg-gradient-to-r from-cyan-300 to-sky-400 font-black text-[#041017] hover:brightness-110 sm:w-auto">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menghubungkan...</> : "Lanjut Pembayaran"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Mini({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-xl border border-white/6 bg-black/20 p-2"><div className="text-cyan-300">{icon}</div><div className="mt-1 text-[9px] text-slate-600">{label}</div><div className="truncate text-[10px] font-bold text-slate-300">{value}</div></div>
}
