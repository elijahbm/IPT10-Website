import { useEffect, useMemo, useState } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import type { ReactNode } from 'react'
import DonationForm from '../components/DonationForm'
import {
  clearPaymentReturn,
  readPaymentReturn,
  stripeAppearance,
  stripeConfigured,
  stripePromise,
} from '../stripe'
import type { PaymentReturn } from '../stripe'
import { formatAmount } from '../money'

const PRESET_AMOUNTS = [2500, 5000, 10000, 25000] // $25, $50, $100, $250
const MIN_AMOUNT = 100 // $1.00, in cents
const MAX_AMOUNT = 500_000 // $5,000.00, in cents

/** Turns "1,250.50" into 125050 cents, or NaN when the input is unusable. */
function parseAmountInput(input: string): number {
  const cleaned = input.replace(/[^0-9.]/g, '')

  if (cleaned === '') {
    return Number.NaN
  }

  const value = Number.parseFloat(cleaned)

  return Number.isFinite(value) ? Math.round(value * 100) : Number.NaN
}

type IntentState =
  | { status: 'choosing' }
  | { status: 'starting' }
  | { status: 'ready'; clientSecret: string; amountCents: number }
  | { status: 'failed'; message: string }

type PaymentStepProps = {
  clientSecret: string
  amountLabel: string
  onSucceeded: () => void
  onBack: () => void
}

/**
 * Elements needs a client secret before the Payment Element can render, which
 * is why the amount is chosen first and the intent created second.
 */
function PaymentStep({ clientSecret, amountLabel, onSucceeded, onBack }: PaymentStepProps) {
  const options = useMemo(() => ({ clientSecret, appearance: stripeAppearance }), [clientSecret])

  return (
    <Elements stripe={stripePromise} options={options}>
      <DonationForm amountLabel={amountLabel} onSucceeded={onSucceeded} onBack={onBack} />
    </Elements>
  )
}

type DonationReceiptProps = {
  status: string
  paymentIntentId: string
  onReset: () => void
}

/** Shown when Stripe redirects the visitor back from a bank or wallet authorisation. */
function DonationReceipt({ status, paymentIntentId, onReset }: DonationReceiptProps) {
  const settled = status === 'succeeded'
  const pending = status === 'processing'

  const headings: Record<string, string> = {
    succeeded: 'Thank you — your gift is on its way.',
    processing: 'Your bank is still confirming it.',
  }

  return (
    <section className={`donation-receipt${settled || pending ? '' : ' is-failed'}`} role="status">
      <p className="eyebrow">
        {settled ? 'Payment complete' : pending ? 'Payment processing' : 'Payment not completed'}
      </p>
      <h2>{headings[status] ?? 'That payment did not go through.'}</h2>
      <p>
        {settled
          ? 'You have just funded real fieldwork, and a receipt is on its way to your inbox.'
          : pending
            ? 'Some payment methods take a few days to settle. We will email you the moment it clears.'
            : 'Nothing was charged. You can try again with a different payment method.'}
      </p>
      {paymentIntentId && (
        <p className="receipt-reference">
          Reference <code>{paymentIntentId}</code>
        </p>
      )}
      <button className="button button-dark" type="button" onClick={onReset}>
        Make another gift <span aria-hidden="true">↗</span>
      </button>
    </section>
  )
}

/** Explains what is missing when the keys have not been filled in yet. */
function SetupNotice() {
  return (
    <section className="donation-setup">
      <p className="eyebrow">Setup needed</p>
      <h2>Stripe is not connected yet.</h2>
      <p>The donation form needs your publishable key before it can load.</p>
      <ol>
        <li>
          Open <code>.env</code> in the project root.
        </li>
        <li>
          Paste your publishable key into <code>VITE_STRIPE_PUBLISHABLE_KEY</code>.
        </li>
        <li>
          Paste your secret key into <code>STRIPE_SECRET_KEY</code>.
        </li>
        <li>
          Restart <code>npm run dev</code>.
        </li>
      </ol>
    </section>
  )
}

type DonatePageProps = {
  /** Pre-selects an amount when a visitor arrives from a Home page gift tier. */
  initialAmountCents?: number | null
}

