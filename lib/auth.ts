import crypto from "crypto"
import clientPromise from "@/lib/mongodb"
import { appConfig } from "@/data/config"

const DB = appConfig.mongodb.dbName

export const SESSION_COOKIE = "brock_session"

function hashPassword(
  password: string,
  salt = crypto.randomBytes(16).toString("hex"),
) {
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

    return (
      saved.length === test.length &&
      crypto.timingSafeEqual(saved, test)
    )
  } catch {
    return false
  }
}

function hashCode(code: string) {
  return crypto
    .createHash("sha256")
    .update(code)
    .digest("hex")
}

function generateVerificationCode() {
  return String(
    crypto.randomInt(100000, 1000000),
  )
}

function getAwayLimitMs() {
  return (
    appConfig.auth.awaySessionMinutes *
    60 *
    1000
  )
}

function isSessionExpired(lastSeenAt?: Date | string | null) {
  if (!lastSeenAt) return true

  const lastSeen = new Date(lastSeenAt).getTime()

  if (!Number.isFinite(lastSeen)) {
    return true
  }

  return (
    Date.now() - lastSeen >= getAwayLimitMs()
  )
}

/* =========================================================
   PENDAFTARAN
========================================================= */

export async function startRegistration(
  username: string,
  email: string,
  password: string,
) {
  const db = (await clientPromise).db(DB)

  const users = db.collection("users")
  const pending = db.collection(
    "pending_registrations",
  )

  const cleanEmail = email
    .trim()
    .toLowerCase()

  const cleanUsername = username.trim()

  const existing = await users.findOne({
    $or: [
      { email: cleanEmail },
      { username: cleanUsername },
    ],
  })

  if (existing?.email === cleanEmail) {
    throw new Error(
      "Email sudah terdaftar. Silakan login.",
    )
  }

  if (existing) {
    throw new Error(
      "Username sudah digunakan.",
    )
  }

  const code = generateVerificationCode()
  const now = new Date()

  const expiresAt = new Date(
    now.getTime() +
      appConfig.auth.verificationCodeMinutes *
        60 *
        1000,
  )

  await pending.deleteMany({
    $or: [
      { email: cleanEmail },
      { username: cleanUsername },
    ],
  })

  await pending.insertOne({
    username: cleanUsername,
    email: cleanEmail,
    passwordHash: hashPassword(password),
    codeHash: hashCode(code),
    expiresAt,
    createdAt: now,
    lastSentAt: now,
  })

  return {
    code,
    email: cleanEmail,
  }
}

export async function deletePendingRegistration(
  email: string,
) {
  const db = (await clientPromise).db(DB)

  await db
    .collection("pending_registrations")
    .deleteMany({
      email: email
        .trim()
        .toLowerCase(),
    })
}

export async function resendRegistrationCode(
  email: string,
) {
  const db = (await clientPromise).db(DB)

  const pending = db.collection(
    "pending_registrations",
  )

  const cleanEmail = email
    .trim()
    .toLowerCase()

  const item: any =
    await pending.findOne({
      email: cleanEmail,
    })

  if (!item) {
    return {
      ok: false as const,
      reason: "not-found" as const,
    }
  }

  const lastSentAt = item.lastSentAt
    ? new Date(
        item.lastSentAt,
      ).getTime()
    : 0

  const cooldownMs =
    appConfig.auth
      .resendVerificationCooldownSeconds *
    1000

  const elapsed =
    Date.now() - lastSentAt

  if (elapsed < cooldownMs) {
    return {
      ok: false as const,
      reason: "cooldown" as const,
      retryAfter: Math.max(
        1,
        Math.ceil(
          (cooldownMs - elapsed) /
            1000,
        ),
      ),
    }
  }

  const code =
    generateVerificationCode()

  const now = new Date()

  await pending.updateOne(
    {
      _id: item._id,
    },
    {
      $set: {
        codeHash: hashCode(code),

        expiresAt: new Date(
          now.getTime() +
            appConfig.auth
              .verificationCodeMinutes *
              60 *
              1000,
        ),

        lastSentAt: now,
      },
    },
  )

  return {
    ok: true as const,
    code,
  }
}

