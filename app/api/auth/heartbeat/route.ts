import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { heartbeatSession, SESSION_COOKIE } from "@/lib/auth"

export const dynamic = "force-dynamic"

function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  })

  return response
}

export async function POST() {
  try {
    const jar = await cookies()
    const token = jar.get(SESSION_COOKIE)?.value
    const result = await heartbeatSession(token)

    if (!result.ok) {
      const response = NextResponse.json(
        { success: false, reason: result.reason },
        { status: result.reason === "expired" ? 440 : 401 },
      )

      return clearSessionCookie(response)
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
