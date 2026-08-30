"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import type { StoreCategory } from "@/data/store-categories"

const panelFaqs = [
  { question: "Apa itu panel Pterodactyl?", answer: "Pterodactyl adalah platform manajemen server berbasis web yang memudahkan pengelolaan server bot dan layanan lainnya." },
  { question: "Apa kegunaan panel bot?", answer: "Panel bot digunakan untuk menjalankan bot WhatsApp, Telegram, Discord, dan script Node.js tanpa harus terus menyalakan perangkat pribadi." },
  { question: "Bagaimana cara klaim garansi?", answer: "Buka menu Garansi, lalu siapkan ID transaksi dan email yang digunakan saat pembelian." },
  { question: "Kenapa email atau username harus berbeda?", answer: "Sistem panel tidak mengizinkan akun ganda dengan email atau username yang sama karena dapat menyebabkan konflik data." },
  { question: "Bagaimana jika lupa password?", answer: "Gunakan fitur Forgot Password pada halaman login panel lalu masukkan email yang terdaftar." },
]

const redfingerFaqs = [
  { question: "Apa itu REDFINGER Cloud?", answer: "REDFINGER adalah layanan cloud phone Android yang dapat diakses secara online. Produk yang dijual di sini berupa Redeem Code sesuai paket yang dipilih." },
  { question: "Apa fungsi Redeem Code REDFINGER?", answer: "Redeem Code digunakan untuk mengaktifkan atau menambahkan layanan REDFINGER sesuai masa aktif paket yang dibeli." },
  { question: "Bagaimana cara menggunakan Redeem Code?", answer: "Setelah kode diterima, buka REDFINGER dan gunakan menu redeem atau aktivasi yang tersedia pada akun Anda." },
  { question: "Kapan Redeem Code saya diterima?", answer: "Setelah pembayaran terkonfirmasi berhasil, kode otomatis tampil di halaman invoice dan dikirim ke email aktif yang Anda masukkan." },
  { question: "Bagaimana jika kode tidak masuk ke email?", answer: "Cek folder Spam atau Promosi terlebih dahulu. Kode juga ditampilkan di invoice transaksi. Jika tetap ada kendala, hubungi Admin BROCK STORE." },
]

export function FaqSection({ category }: { category: StoreCategory }) {
  const [open, setOpen] = useState<number | null>(0)
  const redfinger = category === "redfinger"
  const faqs = redfinger ? redfingerFaqs : panelFaqs

  useEffect(() => setOpen(0), [category])

  return (
    <section id="faq" className="bg-[#090D14] py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 md:px-6 lg:grid-cols-[0.7fr_1.3fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">FAQ</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-white">Masih ada pertanyaan?</h2>
          <p className="mt-4 max-w-sm text-sm leading-7 text-slate-500">Jawaban cepat untuk hal yang paling sering ditanyakan sebelum membeli {redfinger ? "Code REDFINGER" : "panel"}.</p>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, index) => {
            const active = open === index
            return (
              <div key={faq.question} className={`rounded-2xl border transition ${active ? "border-cyan-300/20 bg-cyan-300/[0.035]" : "border-white/7 bg-white/[0.02]"}`}>
                <button onClick={() => setOpen(active ? null : index)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                  <span className="text-sm font-semibold text-slate-200">{faq.question}</span>
                  <Plus className={`h-4 w-4 shrink-0 text-cyan-300 transition ${active ? "rotate-45" : ""}`} />
                </button>
                <AnimatePresence>
                  {active && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><p className="px-5 pb-5 text-xs leading-6 text-slate-500">{faq.answer}</p></motion.div>}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
