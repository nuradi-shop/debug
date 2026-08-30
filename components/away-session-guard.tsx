"use client"

import { useEffect, useRef } from "react"
import { appConfig } from "@/data/config"

const LEFT_AT_KEY = "brock_store_left_at"
const FRESH_LOGIN_COOKIE = "brock_login_fresh"

function hasFreshLoginCookie() {
  return document.cookie
    .split("; ")
    .some((item) => item === `${FRESH_LOGIN_COOKIE}=1`)
}

function clearFreshLoginCookie() {
  document.cookie = `${FRESH_LOGIN_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`
}

export function AwaySessionGuard({ enabled }: { enabled: boolean }) {
  const expiring = useRef(false)

  useEffect(() => {
    if (!enabled) {
      localStorage.removeItem(LEFT_AT_KEY)
      return
    }

    if (hasFreshLoginCookie()) {
      localStorage.removeItem(LEFT_AT_KEY)
      clearFreshLoginCookie()
    }

    const awayLimitMs = appConfig.auth.awaySessionMinutes * 60 * 1000

    const expireSession = async () => {
      if (expiring.current) return
      expiring.current = true

      try {
        await fetch("/api/auth/expire-session", {
          method: "POST",
          cache: "no-store",
          keepalive: true,
        })
      } catch {
        // Tetap arahkan ke login. Request berikutnya akan mengecek session lagi.
      }

      localStorage.removeItem(LEFT_AT_KEY)
      window.location.replace("/login?reason=session_expired")
    }

    const checkReturn = () => {
      const raw = localStorage.getItem(LEFT_AT_KEY)
      if (!raw) return

      const leftAt = Number(raw)
      if (!Number.isFinite(leftAt)) {
        localStorage.removeItem(LEFT_AT_KEY)
        return
      }

      const awayFor = Date.now() - leftAt
      if (awayFor >= awayLimitMs) {
        void expireSession()
        return
      }

      // Balik sebelum 5 menit: sesi tetap aktif dan hitungan dibatalkan.
      localStorage.removeItem(LEFT_AT_KEY)
    }

    const markAway = () => {
      if (document.visibilityState === "hidden") {
        localStorage.setItem(LEFT_AT_KEY, String(Date.now()))
      }
    }

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        markAway()
      } else {
        checkReturn()
      }
    }

    const handlePageHide = () => {
      localStorage.setItem(LEFT_AT_KEY, String(Date.now()))
    }

    const handleStorage = (event: StorageEvent) => {
      // Kalau tab BROCK lain masih terlihat, jangan anggap user benar-benar meninggalkan BROCK STORE.
      if (event.key === LEFT_AT_KEY && document.visibilityState === "visible") {
        localStorage.removeItem(LEFT_AT_KEY)
      }
    }

    checkReturn()
    document.addEventListener("visibilitychange", handleVisibility)
    window.addEventListener("pagehide", handlePageHide)
    window.addEventListener("storage", handleStorage)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility)
      window.removeEventListener("pagehide", handlePageHide)
      window.removeEventListener("storage", handleStorage)
    }
  }, [enabled])

  return null
}
