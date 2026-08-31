"use client"

import { Card, CardContent } from "@/components/ui/card"
import { formatRupiah, formatDate } from "@/lib/utils"
import { plans } from "@/data/plans"
import { motion } from "framer-motion"
import { Clock, CheckCircle, AlertTriangle, Loader2, User, Mail, Package, Calendar, CreditCard, Phone, Cloud } from "lucide-react"

interface InvoiceDetailsProps {
  transactionId: string
  planId: string
  productType: "panel" | "redfinger" | "alight-motion"
  productName?: string
  duration?: string
  username: string
  phone?: string
  email: string
  amount: number
  fee: number
  total: number
  createdAt: string
  status: "pending" | "paid" | "processing" | "completed" | "failed"
}

export function InvoiceDetails({ transactionId, planId, productType, productName, duration, username, phone, email, amount, fee, total, createdAt, status }: InvoiceDetailsProps) {
  const plan = plans.find((p) => p?.id === planId)
  const redfinger = productType === "redfinger"
  const alightMotion = productType === "alight-motion"

  const getStatusBadge = () => {
    switch (status) {
      case "pending": return <div className="status-badge status-pending"><Clock className="mr-1 h-3 w-3" />Menunggu Pembayaran</div>
      case "paid":
      case "processing": return <div className="status-badge status-paid"><Loader2 className="mr-1 h-3 w-3 animate-spin" />Sedang Diproses</div>
      case "completed": return <div className="status-badge status-success"><CheckCircle className="mr-1 h-3 w-3" />Sukses</div>
      case "failed": return <div className="status-badge status-failed"><AlertTriangle className="mr-1 h-3 w-3" />Gagal</div>
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
      <Card className="overflow-hidden border-cyan-300/10 bg-[#0A1020]">
        <div className="bg-gradient-to-r from-cyan-400/20 via-sky-400/10 to-violet-400/15 p-4 text-white">
          <div className="flex items-center justify-between"><h3 className="text-lg font-medium">Detail Invoice</h3>{getStatusBadge()}</div>
        </div>

        <CardContent className="p-0">
          <div className="flex flex-col justify-between gap-4 border-b border-white/8 p-5 md:flex-row">
            <div className="flex items-center space-x-3"><div className="rounded-full bg-[#070B15] p-2"><CreditCard className="h-5 w-5 text-cyan-300" /></div><div><p className="text-sm text-gray-400">ID Transaksi</p><p className="rounded border border-white/8 bg-[#070B15] px-2 py-1 font-mono text-sm text-gray-300">{transactionId}</p></div></div>
            <div className="flex items-center space-x-3"><div className="rounded-full bg-[#070B15] p-2"><Calendar className="h-5 w-5 text-cyan-300" /></div><div><p className="text-sm text-gray-400">Tanggal</p><p className="text-sm text-white">{formatDate(createdAt)}</p></div></div>
          </div>

          <div className="border-b border-white/8 p-5">
            <h4 className="mb-3 text-sm font-medium uppercase text-gray-400">Informasi Pelanggan</h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-start space-x-3">
                <div className="mt-1 rounded-full bg-[#070B15] p-2">{redfinger ? <Phone className="h-4 w-4 text-cyan-300" /> : alightMotion ? <Package className="h-4 w-4 text-cyan-300" /> : <User className="h-4 w-4 text-cyan-300" />}</div>
                <div><p className="text-sm text-gray-400">{redfinger ? "Nomor WhatsApp" : alightMotion ? "Produk Digital" : "Nama Pengguna"}</p><p className="font-medium text-white">{redfinger ? phone || "-" : alightMotion ? "AM Premium" : username}</p></div>
              </div>
              <div className="flex items-start space-x-3"><div className="mt-1 rounded-full bg-[#070B15] p-2"><Mail className="h-4 w-4 text-cyan-300" /></div><div><p className="text-sm text-gray-400">Email</p><p className="font-medium text-white">{email}</p></div></div>
            </div>
          </div>

          <div className="border-b border-white/8 p-5">
            <h4 className="mb-3 text-sm font-medium uppercase text-gray-400">{redfinger || alightMotion ? "Detail Produk" : "Detail Paket"}</h4>
            <div className="mb-4 flex items-start space-x-3"><div className="mt-1 rounded-full bg-[#070B15] p-2">{redfinger ? <Cloud className="h-4 w-4 text-cyan-300" /> : <Package className="h-4 w-4 text-cyan-300" />}</div><div className="flex-1"><p className="text-sm text-gray-400">Produk</p><p className="text-lg font-medium text-white">{productName || plan?.name || "Paket"}</p></div></div>

            <div className="rounded-2xl border border-white/8 bg-[#070B15] p-4">
              {redfinger ? (
                <div className="grid grid-cols-2 gap-4 text-sm"><div><p className="text-gray-400">Jenis</p><p className="font-medium text-white">Redeem Code</p></div><div><p className="text-gray-400">Masa Aktif</p><p className="font-medium text-white">{duration || "-"}</p></div></div>
              ) : alightMotion ? (
                <div className="grid grid-cols-2 gap-4 text-sm"><div><p className="text-gray-400">Layanan</p><p className="font-medium text-white">AM Premium</p></div><div><p className="text-gray-400">Masa Aktif</p><p className="font-medium text-white">{duration || "1 Tahun"}</p></div></div>
              ) : plan ? (
                plan.category === "admin-panel" ? <div className="text-sm"><p className="text-gray-400">Jenis Akses</p><p className="font-medium text-white">Administrator Pterodactyl</p></div> :
                <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3"><div><p className="text-gray-400">RAM</p><p className="font-medium text-white">{plan.memory === 0 ? "Unlimited" : `${plan.memory} MB`}</p></div><div><p className="text-gray-400">Disk</p><p className="font-medium text-white">{plan.disk === 0 ? "Unlimited" : `${plan.disk} MB`}</p></div><div><p className="text-gray-400">CPU</p><p className="font-medium text-white">{plan.cpu === 0 ? "Unlimited" : `${plan.cpu}%`}</p></div></div>
              ) : <p className="text-gray-400">Detail paket tidak tersedia</p>}
            </div>
          </div>

          <div className="p-5">
            <h4 className="mb-3 text-sm font-medium uppercase text-gray-400">Ringkasan Pembayaran</h4>
            <div className="space-y-3"><div className="flex justify-between text-sm"><span className="text-gray-400">Subtotal:</span><span className="text-white">{formatRupiah(amount)}</span></div><div className="flex justify-between text-sm"><span className="text-gray-400">Biaya Admin:</span><span className="text-white">{formatRupiah(fee)}</span></div><div className="my-3 h-px bg-white/8" /><div className="flex justify-between font-medium"><span className="text-white">Total:</span><span className="text-xl text-cyan-200">{formatRupiah(total)}</span></div></div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
