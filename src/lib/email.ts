import { Resend } from 'resend'

const FROM  = process.env.RESEND_FROM_EMAIL ?? 'noreply@palaisrouge.online'
const ADMIN = process.env.RESEND_ADMIN_EMAIL ?? 'admin@palaisrouge.online'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

export interface ContactSubmission {
  name: string
  email?: string
  phone?: string
  whatsapp?: string
  message: string
  propertyTitle?: string
  propertyUrl?: string
  toEmail?: string
}

export async function sendContactNotification(data: ContactSubmission) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Resend] RESEND_API_KEY not set — skipping email')
    return
  }

  const propertyLine = data.propertyTitle
    ? `<tr><td style="padding:8px 0;color:#7A7570;font-size:14px;">Propriété concernée</td>
       <td style="padding:8px 0;font-weight:600;">${data.propertyTitle}</td></tr>`
    : ''

  const phoneLine = data.phone
    ? `<tr><td style="padding:8px 0;color:#7A7570;font-size:14px;">Téléphone</td>
       <td style="padding:8px 0;">${data.phone}</td></tr>`
    : ''

  const whatsappLine = data.whatsapp
    ? `<tr><td style="padding:8px 0;color:#7A7570;font-size:14px;">WhatsApp</td>
       <td style="padding:8px 0;">${data.whatsapp}</td></tr>`
    : ''

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head><meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#F7F3EE;
      font-family:'DM Sans',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0"
        style="background:#F7F3EE;padding:40px 0;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0"
            style="background:#FFFFFF;border-radius:8px;overflow:hidden;
            box-shadow:0 2px 8px rgba(0,0,0,0.08);">

            <tr>
              <td style="background:#8B1A1A;padding:32px 40px;">
                <p style="margin:0;color:#FFFFFF;font-size:22px;
                  font-weight:700;letter-spacing:1px;">
                  PALAIS ROUGE IMMO
                </p>
                <p style="margin:8px 0 0;color:rgba(255,255,255,0.75);
                  font-size:13px;">
                  Nouvelle demande de contact
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:40px;">
                <p style="margin:0 0 24px;font-size:16px;color:#1A1A1A;">
                  Un visiteur a soumis le formulaire de contact.
                </p>

                <table width="100%" cellpadding="0" cellspacing="0"
                  style="border-top:1px solid #EDEAE5;
                  border-bottom:1px solid #EDEAE5;margin-bottom:24px;">
                  <tr>
                    <td style="padding:8px 0;color:#7A7570;
                      font-size:14px;width:40%;">Nom</td>
                    <td style="padding:8px 0;font-weight:600;">
                      ${data.name}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#7A7570;
                      font-size:14px;">Email</td>
                    <td style="padding:8px 0;">
                      ${data.email ?? '—'}</td>
                  </tr>
                  ${phoneLine}
                  ${whatsappLine}
                  ${propertyLine}
                </table>

                <p style="margin:0 0 8px;color:#7A7570;font-size:14px;">
                  Message :</p>
                <div style="background:#F7F3EE;border-left:3px solid #8B1A1A;
                  padding:16px 20px;border-radius:0 4px 4px 0;
                  color:#1A1A1A;font-size:15px;line-height:1.6;">
                  ${data.message}
                </div>

                ${data.propertyUrl ? `
                <div style="margin-top:32px;text-align:center;">
                  <a href="${data.propertyUrl}"
                    style="background:#8B1A1A;color:#FFFFFF;
                    text-decoration:none;padding:14px 32px;
                    border-radius:4px;font-size:14px;font-weight:600;
                    display:inline-block;">
                    Voir la propriété
                  </a>
                </div>` : ''}
              </td>
            </tr>

            <tr>
              <td style="background:#F7F3EE;padding:20px 40px;
                text-align:center;">
                <p style="margin:0;color:#7A7570;font-size:12px;">
                  Palais Rouge Immo · palaisrouge.online
                </p>
              </td>
            </tr>

          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `

  const subject = `Nouvelle demande — ${data.name}${data.propertyTitle ? ` · ${data.propertyTitle}` : ''}`
  const resend = getResend()

  if (data.toEmail && data.toEmail !== ADMIN) {
    // Send to agent
    await resend.emails.send({ from: FROM, to: data.toEmail, subject, html })
    // Also CC admin
    await resend.emails.send({ from: FROM, to: ADMIN, subject, html })
  } else {
    await resend.emails.send({ from: FROM, to: ADMIN, subject, html })
  }
}

export async function sendNewsletterWelcome(email: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Resend] RESEND_API_KEY not set — skipping newsletter welcome')
    return
  }
  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>
  <body style="margin:0;padding:0;background:#F7F3EE;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
          style="background:#FFFFFF;border-radius:8px;overflow:hidden;">
          <tr><td style="background:#8B1A1A;padding:32px 40px;">
            <p style="margin:0;color:#FFFFFF;font-size:22px;font-weight:700;">PALAIS ROUGE IMMO</p>
          </td></tr>
          <tr><td style="padding:40px;">
            <p style="font-size:16px;color:#1A1A1A;">Merci de vous être inscrit à notre newsletter !</p>
            <p style="color:#7A7570;font-size:14px;">
              Vous recevrez nos meilleures annonces et actualités du marché immobilier de Marrakech.
            </p>
          </td></tr>
          <tr><td style="background:#F7F3EE;padding:20px 40px;text-align:center;">
            <p style="margin:0;color:#7A7570;font-size:12px;">Palais Rouge Immo · palaisrouge.online</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: 'Bienvenue chez Palais Rouge Immo',
    html,
  })
}
