import { Activity } from 'lucide-react'
import type { ActivityItem } from './types'

type RecentActivityPanelProps = {
  loading: boolean
  error: string
  activityFeed: ActivityItem[]
}

export default function RecentActivityPanel({
  loading,
  error,
  activityFeed,
}: RecentActivityPanelProps) {
  return (
    <article className="panel panel-activity">
      <h2>
        <Activity size={18} />
        Recent Activity
      </h2>
      {loading ? <p>Loading dashboard data...</p> : null}
      {error ? <p className="status error">{error}</p> : null}
      <ul>
        {activityFeed.map((item) => (
          <li key={`${item.title}-${item.meta}`}>
            <p>{item.title}</p>
            <small>{item.meta}</small>
          </li>
        ))}
        {!loading && !error && activityFeed.length === 0 ? (
          <li>
            <p>No recent activity found.</p>
            <small>Complete a task to see updates.</small>
          </li>
        ) : null}
      </ul>
    </article>
  )
}
