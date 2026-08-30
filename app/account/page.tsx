import Link from "next/link"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getUserBySession, SESSION_COOKIE } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { appConfig } from "@/data/config"
import { logoutAction } from "@/app/actions/auth"

export default async function AccountPage() {
  const jar=await cookies()
  const user=await getUserBySession(jar.get(SESSION_COOKIE)?.value)
  if(!user) redirect("/login")
  const db=(await clientPromise).db(appConfig.mongodb.dbName)
  const tx=await db.collection("payments").find({userId:user.id}).sort({createdAt:-1}).limit(50).toArray()
  return <main className="min-h-screen bg-[#050914] px-4 py-10 text-white">
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><div className="text-xs font-black tracking-[.24em] text-cyan-300">AKUN BROCK STORE</div><h1 className="mt-2 text-3xl font-black">Halo, {user.username}</h1><p className="mt-1 text-sm text-slate-400">{user.email}</p></div>
        <div className="flex gap-2"><Link href="/store" className="rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-black text-slate-950">Belanja</Link><form action={logoutAction}><button className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold">Logout</button></form></div>
      </div>
      <div className="mt-10"><h2 className="text-xl font-black">Riwayat Transaksi Akun</h2><p className="mt-2 text-sm text-slate-500">Transaksi baru yang dibuat saat kamu login akan tersimpan di sini.</p></div>
      <div className="mt-5 space-y-3">
        {tx.length===0 ? <div className="rounded-2xl border border-white/10 bg-white/[.025] p-6 text-sm text-slate-400">Belum ada transaksi yang terhubung ke akun ini.</div> : tx.map((t:any)=><Link key={t.transactionId} href={`/invoice/${t.transactionId}`} className="block rounded-2xl border border-white/10 bg-white/[.025] p-5 hover:border-cyan-300/30"><div className="flex flex-wrap justify-between gap-2"><div><div className="font-black">{t.productName||t.planId}</div><div className="mt-1 text-xs text-slate-500">{t.transactionId}</div></div><div className="text-right"><div className="font-black text-cyan-300">Rp {Number(t.total||0).toLocaleString("id-ID")}</div><div className="mt-1 text-xs uppercase text-slate-500">{t.status}</div></div></div></Link>)}
      </div>
    </div>
  </main>
}
