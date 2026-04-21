/// <reference types="vite/client" />

declare global {
  interface ImportMetaEnv {
    // Клієнтські змінні оточення
    readonly VITE_FAKE_TURNSTILE_SITEKEY: string
    readonly VITE_TURNSTILE_SITEKEY: string
    readonly VITE_SITE_URL: string
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }

  // Серверні змінні оточення
  namespace NodeJS {
    interface ProcessEnv {
      readonly SITE_URL: string
      readonly DATABASE_URL: string
      readonly BETTER_AUTH_SECRET: string
      readonly TURNSTILE_FAKE_SECRET_KEY: string
      readonly TURNSTILE_SECRET_KEY: string
      readonly AWS_ACCESS_KEY_ID: string
      readonly AWS_SECRET_ACCESS_KEY: string
      readonly AWS_ENDPOINT_URL_S3: string
      readonly AWS_ENDPOINT_URL_IAM: string
      readonly AWS_REGION: string
      readonly S3_BUCKET_NAME: string
      readonly UPSTASH_REDIS_REST_URL: string
      readonly UPSTASH_REDIS_REST_TOKEN: string
      readonly NODE_ENV: 'development' | 'production' | 'test'
    }
  }
}

export {}