function DonatePage({ initialAmountCents = null }: DonatePageProps) {
  const startingAmount =
    initialAmountCents !== null && PRESET_AMOUNTS.includes(initialAmountCents)
      ? initialAmountCents
      : PRESET_AMOUNTS[1]

  const [selection, setSelection] = useState<number | 'custom'>(startingAmount)
  const [customValue, setCustomValue] = useState('')
  const [intent, setIntent] = useState<IntentState>({ status: 'choosing' })
  // Stripe's return parameters are read once, before the first paint.
  const [receipt, setReceipt] = useState<PaymentReturn | null>(readPaymentReturn)

  useEffect(() => {
    // Clean the address bar so a refresh shows the form instead of a stale receipt.
    clearPaymentReturn()
  }, [])

  const selectedCents = selection === 'custom' ? parseAmountInput(customValue) : selection
  const amountIsValid =
    Number.isInteger(selectedCents) && selectedCents >= MIN_AMOUNT && selectedCents <= MAX_AMOUNT

  function chooseAmount(next: number | 'custom') {
    setSelection(next)
    setIntent({ status: 'choosing' })
  }

  function resetToChoosing() {
    setIntent({ status: 'choosing' })
  }

  async function startPayment() {
    if (!amountIsValid) {
      return
    }

    setIntent({ status: 'starting' })

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: selectedCents }),
      })

      const payload: { clientSecret?: unknown; error?: unknown } = await response
        .json()
        .catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          typeof payload.error === 'string' ? payload.error : 'We could not start the payment.',
        )
      }

      if (typeof payload.clientSecret !== 'string') {
        throw new Error('The payment server sent an unexpected response.')
      }

      setIntent({ status: 'ready', clientSecret: payload.clientSecret, amountCents: selectedCents })
    } catch (error) {
      setIntent({
        status: 'failed',
        message: error instanceof Error ? error.message : 'We could not start the payment.',
      })
    }
  }

  let panel: ReactNode

  if (receipt) {
    panel = (
      <DonationReceipt
        status={receipt.status}
        paymentIntentId={receipt.paymentIntentId}
        onReset={() => setReceipt(null)}
      />
    )
  } else if (!stripeConfigured) {
    panel = <SetupNotice />
  } else if (intent.status === 'ready') {
    panel = (
      <PaymentStep
        clientSecret={intent.clientSecret}
        amountLabel={formatAmount(intent.amountCents)}
        onSucceeded={() => setReceipt({ status: 'succeeded', paymentIntentId: '' })}
        onBack={resetToChoosing}
      />
    )
  } else {
    panel = (
      <div className="donate-card">
        <h2 className="donate-card-title">Choose an amount</h2>
        <p className="donate-card-note">A one-time gift in US dollars. You can change it before you pay.</p>

        <div className="amount-grid" role="group" aria-label="Suggested donation amounts">
          {PRESET_AMOUNTS.map((preset) => (
            <button
              key={preset}
              className={`amount-option${selection === preset ? ' is-selected' : ''}`}
              type="button"
              aria-pressed={selection === preset}
              onClick={() => {
                chooseAmount(preset)
                setCustomValue('')
              }}
            >
              {formatAmount(preset)}
            </button>
          ))}
        </div>

        <label className="amount-custom">
          <span>Other amount</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="75"
            value={customValue}
            onFocus={() => chooseAmount('custom')}
            onChange={(event) => {
              chooseAmount('custom')
              setCustomValue(event.target.value)
            }}
          />
        </label>

        {selection === 'custom' && customValue.trim() !== '' && !amountIsValid && (
          <p className="amount-error">
            Enter an amount between {formatAmount(MIN_AMOUNT)} and {formatAmount(MAX_AMOUNT)}.
          </p>
        )}

        {intent.status === 'failed' && (
          <p className="donation-error" role="alert">
            {intent.message}
          </p>
        )}

        <button
          className="button donate-submit"
          type="button"
          onClick={startPayment}
          disabled={!amountIsValid || intent.status === 'starting'}
        >
          {intent.status === 'starting' ? 'Preparing…' : 'Continue to payment'}
          <span aria-hidden="true">↗</span>
        </button>
      </div>
    )
  }

  return (
    <main className="donate-page">
      <section className="donate-hero">
        <div className="donate-hero-copy">
          <p className="eyebrow">
            <span /> Support SaveEarth
          </p>
          <h1>
            Every gift grows
            <br />
            <em>something real.</em>
          </h1>
          <p className="donate-lede">
            Your donation plants native trees, brings local waterways back to life and creates healthier wildlife habitats, and puts young people at the
            front of the work. Because we are volunteer-led, the money goes straight to the ground.
          </p>
          <ul className="donate-facts">
            <li>
              <span>01</span> Online gifts fund fieldwork directly.
            </li>
            <li>
              <span>02</span> Any amout helps. Big or small.
            </li>
            <li>
              <span>03</span> Secure checkout hosted by Stripe.
            </li>
          </ul>
        </div>

        <div className="donate-panel">{panel}</div>
      </section>
    </main>
  )
}

export default DonatePage
