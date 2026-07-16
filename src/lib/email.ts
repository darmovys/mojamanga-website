import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendEmailValues {
  to: string
  subject: string
  react: React.ReactNode
}

const SUBDOMAIN = 'updates.mojamanga.com'

export async function sendEmail({ to, subject, react }: SendEmailValues) {
  await resend.emails.send({
    from: `Моя Манга <notify@${SUBDOMAIN}>`,
    to,
    subject,
    react,
  })
}
