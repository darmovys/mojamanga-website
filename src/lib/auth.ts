import { prisma } from '@/db'
import { APIError, betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { username, captcha, openAPI } from 'better-auth/plugins'
import { i18n } from '@better-auth/i18n'
import {
  createForgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from '@/schemas/auth'
import { createAuthMiddleware } from 'better-auth/api'
import { UserRole, UserStatus } from '@/generated/prisma/enums'
import { sendEmail } from './email'
import { ConfirmEmail, ConfirmEmailChange, ResetPassword } from '@/emails'
import { directChangePasswordSchema } from '@/schemas/users'

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
    async sendResetPassword({ user, url }) {
      void sendEmail({
        to: user.email,
        subject: 'Скидання паролю',
        react: ResetPassword({
          url: url,
          baseUrl: import.meta.env.VITE_SITE_URL,
        }),
      })
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    async sendVerificationEmail({ user, url }) {
      let finalUrl = url

      /**
       * Оскільки Better Auth не розділяє функції для відправки верифікації при реєстрації,
       * та при зміні пошти, після схвалення зміни пошти, посилання на шлях /'email-change-accepted
       * передається й у лист для верифікації нової пошти.
       * Тому ми власноруч змінюємо значення callbackURL на правильне посилання /email-verified,
       * у разі якщо трапилася така ситуація.
       * */

      try {
        const parsedUrl = new URL(url)
        const callbackUrlParam = parsedUrl.searchParams.get('callbackURL')

        if (
          callbackUrlParam &&
          callbackUrlParam.includes('email-change-accepted')
        ) {
          const updatedCallback = callbackUrlParam.replace(
            'email-change-accepted',
            'email-verified',
          )
          parsedUrl.searchParams.set('callbackURL', updatedCallback)

          finalUrl = parsedUrl.toString()
        }
      } catch (error) {
        console.error('Не вдалося розпарсити URL верифікації:', error)
      }

      void sendEmail({
        to: user.email,
        subject: 'Підтвердження електронної пошти',
        react: ConfirmEmail({
          url: finalUrl,
          baseUrl: import.meta.env.VITE_SITE_URL,
        }),
      })
    },
  },
  user: {
    changeEmail: {
      enabled: true,
      updateEmailWithoutVerification: false,
      async sendChangeEmailConfirmation({ user, newEmail, url }) {
        void sendEmail({
          to: user.email,
          subject: 'Схваліть зміну електронної пошти',
          react: ConfirmEmailChange({
            url,
            baseUrl: import.meta.env.VITE_SITE_URL,
            newEmail,
          }),
        })
      },
    },
    additionalFields: {
      role: {
        type: 'string',
        required: true,
        defaultValue: 'USER' satisfies UserRole,
        input: false, // don't allow user to set role
      },
      status: {
        type: 'string',
        required: true,
        defaultValue: 'NORMAL' satisfies UserStatus,
        input: false,
      },
    },
  },
  session: {
    additionalFields: {
      lastSeenAt: {
        type: 'date',
        required: false,
        defaultValue: null,
        input: false,
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
                  isSystem: true,
                  systemType: 'READING',
                  sortOrder: 0,
                },
                {
                  userId: user.id,
                  isSystem: true,
                  systemType: 'PLAN_TO_READ',
                  sortOrder: 1,
                },
                {
                  userId: user.id,
                  isSystem: true,
                  systemType: 'COMPLETED',
                  sortOrder: 2,
                },
                {
                  userId: user.id,

                  isSystem: true,
                  systemType: 'ON_HOLD',
                  sortOrder: 3,
                },
                {
                  userId: user.id,
                  isSystem: true,
                  systemType: 'DROPPED',
                  sortOrder: 4,
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
    session: {
      create: {
        after: async (session) => {
          const now = new Date()
          try {
            await Promise.all([
              prisma.user.update({
                where: { id: session.userId },
                data: { lastSeenAt: now },
              }),
              prisma.session.update({
                where: { id: session.id },
                data: { lastSeenAt: now },
              }),
            ])
          } catch (error) {
            console.error('Помилка оновлення lastSeenAt при вході: ', error)
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
          INVALID_TOKEN: 'Недійсний токен',
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
            message: result.error.issues[0].message,
          })
        }
      }

      if (ctx.path === '/change-password') {
        const result = directChangePasswordSchema.safeParse(ctx.body)

        if (!result.success) {
          throw new APIError('BAD_REQUEST', {
            message: result.error.issues[0].message,
          })
        }
      }

      if (ctx.path === '/request-password-reset') {
        const clientForgotPasswordSchema = createForgotPasswordSchema({
          isServer: true,
        })

        const result = clientForgotPasswordSchema
          .omit({ cfToken: true })
          .safeParse(ctx.body)

        if (!result.success) {
          throw new APIError('BAD_REQUEST', {
            message: result.error.issues[0].message,
          })
        }
      }

      if (ctx.path === '/reset-password') {
        const result = resetPasswordSchema.safeParse(ctx.body)

        if (!result.success) {
          throw new APIError('BAD_REQUEST', {
            message: result.error.issues[0].message,
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
            message: result.error.issues[0].message,
          })
        }
      }
    }),
  },
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
