import nodemailer from "nodemailer"
import { appConfig, pterodactylConfig } from "@/data/config"

type PanelType = "panel-bot" | "admin-panel"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: appConfig.emailSender.auth.user,
    pass: appConfig.emailSender.auth.pass,
  },
})

export async function sendPanelDetailsEmail(
  to: string,
  username: string,
  password: string,
  serverId: number | null,
  planName: string,
  panelType: PanelType = "panel-bot",
  transactionId?: string,
) {
  const panelUrl = pterodactylConfig.domain
  const isAdmin = panelType === "admin-panel"

  const mailOptions = {
    from: appConfig.emailSender.from,
    to,
    subject: `Detail Akun Panel Pterodactyl ${appConfig.nameHost}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e0e0e0;border-radius:8px">

        <div style="background:linear-gradient(to right,#e53e3e,#c53030);padding:15px;border-radius:8px 8px 0 0">
          <h2 style="color:white;margin:0;text-align:center">
            ${appConfig.nameHost} - Detail Panel Pterodactyl
          </h2>
        </div>

        <div style="padding:20px;background:#f8f9fa">

          <p>Halo,</p>

          <p>
            Terima kasih telah membeli panel Pterodactyl di
            ${appConfig.nameHost}. Pembayaran Anda telah berhasil dan
            pesanan telah diproses secara otomatis.
          </p>

          ${
            transactionId
              ? `
                <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:15px;margin:20px 0">
                  <p style="margin:0 0 6px 0;font-size:12px;color:#9a3412;font-weight:bold">
                    ID TRANSAKSI
                  </p>

                  <div style="
                    font-family:monospace;
                    font-size:18px;
                    font-weight:bold;
                    color:#7c2d12;
                    background:#ffedd5;
                    border-radius:6px;
                    padding:10px;
                    word-break:break-all;
                  ">
                    ${transactionId}
                  </div>

                  <p style="margin:10px 0 0 0;font-size:12px;line-height:18px;color:#9a3412">
                    Simpan ID transaksi ini sebagai bukti pembelian.
                    ID transaksi wajib disertakan saat melakukan klaim garansi panel.
                  </p>
                </div>
              `
              : ""
          }

          <div style="background:#fff;border:1px solid #e0e0e0;border-radius:8px;padding:15px;margin:20px 0">

            <p>
              <strong>Paket:</strong>
              ${planName}
            </p>

            <p>
              <strong>Username:</strong>
              ${username}
            </p>

            <p>
              <strong>Password:</strong>
              <code style="background:#f0f0f0;padding:2px 4px;border-radius:3px">
                ${password}
              </code>
            </p>

            ${
              isAdmin
                ? `
                  <p>
                    <strong>Hak Akses:</strong>
                    Administrator
                  </p>
                `
                : serverId !== null
                  ? `
                    <p>
                      <strong>Server ID:</strong>
                      ${serverId}
                    </p>
                  `
                  : ""
            }

            <p>
              <strong>URL Panel:</strong>
              <a
                href="${panelUrl}"
                style="color:#e53e3e"
              >
                ${panelUrl}
              </a>
            </p>

          </div>

          <div style="text-align:center;margin:20px 0">
            <a
              href="${panelUrl}"
              style="
                background:#e53e3e;
                color:white;
                padding:10px 20px;
                text-decoration:none;
                border-radius:5px;
                font-weight:bold;
              "
            >
              Login Sekarang
            </a>
          </div>

          <div style="
            background:#fff;
            border-left:4px solid #e53e3e;
            padding:12px 15px;
            margin:20px 0;
            font-size:13px;
            line-height:20px;
          ">
            <strong>Informasi Garansi Panel</strong>
            <br />
            Untuk melakukan klaim garansi, sertakan ID transaksi pembelian Anda.
            Simpan email ini sebagai bukti transaksi.
          </div>

          <p>
            Silakan login ke panel dengan kredensial di atas.
            Jika Anda memiliki pertanyaan atau membutuhkan bantuan,
            jangan ragu untuk menghubungi tim dukungan kami.
          </p>

          <p>
            Anda juga dapat bergabung dengan grup WhatsApp kami untuk
            mendapatkan informasi terbaru dan dukungan.
          </p>

          <div style="text-align:center;margin:20px 0">
            <a
              href="${appConfig.whatsappGroupLink}"
              style="
                background:#25D366;
                color:white;
                padding:10px 20px;
                text-decoration:none;
                border-radius:5px;
                font-weight:bold;
              "
            >
              Gabung Grup WhatsApp
            </a>
          </div>

          <p style="margin-top:30px">
            Salam,
            <br />
            Tim ${appConfig.nameHost}
          </p>

        </div>
      </div>
    `,
  }

  try {
    await transporter.verify()

    const info = await transporter.sendMail(mailOptions)

    return {
      success: true,
      messageId: info.messageId,
    }
  } catch (error) {
    console.error("Error sending panel email:", error)

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    }
  }
}

export async function sendRedfingerDetailsEmail(
  to: string,
  productName: string,
  duration: string,
  redeemCode: string,
) {
  const mailOptions = {
    from: appConfig.emailSender.from,
    to,
    subject: `Redeem Code REDFINGER - ${appConfig.nameHost}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e0e0e0;border-radius:8px">

        <div style="background:linear-gradient(to right,#06b6d4,#3b82f6,#8b5cf6);padding:15px;border-radius:8px 8px 0 0">

          <h2 style="color:white;margin:0;text-align:center">
            ${appConfig.nameHost} - REDFINGER
          </h2>

        </div>

        <div style="padding:20px;background:#f8f9fa">

          <p>Halo,</p>

          <p>
            Terima kasih telah membeli produk REDFINGER di
            ${appConfig.nameHost}. Pembayaran Anda telah berhasil dan
            pesanan telah diproses secara otomatis.
          </p>

          <p>Berikut adalah detail produk Anda:</p>

          <div style="background:#fff;border:1px solid #e0e0e0;border-radius:8px;padding:18px;margin:20px 0">

            <p>
              <strong>Produk:</strong>
              ${productName}
            </p>

            <p>
              <strong>Masa Aktif:</strong>
              ${duration}
            </p>

            <p>
              <strong>Redeem Code:</strong>
            </p>

            <div style="
              font-family:monospace;
              font-size:20px;
              font-weight:bold;
              letter-spacing:1px;
              background:#f1f5f9;
              padding:14px;
              border-radius:8px;
              word-break:break-all;
            ">
              ${redeemCode}
            </div>

          </div>

          <p>
            Silakan gunakan Redeem Code di atas untuk melakukan
            aktivasi pada REDFINGER.
          </p>

          <p>
            Pastikan Anda menyimpan kode dengan baik dan tidak
            membagikannya kepada orang lain.
          </p>

          <p>
            Jika mengalami kendala terkait pesanan,
            silakan hubungi Admin ${appConfig.nameHost}.
          </p>

          <p style="margin-top:30px">
            Terima kasih telah berbelanja di ${appConfig.nameHost}.
            <br /><br />
            Salam,
            <br />
            Tim ${appConfig.nameHost}
          </p>

        </div>
      </div>
    `,
  }

  try {
    await transporter.verify()

    const info = await transporter.sendMail(mailOptions)

    return {
      success: true,
      messageId: info.messageId,
    }
  } catch (error) {
    console.error("Error sending REDFINGER email:", error)

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    }
  }
}