import { revalidatePath } from "next/cache"
import clientPromise from "@/lib/mongodb"
import { appConfig } from "@/data/config"
import type { ObjectId } from "mongodb"

export type PaymentStatus =
  | "pending"
  | "paid"
  | "processing"
  | "completed"
  | "failed"

export interface PanelDetails {
  username: string
  password: string
  serverId: number | null
  userId?: number
  type?: "panel-bot" | "admin-panel"
}

export interface RedfingerDetails {
  type: "redfinger"
  productName: string
  duration: string
  redeemCode: string
}

export interface PaymentData {
  _id?: ObjectId

  transactionId: string
  vpediaId: string

  planId: string

  productType?:
    | "panel"
    | "redfinger"

  productName?: string
  duration?: string

  username: string
  phone?: string

  email: string

  amount: number
  fee: number
  total: number

  qrImageUrl: string
  expirationTime: string

  status: PaymentStatus
  createdAt: string

  // Akun BROCK STORE.
  // Optional supaya guest checkout
  // tetap bisa digunakan.
  userId?: string
  accountEmail?: string

  panelDetails?: PanelDetails
  redfingerDetails?: RedfingerDetails
}

function collection(db: any) {
  return db.collection<PaymentData>(
    "payments",
  )
}

export async function getPayment(
  transactionId: string,
): Promise<PaymentData | null> {
  try {
    const client =
      await clientPromise

    const db = client.db(
      appConfig.mongodb.dbName,
    )

    return await collection(
      db,
    ).findOne({
      transactionId,
    })
  } catch (error) {
    console.error(
      "Error getting payment:",
      error,
    )

    return null
  }
}

export async function updatePaymentStatus(
  transactionId: string,
  status: PaymentStatus,
  panelDetails?: PanelDetails,
): Promise<boolean> {
  try {
    const client =
      await clientPromise

    const db = client.db(
      appConfig.mongodb.dbName,
    )

    const filter: any = {
      transactionId,
    }

    if (status === "failed") {
      filter.status = {
        $in: [
          "pending",
          "paid",
        ],
      }
    }

    const updateData:
      Record<string, unknown> = {
      status,
    }

    if (panelDetails) {
      updateData.panelDetails =
        panelDetails
    }

    const result =
      await collection(
        db,
      ).updateOne(
        filter,
        {
          $set: updateData,
        },
      )

    if (
      result.matchedCount > 0
    ) {
      revalidatePath(
        `/invoice/${transactionId}`,
      )

      return true
    }

    return false
  } catch (error) {
    console.error(
      "Error updating payment status:",
      error,
    )

    return false
  }
}

export async function claimPaymentForProcessing(
  transactionId: string,
): Promise<boolean> {
  try {
    const client =
      await clientPromise

    const db = client.db(
      appConfig.mongodb.dbName,
    )

    const result =
      await collection(
        db,
      ).updateOne(
        {
          transactionId,

          status: {
            $in: [
              "pending",
              "paid",
            ],
          },
        },
        {
          $set: {
            status:
              "processing",
          },
        },
      )

    return (
      result.modifiedCount === 1
    )
  } catch (error) {
    console.error(
      "Error claiming payment:",
      error,
    )

    return false
  }
}

export async function releasePaymentProcessing(
  transactionId: string,
): Promise<boolean> {
  try {
    const client =
      await clientPromise

    const db = client.db(
      appConfig.mongodb.dbName,
    )

    const result =
      await collection(
        db,
      ).updateOne(
        {
          transactionId,
          status:
            "processing",
        },
        {
          $set: {
            status: "paid",
          },
        },
      )

    return (
      result.modifiedCount === 1
    )
  } catch (error) {
    console.error(
      "Error releasing payment processing:",
      error,
    )

    return false
  }
}

export async function completePaymentProcessing(
  transactionId: string,
  panelDetails: PanelDetails,
): Promise<boolean> {
  try {
    const client =
      await clientPromise

    const db = client.db(
      appConfig.mongodb.dbName,
    )

    const result =
      await collection(
        db,
      ).updateOne(
        {
          transactionId,
          status:
            "processing",
        },
        {
          $set: {
            status:
              "completed",

            panelDetails,
          },
        },
      )

    if (
      result.modifiedCount === 1
    ) {
      revalidatePath(
        `/invoice/${transactionId}`,
      )

      return true
    }

    return false
  } catch (error) {
    console.error(
      "Error completing payment processing:",
      error,
    )

    return false
  }
}

export async function completeRedfingerPaymentProcessing(
  transactionId: string,
  redfingerDetails: RedfingerDetails,
): Promise<boolean> {
  try {
    const client =
      await clientPromise

    const db = client.db(
      appConfig.mongodb.dbName,
    )

    const result =
      await collection(
        db,
      ).updateOne(
        {
          transactionId,
          status:
            "processing",
        },
        {
          $set: {
            status:
              "completed",

            redfingerDetails,
          },
        },
      )

    if (
      result.modifiedCount === 1
    ) {
      revalidatePath(
        `/invoice/${transactionId}`,
      )

      return true
    }

    return false
  } catch (error) {
    console.error(
      "Error completing REDFINGER payment:",
      error,
    )

    return false
  }
}

export async function resolvePaymentTransactionId(
  identifier: string,
): Promise<string | null> {
  try {
    const client =
      await clientPromise

    const db = client.db(
      appConfig.mongodb.dbName,
    )

    const payment =
      await collection(
        db,
      ).findOne(
        {
          $or: [
            {
              transactionId:
                identifier,
            },
            {
              vpediaId:
                identifier,
            },
          ],
        },
        {
          projection: {
            transactionId: 1,
          },
        },
      )

    return (
      payment?.transactionId ||
      null
    )
  } catch (error) {
    console.error(
      "Error resolving payment transaction:",
      error,
    )

    return null
  }
}