import Link from "next/link"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import {
  ChevronRight,
  KeyRound,
  LogOut,
  Mail,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  UserRound,
} from "lucide-react"
import { getUserBySession, SESSION_COOKIE } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { appConfig } from "@/data/config"
import { logoutAction } from "@/app/actions/auth"

export default async function AccountPage() {
  const jar = await cookies()
  const user = await getUserBySession(jar.get(SESSION_COOKIE)?.value)

  if (!user) redirect("/login")

  const db = (await clientPromise).db(appConfig.mongodb.dbName)
  const tx = await db
    .collection("payments")
    .find({ userId: user.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray()

  return (
    <main className="min-h-screen bg-[#050914] px-4 py-8 text-white md:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-black tracking-[.24em] text-cyan-300">
              AKUN BROCK STORE
            </div>
            <h1 className="mt-2 text-3xl font-black md:text-4xl">Profil Akun</h1>
            <p className="mt-2 text-sm text-slate-400">
              Kelola informasi akun dan keamanan password kamu.
            </p>
          </div>

          <Link
            href="/store"
            className="click-motion inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-black text-slate-950 shadow-[0_10px_35px_rgba(103,232,249,.14)] hover:bg-cyan-200"
          >
            <ShoppingBag className="h-4 w-4" />
            Belanja
          </Link>
        </div>

        <section className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-white/[.055] to-white/[.018] shadow-2xl shadow-black/20">
          <div className="border-b border-white/10 bg-gradient-to-r from-cyan-300/[.09] via-transparent to-violet-400/[.07] p-6 md:p-7">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
                <UserRound className="h-7 w-7" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold uppercase tracking-[.18em] text-slate-500">
                  Akun aktif
                </div>
                <h2 className="mt-1 truncate text-2xl font-black">{user.username}</h2>
                <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Terhubung ke BROCK STORE
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 p-5 md:grid-cols-2 md:p-7">
            <div className="rounded-2xl border border-white/8 bg-[#070B15]/80 p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.15em] text-slate-500">
                <UserRound className="h-4 w-4 text-cyan-300" />
                Username
              </div>
              <div className="mt-2 break-all text-base font-black text-white">{user.username}</div>
            </div>

            <div className="rounded-2xl border border-white/8 bg-[#070B15]/80 p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.15em] text-slate-500">
                <Mail className="h-4 w-4 text-cyan-300" />
                Email
              </div>
              <div className="mt-2 break-all text-base font-black text-white">{user.email}</div>
            </div>
          </div>

          <div className="border-t border-white/10 p-5 md:p-7">
            <div className="mb-3 text-xs font-black uppercase tracking-[.18em] text-slate-500">
              Keamanan Akun
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Link
                href="/forgot-password"
                className="click-motion group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[.025] p-4 hover:border-cyan-300/25 hover:bg-cyan-300/[.045]"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-300/10 text-cyan-300">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black">Reset Password</div>
                    <div className="mt-0.5 text-xs text-slate-500">Kirim link reset ke email akun.</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-600 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-cyan-300" />
              </Link>

              <form action={logoutAction}>
                <button
                  type="submit"
                  className="click-motion group flex w-full items-center justify-between rounded-2xl border border-red-400/10 bg-red-400/[.035] p-4 text-left hover:border-red-400/25 hover:bg-red-400/[.065]"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-400/10 text-red-300">
                      <LogOut className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-black">Logout</div>
                      <div className="mt-0.5 text-xs text-slate-500">Keluar dari akun di perangkat ini.</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-600 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-red-300" />
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/[.04] text-cyan-300">
              <ReceiptText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black">Riwayat Transaksi</h2>
              <p className="mt-1 text-sm text-slate-500">
                Transaksi yang dibuat saat kamu login akan tersimpan di sini.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {tx.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[.025] p-6 text-sm text-slate-400">
                Belum ada transaksi yang terhubung ke akun ini.
              </div>
            ) : (
              tx.map((t: any) => (
                <Link
                  key={t.transactionId}
                  href={`/invoice/${t.transactionId}`}
                  className="click-motion block rounded-2xl border border-white/10 bg-white/[.025] p-5 hover:border-cyan-300/30 hover:bg-white/[.04]"
                >
                  <div className="flex flex-wrap justify-between gap-2">
                    <div>
                      <div className="font-black">{t.productName || t.planId}</div>
                      <div className="mt-1 text-xs text-slate-500">{t.transactionId}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-cyan-300">
                        Rp {Number(t.total || 0).toLocaleString("id-ID")}
                      </div>
                      <div className="mt-1 text-xs uppercase text-slate-500">{t.status}</div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
