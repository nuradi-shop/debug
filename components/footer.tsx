import Link from "next/link"
import {
  Bot,
  MessageCircle,
  Send,
  Instagram,
  Music2,
  Youtube,
} from "lucide-react"
import { appConfig } from "@/data/config"

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#05070B]">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">

        {/* BRAND */}
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200">
                <Bot className="h-5 w-5" />
              </div>

              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-slate-600">
                  Panel Store
                </div>

                <div className="font-black text-white">
                  {appConfig.nameHost}
                </div>
              </div>
            </div>

            <p className="mt-4 max-w-md text-xs leading-6 text-slate-600">
              Layanan panel Pterodactyl dengan proses pembelian yang
              sederhana, cepat, dan transparan.
            </p>
          </div>
        </div>

        {/* MENU FOOTER */}
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-slate-500">

          <Link
            href="/history"
            className="transition-colors hover:text-cyan-200"
          >
            Riwayat
          </Link>

          <Link
            href="/garansi"
            className="transition-colors hover:text-cyan-200"
          >
            Garansi
          </Link>

          <a
            href="https://wa.me/6283112108527"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-cyan-200"
          >
            WhatsApp
          </a>

          <a
            href="https://t.me/brockstoreidd"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-cyan-200"
          >
            Telegram
          </a>

          <a
            href="https://whatsapp.com/channel/0029Valq3pQHVvThh0GDrh1w"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-cyan-200"
          >
            Komunitas
          </a>

          <a
            href="https://www.instagram.com/nuradistore"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-cyan-200"
          >
            Instagram
          </a>

          <a
            href="https://www.tiktok.com/@brockstoree"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-cyan-200"
          >
            TikTok
          </a>

        </div>

        {/* SOCIAL MEDIA ICON */}
        <div className="mt-7">

          <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.20em] text-slate-700">
            Social Media
          </div>

          <div className="flex flex-wrap items-center gap-3">

            {/* WHATSAPP */}
            <a
              href="https://wa.me/6283112108527"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              title="WhatsApp"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] text-slate-500 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-cyan-200"
            >
              <MessageCircle className="h-[18px] w-[18px]" />
            </a>

            {/* TELEGRAM */}
            <a
              href="https://t.me/brockstoreidd"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              title="Telegram"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] text-slate-500 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-cyan-200"
            >
              <Send className="h-[18px] w-[18px]" />
            </a>

            {/* INSTAGRAM */}
            <a
              href="https://www.instagram.com/nuradistore"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              title="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] text-slate-500 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-cyan-200"
            >
              <Instagram className="h-[18px] w-[18px]" />
            </a>

            {/* TIKTOK */}
            <a
              href="https://www.tiktok.com/@brockstoree"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              title="TikTok"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] text-slate-500 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-cyan-200"
            >
              <Music2 className="h-[18px] w-[18px]" />
            </a>

            {/* YOUTUBE */}
            <a
              href="https://youtube.com/@brockstoree"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              title="YouTube"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] text-slate-500 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-cyan-200"
            >
              <Youtube className="h-[18px] w-[18px]" />
            </a>

          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="mt-8 flex flex-col gap-2 border-t border-white/5 pt-6 text-[11px] text-slate-700 sm:flex-row sm:items-center sm:justify-between">

          <span>
            © {new Date().getFullYear()} {appConfig.nameHost}. All rights reserved.
          </span>

          <span>
            Built for fast panel ordering.
          </span>

        </div>

      </div>
    </footer>
  )
}