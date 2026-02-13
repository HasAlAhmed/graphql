import { BarChart3 } from 'lucide-react'
import { fallbackChartAmounts, fallbackChartBars, fallbackMonthLabels } from './constants'

type SkillsChartPanelProps = {
  chartBars?: number[]
  chartLabels?: string[]
  chartAmounts?: number[]
  formatCompact: (value: number) => string
}

function shortSkillLabel(label: string) {
  if (label.length <= 10) {
    return label
  }

  return `${label.slice(0, 9)}…`
}

export default function SkillsChartPanel({
  chartBars,
  chartLabels,
  chartAmounts,
  formatCompact,
}: SkillsChartPanelProps) {
  return (
    <article className="panel panel-wide">
      <div className="panel-head">
        <h2>
          <BarChart3 size={18} />
          Top Skills
        </h2>
      </div>

      <div className="chart-wrap" aria-label="Top skills bar chart">
        <svg viewBox="0 0 600 250" preserveAspectRatio="none">
          <line x1="0" y1="200" x2="600" y2="200" stroke="#1f2937" strokeWidth="1" />
          <line x1="0" y1="150" x2="600" y2="150" stroke="#1f2937" strokeWidth="1" strokeDasharray="4" />
          <line x1="0" y1="100" x2="600" y2="100" stroke="#1f2937" strokeWidth="1" strokeDasharray="4" />
          <line x1="0" y1="50" x2="600" y2="50" stroke="#1f2937" strokeWidth="1" strokeDasharray="4" />
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d59f2" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0d59f2" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          {(chartBars ?? fallbackChartBars).map((barHeight, index, allBars) => {
            const slotWidth = 600 / allBars.length
            const barWidth = slotWidth * 0.55
            const x = index * slotWidth + (slotWidth - barWidth) / 2
            const y = 200 - barHeight
            const label = (chartLabels ?? fallbackMonthLabels)[index] ?? 'skill'
            const amount = (chartAmounts ?? fallbackChartAmounts)[index] ?? 0
            const centerX = x + barWidth / 2

            return (
              <g key={`${index}-${barHeight}`}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={4}
                  fill="url(#barGradient)"
                >
                  <title>{`${label}: ${formatCompact(amount)}`}</title>
                </rect>
                <text
                  x={centerX}
                  y={220}
                  textAnchor="middle"
                  fill="#9ca3af"
                  fontSize="11"
                  dominantBaseline="middle"
                >
                  {shortSkillLabel(label)}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </article>
  )
}
