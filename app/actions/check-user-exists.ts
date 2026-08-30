"use server"

import { Pterodactyl } from "@/lib/pterodactyl"

export async function checkUserExists(
  username: string,
  email: string
) {
  console.error("=== CHECK USER EXISTS DEBUG V3 ===", {
    panelDomain: process.env.PANEL_DOMAIN || "(MISSING)",
    panelApiKeyExists: Boolean(process.env.PANEL_APIKEY),
    nodeEnv: process.env.NODE_ENV,
  })

  try {
    console.error(
      "CHECK USER EXISTS: BEFORE NEW PTERODACTYL"
    )

    const pterodactyl = new Pterodactyl()

    console.error(
      "CHECK USER EXISTS: AFTER NEW PTERODACTYL"
    )

    const users = await pterodactyl.listUsers()

    console.error(
      "CHECK USER EXISTS: LIST USERS SUCCESS",
      {
        totalUsers: users.length,
      }
    )

    const normalizedUsername =
      username.trim().toLowerCase()

    const normalizedEmail =
      email.trim().toLowerCase()

    const usernameExists = users.some(
      (user) =>
        user.username.trim().toLowerCase() ===
        normalizedUsername
    )

    const emailExists = users.some(
      (user) =>
        user.email.trim().toLowerCase() ===
        normalizedEmail
    )

    return {
      success: true,
      usernameExists,
      emailExists,
    }
  } catch (error) {
    console.error(
      "=== CHECK USER EXISTS REAL ERROR ===",
      {
        name:
          error instanceof Error
            ? error.name
            : "Unknown",

        message:
          error instanceof Error
            ? error.message
            : String(error),

        cause:
          error instanceof Error
            ? error.cause
            : undefined,

        stack:
          error instanceof Error
            ? error.stack
            : undefined,
      }
    )

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to retrieve user list from Pterodactyl panel",
    }
  }
}