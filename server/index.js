import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { config as loadEnv } from 'dotenv'
import express from 'express'
import Stripe from 'stripe'

// Load the same .env file the Vite client reads, so there is only one place
// to keep keys. Only values prefixed with VITE_ are exposed to the browser.
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
loadEnv({ path: path.join(rootDir, '.env') })

const PORT = Number(process.env.PORT ?? 4242)
const HOST = '127.0.0.1'
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY?.trim()

// Donation limits, in cents. The server is the source of truth: the browser
// can send any number it likes, so every request is validated here.
const MIN_AMOUNT = 100 // $1.00
const MAX_AMOUNT = 500_000 // $5,000.00

let stripe = null

if (!STRIPE_SECRET_KEY) {
  console.warn('[stripe] STRIPE_SECRET_KEY is missing from .env - donations are disabled until you add it.')
} else if (!STRIPE_SECRET_KEY.startsWith('sk_')) {
  console.warn('[stripe] STRIPE_SECRET_KEY does not start with "sk_", so it is probably not a secret key. Donations are disabled.')
} else {
  if (STRIPE_SECRET_KEY.startsWith('sk_live_')) {
    console.warn('[stripe] WARNING: a live secret key is loaded. Real cards will be charged for real money.')
  } else {
    console.log('[stripe] Test mode active. Pay with 4242 4242 4242 4242, any future expiry, any CVC.')
  }
  stripe = new Stripe(STRIPE_SECRET_KEY)
}

const app = express()

// Payment intents are tiny JSON payloads; reject anything oversized.
app.use(express.json({ limit: '10kb' }))

app.post('/api/create-payment-intent', async (request, response) => {
  if (!stripe) {
    response.status(503).json({
      error: 'Stripe is not configured yet. Add STRIPE_SECRET_KEY to your .env file and restart the server.',
    })
    return
  }

  const amount = Number(request.body?.amount)

  if (!Number.isInteger(amount)) {
    response.status(400).json({ error: 'The "amount" field must be a whole number of cents.' })
    return
  }

  if (amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
    response.status(400).json({
      error: `The amount must be between ${MIN_AMOUNT} and ${MAX_AMOUNT} cents.`,
    })
    return
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      // Let Stripe offer every payment method enabled in your dashboard.
      automatic_payment_methods: { enabled: true },
      description: `SaveEarth donation - $${(amount / 100).toFixed(2)} USD`,
      metadata: { source: 'saveearth-website' },
    })

    // Only the client secret travels back to the browser. It can confirm this
    // one payment and nothing else.
    response.json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    console.error('[stripe] Failed to create a PaymentIntent:', error.message)
    response.status(500).json({ error: 'We could not start the payment. Please try again in a moment.' })
  }
})

// ----------------------------------------------------------------- file lists

const VOLUNTEERS_FILE = path.join(rootDir, 'server', 'volunteers.json')
const MESSAGES_FILE = path.join(rootDir, 'server', 'messages.json')
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_SHORT = 120
const MAX_MESSAGE = 2000

/** Form values arrive as "any", so only take strings and trim them. */
function cleanText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

async function readList(file) {
  try {
    const raw = await readFile(file, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    // A missing file just means nothing has been submitted yet.
    if (error.code === 'ENOENT') {
      return []
    }

    throw error
  }
}

// Entries are read, appended, and written back. Chaining the promises keeps two
// simultaneous submissions from overwriting each other.
let writeChain = Promise.resolve()

function appendEntry(file, entry) {
  const next = writeChain.then(async () => {
    const entries = await readList(file)
    entries.push(entry)
    await writeFile(file, `${JSON.stringify(entries, null, 2)}\n`, 'utf8')
    return entry
  })

  // Keep the chain usable even if this particular write failed.
  writeChain = next.catch(() => {})
  return next
}

// ----------------------------------------------------------------- volunteers

app.post('/api/volunteer', async (request, response) => {
  const body = request.body ?? {}

  const name = cleanText(body.name).slice(0, MAX_SHORT)
  const email = cleanText(body.email).slice(0, MAX_SHORT)
  const phone = cleanText(body.phone).slice(0, 40)
  const location = cleanText(body.location).slice(0, MAX_SHORT)
  const availability = cleanText(body.availability).slice(0, 40)
  const message = cleanText(body.message).slice(0, MAX_MESSAGE)
  const interests = Array.isArray(body.interests)
    ? body.interests.map(cleanText).filter(Boolean).slice(0, 10)
    : []

  if (!name) {
    response.status(400).json({ error: 'Please tell us your name.' })
    return
  }

  if (!EMAIL_PATTERN.test(email)) {
    response.status(400).json({ error: 'Please enter a valid email address.' })
    return
  }

  if (interests.length === 0) {
    response.status(400).json({ error: 'Choose at least one way you would like to help.' })
    return
  }

  const entry = {
    id: randomUUID(),
    receivedAt: new Date().toISOString(),
    name,
    email,
    phone,
    location,
    availability,
    interests,
    message,
  }

  try {
    await appendEntry(VOLUNTEERS_FILE, entry)
    console.log(`[volunteer] New signup from ${name} <${email}>`)
    response.status(201).json({ ok: true })
  } catch (error) {
    console.error('[volunteer] Could not save signup:', error.message)
    response.status(500).json({ error: 'We could not save your details. Please try again.' })
  }
})

// -------------------------------------------------------------------- contact

app.post('/api/contact', async (request, response) => {
  const body = request.body ?? {}

  const name = cleanText(body.name).slice(0, MAX_SHORT)
  const email = cleanText(body.email).slice(0, MAX_SHORT)
  const message = cleanText(body.message).slice(0, MAX_MESSAGE)

  if (!name) {
    response.status(400).json({ error: 'Please tell us your name.' })
    return
  }

  if (!EMAIL_PATTERN.test(email)) {
    response.status(400).json({ error: 'Please enter a valid email address.' })
    return
  }

  if (message.length < 10) {
    response.status(400).json({ error: 'Please write a slightly longer message.' })
    return
  }

  const entry = {
    id: randomUUID(),
    receivedAt: new Date().toISOString(),
    name,
    email,
    message,
  }

  try {
    await appendEntry(MESSAGES_FILE, entry)
    console.log(`[contact] New message from ${name} <${email}>`)
    response.status(201).json({ ok: true })
  } catch (error) {
    console.error('[contact] Could not save message:', error.message)
    response.status(500).json({ error: 'We could not send your message. Please try again.' })
  }
})

const server = app.listen(PORT, HOST, () => {
  console.log(`[api] Payment server listening on http://${HOST}:${PORT}`)
})

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(
      `[api] Port ${PORT} is already in use. Another dev server is probably still running.\n` +
        `[api] Close that terminal, or free the port with:\n` +
        `[api]   PowerShell: Get-NetTCPConnection -LocalPort ${PORT} -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`,
    )
  } else {
    console.error('[api] Server error:', error.message)
  }

  process.exit(1)
})
