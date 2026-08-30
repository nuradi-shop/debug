import Link from "next/link"
import { ArrowLeft, MailCheck, RefreshCw, ShieldCheck } from "lucide-react"
import {
  resendVerificationAction,
  verifyRegistrationAction,
} from "@/app/actions/auth"
import { appConfig } from "@/data/config"

function maskEmail(email: string) {
  const [name, domain] = email.split("@")
  if (!domain) return email
  const visible = name.slice(0, Math.min(3, name.length))
  return `${visible}${"*".repeat(Math.max(3, name.length - visible.length))}@${domain}`
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; error?: string; success?: string }>
}) {
  const params = await searchParams
  const email = (params.email || "").trim().toLowerCase()

  if (!email) {
    return (
      <main className="min-h-screen bg-[#050914] px-4 py-12 text-white">
        <div className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-white/[.025] p-7 text-center">
          <h1 className="text-2xl font-black">Data pendaftaran tidak ditemukan.</h1>
          <p className="mt-3 text-sm text-slate-400">Silakan mulai pendaftaran dari awal.</p>
          <Link href="/register" className="click-motion mt-6 inline-flex rounded-xl bg-cyan-300 px-5 py-3 font-black text-slate-950">Kembali ke Daftar</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050914] px-4 py-12 text-white">
      <div className="mx-auto max-w-md">
        <Link href="/register" className="click-motion mb-8 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar
        </Link>

        <div className="rounded-[2rem] border border-white/10 bg-white/[.025] p-6 shadow-2xl md:p-8">
          <div className="mb-7">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-sky-500 text-slate-950">
              <MailCheck className="h-6 w-6" />
            </div>
            <div className="mt-4 text-xs font-black tracking-[.25em] text-cyan-300">BROCK STORE</div>
            <h1 className="mt-2 text-3xl font-black">Verifikasi email.</h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Masukkan kode 6 digit yang kami kirim ke <span className="font-bold text-slate-200">{maskEmail(email)}</span>.
              Kode berlaku selama {appConfig.auth.verificationCodeMinutes} menit.
            </p>
          </div>

          <form action={verifyRegistrationAction} className="space-y-4">
            <input type="hidden" name="email" value={email} />
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-400">
                <ShieldCheck className="h-4 w-4" />
                Kode Pendaftaran
              </span>
              <input
                name="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                pattern="[0-9]{6}"
                required
                placeholder="000000"
                className="h-14 w-full rounded-xl border border-white/10 bg-[#070B15] px-4 text-center text-2xl font-black tracking-[.45em] outline-none transition focus:border-cyan-300/50"
              />
            </label>

            {params.error && (
              <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">{params.error}</div>
            )}

            {params.success && (
              <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-200">{params.success}</div>
            )}

            <button type="submit" className="click-motion h-12 w-full rounded-xl bg-gradient-to-r from-cyan-300 to-sky-400 font-black text-slate-950 hover:brightness-110 hover:shadow-[0_12px_35px_rgba(56,189,248,.22)]">
              Verifikasi & Aktifkan Akun
            </button>
          </form>

          <div className="mt-6 border-t border-white/8 pt-5 text-center">
            <p className="text-xs text-slate-500">Tidak menerima kode?</p>
            <form action={resendVerificationAction} className="mt-3">
              <input type="hidden" name="email" value={email} />
              <button type="submit" className="click-motion inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.03] px-4 py-2.5 text-sm font-bold text-cyan-300 hover:border-cyan-300/25 hover:bg-cyan-300/[.05]">
                <RefreshCw className="h-4 w-4" />
                Kirim Ulang Kode
              </button>
            </form>
            <p className="mt-3 text-[11px] leading-5 text-slate-600">Kirim ulang tersedia setiap {appConfig.auth.resendVerificationCooldownSeconds} detik.</p>
          </div>
        </div>
      </div>
    </main>
  )
}
