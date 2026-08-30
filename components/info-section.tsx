"use client"

import { motion } from "framer-motion"
import { Shield, Zap, CalendarClock, Cpu, Clock, CreditCard, Mail, PackageCheck, Cloud, KeyRound } from "lucide-react"
import type { StoreCategory } from "@/data/store-categories"

const panelFeatures = [
  { icon: Shield, title: "Keamanan", text: "Data akun dan akses panel dijaga dengan sistem yang lebih aman." },
  { icon: Zap, title: "Performa", text: "Server stabil untuk kebutuhan bot harian sampai penggunaan berat." },
  { icon: CalendarClock, title: "Masa Aktif", text: "Masa aktif jelas dengan dukungan garansi sesuai ketentuan layanan." },
  { icon: Cpu, title: "Resource Jelas", text: "RAM, disk, dan CPU tampil transparan di setiap paket." },
  { icon: Clock, title: "Online 24/7", text: "Panel dirancang aktif nonstop agar layanan tetap bisa diakses kapan saja." },
  { icon: CreditCard, title: "Pembayaran", text: "Alur checkout tetap cepat dengan pembayaran QRIS yang praktis." },
]

const redfingerFeatures = [
  { icon: Zap, title: "Proses Otomatis", text: "Redeem code diproses otomatis setelah pembayaran berhasil." },
  { icon: Mail, title: "Pengiriman Cepat", text: "Kode tampil di invoice dan dikirim otomatis ke email pembeli." },
  { icon: PackageCheck, title: "Stok Real-Time", text: "Ketersediaan produk mengikuti jumlah kode yang masih tersedia di sistem." },
  { icon: KeyRound, title: "Kode Terjaga", text: "Redeem code hanya dialokasikan setelah transaksi terkonfirmasi berhasil." },
  { icon: Cloud, title: "Pilihan VIP", text: "Tersedia paket REDFINGER VIP 7 Hari dan VIP 30 Hari." },
  { icon: CreditCard, title: "Pembayaran Praktis", text: "Checkout tetap memakai QRIS Sakurupiah seperti produk lainnya." },
]

export function InfoSection({ category }: { category: StoreCategory }) {
  const redfinger = category === "redfinger"
  const features = redfinger ? redfingerFeatures : panelFeatures

  return (
    <section className="border-b border-white/5 bg-[#090D14] py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">Kenapa pilih kami</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">{redfinger ? "Redeem lebih praktis." : "Bukan cuma jual panel."}</h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-500">
              {redfinger
                ? "Informasi produk dibuat fokus ke masa aktif, stok, proses otomatis, dan pengiriman redeem code setelah pembayaran berhasil."
                : "Tampilan dibuat fokus ke informasi penting: kategori, spesifikasi, harga, dan proses beli."}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {features.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div key={item.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }} className="rounded-2xl border border-white/7 bg-white/[0.025] p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-300/10 text-violet-200"><Icon className="h-5 w-5" /></div>
                    <div><h3 className="text-sm font-bold text-white">{item.title}</h3><p className="mt-2 text-xs leading-6 text-slate-500">{item.text}</p></div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
