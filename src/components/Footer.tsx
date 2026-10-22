import Wordmark from './Wordmark'
import { CONTACT_EMAIL, CONTACT_MAILTO } from '../contact'

type FooterProps = {
  setPage: (page: 'home' | 'about' | 'donate') => void
}

function Footer({ setPage }: FooterProps) {
  return (
    <footer className="site-footer">
      <a className="brand-link footer-brand" href="#home" onClick={(event) => { event.preventDefault(); setPage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }) }} aria-label="SaveEarth home">
        <Wordmark />
      </a>
      <p>Care for the places that care for us.</p>
      <a href={CONTACT_MAILTO}>{CONTACT_EMAIL}</a>
      <span className="footer-note">© 2026 SaveEarth · Made for a living planet</span>
    </footer>
  )
}

export default Footer