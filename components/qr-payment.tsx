"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatRupiah, formatDate } from "@/lib/utils"
import { Loader2, RefreshCw, CheckCircle2, AlertCircle, ExternalLink, QrCode, KeyRound } from "lucide-react"
import { checkPaymentStatus } from "@/app/actions/check-payment"
import { StatusModal } from "./status-modal"
import { WhatsappGroupPopup } from "./whatsapp-group-popup"
import { CopyButton } from "./copy-button"
import { pterodactylConfig } from "@/data/config"
import { motion } from "framer-motion"
import { plans } from "@/data/plans"

interface PanelDetails {
  username: string
  password: string
  serverId: number | null
  type?: "panel-bot" | "admin-panel"
  userId?: number
}

interface RedfingerDetails {
  type: "redfinger"
  productName: string
  duration: string
  redeemCode: string
}

interface AlightMotionDetails { type:"alight-motion"; productName:string; duration:string; accountType:"sharing"|"private"; accountEmail?:string; accountPassword?:string }

interface QrPaymentProps {
  transactionId: string
  amount: number
  fee: number
  total: number
  qrImageUrl: string
  expirationTime: string
  status: "pending" | "paid" | "processing" | "completed" | "failed"
  username: string
  phone?: string
  email: string
  planId: string
  productType: "panel" | "redfinger" | "alight-motion"
  productName?: string
  createdAt: string
  initialPanelDetails?: PanelDetails | null
  initialRedfingerDetails?: RedfingerDetails | null
  initialAlightMotionDetails?: AlightMotionDetails | null
}

