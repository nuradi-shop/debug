import { AuthForm } from "@/components/auth-form"
export default async function Page({searchParams}:{searchParams:Promise<{token?:string,error?:string,success?:string}>}) {
  const p=await searchParams
  return <AuthForm mode="reset" token={p.token||""} error={p.error||""} success={p.success||""} />
}
