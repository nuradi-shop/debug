import { pterodactylConfig } from "@/data/config"

interface UserAttributes {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  root_admin?: boolean
}

interface ServerAttributes {
  id: number
  name: string
  user: number
}

interface EggAttributes {
  startup: string
  docker_images: {
    [key: string]: string
  }
}

interface UserResponse {
  attributes?: UserAttributes
  errors?: Array<{ detail: string }>
}

interface ServerResponse {
  attributes?: ServerAttributes
  errors?: Array<{ detail: string }>
}

interface EggResponse {
  attributes?: EggAttributes
  errors?: Array<{ detail: string }>
}

interface ServerListResponse {
  data?: Array<{ attributes: ServerAttributes }>
}

interface UserListResponse {
  data?: Array<{ attributes: UserAttributes }>
}

export class Pterodactyl {
  private domain: string
  private apiKey: string
  private nests: string
  private nestsGame: string
  private egg: string
  private eggSamp: string
  private location: string

  constructor() {
    console.error("=== PTERODACTYL NEW CODE LOADED ===")

    this.domain = (pterodactylConfig.domain || "")
      .trim()
      .replace(/\/$/, "")

    this.apiKey = (pterodactylConfig.apiKey || "").trim()

    this.nests = pterodactylConfig.nests
    this.nestsGame = pterodactylConfig.nestsGame
    this.egg = pterodactylConfig.egg
    this.eggSamp = pterodactylConfig.eggSamp
    this.location = pterodactylConfig.location

    console.error("PTERODACTYL CONFIG:", {
      domain: this.domain,
      apiKeyExists: Boolean(this.apiKey),
      nests: this.nests,
      egg: this.egg,
      location: this.location,
    })

    if (!this.domain || !this.apiKey) {
      console.error("PTERODACTYL CONFIG MISSING:", {
        domainExists: Boolean(this.domain),
        apiKeyExists: Boolean(this.apiKey),
      })

      throw new Error(
        "Konfigurasi panel Pterodactyl belum lengkap."
      )
    }
  }

  async request<T>(
    endpoint: string,
    method = "GET",
    body: any = null
  ): Promise<T> {
    const url = `${this.domain}/api/application${endpoint}`

    const controller = new AbortController()

    const timeout = setTimeout(() => {
      controller.abort()
    }, 8000)

    const options: RequestInit = {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      cache: "no-store",
      signal: controller.signal,
    }

    if (body !== null) {
      options.body = JSON.stringify(body)
    }

    try {
      console.error("PTERODACTYL REQUEST:", {
        url,
        method,
        apiKeyExists: Boolean(this.apiKey),
      })

      const response = await fetch(url, options)

      clearTimeout(timeout)

      console.error("PTERODACTYL RESPONSE:", {
        url,
        status: response.status,
        statusText: response.statusText,
      })

      if (!response.ok) {
        const raw = await response.text()

        console.error("PTERODACTYL API ERROR:", {
          url,
          status: response.status,
          statusText: response.statusText,
          response: raw,
        })

        let errorMessage =
          `Pterodactyl API error ${response.status}: ${response.statusText}`

        try {
          const errorData = JSON.parse(raw)

          errorMessage =
            errorData?.errors?.[0]?.detail ||
            errorMessage
        } catch {}

        if (response.status === 401) {
          throw new Error(
            "API key Pterodactyl tidak valid atau sudah tidak aktif."
          )
        }

        if (response.status === 403) {
          throw new Error(
            "API key Pterodactyl tidak memiliki izin untuk mengakses data ini."
          )
        }

        if (response.status === 404) {
          throw new Error(
            "Endpoint Pterodactyl tidak ditemukan. Periksa domain panel."
          )
        }

        if (response.status >= 500) {
          throw new Error(
            "Panel Pterodactyl sedang mengalami gangguan. Silakan coba lagi beberapa saat."
          )
        }

        throw new Error(errorMessage)
      }

      if (response.status === 204) {
        return {} as T
      }

      const text = await response.text()

      if (!text) {
        return {} as T
      }

      try {
        return JSON.parse(text) as T
      } catch (error) {
        console.error(
          "PTERODACTYL JSON PARSE ERROR:",
          {
            url,
            responseText: text,
            error,
          }
        )

        throw new Error(
          "Response dari panel Pterodactyl tidak valid."
        )
      }
    } catch (error: any) {
      clearTimeout(timeout)

      if (error?.name === "AbortError") {
        console.error("PTERODACTYL TIMEOUT:", {
          url,
          message:
            "Request timeout after 8 seconds",
        })

        throw new Error(
          "Panel sedang tidak dapat dihubungi. Silakan coba lagi beberapa saat."
        )
      }

      if (
        error instanceof TypeError &&
        error.message.toLowerCase().includes("fetch")
      ) {
        console.error(
          "PTERODACTYL NETWORK ERROR:",
          {
            url,
            message: error.message,
          }
        )

        throw new Error(
          "Panel sedang tidak dapat dihubungi. Silakan coba lagi beberapa saat."
        )
      }

      console.error(
        "PTERODACTYL FETCH FAILED:",
        {
          url,
          error:
            error instanceof Error
              ? {
                  name: error.name,
                  message: error.message,
                  cause: error.cause,
                  stack: error.stack,
                }
              : error,
        }
      )

      throw error
    } finally {
      clearTimeout(timeout)
    }
  }

