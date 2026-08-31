import { AuthForm } from "@/components/auth-form"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string; reason?: string }>
}) {
  const p = await searchParams
  const sessionExpired = p.reason === "session_expired"

  return (
    <AuthForm
      mode="login"
      error={p.error || (sessionExpired ? "Sesi login telah berakhir. Silakan login kembali." : "")}
      success={p.success || ""}
    />
  )
}
