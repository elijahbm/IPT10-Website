import { useState } from 'react'
import type { FormEvent } from 'react'

const OPPORTUNITIES = [
  'Tree planting',
  'Waterway cleanups',
  'Youth mentoring',
  'Photography & stories',
  'Events & admin',
]

const AVAILABILITY = ['Weekends', 'Weekdays', 'Either']

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  location: '',
  availability: 'Weekends',
  message: '',
}

type FieldName = keyof typeof EMPTY_FORM

type InvolvedPageProps = {
  onHome: () => void
}

function InvolvedPage({ onHome }: InvolvedPageProps) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [interests, setInterests] = useState<string[]>([])
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  function updateField(field: FieldName, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function toggleInterest(value: string) {
    setInterests((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (status === 'sending') {
      return
    }

    setStatus('sending')
    setErrorMessage(null)

    try {
      const response = await fetch('/api/volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, interests }),
      })

      const payload: { error?: unknown } = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          typeof payload.error === 'string' ? payload.error : 'We could not save your details.',
        )
      }

      setStatus('sent')
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'We could not save your details. Please try again.',
      )
      setStatus('error')
    }
  }

  return (
    <main className="involved-page">
      <section className="involved-hero">
        <div className="involved-hero-copy">
          <p className="eyebrow">
            <span /> Get involved
          </p>
          <h1>
            Time is the
            <br />
            <em>richest gift.</em>
          </h1>
          <p className="involved-lede">
            Volunteers are the engine of every project here. Tell us what you enjoy and how much time
            you have, and we will find a place for you.
          </p>
          <ul className="involved-facts">
            <li>
              <span>01</span> No experience needed — we train on the day.
            </li>
            <li>
              <span>02</span> Two to four hours a month is plenty.
            </li>
            <li>
              <span>03</span> Bring a friend; we will bring the gloves.
            </li>
          </ul>
        </div>

        <div className="involved-panel">
          {status === 'sent' ? (
            <section className="volunteer-success" role="status">
              <p className="eyebrow">You're on the list</p>
              <h2>Thank you for raising your hand.</h2>
              <p>
                We have your details and will email you before the next planting day. If you added a
                phone number, expect a message from one of the organizers.
              </p>
              <button className="button button-dark" type="button" onClick={onHome}>
                Back to the home page <span aria-hidden="true">↗</span>
              </button>
            </section>
          ) : (
            <form className="volunteer-card" onSubmit={handleSubmit}>
              <h2 className="volunteer-title">Join a work day</h2>
              <p className="volunteer-note">We reply within a few days. No commitment yet.</p>

              <div className="field-grid">
                <label className="field">
                  <span>Full name</span>
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

                <div className="field-row">
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

                  <label className="field">
                    <span>Mobile</span>
                    <input
                      type="tel"
                      name="phone"
                      autoComplete="tel"
                      maxLength={40}
                      placeholder="Optional"
                      value={form.phone}
                      onChange={(event) => updateField('phone', event.target.value)}
                    />
                  </label>
                </div>

                <div className="field-row">
                  <label className="field">
                    <span>Location</span>
                    <input
                      type="text"
                      name="location"
                      autoComplete="address-level2"
                      maxLength={120}
                      placeholder="City or barangay"
                      value={form.location}
                      onChange={(event) => updateField('location', event.target.value)}
                    />
                  </label>

                  <label className="field">
                    <span>Availability</span>
                    <select
                      name="availability"
                      value={form.availability}
                      onChange={(event) => updateField('availability', event.target.value)}
                    >
                      {AVAILABILITY.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <fieldset className="choice-group">
                  <legend>How would you like to help?</legend>
                  <div className="choice-pills">
                    {OPPORTUNITIES.map((option) => (
                      <label className="choice-pill" key={option}>
                        <input
                          type="checkbox"
                          checked={interests.includes(option)}
                          onChange={() => toggleInterest(option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <label className="field">
                  <span>Anything else?</span>
                  <textarea
                    name="message"
                    maxLength={2000}
                    placeholder="Skills, questions, or a friend you want to bring along"
                    value={form.message}
                    onChange={(event) => updateField('message', event.target.value)}
                  />
                </label>
              </div>

              {errorMessage && (
                <p className="form-error" role="alert">
                  {errorMessage}
                </p>
              )}

              <button
                className="button volunteer-submit"
                type="submit"
                disabled={status === 'sending'}
              >
                {status === 'sending' ? 'Sending…' : 'Count me in'}
                <span aria-hidden="true">↗</span>
              </button>

              <p className="volunteer-legal">
                We only use these details to contact you about volunteering. Ask us to delete them at
                any time.
              </p>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}

export default InvolvedPage
