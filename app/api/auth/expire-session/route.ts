import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { invalidateSession, SESSION_COOKIE } from "@/lib/auth"

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
  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value

  try {
    if (token) {
      await invalidateSession(token)
    }

    return clearSessionCookie(
      NextResponse.json({ success: true }),
    )
  } catch (error) {
    console.error("Expire session error:", error)

    // Cookie tetap dibuang supaya user tidak terjebak loop session-expired
    // walaupun penghapusan session di database sedang bermasalah.
    return clearSessionCookie(
      NextResponse.json(
        { success: false, message: "Gagal mengakhiri sesi di server." },
        { status: 500 },
      ),
    )
  }
}
