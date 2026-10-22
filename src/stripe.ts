import { loadStripe } from '@stripe/stripe-js'
import type { Appearance, Stripe } from '@stripe/stripe-js'

/**
 * Publishable keys are designed to be public. The matching secret key lives in
 * server/index.js and must never appear in this file or anywhere else in src/.
 */
const publishableKey: string | undefined = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

export const stripeConfigured = Boolean(publishableKey)

/**
 * Stripe.js is downloaded once and reused by every Elements provider on the
 * page, so the promise is created at module scope rather than per render.
 */
export const stripePromise: Promise<Stripe | null> | null = publishableKey ? loadStripe(publishableKey) : null

/**
 * Restyles the hosted Payment Element inputs to match the palette and type
 * scale defined in index.css.
 */
export const stripeAppearance: Appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#193c2c',
    colorText: '#1b2b20',
    colorTextSecondary: '#697469',
    colorTextPlaceholder: '#a3ada2',
    colorBackground: '#ffffff',
    colorDanger: '#a3421d',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    fontSizeBase: '13px',
    borderRadius: '0px',
    spacingUnit: '4px',
  },
  rules: {
    '.Input': {
      border: '1px solid #dce0d5',
      boxShadow: 'none',
      padding: '13px 14px',
    },
    '.Input:focus': {
      border: '1px solid #193c2c',
      boxShadow: 'none',
      outline: 'none',
    },
    '.Label': {
      color: '#697469',
      fontSize: '10px',
      fontWeight: '700',
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
    },
    '.Tab': {
      border: '1px solid #dce0d5',
      boxShadow: 'none',
    },
    '.Tab--selected': {
      border: '1px solid #193c2c',
      backgroundColor: '#ecf3d0',
    },
  },
}

/** Query parameter added to the URL Stripe redirects back to. */
const RETURN_PARAM = 'donation'

export type PaymentReturn = {
  status: string
  paymentIntentId: string
}

/**
 * True when Stripe has sent the visitor back here after a redirect-based
 * payment method (bank debit, some wallets) so the app can reopen the donate page.
 */
export function hasPaymentReturn(): boolean {
  const params = new URLSearchParams(window.location.search)
  return params.has('redirect_status') || params.get(RETURN_PARAM) === 'return'
}

/** Reads the status Stripe attached to the return URL, if there is one. */
export function readPaymentReturn(): PaymentReturn | null {
  const params = new URLSearchParams(window.location.search)
  const status = params.get('redirect_status')

  if (!status) {
    return null
  }

  return {
    status,
    paymentIntentId: params.get('payment_intent') ?? '',
  }
}

/**
 * Strips the Stripe parameters from the address bar so refreshing the page
 * shows the donation form again instead of a stale receipt.
 */
export function clearPaymentReturn(): void {
  if (!window.location.search) {
    return
  }

  window.history.replaceState({}, '', window.location.pathname)
}

/** The URL Stripe returns the visitor to once a redirect-based payment finishes. */
export function buildReturnUrl(): string {
  const url = new URL(window.location.origin)
  url.searchParams.set(RETURN_PARAM, 'return')
  return url.toString()
}
