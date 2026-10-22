import ContactForm from '../components/ContactForm'

// Mission copy lives here so the wording can change without touching the layout.
const MISSION = {
  statement:
    'SaveEarth brings neighbors together to plant trees, clean waterways, and care for local green spaces, so communities can thrive alongside nature.',
  vision: 'A future where nature and people flourish side by side.',
}

type AboutPageProps = {
  onVolunteer: () => void
}

function AboutPage({ onVolunteer }: AboutPageProps) {
  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="about-hero-copy"><p className="eyebrow"><span /> A note from our founder</p><h1>Hi, I’m <em>Joseph Elijah Miclat</em></h1><p className="about-lede">A 20-year old environmentalist and 3rd-year college student from Angeles University Foundation with a passion for sustainable living and community engagement. I believe caring for the Earth should feel less like a distant ideal and more like something we do together, right where we live.</p></div>
        <figure className="about-figure"><div className="about-portrait" role="img" aria-label="Portrait of Joseph Elijah Miclat, founder of SaveEarth" />
        <figcaption className="portrait-caption">[Joseph Elijah Miclat] · Founder, SaveEarth</figcaption></figure>
      </section>
      <section className="story-section">
        <div className="story-kicker"><span>01</span><p className="eyebrow">The story so far</p></div>
        <div className="story-copy"><h2>A small idea<br />with deep roots.</h2><p>SaveEarth started with a simple question: what if protecting the planet began with the places right outside our doors?</p><p>That question grew into a community of people who care about clean air, thriving habitats, and a future where nature and people can flourish side by side. We bring local hands and hopeful hearts to practical, lasting work.</p><p className="personal-note">Pollution is spreading across the world, so I set out to create a solution that could actually help our planet. Here at SaveEarth, I believe we can still make a difference — it is never too late to act.</p></div>
      </section>
      <section className="story-section mission-section">
        <div className="story-kicker"><span>02</span><p className="eyebrow">Our mission</p></div>
        <div className="mission-copy"><h2 className="mission-statement">{MISSION.statement}</h2><p className="eyebrow mission-label">Our vision</p><p className="mission-vision">{MISSION.vision}</p></div>
      </section>
      <section className="values-section">
        <div><p className="eyebrow">What keeps me going</p><h2>Good work is<br /><em>shared work.</em></h2></div>
        <div className="values-list"><p><span>01</span> Start with the community already there.</p><p><span>02</span> Make room for everyone to take part.</p><p><span>03</span> Leave every place better than we found it.</p></div>
      </section>
      <section className="about-cta"><p className="eyebrow">Come say hello</p><h2>Got a question<br />or an idea?</h2><p className="about-volunteer-note">Looking to volunteer? <button className="text-link" type="button" onClick={onVolunteer}>Use the volunteer form <span aria-hidden="true">↗</span></button></p><ContactForm /></section>
    </main>
  )
}

export default AboutPage