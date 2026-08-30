import { NextRequest, NextResponse } from "next/server"
import { checkPaymentStatus } from "@/app/actions/check-payment"
import { resolvePaymentTransactionId } from "@/lib/payments"

async function extractIds(request: NextRequest) {
  let merchantRef = request.nextUrl.searchParams.get("merchant_ref") || request.nextUrl.searchParams.get("transactionId")
  let gatewayId = request.nextUrl.searchParams.get("trx_id")
  try {
    if (request.method !== "GET") {
      const contentType = request.headers.get("content-type") || ""
      if (contentType.includes("application/json")) {
        const body = await request.json()
        merchantRef ||= body?.merchant_ref || body?.transactionId || null
        gatewayId ||= body?.trx_id || null
      } else {
        const form = await request.formData()
        merchantRef ||= form.get("merchant_ref")?.toString() || form.get("transactionId")?.toString() || null
        gatewayId ||= form.get("trx_id")?.toString() || null
      }
    }
  } catch {}
  return { merchantRef, gatewayId }
}

async function handle(request: NextRequest) {
  const { merchantRef, gatewayId } = await extractIds(request)
  const identifier = merchantRef || gatewayId
  if (!identifier) return NextResponse.json({ ok: false, message: "transaction id missing" }, { status: 400 })

  const transactionId = await resolvePaymentTransactionId(identifier)
  if (!transactionId) return NextResponse.json({ ok: false, message: "transaction not found" }, { status: 404 })

  const result = await checkPaymentStatus(transactionId)
  return NextResponse.json({ ok: result.success, status: result.status ?? "unknown" })
}

export const POST = handle
export const GET = handle
