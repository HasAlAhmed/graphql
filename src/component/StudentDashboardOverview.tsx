import {
  LogOut,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import AuditRatioPanel from './dashboard/AuditRatioPanel'
import DashboardHeader from './dashboard/DashboardHeader'
import RecentActivityPanel from './dashboard/RecentActivityPanel'
import SkillsChartPanel from './dashboard/SkillsChartPanel'
import { fetchDashboardViewModel, formatCompact } from './dashboard/dashboardData'
import type { DashboardViewModel, HeaderStat } from './dashboard/types'

type StudentDashboardOverviewProps = {
  onLogout: () => void
}

export default function StudentDashboardOverview({ onLogout }: StudentDashboardOverviewProps) {
  const [dashboard, setDashboard] = useState<DashboardViewModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadDashboard() {
      setLoading(true)
      setError('')

      try {
        const jwt = localStorage.getItem('jwt')
        if (!jwt) {
          throw new Error('Missing JWT token. Please log in again.')
        }

        const viewModel = await fetchDashboardViewModel(jwt)
        if (isMounted) {
          setDashboard(viewModel)
        }
      } catch (caughtError) {
        if (isMounted) {
          setError(caughtError instanceof Error ? caughtError.message : 'Unexpected dashboard error.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void loadDashboard()

    return () => {
      isMounted = false
    }
  }, [])

  const activityFeed = useMemo(() => dashboard?.activityFeed ?? [], [dashboard])
  const headerStats = useMemo<HeaderStat[]>(
    () => dashboard?.headerStats ?? [
      { label: 'Current XP', value: '--' },
      { label: 'Level', value: '--' },
    ],
    [dashboard],
  )

  return (
    <main className="dashboard-page">
      <nav className="dashboard-nav">
        <div className="dashboard-brand">
          <div className="dashboard-brand-icon">∿</div>
          <span>CAMPUS PROFILE</span>
        </div>

        <div className="dashboard-actions">
          <button className="logout-button" type="button" onClick={onLogout}>
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </nav>

      <section className="dashboard-shell">
          <DashboardHeader
            fullName={dashboard?.fullName}
            login={dashboard?.login}
            id={dashboard?.id}
            campus={dashboard?.campus}
            headerStats={headerStats}
          />

          <section className="dashboard-grid">
            <SkillsChartPanel
              chartBars={dashboard?.chartBars}
              chartLabels={dashboard?.chartLabels}
              chartAmounts={dashboard?.chartAmounts}
              formatCompact={formatCompact}
            />
            <AuditRatioPanel
              auditRatioText={dashboard?.auditRatioText}
              doneAmount={dashboard?.doneAmount}
              receivedAmount={dashboard?.receivedAmount}
            />
          </section>

          <RecentActivityPanel loading={loading} error={error} activityFeed={activityFeed} />
      </section>
    </main>
  )
}
