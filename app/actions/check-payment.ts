"use server"

import {
  getPayment,
  updatePaymentStatus,
  claimPaymentForProcessing,
  releasePaymentProcessing,
  completePaymentProcessing,
  completeRedfingerPaymentProcessing,
  completeAlightMotionPaymentProcessing,
} from "@/lib/payments"
import { plans } from "@/data/plans"
import { createPanel } from "./create-panel"
import { appConfig } from "@/data/config"
import {
  claimRedfingerCode,
  countAvailableRedfingerStock,
  getAssignedRedfingerCode,
  getRedfingerProduct,
} from "@/lib/redfinger"
import { sendRedfingerDetailsEmail, sendAlightMotionSharingEmail, sendAlightMotionPrivateEmail } from "@/lib/email-service"
import { claimSharingAccount, decrementPrivateStock, getAlightMotionProduct, getAssignedSharingAccount } from "@/lib/alight-motion"
import { sendRedfingerTelegramNotification } from "@/lib/telegram-service"

const API_ID = appConfig.pay.api_id
const API_KEY = appConfig.pay.api_key
const API_STATUS_URL = "https://sakurupiah.id/api/status-transaction.php"

export async function checkPaymentStatus(transactionId: string) {
  try {
    const payment = await getPayment(transactionId)
    if (!payment) return { success: false, error: "Pembayaran tidak ditemukan" }

    if (payment.status === "completed") {
      return {
        success: true,
        status: "completed" as const,
        panelDetails: payment.panelDetails,
        redfingerDetails: payment.redfingerDetails,
        alightMotionDetails: payment.alightMotionDetails,
      }
    }
    if (payment.status === "processing") return { success: true, status: "processing" as const }
    if (!API_ID || !API_KEY) return { success: false, error: "Konfigurasi pembayaran belum lengkap" }

    const form = new FormData()
    form.append("api_id", API_ID)
    form.append("method", "status")
    form.append("trx_id", payment.vpediaId)

    const response = await fetch(API_STATUS_URL, {
      method: "POST",
      body: form,
      headers: { Authorization: `Bearer ${API_KEY}` },
      cache: "no-store",
    })

    const raw = await response.text()
    let data: any
    try {
      data = JSON.parse(raw)
    } catch {
      console.error("Sakurupiah tidak mengembalikan JSON:", raw)
      return { success: false, error: "Response Sakurupiah tidak valid" }
    }

    if (String(data.status) !== "200") {
      return { success: false, error: data.message || "Gagal cek status pembayaran" }
    }

    const gatewayData = data.data?.[0] ?? {}
    const gatewayStatus = String(gatewayData.status ?? gatewayData.payment_status ?? "").toLowerCase()

    if (gatewayStatus === "pending") return { success: true, status: "pending" as const }

    if (["gagal", "failed", "expired"].includes(gatewayStatus)) {
      await updatePaymentStatus(transactionId, "failed")
      return { success: true, status: "failed" as const }
    }

    if (!["berhasil", "success", "paid"].includes(gatewayStatus)) {
      console.log("Unknown Sakurupiah status:", gatewayStatus)
      return { success: true, status: "pending" as const }
    }

    const claimed = await claimPaymentForProcessing(transactionId)
    if (!claimed) {
      const latest = await getPayment(transactionId)
      if (latest?.status === "completed") {
        return {
          success: true,
          status: "completed" as const,
          panelDetails: latest.panelDetails,
          redfingerDetails: latest.redfingerDetails,
          alightMotionDetails: latest.alightMotionDetails,
        }
      }
      if (latest?.status === "processing") return { success: true, status: "processing" as const }
      return { success: false, error: "Transaksi belum dapat diproses. Silakan cek kembali." }
    }

    if (payment.productType === "alight-motion") {
      try {
        const product:any = await getAlightMotionProduct(payment.planId)
        if (!product) throw new Error("Produk AM Premium tidak ditemukan")
        if (product.type === "sharing") {
          let account:any = await getAssignedSharingAccount(transactionId)
          if (!account) account = await claimSharingAccount(payment.planId, transactionId, payment.email)
          if (!account?.email || !account?.password) { await releasePaymentProcessing(transactionId); return {success:false,status:"paid" as const,error:"Pembayaran berhasil, tetapi stok akun AM Sharing sedang habis. Hubungi admin."} }
          const details={type:"alight-motion" as const,productName:product.name,duration:product.duration,accountType:"sharing" as const,accountEmail:account.email,accountPassword:account.password}
          const saved=await completeAlightMotionPaymentProcessing(transactionId,details); if(!saved) return {success:false,status:"processing" as const,error:"Akun sudah dialokasikan tetapi transaksi belum dapat difinalisasi."}
          await sendAlightMotionSharingEmail(payment.email,product.name,product.duration,account.email,account.password,transactionId)
          return {success:true,status:"completed" as const,alightMotionDetails:details}
        }
        const decremented=await decrementPrivateStock(payment.planId); if(!decremented){await releasePaymentProcessing(transactionId);return {success:false,status:"paid" as const,error:"Pembayaran berhasil, tetapi kuota AM Private sedang habis. Hubungi admin."}}
        const details={type:"alight-motion" as const,productName:product.name,duration:product.duration,accountType:"private" as const}
        const saved=await completeAlightMotionPaymentProcessing(transactionId,details); if(!saved) return {success:false,status:"processing" as const,error:"Pesanan private sudah dicatat tetapi transaksi belum dapat difinalisasi."}
        await sendAlightMotionPrivateEmail(payment.email,product.name,transactionId)
        return {success:true,status:"completed" as const,alightMotionDetails:details}
      } catch(error){console.error("Gagal memproses AM:",error);await releasePaymentProcessing(transactionId);return {success:false,status:"paid" as const,error:error instanceof Error?error.message:"AM Premium gagal diproses"}}
    }

    if (payment.productType === "redfinger") {
      let codeAssigned = false
      try {
        const product = await getRedfingerProduct(payment.planId)
        if (!product) throw new Error("Produk REDFINGER tidak ditemukan")

        let stockItem = await getAssignedRedfingerCode(transactionId)
        if (!stockItem) {
          stockItem = await claimRedfingerCode(
            payment.planId,
            transactionId,
            payment.email,
            payment.phone || "",
          )
        }

        if (!stockItem?.code) {
          await releasePaymentProcessing(transactionId)
          return {
            success: false,
            status: "paid" as const,
            error: "Pembayaran berhasil, tetapi stok REDFINGER sedang habis. Hubungi admin untuk penanganan pesanan.",
          }
        }
        codeAssigned = true

        const redfingerDetails = {
          type: "redfinger" as const,
          productName: product.name,
          duration: product.duration,
          redeemCode: stockItem.code,
        }

        const saved = await completeRedfingerPaymentProcessing(transactionId, redfingerDetails)
        if (!saved) {
          return {
            success: false,
            status: "processing" as const,
            error: "Redeem Code sudah dialokasikan tetapi transaksi belum dapat difinalisasi. Hubungi admin dan jangan ulangi pembayaran.",
          }
        }

        const emailResult = await sendRedfingerDetailsEmail(
          payment.email,
          product.name,
          product.duration,
          stockItem.code,
        )
        if (!emailResult.success) console.error("REDFINGER email failed:", emailResult.error)

        try {
          const remainingStock = await countAvailableRedfingerStock(payment.planId)
          const telegramResult = await sendRedfingerTelegramNotification(
            payment.createdAt,
            payment.amount,
            product.name,
            payment.email,
            remainingStock,
          )
          if (!telegramResult.success) console.error("REDFINGER Telegram failed:", telegramResult.error)
        } catch (error) {
          console.error("REDFINGER Telegram exception:", error)
        }

        return {
          success: true,
          status: "completed" as const,
          redfingerDetails,
          showWhatsappPopup: false,
        }
      } catch (error) {
        console.error("Gagal memproses REDFINGER:", error)
        if (!codeAssigned) await releasePaymentProcessing(transactionId)
        return {
          success: false,
          status: codeAssigned ? ("processing" as const) : ("paid" as const),
          error: error instanceof Error ? error.message : "Pembayaran berhasil tetapi REDFINGER gagal diproses",
        }
      }
    }

    const plan = plans.find((p) => p?.id === payment.planId)
    if (!plan) {
      await releasePaymentProcessing(transactionId)
      return { success: false, error: "Plan tidak ditemukan" }
    }

    let panelCreated = false
    try {
      const panelResult = await createPanel({
        username: payment.username,
        email: payment.email,
        memory: plan.memory,
        disk: plan.disk,
        cpu: plan.cpu,
        planId: payment.planId,
        createdAt: payment.createdAt,
      })
      panelCreated = true

      const panelDetails = {
        username: payment.username,
        password: panelResult.password,
        serverId: panelResult.serverId ?? null,
        type: (panelResult.type || plan.category) as "panel-bot" | "admin-panel",
        userId: panelResult.userId,
      }

      const saved = await completePaymentProcessing(transactionId, panelDetails)
      if (!saved) {
        return {
          success: false,
          status: "processing" as const,
          error: "Panel berhasil dibuat tetapi transaksi belum dapat difinalisasi. Hubungi admin dan jangan ulangi pembayaran.",
        }
      }

      return { success: true, status: "completed" as const, panelDetails, showWhatsappPopup: true }
    } catch (error) {
      console.error("Gagal membuat panel:", error)
      if (!panelCreated) await releasePaymentProcessing(transactionId)
      return {
        success: false,
        status: panelCreated ? ("processing" as const) : ("paid" as const),
        error: error instanceof Error ? error.message : "Pembayaran berhasil tetapi panel gagal dibuat",
      }
    }
  } catch (error) {
    console.error("Error checking payment status:", error)
    return { success: false, error: error instanceof Error ? error.message : "Kesalahan memeriksa status pembayaran" }
  }
}
