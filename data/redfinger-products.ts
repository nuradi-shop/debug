export interface RedfingerProduct {
  productId: string
  name: string
  duration: string
  price: number
  description: string
  active: boolean
  badge?: string
}

export interface RedfingerProductWithStock extends RedfingerProduct {
  stock: number
}

export const defaultRedfingerProducts: RedfingerProduct[] = [
  {
    productId: "redfinger-vip-7d",
    name: "REDFINGER VIP 7 HARI",
    duration: "7 Hari",
    price: 21000,
    description: "Redeem Code REDFINGER VIP 7 Hari untuk All Android.",
    active: true,
    badge: "VIP 7H",
  },
  {
    productId: "redfinger-vip-30d",
    name: "REDFINGER VIP 30 HARI",
    duration: "30 Hari",
    price: 59000,
    description: "Redeem Code REDFINGER VIP 30 Hari untuk All Android.",
    active: true,
    badge: "VIP 30H",
  },
  {
    productId: "redfinger-kvip-7d",
    name: "REDFINGER KVIP 7 HARI",
    duration: "7 Hari",
    price: 37000,
    description: "Redeem Code REDFINGER KVIP 7 Hari untuk All Android.",
    active: true,
    badge: "KVIP 7H",
  },
  {
    productId: "redfinger-kvip-30d",
    name: "REDFINGER KVIP 30 HARI",
    duration: "30 Hari",
    price: 105000,
    description: "Redeem Code REDFINGER KVIP 30 Hari untuk All Android.",
    active: true,
    badge: "KVIP 30H",
  },
  {
    productId: "redfinger-svip-7d",
    name: "REDFINGER SVIP 7 HARI",
    duration: "7 Hari",
    price: 47000,
    description: "Redeem Code REDFINGER SVIP 7 Hari untuk All Android.",
    active: true,
    badge: "SVIP 7H",
  },
  {
    productId: "redfinger-svip-30d",
    name: "REDFINGER SVIP 30 HARI",
    duration: "30 Hari",
    price: 135000,
    description: "Redeem Code REDFINGER SVIP 30 Hari untuk All Android.",
    active: true,
    badge: "SVIP 30H",
  },
]