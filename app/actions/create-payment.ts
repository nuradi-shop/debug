"use server"

import { calculateFee, generateTransactionId } from "@/lib/utils"
import { plans } from "@/data/plans"
import { revalidatePath } from "next/cache"
import clientPromise from "@/lib/mongodb"
import { appConfig } from "@/data/config"
import type { PaymentData } from "@/lib/payments"
import {
  countAvailableRedfingerStock,
  getRedfingerProduct,
} from "@/lib/redfinger"
import crypto from "crypto"
import { cookies } from "next/headers"
import {
  getUserBySession,
  SESSION_COOKIE,
} from "@/lib/auth"

const SAKURU_API_ID = appConfig.pay.api_id
const SAKURU_API_KEY = appConfig.pay.api_key
const SAKURU_API_URL = "https://sakurupiah.id/api/create.php"

const APP_URL = (
  process.env.APP_URL ||
  "https://www.tokopanelbrockstore.my.id"
).replace(/\/$/, "")

export async function createPayment(
  planId: string,
  customerValue: string,
  email: string,
  category:
    | "panel-bot"
    | "admin-panel"
    | "redfinger" = "panel-bot",
) {
  try {
    const cleanEmail = email.trim().toLowerCase()

    // Login bersifat opsional.
    // Kalau customer sedang login,
    // transaksi akan ditautkan ke akun.
    const cookieStore = await cookies()

    const sessionToken =
      cookieStore.get(SESSION_COOKIE)?.value

    const accountUser =
      await getUserBySession(sessionToken)

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        cleanEmail,
      )
    ) {
      throw new Error("Email tidak valid")
    }

    if (!SAKURU_API_ID || !SAKURU_API_KEY) {
      throw new Error(
        "Konfigurasi Sakurupiah belum lengkap",
      )
    }

    const isRedfinger =
      category === "redfinger"

    const panelPlan = !isRedfinger
      ? plans.find((p) => p?.id === planId)
      : undefined

    const redfingerProduct = isRedfinger
      ? await getRedfingerProduct(planId)
      : null

    if (!isRedfinger && !panelPlan) {
      throw new Error("Plan tidak ditemukan")
    }

    if (
      isRedfinger &&
      !redfingerProduct
    ) {
      throw new Error(
        "Produk REDFINGER tidak ditemukan",
      )
    }

    let cleanUsername = ""
    let cleanPhone = ""

    if (isRedfinger) {
      cleanPhone = customerValue.replace(
        /[\s+()-]/g,
        "",
      )

      if (
        !/^(?:08|628)\d{8,13}$/.test(
          cleanPhone,
        )
      ) {
        throw new Error(
          "Nomor WhatsApp tidak valid",
        )
      }

      const stock =
        await countAvailableRedfingerStock(
          planId,
        )

      if (stock <= 0) {
        throw new Error(
          "Stok REDFINGER sedang habis",
        )
      }
    } else {
      cleanUsername =
        customerValue.trim()

      if (
        !/^[a-zA-Z0-9]{3,32}$/.test(
          cleanUsername,
        )
      ) {
        throw new Error(
          "Username minimal 3 karakter dan hanya boleh huruf/angka",
        )
      }
    }

    const price = isRedfinger
      ? redfingerProduct!.price
      : panelPlan!.price

    const productName = isRedfinger
      ? redfingerProduct!.name
      : panelPlan!.name

    const internalFee =
      calculateFee(price)

    const nominal =
      price + internalFee

    const transactionId =
      generateTransactionId()

    const method = "QRIS2"

    const signature = crypto
      .createHmac(
        "sha256",
        SAKURU_API_KEY,
      )
      .update(
        SAKURU_API_ID +
          method +
          transactionId +
          nominal,
      )
      .digest("hex")

    const bodyData =
      new URLSearchParams()

    bodyData.append(
      "api_id",
      SAKURU_API_ID,
    )

    bodyData.append(
      "method",
      method,
    )

    bodyData.append(
      "name",
      isRedfinger
        ? "Pelanggan REDFINGER"
        : cleanUsername,
    )

    // Email Sakurupiah diarahkan
    // ke email toko.
    bodyData.append(
      "email",
      appConfig.emailSender.auth.user,
    )

    bodyData.append(
      "phone",
      isRedfinger
        ? cleanPhone
        : "6280000000000",
    )

    bodyData.append(
      "amount",
      nominal.toString(),
    )

    bodyData.append(
      "merchant_fee",
      "1",
    )

    bodyData.append(
      "merchant_ref",
      transactionId,
    )

    bodyData.append(
      "expired",
      "24",
    )

    bodyData.append(
      "produk[]",
      productName,
    )

    bodyData.append(
      "qty[]",
      "1",
    )

    bodyData.append(
      "harga[]",
      price.toString(),
    )

    bodyData.append(
      "callback_url",
      `${APP_URL}/callback`,
    )

    bodyData.append(
      "return_url",
      `${APP_URL}/invoice/${transactionId}`,
    )

    bodyData.append(
      "signature",
      signature,
    )

    const response = await fetch(
      SAKURU_API_URL,
      {
        method: "POST",

        body: bodyData,

        headers: {
          Authorization:
            `Bearer ${SAKURU_API_KEY}`,

          "Content-Type":
            "application/x-www-form-urlencoded",
        },

        cache: "no-store",
      },
    )

    const raw =
      await response.text()

    let json: any

    try {
      json = JSON.parse(raw)
    } catch {
      console.error(
        "Sakurupiah returned NON-JSON:",
        raw,
      )

      throw new Error(
        "API Sakurupiah tidak mengembalikan JSON",
      )
    }

    if (
      String(json.status) !== "200"
    ) {
      throw new Error(
        json.message ||
          "Gagal membuat invoice Sakurupiah",
      )
    }

    const pay = json.data?.[0]

    if (
      !pay?.trx_id ||
      !pay?.qr ||
      !pay?.expired
    ) {
      throw new Error(
        "Data pembayaran Sakurupiah tidak lengkap",
      )
    }

    const initialGatewayStatus =
      String(
        pay.payment_status ||
          "pending",
      ).toLowerCase()

    const initialStatus:
      PaymentData["status"] =
      [
        "gagal",
        "failed",
        "expired",
      ].includes(
        initialGatewayStatus,
      )
        ? "failed"
        : "pending"

    const paymentData:
      PaymentData = {
      transactionId,

      // ID transaksi Sakurupiah
      vpediaId: String(
        pay.trx_id,
      ),

      planId,

      productType: isRedfinger
        ? "redfinger"
        : "panel",

      productName,

      duration: isRedfinger
        ? redfingerProduct!.duration
        : undefined,

      username: cleanUsername,

      phone: isRedfinger
        ? cleanPhone
        : undefined,

      // Email customer tetap disimpan.
      email: cleanEmail,

      amount: price,

      fee: internalFee,

      total: nominal,

      qrImageUrl:
        String(pay.qr),

      expirationTime:
        new Date(
          pay.expired,
        ).toISOString(),

      status:
        initialStatus,

      createdAt:
        new Date().toISOString(),

      // Hanya terisi kalau customer login.
      userId:
        accountUser?.id,

      accountEmail:
        accountUser?.email,
    }

    const client =
      await clientPromise

    const db = client.db(
      appConfig.mongodb.dbName,
    )

    await db
      .collection<PaymentData>(
        "payments",
      )
      .insertOne(paymentData)

    revalidatePath(
      `/invoice/${transactionId}`,
    )

    return {
      success: true,
      transactionId,
    }
  } catch (error) {
    console.error(
      "Error createPayment:",
      error,
    )

    return {
      success: false,

      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan",
    }
  }
}