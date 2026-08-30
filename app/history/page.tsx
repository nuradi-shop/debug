"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatDate, formatRupiah } from "@/lib/utils"
import Navbar from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Mail,
  Package,
  Trash2,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Eye,
  EyeOff,
} from "lucide-react"
import { CopyButton } from "@/components/copy-button"
import { pterodactylConfig } from "@/data/config"
import { plans } from "@/data/plans"
import { getTransactionById } from "@/app/actions/get-transactions"

interface TransactionHistory {
  transactionId: string
  username: string
  email: string
  planId: string
  planName: string
  total: number
  createdAt: string
  status: "completed" | "pending" | "paid" | "processing" | "failed"
  panelDetails?: {
    username: string
    password: string
    serverId: number | null
    type?: "panel-bot" | "admin-panel"
    userId?: number
  }
}

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<TransactionHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionHistory | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showSensitiveData, setShowSensitiveData] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState<string | null>(null)
  const [loadingTransactions, setLoadingTransactions] = useState<{[key: string]: boolean}>({})
  const router = useRouter()

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const storedTransactions = localStorage.getItem("transactionHistory")
        if (storedTransactions) {
          let history = JSON.parse(storedTransactions)
          
          // Load all transactions from database
          const updatedTransactions: TransactionHistory[] = []
          
          for (const transaction of history) {
            try {
              const dbTransaction = await getTransactionById(transaction.transactionId)
              
              if (dbTransaction) {
                // Use data from database, fallback to local data
                const updatedTransaction: TransactionHistory = {
                  transactionId: dbTransaction.transactionId || transaction.transactionId,
                  username: dbTransaction.username || transaction.username,
                  email: transaction.email || dbTransaction.email,
                  planId: dbTransaction.planId || transaction.planId,
                  planName: dbTransaction.planName || transaction.planName,
                  total: dbTransaction.total || transaction.total,
                  createdAt: dbTransaction.createdAt || transaction.createdAt,
                  status: dbTransaction.status || transaction.status,
                  panelDetails: transaction.panelDetails // Keep panel details from local
                }
                updatedTransactions.push(updatedTransaction)
              } else {
                // If not found in DB, use local data and try to fix plan name
                if (!transaction.planName || transaction.planName === "Unknown" || transaction.planName === "Unknown Plan") {
                  const plan = plans.find((p) => p?.id === transaction.planId)
                  if (plan) {
                    transaction.planName = plan.name
                  }
                }
                updatedTransactions.push(transaction)
              }
            } catch (error) {
              console.error(`Error loading transaction ${transaction.transactionId}:`, error)
              // Use local data as fallback
              if (!transaction.planName || transaction.planName === "Unknown" || transaction.planName === "Unknown Plan") {
                const plan = plans.find((p) => p?.id === transaction.planId)
                if (plan) {
                  transaction.planName = plan.name
                }
              }
              updatedTransactions.push(transaction)
            }
          }
          
          setTransactions(updatedTransactions)
        }
      } catch (error) {
        console.error("Error loading transaction history:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTransactions()
  }, [])

  const handleViewDetails = async (transaction: TransactionHistory) => {
    setLoadingDetails(transaction.transactionId)
    try {
      // Fetch latest transaction data from database
      const dbTransaction = await getTransactionById(transaction.transactionId)
      
      if (dbTransaction) {
        // Merge local data with database data
        const updatedTransaction: TransactionHistory = {
          ...transaction,
          email: transaction.email || dbTransaction.email,
          planId: dbTransaction.planId || transaction.planId,
          planName: dbTransaction.planName || transaction.planName,
          total: dbTransaction.total || transaction.total,
          createdAt: dbTransaction.createdAt || transaction.createdAt,
          status: dbTransaction.status || transaction.status,
          // Keep existing panelDetails if not available from DB
          panelDetails: transaction.panelDetails
        }
        
        setSelectedTransaction(updatedTransaction)
      } else {
        // If not found in DB, use local data
        setSelectedTransaction(transaction)
      }
      setShowDetails(true)
      setShowSensitiveData(false)
    } catch (error) {
      console.error("Error fetching transaction details:", error)
      // Fallback to local data if DB fetch fails
      setSelectedTransaction(transaction)
      setShowDetails(true)
      setShowSensitiveData(false)
    } finally {
      setLoadingDetails(null)
    }
  }

  const handleCloseDetails = () => {
    setShowDetails(false)
    setSelectedTransaction(null)
    setShowSensitiveData(false)
  }

  const toggleSensitiveData = () => {
    setShowSensitiveData(!showSensitiveData)
  }

  const handleClearHistory = () => {
    if (confirm("Apakah Anda yakin ingin menghapus semua riwayat transaksi?")) {
      localStorage.removeItem("transactionHistory")
      setTransactions([])
    }
  }

  // Helper function to safely format dates
  const safeFormatDate = (dateString: string ) => {
    try {
      // Handle ISO format and other date formats
      let date: Date
      
      // Check if it's already a valid Date object
      if (dateString instanceof Date) {
        date = dateString
      } 
      // Check if it's an ISO string
      else if (typeof dateString === 'string') {
        // Try parsing as ISO string first
        date = new Date(dateString)
        
        // If invalid, try other common formats
        if (isNaN(date.getTime())) {
          // Try removing timezone info and parse
          const withoutTimezone = dateString.replace(/[A-Z]/gi, ' ').trim()
          date = new Date(withoutTimezone)
          
          // If still invalid, return fallback
          if (isNaN(date.getTime())) {
            return "Tanggal tidak valid"
          }
        }
      } else {
        return "Tanggal tidak valid"
      }
      
      return formatDate(date)
    } catch (error) {
      console.error("Error formatting date:", error, dateString)
      return "Tanggal tidak valid"
    }
  }

  // Helper function to mask sensitive data
  const maskData = (text: string) => {
    if (!showSensitiveData) {
      return text.replace(/./g, "•")
    }
    return text
  }

  // Refresh single transaction from database
  const refreshTransaction = async (transactionId: string) => {
    setLoadingTransactions(prev => ({...prev, [transactionId]: true}))
    try {
      const dbTransaction = await getTransactionById(transactionId)
      
      if (dbTransaction) {
        setTransactions(prev => prev.map(transaction => 
          transaction.transactionId === transactionId 
            ? {
                ...transaction,
                email: transaction.email || dbTransaction.email,
                planId: dbTransaction.planId || transaction.planId,
                planName: dbTransaction.planName || transaction.planName,
                total: dbTransaction.total || transaction.total,
                createdAt: dbTransaction.createdAt || transaction.createdAt,
                status: dbTransaction.status || transaction.status,
              }
            : transaction
        ))
      }
    } catch (error) {
      console.error(`Error refreshing transaction ${transactionId}:`, error)
    } finally {
      setLoadingTransactions(prev => ({...prev, [transactionId]: false}))
    }
  }

  return (
    <div className="min-h-screen bg-[#070A10] text-white">
      <Navbar />
      <main className="relative overflow-hidden px-4 pb-20 pt-28 md:px-6">
        <div className="pointer-events-none absolute inset-0 hero-grid opacity-20" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-cyan-200"><ArrowLeft className="h-4 w-4" /> Kembali</Link>
              <p className="mt-5 text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">Transaction Center</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">Riwayat transaksi</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">Semua transaksi yang tersimpan di perangkat ini ditampilkan dalam kartu ringkas.</p>
            </div>
            {transactions.length > 0 && (
              <Button variant="outline" onClick={handleClearHistory} className="rounded-xl border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.07] hover:text-white"><Trash2 className="mr-2 h-4 w-4" /> Hapus Riwayat</Button>
            )}
          </div>

          {isLoading ? (
            <StateCard icon={<Loader2 className="h-6 w-6 animate-spin" />} title="Memuat riwayat" text="Sebentar, data transaksi sedang disiapkan." />
          ) : transactions.length === 0 ? (
            <StateCard icon={<Clock className="h-6 w-6" />} title="Belum ada transaksi" text="Pesanan yang kamu buat akan otomatis muncul di halaman ini." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {transactions.map((transaction) => {
                const status = transaction.status
                const statusMeta = status === "completed"
                  ? { label: "Selesai", className: "border-emerald-300/15 bg-emerald-300/[0.05] text-emerald-300", icon: <CheckCircle className="h-3.5 w-3.5" /> }
                  : status === "paid" || status === "processing"
                    ? { label: "Diproses", className: "border-sky-300/15 bg-sky-300/[0.05] text-sky-300", icon: <Loader2 className="h-3.5 w-3.5 animate-spin" /> }
                    : status === "pending"
                      ? { label: "Menunggu", className: "border-amber-300/15 bg-amber-300/[0.05] text-amber-300", icon: <Clock className="h-3.5 w-3.5" /> }
                      : { label: "Gagal", className: "border-rose-300/15 bg-rose-300/[0.05] text-rose-300", icon: <AlertTriangle className="h-3.5 w-3.5" /> }

                return (
                  <div key={transaction.transactionId} className="rounded-[22px] border border-white/8 bg-[#0A1020] p-4 transition hover:border-cyan-300/15">
                    <div className="flex items-start justify-between gap-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-wider ${statusMeta.className}`}>{statusMeta.icon}{statusMeta.label}</span>
                      <button type="button" onClick={() => refreshTransaction(transaction.transactionId)} disabled={loadingTransactions[transaction.transactionId]} className="rounded-lg p-1.5 text-slate-600 hover:bg-white/5 hover:text-cyan-200">
                        <Loader2 className={`h-3.5 w-3.5 ${loadingTransactions[transaction.transactionId] ? "animate-spin" : ""}`} />
                      </button>
                    </div>
                    <h3 className="mt-4 line-clamp-1 text-sm font-black text-white">{transaction.planName || "Paket Panel"}</h3>
                    <p className="mt-1 text-xl font-black text-cyan-200">{formatRupiah(transaction.total)}</p>
                    <div className="mt-4 space-y-2 text-xs text-slate-500">
                      <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-cyan-300" /><span className="truncate">{transaction.email}</span></div>
                      <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-cyan-300" /><span>{safeFormatDate(transaction.createdAt)}</span></div>
                    </div>
                    <Button variant="outline" onClick={() => handleViewDetails(transaction)} disabled={loadingDetails === transaction.transactionId} className="mt-4 h-10 w-full rounded-xl border-white/8 bg-[#070B15] text-xs font-bold text-white hover:bg-white/[0.06]">
                      {loadingDetails === transaction.transactionId ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lihat Detail"}
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {showDetails && selectedTransaction && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-[#02040A]/80 p-4 backdrop-blur-md">
          <div className="max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-[28px] border border-cyan-300/15 bg-[#0A1020] shadow-[0_30px_100px_rgba(0,0,0,.55)]">
            <div className="h-1 bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400" />
            <div className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">Detail Transaksi</p><h2 className="mt-1 text-xl font-black">{selectedTransaction.planName}</h2></div>
                <button onClick={handleCloseDetails} className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-xs font-bold text-slate-400 hover:text-white">Tutup</button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <Detail label="Total" value={formatRupiah(selectedTransaction.total)} accent />
                <Detail label="Tanggal" value={safeFormatDate(selectedTransaction.createdAt)} />
                <div className="col-span-2"><Detail label="ID Transaksi" value={selectedTransaction.transactionId} /></div>
                <Detail label="Username" value={selectedTransaction.username} />
                <Detail label="Email" value={selectedTransaction.email} />
              </div>

              {selectedTransaction.panelDetails && (
                <div className="mt-5 rounded-[22px] border border-white/8 bg-[#070B15] p-4">
                  <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-black">Akses Panel</h3><button onClick={toggleSensitiveData} className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-200">{showSensitiveData ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}{showSensitiveData ? "Sembunyikan" : "Tampilkan"}</button></div>
                  <div className="mt-4 space-y-3">
                    <Sensitive label="Username" value={maskData(selectedTransaction.panelDetails.username)} copyValue={selectedTransaction.panelDetails.username} />
                    <Sensitive label="Password" value={maskData(selectedTransaction.panelDetails.password)} copyValue={selectedTransaction.panelDetails.password} />
                    {selectedTransaction.panelDetails.type === "admin-panel" || selectedTransaction.panelDetails.serverId === null ? (
                      <Detail label="Hak Akses" value="Administrator" />
                    ) : (
                      <Sensitive label="Server ID" value={String(selectedTransaction.panelDetails.serverId)} copyValue={String(selectedTransaction.panelDetails.serverId)} />
                    )}
                  </div>
                  <a href={pterodactylConfig.domain} target="_blank" rel="noopener noreferrer" className="mt-4 flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 to-sky-400 text-sm font-black text-[#041017]"><ExternalLink className="h-4 w-4" /> Buka Panel</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  )
}

function StateCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="rounded-[28px] border border-cyan-300/10 bg-[#0A1020] px-6 py-14 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/5 text-cyan-200">{icon}</div><h3 className="mt-4 text-lg font-black">{title}</h3><p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{text}</p></div>
}

function Detail({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return <div className="rounded-2xl border border-white/7 bg-white/[0.025] p-3"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-600">{label}</p><p className={`mt-1 break-all text-xs font-bold ${accent ? "text-cyan-200" : "text-slate-200"}`}>{value}</p></div>
}

function Sensitive({ label, value, copyValue }: { label: string; value: string; copyValue: string }) {
  return <div><div className="mb-1 flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">{label}</span><CopyButton text={copyValue} /></div><div className="rounded-xl border border-white/6 bg-black/20 px-3 py-2 font-mono text-xs text-slate-300">{value}</div></div>
}