export async function verifyRegistration(
  email: string,
  code: string,
) {
  const db = (await clientPromise).db(DB)

  const pending = db.collection(
    "pending_registrations",
  )

  const users =
    db.collection("users")

  const cleanEmail = email
    .trim()
    .toLowerCase()

  const item: any =
    await pending.findOne({
      email: cleanEmail,
    })

  if (!item) {
    return {
      ok: false as const,
      reason: "not-found" as const,
    }
  }

  if (
    !item.expiresAt ||
    new Date(item.expiresAt) <=
      new Date()
  ) {
    return {
      ok: false as const,
      reason: "expired" as const,
    }
  }

  if (
    hashCode(code.trim()) !==
    item.codeHash
  ) {
    return {
      ok: false as const,
      reason: "invalid" as const,
    }
  }

  const duplicate =
    await users.findOne({
      $or: [
        { email: item.email },
        { username: item.username },
      ],
    })

  if (duplicate) {
    await pending.deleteMany({
      email: cleanEmail,
    })

    return {
      ok: false as const,
      reason: "duplicate" as const,
    }
  }

  await users.insertOne({
    username: item.username,
    email: item.email,

    passwordHash:
      item.passwordHash,

    emailVerifiedAt:
      new Date(),

    createdAt:
      new Date(),
  })

  await pending.deleteMany({
    email: cleanEmail,
  })

  return {
    ok: true as const,
  }
}

/* =========================================================
   LOGIN
========================================================= */

export async function loginUser(
  email: string,
  password: string,
) {
  const db = (await clientPromise).db(DB)

  const users =
    db.collection("users")

  const cleanEmail = email
    .trim()
    .toLowerCase()

  const user: any =
    await users.findOne({
      email: cleanEmail,
    })

  if (
    !user ||
    !verifyPassword(
      password,
      user.passwordHash,
    )
  ) {
    return null
  }

  const token =
    crypto
      .randomBytes(32)
      .toString("hex")

  const now = new Date()

  await users.updateOne(
    {
      _id: user._id,
    },
    {
      $set: {
        sessionToken: token,

        // Ini yang menjadi patokan
        // heartbeat session.
        sessionLastSeenAt: now,
      },
    },
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

/* =========================================================
   CEK SESSION
========================================================= */

export async function getUserBySession(
  token?: string,
) {
  if (!token) return null

  const db = (await clientPromise).db(DB)

  const users =
    db.collection("users")

  const user: any =
    await users.findOne(
      {
        sessionToken: token,
      },
      {
        projection: {
          passwordHash: 0,
          sessionToken: 0,
        },
      },
    )

  if (!user) return null

  /*
    Jangan update sessionLastSeenAt di sini.

    Waktu aktivitas hanya diperbarui
    oleh heartbeat saat BROCK STORE
    benar-benar sedang terlihat.
  */

  if (
    isSessionExpired(
      user.sessionLastSeenAt,
    )
  ) {
    await users.updateOne(
      {
        _id: user._id,
      },
      {
        $unset: {
          sessionToken: "",
          sessionLastSeenAt: "",
        },
      },
    )

    return null
  }

  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
  }
}

/* =========================================================
   HEARTBEAT SESSION
========================================================= */

export async function heartbeatSession(
  token?: string,
) {
  if (!token) {
    return {
      ok: false as const,
      reason: "no-session" as const,
    }
  }

  const db = (await clientPromise).db(DB)

  const users =
    db.collection("users")

  const user: any =
    await users.findOne(
      {
        sessionToken: token,
      },
      {
        projection: {
          _id: 1,
          sessionLastSeenAt: 1,
        },
      },
    )

  if (!user) {
    return {
      ok: false as const,
      reason: "invalid" as const,
    }
  }

  /*
    Kalau terakhir heartbeat sudah
    lewat batas, session langsung
    dimatikan.

    Contoh:
    terakhir aktif 10:00
    balik 10:06
    limit 5 menit
    => expired
  */

  if (
    isSessionExpired(
      user.sessionLastSeenAt,
    )
  ) {
    await users.updateOne(
      {
        _id: user._id,
      },
      {
        $unset: {
          sessionToken: "",
          sessionLastSeenAt: "",
        },
      },
    )

    return {
      ok: false as const,
      reason: "expired" as const,
    }
  }

  /*
    Masih valid.
    Update waktu terakhir user
    benar-benar membuka BROCK STORE.
  */

  const now = new Date()

  await users.updateOne(
    {
      _id: user._id,
      sessionToken: token,
    },
    {
      $set: {
        sessionLastSeenAt: now,
      },
    },
  )

  return {
    ok: true as const,
    lastSeenAt: now,
  }
}

/* =========================================================
   LOGOUT / HAPUS SESSION
========================================================= */

export async function invalidateSession(
  token
