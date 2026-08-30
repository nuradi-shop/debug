"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AlertTriangle, ArrowLeft, Loader2, MailCheck, Server, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { getTransactionById } from "@/app/actions/get-transactions"
import { appConfig } from "@/data/config"
import { claimWarranty } from "@/app/actions/claim-warranty"
import Navbar from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function GaransiDetailPage() {
  const router = useRouter()
  const params = useParams()
  const transactionId = params?.id as string
  const { toast } = useToast()

  const [transaction, setTransaction] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [panelData, setPanelData] = useState<any>(null)
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [locked, setLocked] = useState(false)
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    async function fetchData() {
      try {
        const trx = await getTransactionById(transactionId)
        if (!trx) {
          toast({ title: "Transaksi tidak ditemukan", description: "ID transaksi tidak valid.", variant: "destructive" })
          router.push("/garansi")
          return
        }
        if (trx.status !== "completed") {
          toast({ title: "Transaksi belum selesai", description: "Selesaikan pembayaran sebelum klaim garansi.", variant: "destructive" })
          router.push("/garansi")
          return
        }
        setTransaction(trx)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [transactionId, router, toast])

  const handleVerifyEmail = async () => {
    if (!transaction || locked || verifying) return
    if (!email.trim()) return setError("Masukkan email terlebih dahulu.")

    setVerifying(true)
    setError("")
    try {
      const result = await claimWarranty(transactionId, email)
      if (!result.success) {
        const failCount = attempts + 1
        setAttempts(failCount)
        if (failCount >= 3 && result.error?.toLowerCase().includes("email")) {
          setLocked(true)
          setError("Form dikunci karena 3x gagal. Muat ulang halaman untuk mencoba kembali.")
          return
        }
        setError(result.error || "Klaim garansi gagal diproses.")
        return
      }

      setPanelData(result.panelDetails)
      toast({ title: "Garansi berhasil", description: "Panel baru berhasil dibuat dan detail dikirim ke email kamu." })
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan saat memproses garansi.")
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070A10] text-white">
      <Navbar />
      <main className="relative overflow-hidden px-4 pb-20 pt-28 md:px-6">
        <div className="pointer-events-none absolute inset-0 hero-grid opacity-20" />
        <div className="relative mx-auto max-w-2xl">
          <button onClick={() => router.push("/garansi")} className="mb-5 inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-cyan-200">
            <ArrowLeft className="h-4 w-4" /> Kembali ke Garansi
          </button>

          {loading ? (
            <div className="rounded-[26px] border border-cyan-300/10 bg-[#0A1020] p-12 text-center">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-cyan-300" />
              <p className="mt-3 text-sm text-slate-500">Memuat detail garansi...</p>
            </div>
          ) : transaction ? (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[28px] border border-cyan-300/10 bg-[#0A1020] shadow-[0_30px_90px_rgba(0,0,0,.35)]">
              <div className="h-1 bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400" />
              <div className="p-5 sm:p-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/5 text-cyan-200"><ShieldCheck className="h-6 w-6" /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">Warranty center</p>
                    <h1 className="mt-1 text-2xl font-black">Klaim garansi panel</h1>
                    <p className="mt-2 text-sm leading-6 text-slate-500">Verifikasi email transaksi untuk membuat panel pengganti sesuai ketentuan garansi.</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                  <Info label="ID Transaksi" value={transactionId} />
                  <Info label="Paket" value={transaction.planName || "Paket panel"} />
                  <Info label="Email" value={transaction.email} />
                  <Info label="Status" value="Completed" accent />
                </div>

                {!panelData ? (
                  <div className="mt-6 rounded-[22px] border border-white/8 bg-[#070B15] p-4 sm:p-5">
                    <div className="mb-3 flex items-center gap-2 text-sm font-black"><MailCheck className="h-4 w-4 text-cyan-300" /> Verifikasi email</div>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email yang dipakai saat membeli" disabled={verifying || locked} className="h-12 rounded-xl border-white/10 bg-black/20 text-white focus:border-cyan-300/50 focus:ring-cyan-300/20" />
                    {error && <div className="mt-3 rounded-xl border border-rose-400/15 bg-rose-400/5 px-3 py-2 text-xs leading-5 text-rose-300">{error}</div>}
                    <Button onClick={handleVerifyEmail} disabled={verifying || locked} className="mt-4 h-12 w-full rounded-xl bg-gradient-to-r from-cyan-300 to-sky-400 font-black text-[#041017] hover:brightness-110">
                      {verifying ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memverifikasi...</> : "Proses Klaim Garansi"}
                    </Button>
                  </div>
                ) : (
                  <div className="mt-6 rounded-[22px] border border-emerald-300/15 bg-emerald-300/[0.035] p-5">
                    <h3 className="flex items-center gap-2 text-sm font-black"><Server className="h-4 w-4 text-emerald-300" /> Panel baru berhasil dibuat</h3>
                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                      <Info label="Username" value={panelData.username} />
                      <Info label="Password" value={panelData.password} />
                      {panelData.type === "admin-panel" || panelData.serverId === null ? (
                        <Info label="Hak Akses" value="Administrator" />
                      ) : (
                        <Info label="Server ID" value={String(panelData.serverId)} />
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-5 flex items-start gap-2 text-xs leading-5 text-slate-600"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> Garansi berlaku {appConfig.garansi.warrantyDays} hari dan maksimal {appConfig.garansi.replaceLimit} kali penggantian.</div>
              </div>
            </motion.div>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  )
}

function Info({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return <div className="rounded-2xl border border-white/7 bg-white/[0.025] p-3"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-600">{label}</p><p className={`mt-1 break-all text-xs font-bold ${accent ? "text-emerald-300" : "text-slate-200"}`}>{value}</p></div>
}
