"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { getTransactionById } from "@/app/actions/get-transactions"
import { useRouter } from "next/navigation"
import { appConfig } from "@/data/config"
import Navbar from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CalendarDays, FileSearch, Loader2, PackageCheck } from "lucide-react"
import { formatRupiah } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function GaransiPage() {
  const [transactionId, setTransactionId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [garansiData, setGaransiData] = useState<{
    planName: string
    amount: number
    remainingDays: number
    remainingReplace: number
    createdAt: string
  } | null>(null)
  const [dialogType, setDialogType] = useState<"error" | "expired" | "valid" | "incomplete" | "notfound">("valid")
  const router = useRouter()
  const { toast } = useToast()

  const handleCheckWarranty = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!transactionId.trim()) {
      toast({
        title: "Error",
        description: "Masukkan ID Transaksi terlebih dahulu",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setShowDialog(false)
    setGaransiData(null)

    try {
      const transaction = await getTransactionById(transactionId.trim())

      if (!transaction) {
        setDialogType("notfound")
        setShowDialog(true)
        return
      }

      if (transaction.status !== "completed") {
        setDialogType("incomplete")
        setShowDialog(true)
        return
      }

      const purchaseDate = new Date(transaction.createdAt)
      const now = new Date()
      const diffDays = Math.floor((now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24))
      const remainingDays = appConfig.garansi.warrantyDays - diffDays
      const remainingReplace = appConfig.garansi.replaceLimit - (transaction.replaceUsed || 0)

      if (remainingDays <= 0 || remainingReplace <= 0) {
        setDialogType("expired")
        setShowDialog(true)
        return
      }

      setGaransiData({
        planName: transaction.planName,
        amount: transaction.amount,
        remainingDays,
        remainingReplace,
        createdAt: purchaseDate.toLocaleDateString(),
      })
      setDialogType("valid")
      setShowDialog(true)
    } catch (error) {
      setDialogType("error")
      setShowDialog(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070A10] text-white">
      <Navbar />
      <main className="relative overflow-hidden px-4 pb-20 pt-28 md:px-6">
        <div className="pointer-events-none absolute inset-0 hero-grid opacity-20" />
        <div className="pointer-events-none absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[110px]" />

        <div className="relative mx-auto max-w-2xl">
          <div className="mb-7 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/5 text-cyan-200">
              <PackageCheck className="h-6 w-6" />
            </div>
            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">Warranty Center</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">Cek garansi panel</h1>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">Masukkan ID transaksi untuk melihat status, sisa masa garansi, dan jumlah klaim yang masih tersedia.</p>
          </div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[28px] border border-cyan-300/10 bg-[#0A1020] shadow-[0_30px_90px_rgba(0,0,0,.35)]">
            <div className="h-1 bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400" />
            <div className="p-5 sm:p-7">
              <form onSubmit={handleCheckWarranty} className="space-y-4">
                <div>
                  <Label htmlFor="transactionId" className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-300">
                    <FileSearch className="h-4 w-4 text-cyan-300" /> ID Transaksi
                  </Label>
                  <Input id="transactionId" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder="Contoh: TRX-XXXXXX" className="h-12 rounded-xl border-white/10 bg-[#070B15] text-white placeholder:text-slate-600 focus:border-cyan-300/50 focus:ring-cyan-300/20" />
                </div>
                <Button type="submit" disabled={isLoading} className="h-12 w-full rounded-xl bg-gradient-to-r from-cyan-300 to-sky-400 font-black text-[#041017] hover:brightness-110">
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memeriksa...</> : "Periksa Garansi"}
                </Button>
              </form>

              <div className="mt-5 flex items-start gap-2 rounded-2xl border border-white/7 bg-white/[0.025] p-3 text-xs leading-5 text-slate-600">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                Garansi berlaku {appConfig.garansi.warrantyDays} hari dengan maksimal {appConfig.garansi.replaceLimit} kali penggantian.
              </div>
            </div>
          </motion.div>

          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogContent className="overflow-hidden border-cyan-300/15 bg-[#0A1020] p-0 text-white sm:max-w-md">
              <div className="h-1 bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400" />
              <div className="p-5 sm:p-6">
                <DialogHeader>
                  <DialogTitle className="text-xl font-black text-white">
                    {dialogType === "valid" ? "Garansi masih aktif" : dialogType === "expired" ? "Garansi berakhir" : dialogType === "notfound" ? "Transaksi tidak ditemukan" : dialogType === "incomplete" ? "Pembayaran belum selesai" : "Terjadi kesalahan"}
                  </DialogTitle>
                  <DialogDescription className="text-slate-500">
                    {dialogType === "valid" ? "Data garansi berhasil ditemukan." : dialogType === "expired" ? "Masa garansi atau batas klaim sudah habis." : dialogType === "notfound" ? "Periksa kembali ID transaksi yang kamu masukkan." : dialogType === "incomplete" ? "Selesaikan pembayaran sebelum menggunakan garansi." : "Permintaan belum dapat diproses."}
                  </DialogDescription>
                </DialogHeader>

                {garansiData && dialogType === "valid" && (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <WarrantyInfo label="Paket" value={garansiData.planName} />
                    <WarrantyInfo label="Harga" value={formatRupiah(garansiData.amount)} accent />
                    <WarrantyInfo label="Sisa Garansi" value={`${garansiData.remainingDays} hari`} />
                    <WarrantyInfo label="Sisa Klaim" value={`${garansiData.remainingReplace} kali`} />
                    <div className="col-span-2"><WarrantyInfo label="Tanggal Pembelian" value={garansiData.createdAt} /></div>
                  </div>
                )}

                <DialogFooter className="mt-5 gap-2 sm:gap-2">
                  <Button variant="outline" onClick={() => setShowDialog(false)} className="w-full rounded-xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.07] sm:w-auto">Tutup</Button>
                  {dialogType === "valid" && <Button onClick={() => router.push(`/garansi/${transactionId}`)} className="w-full rounded-xl bg-gradient-to-r from-cyan-300 to-sky-400 font-black text-[#041017] sm:w-auto">Lanjut Klaim</Button>}
                  {dialogType === "expired" && <Button onClick={() => router.push("/")} className="w-full rounded-xl bg-gradient-to-r from-cyan-300 to-sky-400 font-black text-[#041017] sm:w-auto">Beli Lagi</Button>}
                  {dialogType === "incomplete" && <Button onClick={() => router.push(`/invoice/${transactionId}`)} className="w-full rounded-xl bg-gradient-to-r from-cyan-300 to-sky-400 font-black text-[#041017] sm:w-auto">Selesaikan</Button>}
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function WarrantyInfo({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return <div className="rounded-2xl border border-white/7 bg-[#070B15] p-3"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-600">{label}</p><p className={`mt-1 text-xs font-bold ${accent ? "text-cyan-200" : "text-slate-200"}`}>{value}</p></div>
}
