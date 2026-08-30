import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, LockKeyhole, Mail, User } from "lucide-react"
import { forgotAction, loginAction, registerAction, resetAction } from "@/app/actions/auth"
import { appConfig } from "@/data/config"

type AuthMode = "login" | "register" | "forgot" | "reset"

export function AuthForm({
  mode,
  token = "",
  error = "",
  success = "",
}: {
  mode: AuthMode
  token?: string
  error?: string
  success?: string
}) {
  const title =
    mode === "login"
      ? "Selamat datang kembali."
      : mode === "register"
        ? "Buat akun BROCK STORE."
        : mode === "forgot"
          ? "Lupa password?"
          : "Buat password baru."

  const sub =
    mode === "login"
      ? "Login untuk menyimpan dan melihat transaksi akunmu."
      : mode === "register"
        ? "Daftar sekali, riwayat transaksi bisa tetap tersimpan."
        : mode === "forgot"
          ? "Masukkan email akunmu. Kami kirim link reset password."
          : "Masukkan password baru untuk akun BROCK STORE."

  const formAction =
    mode === "login"
      ? loginAction
      : mode === "register"
        ? registerAction
        : mode === "forgot"
          ? forgotAction
          : resetAction

  return (
    <main className="min-h-screen bg-[#050914] px-4 py-12 text-white">
      <div className="mx-auto max-w-md">
        <Link href="/" className="click-motion mb-8 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Home
        </Link>

        <div className="rounded-[2rem] border border-white/10 bg-white/[.025] p-6 shadow-2xl md:p-8">
          <div className="mb-7">
            <div className="relative mb-4 h-16 w-16 overflow-hidden rounded-2xl border border-cyan-300/20 bg-white/[.04] shadow-[0_8px_30px_rgba(56,189,248,.10)]">
              <Image
                src={appConfig.brand.logo}
                alt="Logo BROCK STORE"
                fill
                sizes="64px"
                className="object-cover"
                priority
              />
            </div>

            <div className="text-xs font-black tracking-[.25em] text-cyan-300">BROCK STORE</div>
            <h1 className="mt-2 text-3xl font-black">{title}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">{sub}</p>
          </div>

          <form action={formAction} className="space-y-4">
            {mode === "register" && (
              <Field name="username" label="Username" type="text" icon={<User className="h-4 w-4" />} />
            )}

            {(mode === "login" || mode === "register" || mode === "forgot") && (
              <Field name="email" label="Email Aktif" type="email" icon={<Mail className="h-4 w-4" />} />
            )}

            {(mode === "login" || mode === "register" || mode === "reset") && (
              <Field
                name="password"
                label={mode === "reset" ? "Password Baru" : "Password"}
                type="password"
                icon={<LockKeyhole className="h-4 w-4" />}
              />
            )}

            {mode === "reset" && <input type="hidden" name="token" value={token} />}

            {error && (
              <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">{error}</div>
            )}

            {success && (
              <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-200">{success}</div>
            )}

            {mode === "login" && (
              <div className="text-right">
                <Link href="/forgot-password" className="click-motion inline-block text-xs font-bold text-cyan-300 hover:text-cyan-200">
                  Lupa Password?
                </Link>
              </div>
            )}

            <button
              type="submit"
              className="click-motion relative z-10 h-12 w-full cursor-pointer rounded-xl bg-gradient-to-r from-cyan-300 to-sky-400 font-black text-slate-950 shadow-[0_10px_30px_rgba(56,189,248,.10)] hover:brightness-110 hover:shadow-[0_12px_35px_rgba(56,189,248,.22)] active:scale-[0.97]"
            >
              {mode === "login"
                ? "Login"
                : mode === "register"
                  ? "Buat Akun"
                  : mode === "forgot"
                    ? "Kirim Link Reset"
                    : "Simpan Password Baru"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            {mode === "login" && (
              <>
                Belum punya akun?{" "}
                <Link className="click-motion inline-block font-bold text-cyan-300 hover:text-cyan-200" href="/register">Daftar</Link>
              </>
            )}

            {mode === "register" && (
              <>
                Sudah punya akun?{" "}
                <Link className="click-motion inline-block font-bold text-cyan-300 hover:text-cyan-200" href="/login">Login</Link>
              </>
            )}

            {(mode === "forgot" || mode === "reset") && (
              <Link className="click-motion inline-block font-bold text-cyan-300 hover:text-cyan-200" href="/login">Kembali ke Login</Link>
            )}
          </div>

          {mode === "login" && (
            <Link href="/store" className="click-motion mt-4 block text-center text-xs text-slate-500 hover:text-white">
              Lanjut belanja sebagai tamu →
            </Link>
          )}
        </div>
      </div>
    </main>
  )
}

function Field({ name, label, type, icon }: { name: string; label: string; type: string; icon: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-400">
        {icon}
        {label}
      </span>
      <input
        name={name}
        type={type}
        required
        autoComplete={type === "password" ? "current-password" : name === "email" ? "email" : "username"}
        className="h-12 w-full rounded-xl border border-white/10 bg-[#070B15] px-4 outline-none transition-all duration-200 focus:border-cyan-300/50 focus:shadow-[0_0_20px_rgba(34,211,238,.06)]"
      />
    </label>
  )
}
