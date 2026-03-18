import { prisma } from '@/db'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { username, captcha, openAPI } from 'better-auth/plugins'
import { i18n } from '@better-auth/i18n'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  plugins: [
    i18n({
      translations: {
        uk: {
          USER_NOT_FOUND: 'Користувача не знайдено',
          INVALID_EMAIL_OR_PASSWORD: 'Невірний пароль або електронна пошта',
          INVALID_PASSWORD: 'Невірний пароль',
          CREDENTIAL_ACCOUNT_NOT_FOUND: 'Не вдалося знайти обліковий запис',
          EMAIL_NOT_VERIFIED: 'Електронна пошта не верифікована',
          SESSION_EXPIRED: 'Сесія вичерпана',
        },
      },
    }),
    openAPI(),
    username(),
    captcha({
      provider: 'cloudflare-turnstile',
      secretKey: process.env.TURNSTILE_FAKE_SECRET_KEY!,
    }),
    tanstackStartCookies(),
  ],
  emailAndPassword: {
    enabled: true,
  },
})
