import { Fragment } from 'react'
import aboutData from './about.json'

// Renders an array of lines separated by <br />
function Lines({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={line}>
          {line}
          {i < lines.length - 1 && <br />}
        </Fragment>
      ))}
    </>
  )
}

function AboutPage() {
  const { hero, story, values, cta } = aboutData

  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="about-hero-copy">
          <p className="eyebrow"><span /> {hero.eyebrow}</p>
          <h1>{hero.greeting} <em>{hero.name}</em></h1>
          <p className="about-lede">{hero.lede}</p>
        </div>
        <div className="about-portrait" role="img" aria-label={hero.portraitAlt} />
        <span className="portrait-caption">{hero.portraitCaption}</span>
      </section>

      <section className="story-section">
        <div className="story-kicker">
          <span>{story.number}</span>
          <p className="eyebrow">{story.eyebrow}</p>
        </div>
        <div className="story-copy">
          <h2><Lines lines={story.titleLines} /></h2>
          {story.paragraphs.map((text) => (
            <p key={text}>{text}</p>
          ))}
          <p className="personal-note">{story.personalNote}</p>
        </div>
      </section>

      <section className="values-section">
        <div>
          <p className="eyebrow">{values.eyebrow}</p>
          <h2>
            <Lines lines={values.titleLines} />
            <br />
            <em>{values.titleEmphasis}</em>
          </h2>
        </div>
        <div className="values-list">
          {values.items.map((item) => (
            <p key={item.number}><span>{item.number}</span> {item.text}</p>
          ))}
        </div>
      </section>

      <section className="about-cta">
        <p className="eyebrow">{cta.eyebrow}</p>
        <h2><Lines lines={cta.titleLines} /></h2>
        <a className="button button-dark" href={`mailto:${cta.email}`}>
          {cta.buttonLabel} <span aria-hidden="true">↗</span>
        </a>
      </section>
    </main>
  )
}

export default AboutPage