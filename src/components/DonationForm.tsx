import { useState } from 'react'
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import type { FormEvent } from 'react'
import type { StripePaymentElementOptions } from '@stripe/stripe-js'
import { buildReturnUrl } from '../stripe'

const paymentElementOptions: StripePaymentElementOptions = { layout: 'tabs' }

type DonationFormProps = {
  amountLabel: string
  onSucceeded: () => void
  onBack: () => void
}

function DonationForm({ amountLabel, onSucceeded, onBack }: DonationFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const ready = Boolean(stripe && elements)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!stripe || !elements || submitting) {
      return
    }

    setSubmitting(true)
    setErrorMessage(null)

    try {
      // The Payment Element may need to send the visitor to their bank. When
      // that happens Stripe handles the redirect and comes back to return_url.
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: buildReturnUrl() },
        redirect: 'if_required',
      })

      if (error) {
        setErrorMessage(
          error.message ?? 'Your payment could not be completed. Please check your details and try again.',
        )
        return
      }

      // No redirect and no error means the payment is already done.
      onSucceeded()
    } catch (error) {
      // Stripe.js can also throw (for example if the Element unmounted mid-flight).
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Your payment could not be completed. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="donation-form" onSubmit={handleSubmit}>
      <div className="donation-summary">
        <span className="donation-summary-label">One-time gift</span>
        <strong>{amountLabel}</strong>
      </div>

      <PaymentElement options={paymentElementOptions} />

      {errorMessage && (
        <p className="donation-error" role="alert">
          {errorMessage}
        </p>
      )}

      <button className="button donate-submit" type="submit" disabled={!ready || submitting}>
        {submitting ? 'Processing…' : `Give ${amountLabel}`}
        <span aria-hidden="true">↗</span>
      </button>

      <button className="donate-back" type="button" onClick={onBack} disabled={submitting}>
        Change the amount
      </button>

      <p className="donation-legal">
        SaveEarth never sees or stores your card details. Payments are processed securely by Stripe and you will receive a
        receipt by email.
      </p>
    </form>
  )
}

export default DonationForm
