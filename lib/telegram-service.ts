import { appConfig } from "@/data/config"

async function sendTelegramMessage(message: string) {
  try {
    if (!appConfig.telegram.botToken || !appConfig.telegram.ownerId) {
      return { success: false, error: "Telegram belum dikonfigurasi" }
    }

    const response = await fetch(`https://api.telegram.org/bot${appConfig.telegram.botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: appConfig.telegram.ownerId, text: message }),
    })

    const data = await response.json()
    if (!data.ok) throw new Error(`Telegram API error: ${data.description}`)
    return { success: true }
  } catch (error) {
    console.error("Error sending Telegram notification:", error)
    return { success: false, error }
  }
}

export async function sendTelegramNotification(
  userId: number,
  invoiceDate: string,
  price: number,
  planName: string,
  email: string,
) {
  const message =
    `🔔 Pesanan Panel Berhasil\n\n` +
    `👤 User ID: ${userId}\n` +
    `📅 Invoice: ${formatDate(invoiceDate)}\n` +
    `💰 Harga: ${formatRupiah(price)}\n` +
    `📦 Produk: ${planName}\n` +
    `📧 Email: ${maskEmail(email)}`

  return sendTelegramMessage(message)
}

export async function sendRedfingerTelegramNotification(
  invoiceDate: string,
  price: number,
  productName: string,
  email: string,
  remainingStock: number,
) {
  const message =
    `🔔 Pesanan REDFINGER Berhasil\n\n` +
    `📅 Invoice: ${formatDate(invoiceDate)}\n` +
    `💰 Harga: ${formatRupiah(price)}\n` +
    `📦 Produk: ${productName}\n` +
    `📧 Email: ${maskEmail(email)}\n` +
    `✅ Status: Sukses\n` +
    `📊 Stok tersisa: ${remainingStock}`

  return sendTelegramMessage(message)
}

function maskEmail(email: string): string {
  const [username = "", domain = ""] = String(email || "").split("@")
  if (!domain) return "***"
  if (username.length <= 3) return `${username}***@${domain}`
  return `${username.substring(0, Math.ceil(username.length / 2))}***@${domain}`
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
