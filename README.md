# SaveEarth

A React + Vite site for the SaveEarth nonprofit, with a Stripe-powered donation page, a volunteer signup form, and a contact form.

## Getting started

```bash
npm install
```

Create your local environment file and fill in your own **test** keys from
<https://dashboard.stripe.com/test/apikeys>:

```bash
cp .env.example .env
```

```ini
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
PORT=4242
```

Then start both the site and the payment server:

```bash
npm run dev
```

Vite proxies `/api/*` to the payment server, so the browser only ever talks to one origin.

### Testing a payment

Use Stripe's test card: `4242 4242 4242 4242`, any future expiry date, any three-digit CVC, any postal code.

## How the donation flow works

1. `src/pages/DonatePage.tsx` collects an amount and asks the server for a PaymentIntent.
2. `server/index.js` validates the amount, creates the PaymentIntent with the secret key, and returns only the `client_secret`.
3. `src/pages/DonatePage.tsx` hands that secret to `<Elements>`, which loads the hosted `PaymentElement` from `src/components/DonationForm.tsx`.
4. `stripe.confirmPayment` completes the charge. Redirect-based payment methods (bank debits, some wallets) send the visitor back with `?redirect_status=...`, which `src/stripe.ts` reads so the receipt is shown.

The Payment Element is served by Stripe, so card numbers are typed into a Stripe iframe and never touch this codebase or its server.

## How volunteer signups work

1. The Home page's **Get involved** and **Find your way in** buttons open `src/pages/InvolvedPage.tsx`. That page deliberately has no header tab, so the nav stays `Home · About · Support our work`.
2. The form posts to `POST /api/volunteer`.
3. `server/index.js` validates the fields (required name and email, a real-looking email address, at least one interest) and appends the signup to `server/volunteers.json`.

`server/volunteers.json` is created on the first signup. It holds personal details (name, email, optional phone, location, notes), so it is gitignored. Open it in VS Code to read the signups and delete entries you have handled. Writes are queued one after another, so two people submitting at the same moment cannot overwrite each other.

A JSON file is fine for a class project, but it does not survive a redeploy on a host with an ephemeral filesystem. Move the entries to a database before going live.

## How the contact form works

The About page ends with a short form (name, email, message) instead of a `mailto:` link. A mailto link hands the message to whatever app Windows has registered for email — often Outlook — which is a dead end on machines with no mail client configured. The form works everywhere.

1. `src/components/ContactForm.tsx` posts to `POST /api/contact`.
2. `server/index.js` checks for a name, a valid email, and a message of at least 10 characters.
3. The message is appended to `server/messages.json`, which is gitignored just like the volunteer file.

A **copy address** link sits next to the submit button for visitors who would rather write from their own inbox.

Neither the volunteer nor the contact endpoint sends email. You read the two JSON files, or add a transactional email service (Resend, Postmark, SendGrid) inside the handlers.

## Security notes

- `STRIPE_SECRET_KEY` is read only by `server/index.js`. It must never be prefixed with `VITE_`, because every `VITE_*` value is compiled into the browser bundle.
- `.env` is gitignored. Commit `.env.example` instead.
- `server/volunteers.json` and `server/messages.json` contain visitors' contact details, so they are gitignored as well.
- Amounts are re-validated on the server (`$1`–`$5,000`), since a client can send any number it likes.
- This repository has no database, so payments are not persisted. Stripe records every PaymentIntent in the dashboard.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite + payment server together |
| `npm run dev:client` | Vite only |
| `npm run dev:server` | Payment server only |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run preview` | Preview the production build |

Note: `npm run build` produces static files only. The `/api` endpoint must be deployed separately (for example on Render, Fly.io, or a serverless function) before a production build can take payments.

## Recurring donations

The current flow takes one-time gifts. Monthly giving needs Stripe Subscriptions with a Price object rather than a PaymentIntent, which is a larger change to both the server and the donate page.

---

## Vite template notes

This project was scaffolded with the React + Vite template.

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

### React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

### Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
