import clientPromise from "@/lib/mongodb"
import { appConfig } from "@/data/config"
import { defaultRedfingerProducts, type RedfingerProduct, type RedfingerProductWithStock } from "@/data/redfinger-products"

export type RedfingerStockStatus = "available" | "sold"

export interface RedfingerStockItem {
  productId: string
  code: string
  status: RedfingerStockStatus
  transactionId?: string
  soldTo?: string
  phone?: string
  soldAt?: string
  createdAt?: string
}

async function getDb() {
  const client = await clientPromise
  return client.db(appConfig.mongodb.dbName)
}

export async function ensureDefaultRedfingerProducts() {
  const db = await getDb()
  const products = db.collection<RedfingerProduct>("redfinger_products")

  for (const product of defaultRedfingerProducts) {
    await products.updateOne(
      { productId: product.productId },
      { $setOnInsert: product },
      { upsert: true },
    )
  }
}

export async function getRedfingerProducts(): Promise<RedfingerProductWithStock[]> {
  await ensureDefaultRedfingerProducts()
  const db = await getDb()
  const products = await db
    .collection<RedfingerProduct>("redfinger_products")
    .find({ active: { $ne: false } })
    .sort({ price: 1 })
    .toArray()

  return Promise.all(
    products.map(async (product) => ({
      ...product,
      stock: await db.collection<RedfingerStockItem>("redfinger_stock").countDocuments({
        productId: product.productId,
        status: "available",
      }),
    })),
  )
}

export async function getRedfingerProduct(productId: string): Promise<RedfingerProduct | null> {
  await ensureDefaultRedfingerProducts()
  const db = await getDb()
  return db.collection<RedfingerProduct>("redfinger_products").findOne({ productId, active: { $ne: false } })
}

export async function countAvailableRedfingerStock(productId: string): Promise<number> {
  const db = await getDb()
  return db.collection<RedfingerStockItem>("redfinger_stock").countDocuments({ productId, status: "available" })
}

export async function getAssignedRedfingerCode(transactionId: string): Promise<RedfingerStockItem | null> {
  const db = await getDb()
  return db.collection<RedfingerStockItem>("redfinger_stock").findOne({ transactionId, status: "sold" })
}

export async function claimRedfingerCode(
  productId: string,
  transactionId: string,
  email: string,
  phone: string,
): Promise<RedfingerStockItem | null> {
  const existing = await getAssignedRedfingerCode(transactionId)
  if (existing) return existing

  const db = await getDb()
  const result = await db.collection<RedfingerStockItem>("redfinger_stock").findOneAndUpdate(
    { productId, status: "available" },
    {
      $set: {
        status: "sold",
        transactionId,
        soldTo: email,
        phone,
        soldAt: new Date().toISOString(),
      },
    },
    { returnDocument: "after" },
  )

  return result || null
}
