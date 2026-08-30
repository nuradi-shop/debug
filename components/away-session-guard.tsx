"use client"

import { useCallback, useEffect, useRef } from "react"
import { appConfig } from "@/data/config"

const HEARTBEAT_INTERVAL = appConfig.auth.heartbeatSeconds * 1000

export function AwaySessionGuard({ enabled }: { enabled: boolean }) {
  const checking = useRef(false)
  const expired = useRef(false)

  const goToExpiredLogin = useCallback(() => {
    if (expired.current) return
    expired.current = true
    window.location.replace("/login?reason=session_expired")
  }, [])

  const sendHeartbeat = useCallback(async () => {
    if (!enabled || checking.current || expired.current) return
    if (document.visibilityState !== "visible") return

    checking.current = true

    try {
      const response = await fetch("/api/auth/heartbeat", {
        method: "POST",
        cache: "no-store",
        credentials: "same-origin",
      })

      if (response.status === 401 || response.status === 440) {
        goToExpiredLogin()
        return
      }

      if (!response.ok) {
        console.warn("Heartbeat session gagal:", response.status)
      }
    } catch (error) {
      // Koneksi putus sementara tidak langsung membuat user logout.
      console.warn("Heartbeat session error:", error)
    } finally {
      checking.current = false
    }
  }, [enabled, goToExpiredLogin])

  useEffect(() => {
    if (!enabled) return

    // Saat halaman pertama kali aktif / user kembali ke BROCK STORE,
    // server langsung mengecek apakah sesi masih valid.
    void sendHeartbeat()

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void sendHeartbeat()
      }
    }, HEARTBEAT_INTERVAL)

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void sendHeartbeat()
      }
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
