import { useState } from 'react'
import type { FormEvent } from 'react'
import { CONTACT_EMAIL } from '../contact'

const EMPTY_FORM = {
  name: '',
  email: '',
  message: '',
}

type FieldName = keyof typeof EMPTY_FORM

function ContactForm() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [sentAddress, setSentAddress] = useState('')
  const [copied, setCopied] = useState(false)

  function updateField(field: FieldName, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (status === 'sending') {
      return
    }

    setStatus('sending')
    setErrorMessage(null)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const payload: { error?: unknown } = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          typeof payload.error === 'string' ? payload.error : 'We could not send your message.',
        )
      }

      setSentAddress(form.email)
      setForm(EMPTY_FORM)
      setStatus('sent')
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'We could not send your message. Please try again.',
      )
      setStatus('error')
    }
  }

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2500)
    } catch {
      // Clipboard access can be blocked; the address is still on screen to select.
      setCopied(false)
    }
  }

  if (status === 'sent') {
    return (
      <div className="contact-panel">
        <div className="contact-done" role="status">
          <p className="contact-done-title">Message sent</p>
          <p>
            Thank you. I read everything myself and will reply to <strong>{sentAddress}</strong> as
            soon as I can.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="contact-panel">
      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="contact-row">
          <label className="field">
            <span>Your name</span>
            <input
              type="text"
              name="name"
              autoComplete="name"
              required
              maxLength={120}
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
            />
          </label>

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              maxLength={120}
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
            />
          </label>
        </div>

        <label className="field">
          <span>Message</span>
          <textarea
            name="message"
            required
            minLength={10}
            maxLength={2000}
            placeholder="What would you like to talk about?"
            value={form.message}
            onChange={(event) => updateField('message', event.target.value)}
          />
        </label>

        {errorMessage && (
          <p className="form-error" role="alert">
            {errorMessage}
          </p>
        )}

        <div className="contact-actions">
          <button className="button button-dark" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Send message'}
            <span aria-hidden="true">↗</span>
          </button>

          <button className="text-link" type="button" onClick={copyAddress}>
            {copied ? 'Address copied' : `or copy ${CONTACT_EMAIL}`}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ContactForm
