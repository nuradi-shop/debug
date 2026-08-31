import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { appConfig } from "@/data/config"
import { Pterodactyl } from "@/lib/pterodactyl"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db(appConfig.mongodb.dbName)
    const payments = db.collection("payments")

    const [totalPurchases, codeSold, amSold] = await Promise.all([
      payments.countDocuments({ status: "completed" }),
      db.collection("redfinger_stock").countDocuments({ status: "sold" }),
      payments.countDocuments({ status: "completed", productType: "alight-motion" }),
    ])

    let totalUsers = 0
    let totalServers = 0
    try {
      const pterodactyl = new Pterodactyl()
      const [users, servers] = await Promise.all([pterodactyl.listUsers(), pterodactyl.listServers()])
      totalUsers = users.length
      totalServers = servers.length
    } catch (panelError) {
      console.error("Panel stats unavailable:", panelError)
    }

    return NextResponse.json(
      { totalUsers, totalServers, totalPurchases, codeSold, amSold },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
    )
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json(
      { totalUsers: 0, totalServers: 0, totalPurchases: 0, codeSold: 0, amSold: 0, error: "Failed to fetch stats" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    )
  }
}
