"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import nodemailer from "nodemailer"
import { appConfig } from "@/data/config"
import {
  createReset,
  createUser,
  loginUser,
  resetPassword,
  SESSION_COOKIE,
} from "@/lib/auth"

const enc = (value: string) => encodeURIComponent(value)

export async function registerAction(formData: FormData) {
  const username = String(formData.get("username") || "").trim()
  const email = String(formData.get("email") || "").trim().toLowerCase()
  const password = String(formData.get("password") || "")

  if (username.length < 3 || password.length < 6 || !email.includes("@")) {
    redirect(`/register?error=${enc("Data belum valid. Username minimal 3 karakter dan password minimal 6 karakter.")}`)
  }

  let errorMessage = ""

  try {
    await createUser(username, email, password)
  } catch (error: any) {
    console.error("REGISTER ERROR:", error)
    errorMessage = error?.message || "Gagal membuat akun. Silakan coba lagi."
  }

  if (errorMessage) {
    redirect(`/register?error=${enc(errorMessage)}`)
  }

  redirect(`/login?success=${enc("Akun berhasil dibuat. Silakan login.")}`)
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

  if (failed) {
    redirect(`/login?error=${enc("Terjadi kesalahan saat menghubungkan akun. Silakan coba lagi.")}`)
  }

  if (!result) {
    redirect(`/login?error=${enc("Email atau password salah.")}`)
  }

  const jar = await cookies()
  jar.set(SESSION_COOKIE, result.token, {
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
  jar.delete(SESSION_COOKIE)
  redirect("/")
}

export async function forgotAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase()

  if (!email || !email.includes("@")) {
    redirect(`/forgot-password?error=${enc("Masukkan email yang valid.")}`)
  }

  let resetToken: string | null = null
  let createFailed = false

  try {
    resetToken = await createReset(email)
  } catch (error) {
    console.error("CREATE RESET ERROR:", error)
    createFailed = true
  }

  if (createFailed) {
    redirect(`/forgot-password?error=${enc("Terjadi kesalahan. Silakan coba lagi.")}`)
  }

  if (!resetToken) {
    redirect(`/forgot-password?success=${enc("Jika email terdaftar, link reset password akan dikirim.")}`)
  }

  const appUrl = (process.env.APP_URL || "https://www.tokopanelbrockstore.my.id").replace(/\/$/, "")
  const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(resetToken)}`

  let emailFailed = false

  try {
    const transporter = nodemailer.createTransport({
      host: appConfig.emailSender.host,
      port: appConfig.emailSender.port,
      secure: appConfig.emailSender.secure,
      auth: {
        user: appConfig.emailSender.auth.user,
        pass: appConfig.emailSender.auth.pass,
      },
    })

    await transporter.sendMail({
      from: appConfig.emailSender.from,
      to: email,
      subject: "Reset Password BROCK STORE",
      text: `Reset password akun BROCK STORE kamu:\n\n${resetUrl}\n\nLink ini memiliki masa berlaku terbatas.`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6">
          <h2>Reset Password BROCK STORE</h2>
          <p>Kami menerima permintaan reset password untuk akun kamu.</p>
          <p><a href="${resetUrl}">Reset Password</a></p>
          <p>Jika kamu tidak meminta reset password, abaikan email ini.</p>
        </div>
      `,
    })
  } catch (error) {
    console.error("RESET EMAIL ERROR:", error)
    emailFailed = true
  }

  if (emailFailed) {
    redirect(`/forgot-password?error=${enc("Email reset gagal dikirim. Silakan coba lagi.")}`)
  }

  redirect(`/forgot-password?success=${enc("Jika email terdaftar, link reset password akan dikirim.")}`)
}

export async function resetAction(formData: FormData) {
  const token = String(formData.get("token") || "")
  const password = String(formData.get("password") || "")

  if (!token) {
    redirect(`/reset-password?error=${enc("Token reset tidak ditemukan.")}`)
  }

  if (password.length < 6) {
    redirect(`/reset-password?token=${encodeURIComponent(token)}&error=${enc("Password minimal 6 karakter.")}`)
  }

  let success = false
  let failed = false

  try {
    success = await resetPassword(token, password)
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error)
    failed = true
  }

  if (failed) {
    redirect(`/reset-password?token=${encodeURIComponent(token)}&error=${enc("Terjadi kesalahan saat reset password.")}`)
  }

  if (!success) {
    redirect(`/reset-password?error=${enc("Token tidak valid atau sudah kedaluwarsa.")}`)
  }

  redirect(`/login?success=${enc("Password berhasil diubah. Silakan login.")}`)
}
