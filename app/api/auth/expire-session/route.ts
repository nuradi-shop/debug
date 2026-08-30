import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { invalidateSession, SESSION_COOKIE } from "@/lib/auth"

export async function POST() {
  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value

  if (token) {
    await invalidateSession(token)
  }

  jar.delete(SESSION_COOKIE)
  jar.delete("brock_login_fresh")

  return NextResponse.json({ success: true })
}
