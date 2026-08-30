"use client"

import { useCallback, useEffect, useRef } from "react"

const HEARTBEAT_INTERVAL = 20_000

export function AwaySessionGuard({ enabled }: { enabled: boolean }) {
  const checking = useRef(false)
  const expired = useRef(false)

  const goToExpiredLogin = useCallback(() => {
    if (expired.current) return

    expired.current = true
    window.location.replace("/login?reason=session_expired")
  }, [])

  const sendHeartbeat = useCallback(async () => {
    if (!enabled) return
    if (checking.current) return
    if (expired.current) return

    // Kalau tab BROCK STORE sedang tidak terlihat,
    // jangan update waktu session.
    if (document.visibilityState !== "visible") return

    checking.current = true

    try {
      const response = await fetch("/api/auth/heartbeat", {
        method: "POST",
        cache: "no-store",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.status === 401 || response.status === 440) {
        goToExpiredLogin()
        return
      }

      if (!response.ok) {
        console.warn("Heartbeat session gagal:", response.status)
      }
    } catch (error) {
      // Kalau internet putus sebentar, jangan langsung logout.
      // Server akan mengecek expiry lagi saat heartbeat berikutnya.
      console.warn("Heartbeat session error:", error)
    } finally {
      checking.current = false
    }
  }, [enabled, goToExpiredLogin])

  useEffect(() => {
    if (!enabled) return

    // Begitu halaman dibuka / user kembali ke BROCK STORE,
    // server langsung cek apakah session sudah lewat 5 menit.
    void sendHeartbeat()

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void sendHeartbeat()
      }
    }, HEARTBEAT_INTERVAL)

    const handleVisibilityChange = () => {
      // Saat kembali ke BROCK STORE, langsung cek session.
      if (document.visibilityState === "visible") {
        void sendHeartbeat()
      }

      // Saat hidden tidak melakukan apa-apa.
      // Heartbeat otomatis berhenti karena tab tidak visible.
    }

    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        void sendHeartbeat()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleFocus)

    return () => {
      window.clearInterval(interval)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleFocus)
    }
  }, [enabled, sendHeartbeat])

  return null
}
