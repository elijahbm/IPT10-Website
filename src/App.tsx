import { useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import AboutPage from './pages/AboutPage'
import DonatePage from './pages/DonatePage'
import HomePage from './pages/HomePage'
import InvolvedPage from './pages/InvolvedPage'
import { hasPaymentReturn } from './stripe'
import './App.css'

type Page = 'home' | 'about' | 'donate' | 'involved'

/** Stripe sends redirect-based payments back with query parameters; reopen the donate page for those. */
function initialPage(): Page {
  return hasPaymentReturn() ? 'donate' : 'home'
}

function App() {
  const [page, setPage] = useState<Page>(initialPage)
  const [donationAmountCents, setDonationAmountCents] = useState<number | null>(null)

  /** Nav links open the donate page with no amount pre-chosen. */
  function navigate(nextPage: Page) {
    if (nextPage === 'donate') {
      setDonationAmountCents(null)
    }

    setPage(nextPage)
  }

  /** The Home page's gift tiers hand their chosen amount to the donate page. */
  function startDonation(amountCents: number) {
    setDonationAmountCents(amountCents)
    setPage('donate')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /** The volunteer form has no header tab; it is reached from the Home CTAs. */
  function startVolunteering() {
    setPage('involved')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="site-shell">
      <Header page={page} setPage={navigate} />
      {page === 'home' && <HomePage onDonate={startDonation} onVolunteer={startVolunteering} />}
      {page === 'about' && <AboutPage onVolunteer={startVolunteering} />}
      {page === 'donate' && <DonatePage initialAmountCents={donationAmountCents} />}
      {page === 'involved' && <InvolvedPage onHome={() => navigate('home')} />}
      <Footer setPage={navigate} />
    </div>
  )
}

export default App
