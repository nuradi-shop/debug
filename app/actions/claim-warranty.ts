"use server"

import clientPromise from "@/lib/mongodb"
import { appConfig } from "@/data/config"
import { plans } from "@/data/plans"
import { Pterodactyl } from "@/lib/pterodactyl"
import { createPanel } from "./create-panel"

export async function claimWarranty(transactionId: string, email: string) {
  const id = transactionId.trim()
  const normalizedEmail = email.trim().toLowerCase()
  if (!id || !normalizedEmail) return { success: false, error: "ID transaksi dan email wajib diisi." }

  const client = await clientPromise
  const db = client.db(appConfig.mongodb.dbName)
  const payments = db.collection("payments")
  const trx = await payments.findOne({ transactionId: id })

  if (!trx || trx.status !== "completed") return { success: false, error: "Transaksi tidak ditemukan atau belum selesai." }
  if (String(trx.email || "").toLowerCase() !== normalizedEmail) return { success: false, error: "Email tidak sesuai dengan transaksi ini." }

  const purchaseTime = new Date(trx.createdAt).getTime()
  const ageDays = Math.floor((Date.now() - purchaseTime) / 86_400_000)
  if (!Number.isFinite(purchaseTime) || ageDays < 0 || ageDays >= appConfig.garansi.warrantyDays) {
    return { success: false, error: "Masa garansi transaksi ini sudah berakhir." }
  }

  const used = Number(trx.replaceUsed || 0)
  if (used >= appConfig.garansi.replaceLimit) return { success: false, error: "Batas maksimal klaim garansi sudah tercapai." }

  const plan = plans.find((p) => p.id === trx.planId)
  if (!plan) return { success: false, error: "Paket tidak ditemukan. Hubungi admin." }

  const pterodactyl = new Pterodactyl()
  const users = await pterodactyl.listUsers()
  const accountStillExists = users.some(
    (user) => user.username.toLowerCase() === String(trx.username).toLowerCase() || user.email.toLowerCase() === normalizedEmail,
  )
  if (accountStillExists) return { success: false, error: "Akun panel masih aktif. Garansi belum bisa digunakan." }

  const replaceFilter = used === 0
    ? { $or: [{ replaceUsed: 0 }, { replaceUsed: { $exists: false } }] }
    : { replaceUsed: used }

  const reserved = await payments.updateOne(
    { transactionId: id, status: "completed", warrantyProcessing: { $ne: true }, ...replaceFilter },
    { $set: { warrantyProcessing: true } },
  )
  if (reserved.modifiedCount !== 1) return { success: false, error: "Klaim sedang diproses atau sudah digunakan. Silakan muat ulang halaman." }

  try {
    const panel = await createPanel({
      username: trx.username,
      email: trx.email,
      memory: plan.memory,
      disk: plan.disk,
      cpu: plan.cpu,
      planId: trx.planId,
      createdAt: new Date().toISOString(),
    })

    await payments.updateOne(
      { transactionId: id, warrantyProcessing: true },
      { $inc: { replaceUsed: 1 }, $unset: { warrantyProcessing: "" } },
    )

    return {
      success: true,
      panelDetails: {
        username: trx.username,
        password: panel.password,
        serverId: panel.serverId ?? null,
        type: panel.type || plan.category,
        userId: panel.userId,
      },
    }
  } catch (error) {
    await payments.updateOne({ transactionId: id }, { $unset: { warrantyProcessing: "" } })
    return { success: false, error: error instanceof Error ? error.message : "Terjadi kesalahan saat membuat panel pengganti." }
  }
}