  async createUser(
    username: string,
    email: string,
    password: string,
    rootAdmin = false
  ): Promise<UserResponse> {
    return this.request<UserResponse>(
      "/users",
      "POST",
      {
        username,
        email,
        first_name: username,
        last_name: rootAdmin
          ? "Admin"
          : "User",
        password,
        root_admin: rootAdmin,
      }
    )
  }

  async addServer(
    userId: number,
    serverName: string,
    memory: number,
    disk: number,
    cpu: number
  ): Promise<ServerResponse> {
    const eggData =
      await this.request<EggResponse>(
        `/nests/${this.nests}/eggs/${this.egg}`
      )

    if (
      !eggData.attributes ||
      !eggData.attributes.startup
    ) {
      throw new Error(
        "Egg startup command is undefined."
      )
    }

    const dockerImage =
      eggData.attributes.docker_images[
        "ghcr.io/parkervcp/yolks:nodejs_20"
      ]

    if (!dockerImage) {
      throw new Error(
        "NodeJS 20 docker image tidak tersedia pada egg."
      )
    }

    return this.request<ServerResponse>(
      "/servers",
      "POST",
      {
        name: serverName,

        description:
          "Order Panel? Kunjungi https://www.tokopanelbrockstore.my.id",

        user: userId,

        egg: Number.parseInt(this.egg),

        docker_image: dockerImage,

        startup:
          eggData.attributes.startup,

        environment: {
          GIT_ADDRESS: "",
          BRANCH: "",
          USERNAME: "",
          ACCESS_TOKEN: "",
          CMD_RUN: "npm start",
          AUTO_UPDATE: "0",
          NODE_PACKAGES: "",
          UNNODE_PACKAGES: "",
          CUSTOM_ENVIRONMENT_VARIABLES: "",
          USER_UPLOAD: "true",
        },

        limits: {
          memory,
          swap: 0,
          disk,
          io: 500,
          cpu,
        },

        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 1,
        },

        deploy: {
          locations: [
            Number.parseInt(
              this.location
            ),
          ],

          dedicated_ip: false,

          port_range: [],
        },
      }
    )
  }

  async listServers(): Promise<
    Array<{
      id: number
      name: string
      user: number
    }>
  > {
    try {
      const serversResponse =
        await this.request<ServerListResponse>(
          "/servers"
        )

      if (!serversResponse.data) {
        return []
      }

      return serversResponse.data.map(
        (server) => ({
          id: server.attributes.id,
          name: server.attributes.name,
          user: server.attributes.user,
        })
      )
    } catch (error) {
      console.error(
        "PTERODACTYL LIST SERVERS REAL ERROR:",
        error
      )

      if (error instanceof Error) {
        throw error
      }

      throw new Error(
        "Gagal mengambil daftar server dari panel Pterodactyl."
      )
    }
  }

  async listUsers(): Promise<
    Array<{
      id: number
      username: string
      email: string
      root_admin?: boolean
    }>
  > {
    try {
      console.error(
        "=== PTERODACTYL LIST USERS CALLED ==="
      )

      const usersResponse =
        await this.request<UserListResponse>(
          "/users"
        )

      if (!usersResponse.data) {
        return []
      }

      console.error(
        "PTERODACTYL LIST USERS SUCCESS:",
        {
          totalUsers:
            usersResponse.data.length,
        }
      )

      return usersResponse.data.map(
        (user) => ({
          id: user.attributes.id,
          username:
            user.attributes.username,
          email:
            user.attributes.email,
          root_admin:
            user.attributes.root_admin,
        })
      )
    } catch (error) {
      console.error(
        "PTERODACTYL LIST USERS REAL ERROR:",
        error
      )

      /*
       * PENTING:
       * Jangan timpa error di sini.
       *
       * Kalau request timeout, pesan:
       * "Panel sedang tidak dapat dihubungi..."
       * akan diteruskan ke check-user-exists.ts
       * dan kemudian muncul ke user.
       */
      if (error instanceof Error) {
        throw error
      }

      throw new Error(
        "Gagal mengambil daftar user dari panel Pterodactyl."
      )
    }
  }

  async userInfo(
    userId: number
  ): Promise<
    | {
        id: number
        username: string
        email: string
        root_admin?: boolean
        total_servers: number

        servers: Array<{
          id: number
          name: string
          user: number
        }>
      }
    | {
        error: string
      }
  > {
    const userResponse =
      await this.request<UserResponse>(
        `/users/${userId}`
      )

    if (!userResponse.attributes) {
      return {
        error: "User not found",
      }
    }

    const servers =
      await this.listServers()

    const userServers =
      servers.filter(
        (server) =>
          server.user === userId
      )

    return {
      id:
        userResponse.attributes.id,

      username:
        userResponse.attributes
          .username,

      email:
        userResponse.attributes
          .email,

      root_admin:
        userResponse.attributes
          .root_admin,

      total_servers:
        userServers.length,

      servers: userServers,
    }
  }

  async deleteServer(
    serverId: number
  ): Promise<any> {
    return this.request(
      `/servers/${serverId}`,
      "DELETE"
    )
  }

  async deleteUser(
    userId: number
  ): Promise<any> {
    return this.request(
      `/users/${userId}`,
      "DELETE"
    )
  }
}