export function QrPayment({
  transactionId,
  amount,
  fee,
  total,
  qrImageUrl,
  expirationTime,
  status: initialStatus,
  username,
  phone,
  email,
  planId,
  productType,
  productName,
  createdAt,
  initialPanelDetails = null,
  initialRedfingerDetails = null,
  initialAlightMotionDetails = null,
}: QrPaymentProps) {
  const [status, setStatus] = useState(initialStatus)
  const [isChecking, setIsChecking] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<"success" | "error" | "info" | "loading">("info")
  const [modalTitle, setModalTitle] = useState("")
  const [modalMessage, setModalMessage] = useState("")
  const [showWhatsappPopup, setShowWhatsappPopup] = useState(false)
  const [panelDetails, setPanelDetails] = useState<PanelDetails | null>(initialPanelDetails)
  const [redfingerDetails, setRedfingerDetails] = useState<RedfingerDetails | null>(initialRedfingerDetails)
  const isRedfinger = productType === "redfinger"
  const isAlightMotion = productType === "alight-motion"
  const [alightMotionDetails,setAlightMotionDetails]=useState<AlightMotionDetails|null>(initialAlightMotionDetails)

  const getPlanName = () => {
    if (productName) return productName
    return plans.find((p) => p?.id === planId)?.name || (isRedfinger ? "REDFINGER" : isAlightMotion ? "AM Premium" : "Unknown")
  }

  const saveTransactionToHistory = (nextStatus: typeof status, details?: PanelDetails | RedfingerDetails | null) => {
    try {
      const existingHistory = localStorage.getItem("transactionHistory")
      let history = existingHistory ? JSON.parse(existingHistory) : []
      const existingIndex = history.findIndex((t: any) => t.transactionId === transactionId)
      const transaction = {
        transactionId,
        username,
        phone,
        email,
        planId,
        productType,
        planName: getPlanName(),
        total,
        createdAt,
        status: nextStatus,
        panelDetails: !isRedfinger ? details || undefined : undefined,
        redfingerDetails: isRedfinger ? details || undefined : undefined,
      }
      if (existingIndex !== -1) history[existingIndex] = transaction
      else history.unshift(transaction)
      if (history.length > 20) history = history.slice(0, 20)
      localStorage.setItem("transactionHistory", JSON.stringify(history))
    } catch (error) {
      console.error("Error saving transaction to history:", error)
    }
  }

  useEffect(() => {
    saveTransactionToHistory(initialStatus, isRedfinger ? initialRedfingerDetails : initialPanelDetails)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const applyResult = (result: any, showFeedback: boolean) => {
    if (!result.success) {
      if (showFeedback) {
        setModalType("error")
        setModalTitle("Gagal Memeriksa Status")
        setModalMessage(result.error || "Gagal memeriksa status pembayaran")
        setShowModal(true)
      }
      return
    }

    if (result.status === "completed") {
      setStatus("completed")
      if (isRedfinger) { setRedfingerDetails(result.redfingerDetails || null); saveTransactionToHistory("completed", result.redfingerDetails) }
      else if (isAlightMotion) { setAlightMotionDetails(result.alightMotionDetails || null); saveTransactionToHistory("completed", result.alightMotionDetails) }
      else { setPanelDetails(result.panelDetails || null); saveTransactionToHistory("completed", result.panelDetails) }

      if (showFeedback) {
        setModalType("success")
        setModalTitle("Pembayaran Berhasil")
        setModalMessage(isRedfinger ? "Redeem Code REDFINGER sudah siap dan dikirim ke email Anda." : isAlightMotion ? "Pesanan AM Premium berhasil. Silakan cek email Anda." : "Panel Anda telah berhasil dibuat dan detail akun dikirim ke email Anda.")
        setShowModal(true)
      }
      if (!isRedfinger && !isAlightMotion && result.showWhatsappPopup) setTimeout(() => setShowWhatsappPopup(true), 1000)
    } else if (result.status === "paid" || result.status === "processing") {
      setStatus(result.status)
      saveTransactionToHistory(result.status)
      if (showFeedback) {
        setModalType("info")
        setModalTitle("Pembayaran Diterima")
        setModalMessage(isRedfinger ? "Pembayaran diterima. Redeem Code sedang diproses." : isAlightMotion ? "Pembayaran diterima. AM Premium sedang diproses." : "Pembayaran diterima. Panel sedang dalam proses pembuatan.")
        setShowModal(true)
      }
    } else if (result.status === "failed") {
      setStatus("failed")
      saveTransactionToHistory("failed")
      if (showFeedback) {
        setModalType("error")
        setModalTitle("Pembayaran Gagal")
        setModalMessage("Pembayaran gagal atau kedaluwarsa.")
        setShowModal(true)
      }
    }
  }

  const checkStatus = async () => {
    if (status === "completed") {
      setModalType("success")
      setModalTitle("Pembayaran Berhasil")
      setModalMessage(isRedfinger ? "Redeem Code REDFINGER sudah tersedia di invoice." : "Panel Anda telah berhasil dibuat.")
      setShowModal(true)
      return
    }

    setIsChecking(true)
    try {
      const result = await checkPaymentStatus(transactionId)
      applyResult(result, true)
    } catch {
      setModalType("error")
      setModalTitle("Terjadi Kesalahan")
      setModalMessage("Gagal memeriksa status pembayaran")
      setShowModal(true)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    if (status !== "pending" && status !== "paid" && status !== "processing") return
    const interval = setInterval(async () => {
      try {
        const result = await checkPaymentStatus(transactionId)
        applyResult(result, false)
      } catch (error) {
        console.error("Error checking payment status:", error)
      }
    }, 10000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, transactionId])

  const isExpired = new Date() > new Date(expirationTime)

  return (
    <div className="relative space-y-6">
      <StatusModal isOpen={showModal} onClose={() => setShowModal(false)} type={modalType} title={modalTitle} message={modalMessage} panelDetails={panelDetails} />
      {!isRedfinger && !isAlightMotion && <WhatsappGroupPopup isOpen={showWhatsappPopup} onClose={() => setShowWhatsappPopup(false)} />}

      {status === "pending" && !isExpired && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="overflow-hidden border-cyan-300/10 bg-[#0A1020]">
            <div className="bg-gradient-to-r from-cyan-400/20 via-sky-400/10 to-violet-400/15 p-4 text-white">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div className="flex items-center space-x-2"><QrCode className="h-5 w-5" /><h3 className="font-medium">Scan QR Code untuk Pembayaran</h3></div>
                <p className="text-sm text-gray-300">Expired: {formatDate(expirationTime)}</p>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="grid gap-6 md:grid-cols-[260px_1fr] md:items-start">
                <div className="mx-auto w-full max-w-[260px] rounded-2xl bg-white p-3">
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                    <Image src={qrImageUrl} alt="QRIS Pembayaran" fill unoptimized className="object-contain" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/8 bg-[#070B15] p-4">
                    <h4 className="mb-3 text-sm font-medium uppercase text-gray-400">Ringkasan Pembayaran</h4>
                    <div className="space-y-3 text-sm"><div className="flex justify-between"><span className="text-gray-400">Produk:</span><span className="max-w-[60%] text-right text-white">{getPlanName()}</span></div><div className="flex justify-between"><span className="text-gray-400">Subtotal:</span><span className="text-white">{formatRupiah(amount)}</span></div><div className="flex justify-between"><span className="text-gray-400">Biaya Admin:</span><span className="text-white">{formatRupiah(fee)}</span></div><div className="my-3 h-px bg-white/8" /><div className="flex justify-between font-medium"><span className="text-white">Total Pembayaran:</span><span className="text-cyan-200">{formatRupiah(total)}</span></div></div>
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-[#070B15] p-4">
                    <h4 className="mb-3 text-sm font-medium uppercase text-gray-400">Instruksi</h4>
                    <ol className="list-inside list-decimal space-y-2 text-sm text-gray-300"><li>Buka aplikasi e-wallet atau m-banking Anda</li><li>Pilih menu scan QR Code atau QRIS</li><li>Scan QR Code di samping</li><li>Pastikan nominal sesuai total pembayaran</li><li>Selesaikan pembayaran</li><li>Klik tombol Cek Status Pembayaran</li></ol>
                  </div>

                  <Button onClick={checkStatus} disabled={isChecking} className="flex h-12 w-full items-center justify-center bg-gradient-to-r from-cyan-300 to-sky-400 font-black text-[#041017] hover:brightness-110">
                    {isChecking ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Memeriksa Pembayaran...</> : <><RefreshCw className="mr-2 h-5 w-5" />Cek Status Pembayaran</>}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {(status === "paid" || status === "processing") && (
        <Card className="overflow-hidden border-cyan-300/10 bg-[#0A1020]">
          <div className="bg-gradient-to-r from-sky-400/20 to-cyan-400/10 p-4 text-white"><h3 className="flex items-center justify-center font-medium"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Pembayaran Diterima</h3></div>
          <CardContent className="p-6 text-center"><p className="text-gray-300">{isRedfinger ? "Pembayaran telah diterima. Redeem Code REDFINGER sedang diproses." : isAlightMotion ? "Pembayaran telah diterima. Pesanan AM Premium sedang diproses." : "Pembayaran telah diterima. Panel Pterodactyl Anda sedang dalam proses pembuatan."}</p><div className="mt-4 rounded-2xl border border-white/8 bg-[#070B15] p-4 text-sm text-gray-400">Halaman akan diperbarui otomatis setelah pesanan selesai diproses.</div></CardContent>
        </Card>
      )}

      {status === "completed" && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
          <Card className="overflow-hidden border-cyan-300/10 bg-[#0A1020]">
            <div className="bg-gradient-to-r from-emerald-400/20 to-cyan-400/10 p-4 text-white"><h3 className="flex items-center justify-center font-medium"><CheckCircle2 className="mr-2 h-5 w-5" />Pembayaran Berhasil</h3></div>
            <CardContent className="p-6">
              <div className="mb-6 text-center"><p className="text-gray-300">{isRedfinger ? "Terima kasih atas pembelian Anda. Redeem Code REDFINGER telah diproses dan juga dikirim ke email Anda." : isAlightMotion ? (alightMotionDetails?.accountType === "private" ? "Pembayaran berhasil. Screenshot halaman ini, simpan ID transaksi, lalu cek email untuk tombol Hubungi Admin WhatsApp." : "AM Premium Sharing berhasil diproses. Detail akun telah dikirim ke email Anda.") : "Terima kasih atas pembelian Anda. Panel Pterodactyl telah berhasil dibuat dan detail akun telah dikirim ke email Anda."}</p></div>

              {isRedfinger && redfingerDetails && (
                <div className="mb-4 rounded-2xl border border-white/8 bg-[#070B15] p-4">
                  <div className="mb-4 flex items-center gap-2"><KeyRound className="h-5 w-5 text-cyan-300" /><h4 className="font-medium text-white">Detail REDFINGER</h4></div>
                  <div className="space-y-3"><InfoRow label="Produk" value={redfingerDetails.productName} /><InfoRow label="Masa Aktif" value={redfingerDetails.duration} /><div><div className="mb-1 flex items-center justify-between"><span className="text-sm text-gray-400">Redeem Code:</span><CopyButton text={redfingerDetails.redeemCode} /></div><div className="break-all rounded-xl border border-cyan-300/10 bg-black/20 px-3 py-3 font-mono text-base font-bold text-cyan-100">{redfingerDetails.redeemCode}</div></div></div>
                  <p className="mt-4 text-center text-sm text-gray-400">Simpan kode dengan baik. Kode yang sama juga sudah dikirim ke email Anda.</p>
                </div>
              )}

              {isAlightMotion && alightMotionDetails && (
                <div className="mb-4 rounded-2xl border border-white/8 bg-[#070B15] p-4"><h4 className="mb-3 font-medium text-white">Detail AM Premium</h4><InfoRow label="Produk" value={alightMotionDetails.productName}/><div className="mt-3"><InfoRow label="ID Transaksi" value={transactionId}/></div>{alightMotionDetails.accountType === "sharing" && alightMotionDetails.accountEmail && alightMotionDetails.accountPassword ? <div className="mt-3 space-y-3"><CopyRow label="Email Akun" value={alightMotionDetails.accountEmail}/><CopyRow label="Password" value={alightMotionDetails.accountPassword}/></div> : <div className="mt-4 rounded-xl border border-amber-300/15 bg-amber-300/5 p-3 text-sm text-amber-100">Pesanan Private diproses manual. Screenshot bukti pembayaran ini dan simpan ID transaksi. Instruksi serta tombol WhatsApp admin sudah dikirim ke email.</div>}</div>
              )}

              {!isRedfinger && !isAlightMotion && panelDetails && (
                <div className="mb-4 rounded-2xl border border-white/8 bg-[#070B15] p-4">
                  <h4 className="mb-3 font-medium text-white">Detail Panel</h4>
                  <div className="space-y-3"><CopyRow label="URL Panel" value={pterodactylConfig.domain} /><CopyRow label="Username" value={panelDetails.username} /><CopyRow label="Password" value={panelDetails.password} />{panelDetails.type === "admin-panel" || panelDetails.serverId === null ? <InfoRow label="Hak Akses" value="Administrator" /> : <CopyRow label="Server ID" value={panelDetails.serverId.toString()} />}</div>
                  <a href={pterodactylConfig.domain} target="_blank" rel="noopener noreferrer" className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 to-sky-400 px-4 py-2 font-black text-[#041017]"><ExternalLink className="h-4 w-4" />Login Sekarang</a>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {status === "failed" && <FailureCard title="Pembayaran Gagal" text="Maaf, pembayaran Anda gagal diproses. Silakan coba lagi atau hubungi customer service kami." />}
      {status === "pending" && isExpired && <FailureCard title="Pembayaran Kedaluwarsa" text="Waktu pembayaran telah habis. Silakan buat pesanan baru." />}
    </div>
  )
}

function CopyRow({ label, value }: { label: string; value: string }) {
  return <div><div className="mb-1 flex items-center justify-between"><span className="text-sm text-gray-400">{label}:</span><CopyButton text={value} /></div><div className="break-all rounded bg-black/20 px-3 py-2 font-mono text-sm text-gray-300">{value}</div></div>
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div><span className="text-sm text-gray-400">{label}:</span><div className="mt-1 rounded bg-black/20 px-3 py-2 text-sm text-gray-300">{value}</div></div>
}

function FailureCard({ title, text }: { title: string; text: string }) {
  return <Card className="overflow-hidden border-cyan-300/10 bg-[#0A1020]"><div className="bg-gradient-to-r from-amber-400/20 to-orange-400/10 p-4 text-white"><h3 className="flex items-center justify-center font-medium"><AlertCircle className="mr-2 h-5 w-5" />{title}</h3></div><CardContent className="p-6 text-center"><p className="mb-4 text-gray-300">{text}</p><Button onClick={() => (window.location.href = "/")} className="h-12 rounded-xl bg-gradient-to-r from-cyan-300 to-sky-400 font-black text-[#041017]">Kembali ke Halaman Utama</Button></CardContent></Card>
}
