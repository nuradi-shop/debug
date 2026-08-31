"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createPayment } from "@/app/actions/create-payment"
import { checkUserExists } from "@/app/actions/check-user-exists"
import { plans } from "@/data/plans"
import type { StoreCategory } from "@/data/store-categories"
import type { RedfingerProductWithStock } from "@/data/redfinger-products"
import type { AlightMotionProductWithStock } from "@/data/alight-motion-products"
import { formatRupiah } from "@/lib/utils"
import {
  Bot,
  Check,
  ChevronRight,
  Cloud,
  Crown,
  Cpu,
  Database,
  HardDrive,
  Loader2,
  Mail,
  PackageOpen,
  Phone,
  Sparkles,
  Film,
  User,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ConfirmationDialog } from "./confirmation-dialog"
import { StatusModal } from "./status-modal"
import { motion } from "framer-motion"

const categoryMeta: Record<
  StoreCategory,
  { label: string; description: string; icon: React.ReactNode }
> = {
  "panel-bot": {
    label: "Panel Bot",
    description: "Untuk WhatsApp, Telegram, Discord, dan bot lainnya.",
    icon: <Bot className="h-4 w-4" />,
  },

  "admin-panel": {
    label: "Admin Panel",
    description:
      "Paket khusus akses dan pengelolaan administrator Pterodactyl.",
    icon: <Crown className="h-4 w-4" />,
  },

  redfinger: {
    label: "Code REDFINGER",
    description:
      "Redeem Code REDFINGER Cloud VIP dengan stok real-time dan pengiriman otomatis.",
    icon: <Cloud className="h-4 w-4" />,
  },
  "alight-motion": { label: "Alight Motion", description: "AM Premium 1 Tahun: Sharing otomatis atau Private proses manual.", icon: <Film className="h-4 w-4" /> },
}

interface PanelFormProps {
  activeCategory: StoreCategory
  onCategoryChange: (category: StoreCategory) => void
}

