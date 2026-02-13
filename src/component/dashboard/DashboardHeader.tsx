import { MapPin } from 'lucide-react'
import type { HeaderStat } from './types'

type DashboardHeaderProps = {
  fullName?: string
  login?: string
  id?: number
  campus?: string
  headerStats: HeaderStat[]
}

export default function DashboardHeader({
  fullName,
  login,
  id,
  campus,
  headerStats,
}: DashboardHeaderProps) {
  return (
    <header className="dashboard-header">
      <h1>
        {fullName ?? 'Loading profile...'} <span>@{login ?? '...'}</span>
      </h1>

      <div className="dashboard-meta">
        <span>ID: {id ?? '--'}</span>
        <span className="divider">|</span>
        <span className="cohort">Realtime profile</span>
        <span className="divider">|</span>
        <span className="location">
          <MapPin size={14} />
          {campus ?? 'Unknown campus'}
        </span>
      </div>

      <div className="dashboard-summary-row">
        {headerStats.map((stat, idx) => (
          <div className="summary-item" key={stat.label}>
            <p>{stat.label}</p>
            <strong>{stat.value}</strong>
            {idx < headerStats.length - 1 ? <div className="summary-divider" aria-hidden="true" /> : null}
          </div>
        ))}
      </div>
    </header>
  )
}
