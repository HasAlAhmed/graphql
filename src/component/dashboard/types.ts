export type HeaderStat = {
  label: string
  value: string
}

export type ActivityItem = {
  title: string
  meta: string
}

export type DashboardUser = {
  id: number
  login: string
  attrs?: unknown
  firstName: string | null
  lastName: string | null
  campus: string | null
  auditRatio: number | null
  totalUp: number | string | null
  totalDown: number | string | null
  xpTotal: {
    aggregate: {
      sum: {
        amount: number | string | null
      } | null
    } | null
  }
  levelProgress: Array<{
    amount: number | string
  }>
  skillTransactions: Array<{
    type: string
    amount: number | string
  }>
  recentTransactions: Array<{
    amount: number | string
    createdAt: string
    path: string
    type: string
  }>
  records: Array<{
    createdAt: string
    message: string | null
    type: {
      label: string | null
      type: string
    }
  }>
  labels?: Array<{
    eventId: number | null
  }>
}

export type DashboardResponse = {
  user: DashboardUser[]
}

export type GraphQLResponse<T> = {
  data?: T
  errors?: Array<{ message: string }>
}

export type DashboardViewModel = {
  fullName: string
  login: string
  id: number
  campus: string
  headerStats: HeaderStat[]
  auditRatioText: string
  doneAmount: string
  receivedAmount: string
  activityFeed: ActivityItem[]
  chartLabels: string[]
  chartBars: number[]
  chartAmounts: number[]
}
