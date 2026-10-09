import ArrowLink from '../components/ArrowLink'

const programs = [
  {
    number: '01',
    title: 'Grow neighborhood forests',
    description: 'Bring native trees back to the places that need shade, cleaner air, and room for wildlife.',
    label: 'Urban reforestation',
    symbol: '✳',
  },
  {
    number: '02',
    title: 'Bring local waterways back to life',
    description: 'Care for the rivers and wetlands that keep entire communities and ecosystems thriving.',
    label: 'Waterway restoration',
    symbol: '≈',
  },
  {
    number: '03',
    title: 'Put young people in the lead',
    description: 'Give the next generation the tools, confidence, and community to shape a greener future.',
    label: 'Youth action',
    symbol: '↗',
  },
]

function HomePage() {
  return (
    <main>
      <section className="home-hero">
        <div className="hero-image" role="img" aria-label="Sunlight filtering through a lush green forest" />
        <div className="hero-shade" />
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow"><span /> A nonprofit for people and planet</p>
          <h1>A healthier<br />planet starts<br /><em>right here.</em></h1>
          <p className="hero-description">We bring people together to restore the natural places we all depend on, starting in the communities we call home.</p>
          <div className="hero-actions">
            <a className="button button-lime" href="mailto:hello@saveearth.org?subject=I%20want%20to%20volunteer">Get involved <span aria-hidden="true">↗</span></a>
            <a className="hero-text-link" href="#our-work">Explore our work <span aria-hidden="true">↓</span></a>
          </div>
        </div>
        <div className="hero-caption"><span>01 / 03</span><span>Healthy ecosystems. Stronger communities.</span></div>
        <div className="hero-side-label">FIELD NOTES · ISSUE 01</div>
      </section>

      <section className="intro-band" aria-labelledby="intro-title">
        <p className="eyebrow intro-label">A little good goes a long way</p>
        <h2 id="intro-title">When nature does well,<br /><span>we all do.</span></h2>
        <div className="intro-detail"><p>SaveEarth is a community-powered nonprofit creating practical ways for people to protect the places, plants, and wildlife around them.</p><ArrowLink href="#our-work">What we focus on</ArrowLink></div>
      </section>

      <section className="work-section" id="our-work" aria-labelledby="work-title">
        <div className="section-heading">
          <div><p className="eyebrow">Small actions. Lasting change.</p><h2 id="work-title">Rooted in the work<br />that matters.</h2></div>
          <p className="section-aside">A living planet needs more than awareness. It needs neighbors showing up for the long haul.</p>
        </div>
        <div className="program-list">
          {programs.map((program) => (
            <article className="program-row" key={program.number}>
              <span className="program-number">{program.number}</span>
              <span className="program-symbol" aria-hidden="true">{program.symbol}</span>
              <div className="program-copy"><span className="program-label">{program.label}</span><h3>{program.title}</h3><p>{program.description}</p></div>
              <span className="program-arrow" aria-hidden="true">↗</span>
            </article>
          ))}
        </div>
      </section>

      <section className="callout-band">
        <div className="callout-flower" aria-hidden="true">✳</div>
        <p className="eyebrow">It starts with us</p>
        <h2>There’s room for<br /><em>everyone</em> in this.</h2>
        <p className="callout-copy">Show up with what you have. Learn alongside your neighbors. Leave your corner of the world a little greener.</p>
        <a className="button button-dark" href="mailto:hello@saveearth.org?subject=I%20want%20to%20volunteer">Find your way in <span aria-hidden="true">↗</span></a>
      </section>
    </main>
  )
}

export default HomePage