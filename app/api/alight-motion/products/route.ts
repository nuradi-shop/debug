import { NextResponse } from "next/server"
import { listAlightMotionProducts } from "@/lib/alight-motion"
export const dynamic="force-dynamic"
export async function GET(){ try{return NextResponse.json({products:await listAlightMotionProducts()},{headers:{"Cache-Control":"no-store"}})}catch(e){console.error(e);return NextResponse.json({products:[],error:"Failed"},{status:500})} }
