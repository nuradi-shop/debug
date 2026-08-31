export interface AlightMotionProduct {
  productId: string
  name: string
  duration: string
  type: "sharing" | "private"
  price: number
  description: string
  active: boolean
  badge: string
}

export interface AlightMotionProductWithStock extends AlightMotionProduct { stock: number }

export const defaultAlightMotionProducts: AlightMotionProduct[] = [
  { productId: "am-sharing-1y", name: "AM Premium Sharing 1 Tahun", duration: "1 Tahun", type: "sharing", price: 3000, description: "Akun sharing dikirim otomatis ke email setelah pembayaran berhasil.", active: true, badge: "SHARING" },
  { productId: "am-private-1y", name: "AM Premium Private 1 Tahun", duration: "1 Tahun", type: "private", price: 7000, description: "Pesanan private diproses manual oleh admin setelah pembayaran berhasil.", active: true, badge: "PRIVATE" },
]
