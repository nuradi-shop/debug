import nodemailer from "nodemailer"
import { appConfig, pterodactylConfig } from "@/data/config"

type PanelType = "panel-bot" | "admin-panel"

const transporter = nodemailer.createTransport({
  host: appConfig.emailSender.host,
  port: appConfig.emailSender.port,
  secure: appConfig.emailSender.secure,
  auth: {
    user: appConfig.emailSender.auth.user,
    pass: appConfig.emailSender.auth.pass,
  },
})

export async function sendRegistrationVerificationEmail(to: string, code: string) {
  const template = appConfig.emailTemplates.verification
  const minutes = appConfig.auth.verificationCodeMinutes

  return sendMailSafe({
    to,
    subject: template.subject,
    text: `${template.title}\n\nKode verifikasi pendaftaran kamu: ${code}\n\nKode berlaku selama ${minutes} menit.\n\nJangan berikan kode ini kepada siapa pun.\n\nBROCK STORE`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.7;color:#111;max-width:600px;margin:0 auto">
        <h2 style="margin-bottom:18px">${template.title}</h2>
        <p>Halo,</p>
        <p>Gunakan kode berikut untuk menyelesaikan pendaftaran akun BROCK STORE:</p>
        <div style="margin:24px 0;padding:18px;border-radius:12px;background:#f1f5f9;text-align:center;font-size:30px;font-weight:800;letter-spacing:8px">${code}</div>
        <p>Kode verifikasi ini berlaku selama <strong>${minutes} menit</strong>.</p>
        <p>Jangan berikan kode ini kepada siapa pun.</p>
        <p style="margin-top:32px;color:#888">BROCK STORE</p>
      </div>
    `,
  })
}

export async function sendResetPasswordEmail(to: string, resetUrl: string) {
  const template = appConfig.emailTemplates.resetPassword
  const minutes = appConfig.auth.resetPasswordMinutes

  return sendMailSafe({
    to,
    subject: template.subject,
    text: `Halo,\n\nKami menerima permintaan untuk mengganti password akun BROCK STORE.\n\nKlik link berikut untuk membuat password baru:\n\n${resetUrl}\n\nLink reset password ini berlaku selama ${minutes} menit.\n\nJika kamu tidak meminta penggantian password, abaikan email ini.\n\nBROCK STORE`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.7;color:#111;max-width:600px;margin:0 auto">
        <h2>${template.title}</h2>
        <p>Halo,</p>
        <p>Kami menerima permintaan untuk mengganti password akun BROCK STORE.</p>
        <p>Klik link berikut untuk membuat password baru:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>Link reset password ini berlaku selama <strong>${minutes} menit</strong>.</p>
        <p>Jika kamu tidak meminta penggantian password, abaikan email ini.</p>
        <p style="margin-top:32px;color:#888">BROCK STORE</p>
      </div>
    `,
  })
}

export async function sendPanelDetailsEmail(
  to: string,
  username: string,
  password: string,
  serverId: number | null,
  planName: string,
  panelType: PanelType = "panel-bot",
  transactionId?: string,
) {
  const panelUrl = pterodactylConfig.domain
  const isAdmin = panelType === "admin-panel"
  const template = isAdmin
    ? appConfig.emailTemplates.adminPanel
    : appConfig.emailTemplates.panelBot

  return sendMailSafe({
    to,
    subject: template.subject,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e0e0e0;border-radius:8px">
        <div style="background:linear-gradient(to right,#06b6d4,#3b82f6);padding:15px;border-radius:8px 8px 0 0">
          <h2 style="color:white;margin:0;text-align:center">${template.title}</h2>
        </div>
        <div style="padding:20px;background:#f8f9fa">
          <p>Halo,</p>
          <p>Pembayaran ${isAdmin ? "Admin Panel" : "Panel Bot"} kamu telah berhasil dan pesanan sudah diproses otomatis.</p>
          ${transactionId ? `<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:15px;margin:20px 0"><strong>ID Transaksi:</strong><div style="margin-top:8px;font-family:monospace;word-break:break-all">${transactionId}</div></div>` : ""}
          <div style="background:#fff;border:1px solid #e0e0e0;border-radius:8px;padding:15px;margin:20px 0">
            <p><strong>Paket:</strong> ${planName}</p>
            <p><strong>Username:</strong> ${username}</p>
            <p><strong>Password:</strong> <code style="background:#f0f0f0;padding:2px 4px;border-radius:3px">${password}</code></p>
            ${isAdmin ? `<p><strong>Hak Akses:</strong> Administrator</p>` : serverId !== null ? `<p><strong>Server ID:</strong> ${serverId}</p>` : ""}
            <p><strong>URL Panel:</strong> <a href="${panelUrl}" style="color:#0891b2">${panelUrl}</a></p>
          </div>
          <div style="text-align:center;margin:20px 0"><a href="${panelUrl}" style="background:#06b6d4;color:#041017;padding:11px 20px;text-decoration:none;border-radius:8px;font-weight:bold">Login Sekarang</a></div>
          <p>Simpan username dan password di atas dengan baik dan jangan membagikannya kepada orang lain.</p>
          <p>Jika mengalami kendala, silakan hubungi Admin ${appConfig.nameHost}.</p>
          <p style="margin-top:30px">Terima kasih telah berbelanja di ${appConfig.nameHost}.<br /><br />Salam,<br />Tim ${appConfig.nameHost}</p>
        </div>
      </div>
    `,
  })
}

export async function sendRedfingerDetailsEmail(
  to: string,
  productName: string,
  duration: string,
  redeemCode: string,
) {
  const template = appConfig.emailTemplates.redfinger

  return sendMailSafe({
    to,
    subject: template.subject,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e0e0e0;border-radius:8px">
        <div style="background:linear-gradient(to right,#06b6d4,#3b82f6,#8b5cf6);padding:15px;border-radius:8px 8px 0 0">
          <h2 style="color:white;margin:0;text-align:center">${template.title}</h2>
        </div>
        <div style="padding:20px;background:#f8f9fa">
          <p>Halo,</p>
          <p>Pembayaran REDFINGER kamu telah berhasil dan pesanan sudah diproses otomatis.</p>
          <div style="background:#fff;border:1px solid #e0e0e0;border-radius:8px;padding:18px;margin:20px 0">
            <p><strong>Produk:</strong> ${productName}</p>
            <p><strong>Masa Aktif:</strong> ${duration}</p>
            <p><strong>Redeem Code:</strong></p>
            <div style="font-family:monospace;font-size:20px;font-weight:bold;letter-spacing:1px;background:#f1f5f9;padding:14px;border-radius:8px;word-break:break-all">${redeemCode}</div>
          </div>
          <p>Simpan kode dengan baik dan jangan membagikannya kepada orang lain.</p>
          <p>Jika mengalami kendala terkait pesanan, silakan hubungi Admin ${appConfig.nameHost}.</p>
          <p style="margin-top:30px">Terima kasih telah berbelanja di ${appConfig.nameHost}.<br /><br />Salam,<br />Tim ${appConfig.nameHost}</p>
        </div>
      </div>
    `,
  })
}

async function sendMailSafe({
  to,
  subject,
  text,
  html,
}: {
  to: string
  subject: string
  text?: string
  html: string
}) {
  try {
    const info = await transporter.sendMail({
      from: appConfig.emailSender.from,
      to,
      subject,
      text,
      html,
    })

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error(`Error sending email (${subject}):`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
