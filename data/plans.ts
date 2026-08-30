export type PlanCategory = "panel-bot" | "admin-panel"

export interface Plan {
  id: string
  category: PlanCategory
  name: string
  memory: number
  disk: number
  cpu: number
  price: number
  description: string
  features: string[]
  badge?: string
}

export const plans: Plan[] = [
  {
    id: "1gb",
    category: "panel-bot",
    name: "Panel Bot 1GB",
    memory: 1025,
    disk: 1025,
    cpu: 40,
    price: 3000,
    description: "Cocok untuk script bot ringan.",
    features: [
      "Private server",
      "Node.js 20+",
      "Aktif ±1 bulan",
      "Garansi 30 hari",
    ],
  },
  {
    id: "2gb",
    category: "panel-bot",
    name: "Panel Bot 2GB",
    memory: 2025,
    disk: 2025,
    cpu: 80,
    price: 5000,
    description: "Resource seimbang untuk bot harian.",
    features: [
      "Private server",
      "Node.js 20+",
      "Aktif ±1 bulan",
      "Garansi 30 hari",
    ],
  },
  {
    id: "3gb",
    category: "panel-bot",
    name: "Panel Bot 3GB",
    memory: 3025,
    disk: 3025,
    cpu: 120,
    price: 7000,
    description: "Lebih kuat untuk kebutuhan bot menengah.",
    features: [
      "Private server",
      "Node.js 20+",
      "Aktif ±1 bulan",
      "Garansi 30 hari",
    ],
  },
  {
    id: "4gb",
    category: "panel-bot",
    name: "Panel Bot 4GB",
    memory: 4025,
    disk: 4025,
    cpu: 160,
    price: 9000,
    description: "Untuk bot aktif dengan penggunaan resource lebih besar.",
    features: [
      "Private server",
      "Node.js 20+",
      "Aktif ±1 bulan",
      "Garansi 30 hari",
    ],
  },
  {
    id: "5gb",
    category: "panel-bot",
    name: "Panel Bot 5GB",
    memory: 5025,
    disk: 5025,
    cpu: 200,
    price: 11000,
    description: "Paket performa untuk script yang lebih kompleks.",
    features: [
      "Private server",
      "Node.js 20+",
      "Aktif ±1 bulan",
      "Garansi 30 hari",
    ],
    badge: "Popular",
  },
  {
    id: "6gb",
    category: "panel-bot",
    name: "Panel Bot 6GB",
    memory: 6025,
    disk: 6025,
    cpu: 240,
    price: 13000,
    description: "Resource besar untuk bot dengan trafik tinggi.",
    features: [
      "Private server",
      "Node.js 20+",
      "Aktif ±1 bulan",
      "Garansi 30 hari",
    ],
  },
  {
    id: "7gb",
    category: "panel-bot",
    name: "Panel Bot 7GB",
    memory: 7025,
    disk: 7025,
    cpu: 280,
    price: 15000,
    description: "Kapasitas besar untuk kebutuhan berat.",
    features: [
      "Private server",
      "Node.js 20+",
      "Aktif ±1 bulan",
      "Garansi 30 hari",
    ],
  },


  {
    id: "unlimited",
    category: "panel-bot",
    name: "Panel Bot Unlimited",
    memory: 0,
    disk: 0,
    cpu: 0,
    price: 20000,
    description: "Panel unlimited untuk kebutuhan resource yang lebih besar.",
    features: [
      "Private server",
      "Node.js 20+",
      "Aktif ±1 bulan",
      "Garansi 30 hari",
    ],
    badge: "Express",
  },


  {
    id: "admin-panel",
    category: "admin-panel",
    name: "Admin Panel Starter",
    memory: 4096,
    disk: 10240,
    cpu: 100,
    price: 30000,
    description: "Akses admin untuk kebutuhan pengelolaan panel.",
    features: [
      "Akses administrator",
      "Kelola panel",
      "Akses fitur admin",
      "Garansi 30 hari",
    ],
    badge: "Admin",
  },
]