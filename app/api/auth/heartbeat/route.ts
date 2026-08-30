import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { heartbeatSession, SESSION_COOKIE } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    const jar = await cookies()
    const token = jar.get(SESSION_COOKIE)?.value
    const result = await heartbeatSession(token)

    if (!result.ok) {
      jar.delete(SESSION_COOKIE)

      return NextResponse.json(
        { success: false, reason: result.reason },
        { status: result.reason === "expired" ? 440 : 401 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Heartbeat session error:", error)
    return NextResponse.json(
      { success: false, message: "Gagal memeriksa sesi." },
      { status: 500 },
    )
  }
}
