import './StatsBar.css'

const STATS = [
  { key: 'total',     label: 'Total',     color: 'var(--gold)'   },
  { key: 'customers', label: 'Customers', color: 'var(--green)'  },
  { key: 'prospects', label: 'Prospects', color: 'var(--blue)'   },
  { key: 'leads',     label: 'Leads',     color: 'var(--purple)' },
  { key: 'churned',   label: 'Churned',   color: '#6B7280'       },
]

export default function StatsBar({ stats }) {
  return (
    <div className="stats-bar">
      {STATS.map(s => (
        <div className="stat-card" key={s.key} style={{ '--accent': s.color }}>
          <span className="stat-value">
            {stats ? stats[s.key] : <span className="skeleton" style={{ width: 32, height: 28, display:'inline-block' }} />}
          </span>
          <span className="stat-label">{s.label}</span>
          <div className="stat-stripe" />
        </div>
      ))}
    </div>
  )
}
