import Link from "next/link"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ArrowRight, Bot, Cloud, Crown, QrCode, ShieldCheck, Zap } from "lucide-react"
import { getUserBySession, SESSION_COOKIE } from "@/lib/auth"

const services = [
  {
    icon: Bot,
    title: "Panel Bot",
    text: "Panel Pterodactyl untuk bot WhatsApp, Telegram, Discord, dan kebutuhan lainnya.",
    href: "/store?product=panel-bot#order",
  },
  {
    icon: Crown,
    title: "Admin Panel",
    text: "Akses administrator untuk pengelolaan panel dengan proses pembelian yang praktis.",
    href: "/store?product=admin-panel#order",
  },
  {
    icon: Cloud,
    title: "Code REDFINGER",
    text: "Redeem Code VIP, KVIP, dan SVIP dengan stok real-time dan pengiriman otomatis.",
    href: "/store?product=redfinger#order",
  },
]

export default async function Home() {
  const jar = await cookies()
  const user = await getUserBySession(jar.get(SESSION_COOKIE)?.value)

  if (user) redirect("/store")

  return (
    <main className="min-h-screen bg-[#050914] text-white">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#050914]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="click-motion flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-blue-500 font-black text-[#041017]">B</div>
            <div>
              <div className="text-[10px] font-bold tracking-[.3em] text-slate-500">TOKO DIGITAL</div>
              <div className="font-black">BROCK STORE</div>
            </div>
          </Link>
          <div className="flex gap-2">
            <Link href="/login" className="click-motion rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold hover:bg-white/5">Login</Link>
            <Link href="/store" className="click-motion rounded-xl bg-gradient-to-r from-cyan-300 to-sky-400 px-4 py-2.5 text-sm font-black text-slate-950">Masuk Toko</Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[120px]" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 text-center md:px-6 md:py-32">
          <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/5 px-4 py-2 text-xs font-black tracking-[.18em] text-cyan-200">BROCK STORE • DIGITAL SERVICE</div>
          <h1 className="mx-auto mt-7 max-w-4xl text-5xl font-black leading-[1.02] tracking-tight md:text-7xl">Semua kebutuhan digital <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 bg-clip-text text-transparent">dalam satu tempat.</span></h1>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">Beli Panel Bot, Admin Panel, dan Redeem Code REDFINGER dengan pembayaran QRIS dan proses otomatis.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/store" className="click-motion inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-300 to-sky-400 px-6 py-3.5 font-black text-slate-950">Lihat Produk <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/login" className="click-motion rounded-2xl border border-white/10 bg-white/[.03] px-6 py-3.5 font-bold">Login Akun</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="mb-9 text-center">
          <div className="text-base font-black uppercase tracking-[.28em] text-cyan-300 md:text-lg">Layanan Kami</div>
          <h2 className="mt-3 text-3xl font-black md:text-4xl">Pilih produk yang kamu butuhkan</h2>
          <p className="mt-3 text-slate-400">Satu website untuk layanan digital BROCK STORE.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {services.map(({ icon: Icon, title, text, href }) => (
            <Link
              key={title}
              href={href}
              className="click-motion group block rounded-3xl border border-white/10 bg-white/[.025] p-6 hover:-translate-y-1 hover:border-cyan-300/25 hover:bg-white/[.04] hover:shadow-[0_18px_50px_rgba(34,211,238,.06)]"
            >
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-300"><Icon className="h-5 w-5" /></div>
              <h3 className="mt-5 text-xl font-black">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">{text}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-cyan-300">Lihat produk <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-10 md:grid-cols-4 md:px-6">
        {[["24/7", "Sistem Otomatis", Zap], ["QRIS", "Pembayaran Praktis", QrCode], ["Instan", "Proses Pesanan", ArrowRight], ["Aman", "Data & Transaksi", ShieldCheck]].map(([a, b, I]: any) => (
          <div key={a} className="rounded-2xl border border-white/10 bg-white/[.02] p-5 text-center"><I className="mx-auto h-5 w-5 text-cyan-300" /><div className="mt-3 text-2xl font-black text-cyan-300">{a}</div><div className="mt-1 text-xs text-slate-500">{b}</div></div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <div className="rounded-[2rem] border border-cyan-300/15 bg-gradient-to-br from-cyan-300/[.07] to-violet-400/[.06] p-8 text-center md:p-12">
          <h2 className="text-3xl font-black">Siap mulai belanja?</h2>
          <p className="mt-3 text-slate-400">Login untuk menyimpan riwayat, atau lanjut sebagai tamu.</p>
          <Link href="/store" className="click-motion mt-6 inline-flex rounded-2xl bg-cyan-300 px-6 py-3 font-black text-slate-950">Buka Katalog</Link>
        </div>
      </section>
    </main>
  )
}
