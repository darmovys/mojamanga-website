import { prisma } from '@/db'
import { APIError, betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { username, captcha, openAPI } from 'better-auth/plugins'
import { i18n } from '@better-auth/i18n'
import { loginSchema, signupSchema } from '@/schemas/auth'
import { createAuthMiddleware } from 'better-auth/api'
import { UserRole } from '@/generated/prisma/enums'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  baseURL: process.env.SITE_URL,
  emailAndPassword: {
    minPasswordLength: 1,
    maxPasswordLength: Infinity,
    enabled: true,
    autoSignIn: false,
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: true,
        defaultValue: 'USER' satisfies UserRole,
        input: false, // don't allow user to set role
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            await prisma.bookmarkFolder.createMany({
              data: [
                {
                  userId: user.id,
                  name: 'Читаю',
                  isSystem: true,
                  systemType: 'READING',
                },
                {
                  userId: user.id,
                  name: 'Прочитано',
                  isSystem: true,
                  systemType: 'COMPLETED',
                },
                {
                  userId: user.id,
                  name: 'Відкладено',
                  isSystem: true,
                  systemType: 'ON_HOLD',
                },
                {
                  userId: user.id,
                  name: 'Покинуто',
                  isSystem: true,
                  systemType: 'DROPPED',
                },
                {
                  userId: user.id,
                  name: 'В планах',
                  isSystem: true,
                  systemType: 'PLAN_TO_READ',
                },
              ],
            })
          } catch (error) {
            console.error(
              'Помилка при створенні системних папок для користувача:',
              error,
            )
          }
        },
      },
    },
  },
  plugins: [
    i18n({
      translations: {
        uk: {
          USER_NOT_FOUND: 'Користувача не знайдено',
          INVALID_EMAIL_OR_PASSWORD: 'Неправильний пароль або електронна пошта',
          INVALID_PASSWORD: 'Неправильний пароль',
          CREDENTIAL_ACCOUNT_NOT_FOUND: 'Не вдалося знайти обліковий запис',
          EMAIL_NOT_VERIFIED: 'Електронна пошта не верифікована',
          SESSION_EXPIRED: 'Сесія вичерпана',
          USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
            'Користувач з такою поштою вже існує',
          USERNAME_IS_ALREADY_TAKEN: 'Псевдонім вже використовується',
          INVALID_USERNAME_OR_PASSWORD: 'Неправильний пароль або псевдонім',
        },
      },
    }),
    openAPI(),
    username({
      minUsernameLength: 1,
      maxUsernameLength: Infinity,
      usernameValidator: () => {
        return true
      },
      usernameNormalization: (username) => username.toLowerCase(),
    }),
    captcha({
      provider: 'cloudflare-turnstile',
      secretKey: process.env.TURNSTILE_FAKE_SECRET_KEY,
    }),
    tanstackStartCookies(),
  ],
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === '/sign-up/email') {
        /* 
          Виключаємо поле username з валідації, бо воно валідується окремо в функції usernameValidator.
          Поле cfToken виключається також, бо воно валідується в полі headers.
        */
        const result = signupSchema.omit({ cfToken: true }).safeParse(ctx.body)
        if (!result.success) {
          throw new APIError('BAD_REQUEST', {
            message: result.error.message,
          })
        }
      }

      if (ctx.path === '/sign-in/username' || ctx.path === '/sign-in/email') {
        const body = {
          ...ctx.body,
          usernameOrEmail: ctx.body?.username ?? ctx.body?.email,
        }
        const result = loginSchema.omit({ cfToken: true }).safeParse(body)
        if (!result.success) {
          throw new APIError('BAD_REQUEST', {
            message: result.error.message,
          })
        }
      }
    }),
  },
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
