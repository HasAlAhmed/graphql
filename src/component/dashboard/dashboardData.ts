import { GRAPHQL_ENDPOINT } from '../../App'
import { dashboardQuery, userExpAndLevelQuery } from '../../graphql/query'
import {
  fallbackChartAmounts,
  fallbackChartBars,
  fallbackMonthLabels,
} from './constants'
import type {
  ActivityItem,
  DashboardResponse,
  DashboardUser,
  DashboardViewModel,
  GraphQLResponse,
} from './types'

type UserExpAndLevelResponse = {
  xp: {
    aggregate: {
      sum: {
        amount: number | string | null
      } | null
    } | null
  }
  level: Array<{
    amount: number | string
  }>
}

export function formatCompact(value: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined) {
    return 0
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function formatBytesLike(value: number) {
  return `${formatCompact(value)}B`
}

function formatTimeAgo(dateIso: string) {
  const then = new Date(dateIso).getTime()
  const now = Date.now()

  if (!Number.isFinite(then)) {
    return 'just now'
  }

  const deltaSeconds = Math.max(1, Math.floor((now - then) / 1000))
  const units: Array<{ unit: Intl.RelativeTimeFormatUnit; seconds: number }> = [
    { unit: 'year', seconds: 60 * 60 * 24 * 365 },
    { unit: 'month', seconds: 60 * 60 * 24 * 30 },
    { unit: 'week', seconds: 60 * 60 * 24 * 7 },
    { unit: 'day', seconds: 60 * 60 * 24 },
    { unit: 'hour', seconds: 60 * 60 },
    { unit: 'minute', seconds: 60 },
  ]

  const relativeTime = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  for (const { unit, seconds } of units) {
    if (deltaSeconds >= seconds) {
      const value = Math.floor(deltaSeconds / seconds)
      return relativeTime.format(-value, unit)
    }
  }

  return 'just now'
}

function getSkillLabel(skillType: string) {
  return skillType.replace(/^skill_/, '').replaceAll('_', ' ')
}

function buildChartFromSkills(skills: DashboardUser['skillTransactions']) {
  const selected = [...skills].sort((left, right) => toNumber(left.amount) - toNumber(right.amount)).slice(-6)

  if (selected.length === 0) {
    return {
      chartLabels: fallbackMonthLabels,
      chartBars: fallbackChartBars,
      chartAmounts: fallbackChartAmounts,
    }
  }

  const maxValue = Math.max(...selected.map((skill) => toNumber(skill.amount)), 1)
  const bars = selected.map((skill) => {
    const normalized = toNumber(skill.amount) / maxValue
    return Math.max(8, Math.round(normalized * 160))
  })

  return {
    chartLabels: selected.map((skill) => getSkillLabel(skill.type)),
    chartBars: bars,
    chartAmounts: selected.map((skill) => toNumber(skill.amount)),
  }
}

function mapDashboardData(user: DashboardUser): DashboardViewModel {
  const xp = toNumber(user.xpTotal.aggregate?.sum?.amount)
  const levelValue = toNumber(user.levelProgress[0]?.amount)
  const done = toNumber(user.totalUp)
  const received = toNumber(user.totalDown)
  const ratio = Number.isFinite(user.auditRatio ?? Number.NaN) ? user.auditRatio ?? 0 : 0
  const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.login

  const mappedRecords: ActivityItem[] = user.records.map((record) => {
    const title = record.message?.trim() || record.type.label || record.type.type
    return {
      title,
      meta: `${formatTimeAgo(record.createdAt)} · ${record.type.type}`,
    }
  })

  const fallbackTransactions: ActivityItem[] = user.recentTransactions.map((transaction) => ({
    title: transaction.path,
    meta: `${formatTimeAgo(transaction.createdAt)} · +${formatCompact(toNumber(transaction.amount))} XP`,
  }))

  const chart = buildChartFromSkills(user.skillTransactions)

  return {
    fullName,
    login: user.login,
    id: user.id,
    campus: user.campus || 'Unknown campus',
    headerStats: [
      { label: 'Current XP', value: formatCompact(xp) },
      { label: 'Level', value: String(Math.trunc(levelValue || 0)).padStart(2, '0') },
    ],
    auditRatioText: ratio.toFixed(1),
    doneAmount: formatBytesLike(done),
    receivedAmount: formatBytesLike(received),
    activityFeed: mappedRecords.length > 0 ? mappedRecords : fallbackTransactions,
    chartLabels: chart.chartLabels,
    chartBars: chart.chartBars,
    chartAmounts: chart.chartAmounts,
  }
}

function extractRootEventId(user: DashboardUser) {
  const attrs = user.attrs
  if (attrs && typeof attrs === 'object' && !Array.isArray(attrs)) {
    const attrsRecord = attrs as Record<string, unknown>
    const fromAttrs = attrsRecord['rootEventId'] ?? attrsRecord['eventId']
    if (typeof fromAttrs === 'number' && Number.isFinite(fromAttrs)) {
      return fromAttrs
    }
    if (typeof fromAttrs === 'string') {
      const parsed = Number(fromAttrs)
      if (Number.isFinite(parsed)) {
        return parsed
      }
    }
  }

  const fromLabels = user.labels?.find((label) => typeof label.eventId === 'number')?.eventId
  if (typeof fromLabels === 'number' && Number.isFinite(fromLabels)) {
    return fromLabels
  }

  return null
}

async function fetchExpAndLevel(jwt: string, userId: number, rootEventId: number) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwt}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: userExpAndLevelQuery,
      variables: {
        userId,
        rootEventId,
      },
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch XP and level data from GraphQL.')
  }

  const payload = (await response.json()) as GraphQLResponse<UserExpAndLevelResponse>

  if (payload.errors?.length) {
    throw new Error(payload.errors[0].message)
  }

  const expAmount = toNumber(payload.data?.xp.aggregate?.sum?.amount)
  const levelAmount = toNumber(payload.data?.level?.[0]?.amount)

  return {
    expAmount,
    levelAmount,
  }
}

export async function fetchDashboardViewModel(jwt: string) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwt}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: dashboardQuery }),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data from GraphQL.')
  }

  const payload = (await response.json()) as GraphQLResponse<DashboardResponse>

  if (payload.errors?.length) {
    throw new Error(payload.errors[0].message)
  }

  const user = payload.data?.user[0]
  if (!user) {
    throw new Error('No user data returned from GraphQL.')
  }

  const viewModel = mapDashboardData(user)

  const rootEventId = extractRootEventId(user)
  if (rootEventId === null) {
    return viewModel
  }

  const { expAmount, levelAmount } = await fetchExpAndLevel(jwt, user.id, rootEventId)

  return {
    ...viewModel,
    headerStats: [
      { label: 'Current XP', value: formatCompact(expAmount) },
      { label: 'Level', value: String(Math.trunc(levelAmount || 0)).padStart(2, '0') },
    ],
  }
}
