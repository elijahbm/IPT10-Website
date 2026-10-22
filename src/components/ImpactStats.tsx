/**
 * Placeholder figures - replace these with your real numbers before publishing.
 * Impact claims are exactly the kind of thing a donor will check.
 */
const impactStats = [
  { value: '1,240', label: 'Native trees planted' },
  { value: '8', label: 'Waterways restored' },
  { value: '340', label: 'Young people trained' },
  { value: '12', label: 'Communities reached' },
]

function ImpactStats() {
  return (
    <section className="impact-strip" aria-label="Our impact so far">
      <div className="impact-inner">
        {impactStats.map((stat) => (
          <div className="impact-stat" key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ImpactStats
