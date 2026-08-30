import crypto from "crypto"
import clientPromise from "@/lib/mongodb"
import { appConfig } from "@/data/config"

const DB = appConfig.mongodb.dbName
export const SESSION_COOKIE = "brock_session"

function hashPassword(password: string, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

function verifyPassword(password: string, stored?: string) {
  if (!stored || typeof stored !== "string") return false

  const [salt, hash] = stored.split(":")
  if (!salt || !hash) return false

  try {
    const test = crypto.scryptSync(password, salt, 64)
    const saved = Buffer.from(hash, "hex")
    return saved.length === test.length && crypto.timingSafeEqual(saved, test)
  } catch {
    return false
  }
}

export async function createUser(username: string, email: string, password: string) {
  const db = (await clientPromise).db(DB)
  const users = db.collection("users")
  const cleanEmail = email.trim().toLowerCase()
  const cleanUsername = username.trim()

  const existing = await users.findOne({
    $or: [{ email: cleanEmail }, { username: cleanUsername }],
  })

  if (existing) {
    throw new Error("Username atau email sudah terdaftar.")
  }

  const result = await users.insertOne({
    username: cleanUsername,
    email: cleanEmail,
    passwordHash: hashPassword(password),
  })

  return result.insertedId.toString()
}

export async function loginUser(email: string, password: string) {
  const db = (await clientPromise).db(DB)
  const users = db.collection("users")
  const cleanEmail = email.trim().toLowerCase()
  const user: any = await users.findOne({ email: cleanEmail })

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return null
  }

  const token = crypto.randomBytes(32).toString("hex")

  await users.updateOne(
    { _id: user._id },
    { $set: { sessionToken: token } }
  )

  return {
    token,
    user: {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    },
  }
}

export async function getUserBySession(token?: string) {
  if (!token) return null

  const db = (await clientPromise).db(DB)
  const user: any = await db.collection("users").findOne(
    { sessionToken: token },
    { projection: { passwordHash: 0, sessionToken: 0 } }
  )

  if (!user) return null

  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
  }
}

export async function createReset(email: string) {
  const db = (await clientPromise).db(DB)
  const users = db.collection("users")
  const cleanEmail = email.trim().toLowerCase()
  const user: any = await users.findOne({ email: cleanEmail })

  if (!user) return null

  const token = crypto.randomBytes(32).toString("hex")
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex")
  const resets = db.collection("password_resets")

  await resets.deleteMany({ email: user.email })
  await resets.insertOne({
    email: user.email,
    tokenHash,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  })

  return token
}

export async function resetPassword(token: string, password: string) {
  const db = (await clientPromise).db(DB)
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex")
  const resets = db.collection("password_resets")

  const reset: any = await resets.findOne({
    tokenHash,
    expiresAt: { $gt: new Date() },
  })

  if (!reset) return false

  await db.collection("users").updateOne(
    { email: reset.email },
    {
      $set: { passwordHash: hashPassword(password) },
      $unset: { sessionToken: "" },
    }
  )

  await resets.deleteMany({ email: reset.email })
  return true
}
