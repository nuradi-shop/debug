import { notFound } from "next/navigation"
import { getPayment } from "@/lib/payments"
import { InvoiceDetails } from "@/components/invoice-details"
import { QrPayment } from "@/components/qr-payment"
import { InvoiceHeader } from "@/components/invoice-header"
import { SocialMediaButton } from "@/components/social-media-button"

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payment = await getPayment(id)
  if (!payment) notFound()

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070A10] pt-20 text-white">
      <InvoiceHeader />
      <SocialMediaButton />
      <div className="pointer-events-none absolute inset-0 hero-grid opacity-20" />
      <div className="pointer-events-none absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[100px]" />

      <main className="relative mx-auto max-w-4xl px-4 py-10 md:px-6 md:py-14">
        <div className="mb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">Checkout</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">Selesaikan pembayaran</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">Invoice dan status pembayaran ditampilkan dalam satu halaman. Setelah pembayaran berhasil, pesanan diproses otomatis sesuai produk yang dibeli.</p>
        </div>

        <div className="space-y-5">
          <InvoiceDetails
            transactionId={payment.transactionId}
            planId={payment.planId}
            productType={payment.productType || "panel"}
            productName={payment.productName}
            duration={payment.duration}
            username={payment.username}
            phone={payment.phone}
            email={payment.email}
            amount={payment.amount}
            fee={payment.fee}
            total={payment.total}
            createdAt={payment.createdAt}
            status={payment.status}
          />
          <QrPayment
            transactionId={payment.transactionId}
            amount={payment.amount}
            fee={payment.fee}
            total={payment.total}
            qrImageUrl={payment.qrImageUrl}
            expirationTime={payment.expirationTime}
            status={payment.status}
            username={payment.username}
            phone={payment.phone}
            email={payment.email}
            planId={payment.planId}
            productType={payment.productType || "panel"}
            productName={payment.productName}
            createdAt={payment.createdAt}
            initialPanelDetails={payment.panelDetails || null}
            initialRedfingerDetails={payment.redfingerDetails || null}
          />
        </div>
      </main>
    </div>
  )
}
