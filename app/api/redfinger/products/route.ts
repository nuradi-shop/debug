import { NextResponse } from "next/server"
import { getRedfingerProducts } from "@/lib/redfinger"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const products = await getRedfingerProducts()
    return NextResponse.json({ products }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    console.error("Error fetching REDFINGER products:", error)
    return NextResponse.json({ products: [], error: "Gagal memuat produk REDFINGER" }, { status: 500 })
  }
}
