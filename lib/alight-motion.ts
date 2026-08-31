import clientPromise from "@/lib/mongodb"
import { appConfig } from "@/data/config"
import { defaultAlightMotionProducts } from "@/data/alight-motion-products"

const DB = appConfig.mongodb.dbName
export async function getAlightMotionProduct(productId: string) {
  const db=(await clientPromise).db(DB); const custom:any=await db.collection("am_products").findOne({productId})
  const base=defaultAlightMotionProducts.find(p=>p.productId===productId); if(!base) return null
  return {...base, ...(custom||{}), _id:undefined}
}
export async function countAlightMotionStock(productId:string){
  const p=await getAlightMotionProduct(productId); if(!p||!p.active) return 0
  const db=(await clientPromise).db(DB)
  if(p.type==="sharing") return db.collection("am_stock").countDocuments({productId,status:"available"})
  const custom:any=await db.collection("am_products").findOne({productId}); return Number(custom?.stock ?? 0)
}
export async function listAlightMotionProducts(){ return Promise.all(defaultAlightMotionProducts.map(async b=>({...b,...((await getAlightMotionProduct(b.productId))||{}),stock:await countAlightMotionStock(b.productId)}))) }
export async function claimSharingAccount(productId:string,transactionId:string,email:string){
  const db=(await clientPromise).db(DB); const now=new Date()
  const result:any=await db.collection("am_stock").findOneAndUpdate({productId,status:"available"},{$set:{status:"sold",transactionId,buyerEmail:email,soldAt:now}},{returnDocument:"after"})
  return result?.value ?? result ?? null
}
export async function getAssignedSharingAccount(transactionId:string){ const db=(await clientPromise).db(DB); return db.collection("am_stock").findOne({transactionId,status:"sold"}) }
export async function decrementPrivateStock(productId:string){ const db=(await clientPromise).db(DB); const r=await db.collection("am_products").updateOne({productId,stock:{$gt:0}},{$inc:{stock:-1}}); return r.modifiedCount===1 }
