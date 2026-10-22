/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Stripe publishable key (pk_test_... or pk_live_...). Configured in .env */
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
