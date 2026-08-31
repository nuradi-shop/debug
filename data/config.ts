export const pterodactylConfig = {
  domain: (process.env.PANEL_DOMAIN || "https://panelprivatemngyaanzpanel7631.buyervps.my.id").replace(/\/$/, ""),
  apiKey: process.env.PANEL_APIKEY,
  nests: "5",
  nestsGame: "2",
  egg: "15",
  eggSamp: "16",
  location: "1",
}

export const appConfig = {
  whatsappChannelLink: "https://whatsapp.com/channel/0029Valq3pQHVvThh0GDrh1w",
  nameHost: "BROCK STORE",

  brand: {
    // Ganti file ini kapan saja kalau mau pakai logo baru.
    logo: "/brock.png",
  },

  feeMin: 135,
  feeMax: 136,

  garansi: {
    warrantyDays: 30,
    replaceLimit: 5,
  },

  pay: {
    api_key: process.env.SAKURUPIAH_APIKEY,
    api_id: process.env.SAKURUPIAH_ID,
  },

  emailSender: {
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "brockstore71@gmail.com",
      pass: process.env.GMAIL_PASSWORD,
    },
    from: "TIM BROCK STORE <brockstore71@gmail.com>",
  },

  auth: {
    verificationCodeMinutes: 5,
    resetPasswordMinutes: 5,
    resendVerificationCooldownSeconds: 60,
    // Heartbeat hanya berjalan saat BROCK STORE terlihat.
    heartbeatSeconds: 20,
    // Tanpa heartbeat selama 5 menit = sesi berakhir.
    awaySessionMinutes: 5,
  },

  emailTemplates: {
    panelBot: {
      subject: "DATA PANEL BOT ANDA",
      title: "PEMBAYARAN PANEL BOT BERHASIL",
    },
    adminPanel: {
      subject: "DATA AKUN ADMIN PANEL ANDA",
      title: "PEMBAYARAN ADMIN PANEL BERHASIL",
    },
    redfinger: {
      subject: "KODE REDFINGER ANDA",
      title: "PEMBAYARAN REDFINGER BERHASIL",
    },
    amSharing: {
      subject: "AKUN AM PREMIUM SHARING ANDA",
      title: "PEMBAYARAN AM PREMIUM SHARING BERHASIL",
    },
    amPrivate: {
      subject: "PESANAN AM PREMIUM PRIVATE ANDA",
      title: "PEMBAYARAN AM PREMIUM PRIVATE BERHASIL",
    },
    verification: {
      subject: "KODE VERIFIKASI PENDAFTARAN",
      title: "VERIFIKASI EMAIL BROCK STORE",
    },
    resetPassword: {
      subject: "RESET PASSWORD BROCK STORE",
      title: "PERMINTAAN RESET PASSWORD",
    },
  },

  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || "",
    ownerId: process.env.TELEGRAM_OWNER_ID || "",
  },

  mongodb: {
    uri: process.env.MONGODB_URL,
    dbName: "Cluster0",
  },

  alightMotion: {
    sharing: {
      name: "AM Premium Sharing 1 Tahun",
      price: 3000,
      delivery: "automatic",
    },
    private: {
      name: "AM Premium Private 1 Tahun",
      price: 7000,
      delivery: "manual",
      adminWhatsapp: "https://wa.me/6283112108527",
    },
  },

  socialMedia: {
    whatsapp: "https://wa.me/6283112108527",
    whatsappChannel: "https://whatsapp.com/channel/0029Valq3pQHVvThh0GDrh1w",
    telegram: "https://t.me/brockstoreidd",
    tiktok: "https://www.tiktok.com/@brockstoree",
    instagram: "https://www.instagram.com/nuradistore",
  },
}