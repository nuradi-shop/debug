"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import {
  createReset,
  deletePendingRegistration,
  invalidateSession,
  loginUser,
  resendRegistrationCode,
  resetPassword,
  SESSION_COOKIE,
  startRegistration,
  verifyRegistration,
} from "@/lib/auth"
import {
  sendRegistrationVerificationEmail,
  sendResetPasswordEmail,
} from "@/lib/email-service"

const enc = (value: string) => encodeURIComponent(value)

export async function registerAction(formData: FormData) {
  const username = String(formData.get("username") || "").trim()
  const email = String(formData.get("email") || "").trim().toLowerCase()
  const password = String(formData.get("password") || "")

  if (username.length < 3 || password.length < 6 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect(`/register?error=${enc("Data belum valid. Username minimal 3 karakter dan password minimal 6 karakter.")}`)
  }

  let pending: Awaited<ReturnType<typeof startRegistration>> | null = null

  try {
    pending = await startRegistration(username, email, password)
  } catch (error: any) {
    console.error("REGISTER START ERROR:", error)
    redirect(`/register?error=${enc(error?.message || "Gagal memulai pendaftaran. Silakan coba lagi.")}`)
  }

  if (!pending) {
    redirect(`/register?error=${enc("Gagal memulai pendaftaran. Silakan coba lagi.")}`)
  }

  const registration = pending!
  const emailResult = await sendRegistrationVerificationEmail(registration.email, registration.code)

  if (!emailResult.success) {
    await deletePendingRegistration(registration.email)
    redirect(`/register?error=${enc("Kode verifikasi gagal dikirim. Periksa email lalu coba lagi.")}`)
  }

  redirect(`/verify-email?email=${enc(registration.email)}&success=${enc("Kode verifikasi telah dikirim ke email kamu.")}`)
}

export async function verifyRegistrationAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase()
  const code = String(formData.get("code") || "").replace(/\D/g, "").slice(0, 6)

  if (!email || code.length !== 6) {
    redirect(`/verify-email?email=${enc(email)}&error=${enc("Masukkan kode verifikasi 6 digit.")}`)
  }

  const result = await verifyRegistration(email, code)

  if (!result.ok) {
    const message =
      result.reason === "expired"
        ? "Kode verifikasi sudah kedaluwarsa. Silakan kirim ulang kode."
        : result.reason === "invalid"
          ? "Kode verifikasi tidak valid."
          : result.reason === "duplicate"
            ? "Email atau username sudah terdaftar. Silakan login."
            : "Data pendaftaran tidak ditemukan. Silakan daftar ulang."

    redirect(`/verify-email?email=${enc(email)}&error=${enc(message)}`)
  }

  redirect(`/login?success=${enc("Email berhasil diverifikasi. Akun sudah aktif, silakan login.")}`)
}

export async function resendVerificationAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase()

  if (!email) redirect(`/register?error=${enc("Silakan daftar ulang.")}`)

  const result = await resendRegistrationCode(email)

  if (!result.ok) {
    if (result.reason === "cooldown") {
      redirect(`/verify-email?email=${enc(email)}&error=${enc(`Tunggu ${result.retryAfter ?? 60} detik sebelum kirim ulang kode.`)}`)
    }

    redirect(`/register?error=${enc("Data pendaftaran tidak ditemukan. Silakan daftar ulang.")}`)
  }

  const emailResult = await sendRegistrationVerificationEmail(email, result.code)

  if (!emailResult.success) {
    redirect(`/verify-email?email=${enc(email)}&error=${enc("Kode verifikasi gagal dikirim ulang. Silakan coba lagi.")}`)
  }

  redirect(`/verify-email?email=${enc(email)}&success=${enc("Kode verifikasi baru sudah dikirim.")}`)
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase()
  const password = String(formData.get("password") || "")

  let result: Awaited<ReturnType<typeof loginUser>> = null
  let failed = false

  try {
    result = await loginUser(email, password)
  } catch (error) {
    console.error("LOGIN ERROR:", error)
    failed = true
  }

  if (failed) redirect(`/login?error=${enc("Terjadi kesalahan saat menghubungkan akun. Silakan coba lagi.")}`)
  if (!result) redirect(`/login?error=${enc("Email atau password salah.")}`)

  const loginResult = result!
  const jar = await cookies()
  jar.set(SESSION_COOKIE, loginResult.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })

  redirect("/store")
}

export async function logoutAction() {
  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value

  if (token) {
    await invalidateSession(token)
  }

  jar.delete(SESSION_COOKIE)
  redirect("/")
}

export async function forgotAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase()

  if (!email || !email.includes("@")) {
    redirect(`/forgot-password?error=${enc("Masukkan email yang valid.")}`)
  }

  let resetToken: string | null = null

  try {
    resetToken = await createReset(email)
  } catch (error) {
    console.error("CREATE RESET ERROR:", error)
    redirect(`/forgot-password?error=${enc("Terjadi kesalahan. Silakan coba lagi.")}`)
  }

  if (!resetToken) {
    redirect(`/forgot-password?success=${enc("Jika email terdaftar, link reset password akan dikirim.")}`)
  }

  const appUrl = (process.env.APP_URL || "https://www.tokopanelbrockstore.my.id").replace(/\/$/, "")
  const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(resetToken!)}`
  const emailResult = await sendResetPasswordEmail(email, resetUrl)

  if (!emailResult.success) {
    redirect(`/forgot-password?error=${enc("Email reset gagal dikirim. Silakan coba lagi.")}`)
  }

  redirect(`/forgot-password?success=${enc("Jika email terdaftar, link reset password akan dikirim.")}`)
}

export async function resetAction(formData: FormData) {
  const token = String(formData.get("token") || "")
  const password = String(formData.get("password") || "")

  if (!token) redirect(`/reset-password?error=${enc("Token reset tidak ditemukan.")}`)

  if (password.length < 6) {
    redirect(`/reset-password?token=${encodeURIComponent(token)}&error=${enc("Password minimal 6 karakter.")}`)
  }

  let success = false

  try {
    success = await resetPassword(token, password)
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error)
    redirect(`/reset-password?token=${encodeURIComponent(token)}&error=${enc("Terjadi kesalahan saat reset password.")}`)
  }

  if (!success) redirect(`/reset-password?error=${enc("Token tidak valid atau sudah kedaluwarsa.")}`)

  redirect(`/login?success=${enc("Password berhasil diubah. Silakan login.")}`)
}
