import { getTransporter, isMailConfigured } from '../config/mailer.js'

// (Header mein new line nahi hone chahiye.)
const oneLine = (text) => String(text ?? '').replace(/[\r\n]+/g, ' ').trim()

export async function sendLeadNotification(lead, productName) {
  if (!isMailConfigured()) {
    console.warn('Email is not configured. The lead was saved but no notification was sent.')
    return
  }

  const lines = [
    'You have a new enquiry on the Ayat Furniture website.',
    '',
    `Name:     ${oneLine(lead.name)}`,
    `Phone:    ${lead.phone}`,
    `Email:    ${lead.email || '-'}`,
    `Type:     ${lead.type}`,
    `Product:  ${productName ? oneLine(productName) : '-'}`,
    `Page:     ${lead.sourcePath || '-'}`,
    `Campaign: ${lead.utm?.campaign || '-'} (${lead.utm?.source || '-'} / ${lead.utm?.medium || '-'})`,
    '',
    'Message:',
    lead.message,
  ]

  await getTransporter().sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: process.env.LEAD_NOTIFY_EMAIL,
    replyTo: lead.email || undefined,
    subject: `New enquiry from ${oneLine(lead.name)} (${lead.phone})`,
    text: lines.join('\n'),
  })
}