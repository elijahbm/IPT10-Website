function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="about-hero-copy"><p className="eyebrow"><span /> A note from our founder</p><h1>Hi, I’m <em>Joseph Elijah Miclat</em></h1><p className="about-lede">A 20-year old environmentalist and 3rd-year college student from Angeles Univeristy Foundation with a passion for sustainable living and community engagement. I believe caring for the Earth should feel less like a distant ideal and more like something we do together, right where we live.</p></div>
        <div className="about-portrait" role="img" aria-label="A person tending a community garden" />
        <span className="portrait-caption">[Joseph Elijah Miclat] · Founder, SaveEarth</span>
      </section>
      <section className="story-section">
        <div className="story-kicker"><span>01</span><p className="eyebrow">The story so far</p></div>
        <div className="story-copy"><h2>A small idea<br />with deep roots.</h2><p>SaveEarth started with a simple question: what if protecting the planet began with the places right outside our doors?</p><p>That question grew into a community of people who care about clean air, thriving habitats, and a future where nature and people can flourish side by side. We bring local hands and hopeful hearts to practical, lasting work.</p><p className="personal-note">Due to the widely spread of pollution all over the world, I came up with the idea of creating a solution that can solve and benefit our mother earth. Here in SaveEarth, I do believe that we can make a change and it is never too late to take an action.</p></div>
      </section>
      <section className="values-section">
        <div><p className="eyebrow">What keeps me going</p><h2>Good work is<br /><em>shared work.</em></h2></div>
        <div className="values-list"><p><span>01</span> Start with the community already there.</p><p><span>02</span> Make room for everyone to take part.</p><p><span>03</span> Leave every place better than we found it.</p></div>
      </section>
      <section className="about-cta"><p className="eyebrow">Come say hello</p><h2>Let’s make something<br />good happen.</h2><a className="button button-dark" href="mailto:hello@saveearth.org">Write to me <span aria-hidden="true">↗</span></a></section>
    </main>
  )
}

export default AboutPage