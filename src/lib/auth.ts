import { prisma } from '@/db'
import { APIError, betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { username, captcha, openAPI } from 'better-auth/plugins'
import { i18n } from '@better-auth/i18n'
import { signupSchema } from '@/schemas/signup'
import { createAuthMiddleware } from 'better-auth/api'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
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
    username({
      usernameValidator: (username) => {
        const result = signupSchema.shape.username.safeParse(username)

        if (!result.success) {
          throw new APIError('BAD_REQUEST', {
            message: result.error.message,
          })
        }

        return true
      },
      usernameNormalization: (username) => username.toLowerCase(),
    }),
    captcha({
      provider: 'cloudflare-turnstile',
      secretKey: process.env.TURNSTILE_FAKE_SECRET_KEY!,
    }),
    tanstackStartCookies(),
  ],
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === '/sign-up/email') {
        // Виключаємо поле username з валідації, бо воно валідується окремо в функції usernameValidator
        const result = signupSchema
          .omit({ username: true, cfToken: true })
          .safeParse(ctx.body)
        if (!result.success) {
          throw new APIError('BAD_REQUEST', {
            message: result.error.message,
          })
        }
      }
    }),
  },
  disabledPaths: ['/is-username-available'],
})