export default function PanelForm({
  activeCategory,
  onCategoryChange,
}: PanelFormProps) {
  const [username, setUsername] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [selectedPlan, setSelectedPlan] = useState("")

  const [redfingerProducts, setRedfingerProducts] = useState<
    RedfingerProductWithStock[]
  >([])

  const [alightMotionProducts, setAlightMotionProducts] = useState<AlightMotionProductWithStock[]>([])
  const [loadingAlightMotion, setLoadingAlightMotion] = useState(false)
  const [loadingRedfinger, setLoadingRedfinger] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)

  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const [modalType, setModalType] = useState<
    "success" | "error" | "info" | "loading"
  >("info")

  const [modalTitle, setModalTitle] = useState("")
  const [modalMessage, setModalMessage] = useState("")

  const { toast } = useToast()
  const router = useRouter()

  const visiblePlans = useMemo(
    () =>
      activeCategory === "redfinger" || activeCategory === "alight-motion"
        ? []
        : plans.filter((plan) => plan?.category === activeCategory),
    [activeCategory],
  )

  const selectedPanelPlan = plans.find(
    (plan) => plan?.id === selectedPlan,
  )

  const selectedAlightMotion = alightMotionProducts.find((product) => product.productId === selectedPlan)

  const selectedRedfinger = redfingerProducts.find(
    (product) => product.productId === selectedPlan,
  )

  const selectedName =
    selectedRedfinger?.name || selectedAlightMotion?.name || selectedPanelPlan?.name || ""

  const selectedPrice =
    selectedRedfinger?.price ?? selectedAlightMotion?.price ?? selectedPanelPlan?.price ?? 0

  const loadAlightMotion = async () => { setLoadingAlightMotion(true); try { const r=await fetch("/api/alight-motion/products",{cache:"no-store"}); const d=await r.json(); setAlightMotionProducts(Array.isArray(d.products)?d.products:[]) } catch { setAlightMotionProducts([]) } finally { setLoadingAlightMotion(false) } }

  const loadRedfinger = async () => {
    setLoadingRedfinger(true)

    try {
      const response = await fetch("/api/redfinger/products", {
        cache: "no-store",
      })

      const data = await response.json()

      setRedfingerProducts(
        Array.isArray(data.products) ? data.products : [],
      )
    } catch {
      setRedfingerProducts([])
    } finally {
      setLoadingRedfinger(false)
    }
  }

  useEffect(() => { if(activeCategory === "alight-motion") loadAlightMotion() }, [activeCategory])

  useEffect(() => {
    if (activeCategory === "redfinger") {
      loadRedfinger()
    }
  }, [activeCategory])

  const switchCategory = (category: StoreCategory) => {
    onCategoryChange(category)
    setSelectedPlan("")
    setShowConfirmation(false)
  }

  const validateAndContinue = async () => {
    if (!selectedPlan) {
      toast({
        title: "Produk belum dipilih",
        description: "Pilih produk terlebih dahulu.",
        variant: "destructive",
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(email)) {
      toast({
        title: "Email tidak valid",
        description: "Periksa kembali alamat email kamu.",
        variant: "destructive",
      })
      return
    }

    if (activeCategory === "alight-motion") { if(!selectedAlightMotion || selectedAlightMotion.stock<=0){toast({title:"Stok habis",description:"Pilih paket AM Premium yang masih tersedia.",variant:"destructive"});return} setShowConfirmation(true);return }

    if (activeCategory === "redfinger") {
      const cleanPhone = phone.replace(/[\s+()-]/g, "")

      if (!/^(?:08|628)\d{8,13}$/.test(cleanPhone)) {
        toast({
          title: "Nomor WhatsApp tidak valid",
          description:
            "Gunakan nomor aktif, contoh 081234567890.",
          variant: "destructive",
        })
        return
      }

      if (!selectedRedfinger || selectedRedfinger.stock <= 0) {
        toast({
          title: "Stok habis",
          description:
            "Pilih paket REDFINGER yang masih tersedia.",
          variant: "destructive",
        })
        return
      }

      setShowConfirmation(true)
      return
    }

    if (
      username.length < 3 ||
      /[^a-zA-Z0-9]/.test(username)
    ) {
      toast({
        title: "Username belum valid",
        description:
          "Minimal 3 karakter dan hanya boleh huruf serta angka.",
        variant: "destructive",
      })
      return
    }

    setIsValidating(true)

    setModalType("loading")
    setModalTitle("Memeriksa data")
    setModalMessage(
      "Sebentar, kami sedang memeriksa username dan email kamu.",
    )

    setShowModal(true)

    try {
      const result = await checkUserExists(username, email)

      if (!result.success) {
        throw new Error(
          result.error || "Gagal memeriksa data",
        )
      }

      if (result.usernameExists) {
        setModalType("error")
        setModalTitle("Username sudah digunakan")
        setModalMessage(
          "Gunakan username lain untuk melanjutkan.",
        )
        return
      }

      if (result.emailExists) {
        setModalType("error")
        setModalTitle("Email sudah digunakan")
        setModalMessage(
          "Gunakan email lain untuk melanjutkan.",
        )
        return
      }

      setShowModal(false)
      setShowConfirmation(true)
    } catch (error) {
      setModalType("error")
      setModalTitle("Pemeriksaan gagal")

      setModalMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memeriksa data.",
      )

      setShowModal(true)
    } finally {
      setIsValidating(false)
    }
  }

  const handleSubmit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault()
    await validateAndContinue()
  }

  const handleConfirm = async () => {
    if (isLoading) return

    setIsLoading(true)

    try {
      const timeout = new Promise<never>(
        (_, reject) =>
          setTimeout(
            () =>
              reject(
                new Error(
                  "Gateway pembayaran tidak merespons. Coba lagi beberapa saat.",
                ),
              ),
            15000,
          ),
      )

      const customerValue =
        activeCategory === "redfinger" ? phone : activeCategory === "alight-motion" ? "AM Premium" : username

      const result = await Promise.race([
        createPayment(
          selectedPlan,
          customerValue,
          email,
          activeCategory,
        ),
        timeout,
      ])

      if (!result.success || !result.transactionId) {
        throw new Error(
          result.error ||
            "Pembayaran belum dapat dibuat.",
        )
      }

      setShowConfirmation(false)

      router.push(
        `/invoice/${result.transactionId}`,
      )
    } catch (error) {
      setShowConfirmation(false)

      setModalType("error")
      setModalTitle(
        "Pembayaran belum tersedia",
      )

      setModalMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat membuat pembayaran.",
      )

      setShowModal(true)
      setIsLoading(false)
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-[28px] border border-cyan-300/10 bg-[#0A1020]/95 shadow-[0_30px_90px_rgba(0,0,0,.35)] backdrop-blur-xl"
      >
        <div className="border-b border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,.12),transparent_45%),radial-gradient(circle_at_top_right,rgba(139,92,246,.10),transparent_42%)] p-5 md:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">
                Katalog Produk
              </p>

              <h2 className="mt-1 text-2xl font-black tracking-tight text-white">
                Pilihan jenis produk
              </h2>
            </div>

            <div className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/5 text-cyan-200 sm:flex">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="space-y-6 p-4 md:p-7">
          <div className="grid gap-3 md:grid-cols-2">
            {activeCategory === "redfinger" ? (
              <Field
                icon={
                  <Phone className="h-4 w-4" />
                }
                label="Nomor WhatsApp"
              >
                <Input
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  placeholder="081234567890"
                  required
                  inputMode="tel"
                  className="h-12 rounded-xl border-white/10 bg-[#070B15] text-white placeholder:text-slate-600 focus:border-cyan-300/50 focus:ring-cyan-300/20"
                />
              </Field>
            ) : activeCategory === "alight-motion" ? null : (
              <Field
                icon={
                  <User className="h-4 w-4" />
                }
                label="Username"
              >
                <Input
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  placeholder="contoh: brock123"
                  required
                  className="h-12 rounded-xl border-white/10 bg-[#070B15] text-white placeholder:text-slate-600 focus:border-cyan-300/50 focus:ring-cyan-300/20"
                />
              </Field>
            )}

            <Field
              icon={<Mail className="h-4 w-4" />}
              label="Email Aktif"
            >
              <Input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="nama@email.com"
                required
                className="h-12 rounded-xl border-white/10 bg-[#070B15] text-white placeholder:text-slate-600 focus:border-cyan-300/50 focus:ring-cyan-300/20"
              />
            </Field>
          </div>

          <div>
            <div className="grid grid-cols-2 gap-1.5 rounded-2xl sm:grid-cols-4 border border-white/8 bg-[#070B15] p-1.5">
              {(
                Object.keys(
                  categoryMeta,
                ) as StoreCategory[]
              ).map((category) => {
                const meta =
                  categoryMeta[category]

                const active =
                  activeCategory === category

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() =>
                      switchCategory(category)
                    }
                    className={`flex min-h-12 items-center justify-center gap-1.5 rounded-xl px-2 text-[11px] font-black transition-all sm:text-sm ${
                      active
                        ? "bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-400 text-[#041017] shadow-[0_12px_34px_rgba(34,211,238,.16)]"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {meta.icon}

                    <span className="truncate">
                      {meta.label}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="mt-3 flex items-start gap-2 rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-3 text-xs leading-5 text-slate-500">
              <span className="mt-0.5 text-cyan-300">
                {
                  categoryMeta[
                    activeCategory
                  ].icon
                }
              </span>

              <span>
                {
                  categoryMeta[
                    activeCategory
                  ].description
                }
              </span>
            </div>
          </div>

          {activeCategory === "alight-motion" ? (
            loadingAlightMotion ? (
              <div className="flex min-h-[180px] items-center justify-center rounded-[22px] border border-white/8 bg-white/[0.02]"><Loader2 className="h-6 w-6 animate-spin text-cyan-300" /></div>
            ) : alightMotionProducts.length > 0 ? (
              <motion.div key="alight-motion" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} className="grid grid-cols-2 gap-2.5 lg:gap-3">
                {alightMotionProducts.map((product) => { const active=selectedPlan===product.productId; const soldOut=product.stock<=0; return (
                  <button key={product.productId} type="button" disabled={soldOut} onClick={()=>setSelectedPlan(product.productId)} className={`relative min-h-[190px] rounded-[20px] border p-4 text-left transition-all ${active?"border-cyan-300/60 bg-cyan-300/[0.075]":soldOut?"cursor-not-allowed border-white/5 bg-white/[0.015] opacity-55":"border-white/8 bg-white/[0.025] hover:border-cyan-300/25 hover:bg-white/[0.04]"}`}>
                    <div className="flex items-start justify-between gap-2"><div><div className="flex items-center gap-2"><Film className="h-4 w-4 text-cyan-300"/><h3 className="text-sm font-black text-white">{product.name}</h3></div><p className="mt-2 text-2xl font-black text-cyan-200">{formatRupiah(product.price)}</p></div>{active&&<div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-300 text-[#041017]"><Check className="h-4 w-4"/></div>}</div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]"><Mini label="Masa Aktif" value={product.duration}/><Mini label="Stok" value={soldOut?"HABIS":String(product.stock)}/></div><div className="mt-3 inline-flex rounded-full border border-violet-300/15 bg-violet-300/5 px-2 py-1 text-[10px] font-black text-violet-200">{product.badge}</div><p className="mt-3 text-[11px] leading-4 text-slate-500">{product.description}</p>
                  </button>) })}
              </motion.div>
            ) : <div className="rounded-[22px] border border-dashed border-cyan-300/15 px-5 py-10 text-center text-sm text-slate-500">Produk AM Premium belum tersedia. Isi stok MongoDB terlebih dahulu.</div>
          ) : activeCategory === "redfinger" ? (
            loadingRedfinger ? (
              <div className="flex min-h-[180px] items-center justify-center rounded-[22px] border border-white/8 bg-white/[0.02]">
                <Loader2 className="h-6 w-6 animate-spin text-cyan-300" />
              </div>
            ) : redfingerProducts.length >
              0 ? (
              <motion.div
                key="redfinger"
                initial={{
                  opacity: 0,
                  y: 6,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="grid grid-cols-2 gap-2.5 lg:gap-3"
              >
                {redfingerProducts.map(
                  (product) => {
                    const active =
                      selectedPlan ===
                      product.productId

                    const soldOut =
                      product.stock <= 0

                    return (
                      <button
                        key={
                          product.productId
                        }
                        type="button"
                        disabled={soldOut}
                        onClick={() =>
                          setSelectedPlan(
                            product.productId,
                          )
                        }
                        className={`group relative min-h-[190px] overflow-hidden rounded-[20px] border p-3 text-left transition-all duration-200 sm:min-h-[200px] sm:p-4 ${
                          active
                            ? "border-cyan-300/60 bg-cyan-300/[0.075] shadow-[0_0_0_1px_rgba(103,232,249,.12),0_18px_44px_rgba(0,0,0,.28)]"
                            : soldOut
                              ? "cursor-not-allowed border-white/5 bg-white/[0.015] opacity-55"
                              : "border-white/8 bg-white/[0.025] hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-white/[0.04]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <Cloud className="h-4 w-4 shrink-0 text-cyan-300" />

                              <h3 className="line-clamp-2 text-[12px] font-black leading-4 text-white sm:text-sm">
                                {
                                  product.name
                                }
                              </h3>
                            </div>

                            <p className="mt-2 text-xl font-black text-cyan-200 sm:text-2xl">
                              {formatRupiah(
                                product.price,
                              )}
                            </p>
                          </div>

                          {active && (
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-300 text-[#041017]">
                              <Check className="h-4 w-4" />
                            </div>
                          )}
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] sm:text-[11px]">
                          <Mini
                            label="Masa Aktif"
                            value={
                              product.duration
                            }
                          />

                          <div
                            className={`rounded-xl border p-2 ${
                              soldOut
                                ? "border-rose-300/15 bg-rose-300/[0.04]"
                                : "border-white/6 bg-black/20"
                            }`}
                          >
                            <div
                              className={`mt-1 text-[10px] font-black sm:text-[11px] ${
                                soldOut
                                  ? "text-rose-300"
                                  : "text-cyan-200"
                              }`}
                            >
                              {soldOut
                                ? "STOK HABIS"
                                : `Stok ${product.stock}`}
                            </div>
                          </div>
                        </div>

                        <p className="mt-3 line-clamp-2 text-[10px] leading-4 text-slate-500 sm:text-[11px]">
                          {
                            product.description
                          }
                        </p>
                      </button>
                    )
                  },
                )}
              </motion.div>
            ) : (
              <div className="rounded-[22px] border border-dashed border-cyan-300/15 bg-cyan-300/[0.025] px-5 py-10 text-center">
                <PackageOpen className="mx-auto h-7 w-7 text-cyan-300/70" />

                <h3 className="mt-3 text-sm font-bold text-white">
                  Produk REDFINGER belum
                  tersedia
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Pastikan koneksi MongoDB
                  aktif lalu muat ulang
                  halaman.
                </p>
              </div>
            )
          ) : visiblePlans.length > 0 ? (
            <motion.div
              key={activeCategory}
              initial={{
                opacity: 0,
                y: 6,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.18,
              }}
              className="grid grid-cols-2 gap-2.5 lg:gap-3"
            >
              {visiblePlans.map((plan) => {
                const active =
                  selectedPlan === plan.id

                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() =>
                      setSelectedPlan(plan.id)
                    }
                    className={`group relative min-h-[188px] overflow-hidden rounded-[20px] border p-3 text-left transition-all duration-200 sm:min-h-[200px] sm:p-4 ${
                      active
                        ? "border-cyan-300/60 bg-cyan-300/[0.075] shadow-[0_0_0_1px_rgba(103,232,249,.12),0_18px_44px_rgba(0,0,0,.28)]"
                        : "border-white/8 bg-white/[0.025] hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="line-clamp-2 text-[12px] font-black leading-4 text-white sm:text-sm">
                          {plan.name}
                        </h3>

                        <p className="mt-2 text-xl font-black text-cyan-200 sm:text-2xl">
                          {formatRupiah(
                            plan.price,
                          )}
                        </p>
                      </div>

                      {active && (
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-300 text-[#041017]">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </div>

                    {plan.category ===
                    "admin-panel" ? (
                      <div className="mt-4 rounded-xl border border-violet-300/10 bg-violet-300/[0.035] p-3 text-[10px] text-slate-400 sm:text-[11px]">
                        Akses Administrator
                        Pterodactyl
                      </div>
                    ) : (
                      <div className="mt-4 grid grid-cols-3 gap-1.5">
                        <MiniIcon
                          icon={
                            <Database className="h-3.5 w-3.5" />
                          }
                          label="RAM"
                          value={
                            plan.memory === 0
                              ? "∞"
                              : `${plan.memory} MB`
                          }
                        />

                        <MiniIcon
                          icon={
                            <HardDrive className="h-3.5 w-3.5" />
                          }
                          label="Disk"
                          value={
                            plan.disk === 0
                              ? "∞"
                              : `${plan.disk} MB`
                          }
                        />

                        <MiniIcon
                          icon={
                            <Cpu className="h-3.5 w-3.5" />
                          }
                          label="CPU"
                          value={
                            plan.cpu === 0
                              ? "∞"
                              : `${plan.cpu}%`
                          }
                        />
                      </div>
                    )}

                    <p className="mt-3 line-clamp-2 text-[10px] leading-4 text-slate-500 sm:text-[11px]">
                      {plan.description}
                    </p>
                  </button>
                )
              })}
            </motion.div>
          ) : (
            <div className="rounded-[22px] border border-dashed border-cyan-300/15 bg-cyan-300/[0.025] px-5 py-10 text-center">
              <PackageOpen className="mx-auto h-7 w-7 text-cyan-300/70" />

              <h3 className="mt-3 text-sm font-bold text-white">
                Belum ada produk di kategori
                ini
              </h3>
            </div>
          )}

          <Button
            type="submit"
            disabled={
              isValidating ||
              !selectedPlan ||
              (activeCategory ===
                "redfinger" &&
                !!selectedRedfinger &&
                selectedRedfinger.stock <= 0)
            }
            className="hidden h-14 w-full rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 font-black text-[#041017] shadow-[0_14px_45px_rgba(34,211,238,.14)] hover:brightness-110 disabled:opacity-40 sm:flex"
          >
            {isValidating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Memeriksa data...
              </>
            ) : (
              <>
                Lanjutkan Pembayaran
                <ChevronRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </form>

      {!!selectedPlan && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-cyan-300/15 bg-[#070B15]/95 p-3 shadow-[0_-18px_60px_rgba(0,0,0,.45)] backdrop-blur-xl sm:hidden">
          <div className="mx-auto flex max-w-xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-bold text-white">
                {selectedName}
              </p>

              <p className="text-base font-black text-cyan-200">
                {formatRupiah(
                  selectedPrice,
                )}
              </p>
            </div>

            <Button
              type="button"
              onClick={
                validateAndContinue
              }
              disabled={
                isValidating
              }
              className="h-11 rounded-xl bg-gradient-to-r from-cyan-300 to-sky-400 px-4 font-black text-[#041017]"
            >
              {isValidating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Lanjut
                  <ChevronRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      <StatusModal
        isOpen={showModal}
        onClose={() =>
          !isLoading &&
          setShowModal(false)
        }
        type={modalType}
        title={modalTitle}
        message={modalMessage}
      />

      <ConfirmationDialog
        open={showConfirmation}
        onOpenChange={
          setShowConfirmation
        }
        planId={selectedPlan}
        onConfirm={handleConfirm}
        isLoading={isLoading}
        category={activeCategory}
        redfingerProduct={
          selectedRedfinger
        }
      />
    </>
  )
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-400">
        <span className="text-cyan-300">
          {icon}
        </span>

        {label}
      </span>

      {children}
    </label>
  )
}

function Mini({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-white/6 bg-black/20 p-2">
      <div className="text-[9px] text-slate-600">
        {label}
      </div>

      <div className="mt-1 truncate text-[10px] font-bold text-slate-300 sm:text-[11px]">
        {value}
      </div>
    </div>
  )
}

function MiniIcon({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-white/6 bg-black/20 p-2">
      <div className="text-cyan-300">
        {icon}
      </div>

      <div className="mt-1 text-[9px] text-slate-600">
        {label}
      </div>

      <div className="truncate text-[9px] font-bold text-slate-300 sm:text-[10px]">
        {value}
      </div>
    </div>
  )
}