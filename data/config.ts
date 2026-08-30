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
  whatsappGroupLink: "https://whatsapp.com/channel/0029Valq3pQHVvThh0GDrh1w",
  nameHost: "BROCK STORE",

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

  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || "",
    ownerId: process.env.TELEGRAM_OWNER_ID || "",
  },

  mongodb: {
    uri: process.env.MONGODB_URL,
    dbName: "Cluster0",
  },

  socialMedia: {
    whatsapp: "https://wa.me/6283112108527",
    telegram: "https://t.me/brockstoreidd",
    tiktok: "https://www.tiktok.com/@brockstoree",
    instagram: "https://www.instagram.com/nuradistore",
  },
}