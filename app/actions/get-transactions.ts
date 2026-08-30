"use server"

import clientPromise from "@/lib/mongodb"
import { appConfig } from "@/data/config"
import { plans } from "@/data/plans"

export async function getSuccessfulTransactions() {
  try {
    const client = await clientPromise
    const db = client.db(appConfig.mongodb.dbName)
    const transactions = await db.collection("payments").find({}).sort({ createdAt: -1 }).limit(50).toArray()
    return transactions.map((transaction: any) => {
      const plan = plans.find((p) => p?.id === transaction.planId)
      return {
        transactionId: transaction.transactionId,
        email: maskEmail(transaction.email),
        planId: transaction.planId,
        planName: transaction.productName || plan?.name || "Unknown Plan",
        productType: transaction.productType || "panel",
        total: transaction.total,
        createdAt: transaction.createdAt,
        status: transaction.status,
      }
    })
  } catch (error) {
    console.error("Error getting transactions:", error)
    return []
  }
}

export async function getTransactionById(transactionId: string) {
  try {
    const client = await clientPromise
    const db = client.db(appConfig.mongodb.dbName)
    const transaction: any = await db.collection("payments").findOne({ transactionId })
    if (!transaction) return null
    const plan = plans.find((p) => p?.id === transaction.planId)
    return {
      transactionId: transaction.transactionId,
      username: transaction.username || "",
      phone: transaction.phone || "",
      email: maskEmail(transaction.email),
      planId: transaction.planId,
      planName: transaction.productName || plan?.name || "Unknown Plan",
      productType: transaction.productType || "panel",
      amount: transaction.amount,
      total: transaction.total,
      createdAt: transaction.createdAt,
      status: transaction.status,
      replaceUsed: Number(transaction.replaceUsed || 0),
      category: transaction.productType === "redfinger" ? "redfinger" : plan?.category,
    }
  } catch (error) {
    console.error("Error getting transaction by ID:", error)
    return null
  }
}

function maskEmail(email: string): string {
  const [username = "", domain = ""] = String(email || "").split("@")
  if (!domain) return "***"
  return `${username.slice(0, Math.min(3, username.length))}***@${domain}`
}
