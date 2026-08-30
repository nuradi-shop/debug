import { AuthForm } from "@/components/auth-form"
export default async function Page({searchParams}:{searchParams:Promise<{error?:string,success?:string}>}) {
  const p=await searchParams
  return <AuthForm mode="login" error={p.error||""} success={p.success||""} />
}
