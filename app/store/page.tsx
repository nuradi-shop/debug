import { cookies } from "next/headers"
import Navbar from "@/components/navbar"
import { LoadingScreen } from "@/components/loading-screen"
import { SocialMediaButton } from "@/components/social-media-button"
import { Footer } from "@/components/footer"
import { StorefrontHome } from "@/components/storefront-home"
import { getUserBySession, SESSION_COOKIE } from "@/lib/auth"
import type { StoreCategory } from "@/data/store-categories"

const categories: StoreCategory[] = ["panel-bot", "admin-panel", "redfinger"]

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>
}) {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value
  const user = await getUserBySession(sessionToken)
  const params = await searchParams

  const initialCategory: StoreCategory = categories.includes(params.product as StoreCategory)
    ? (params.product as StoreCategory)
    : "panel-bot"

  const account = user
    ? { username: user.username, email: user.email }
    : null

  return (
    <>
      <LoadingScreen />
      <div className="min-h-screen bg-[#070A10] text-white">
        <Navbar user={account} />
        <SocialMediaButton />
        <StorefrontHome user={account} initialCategory={initialCategory} />
        <Footer />
      </div>
    </>
  )
}
