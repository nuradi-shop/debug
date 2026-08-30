import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { invalidateSession, SESSION_COOKIE } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    const jar = await cookies()
    const token = jar.get(SESSION_COOKIE)?.value

    if (token) await invalidateSession(token)
    jar.delete(SESSION_COOKIE)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Expire session error:", error)
    return NextResponse.json(
      { success: false, message: "Gagal mengakhiri sesi." },
      { status: 500 },
    )
  }
}
