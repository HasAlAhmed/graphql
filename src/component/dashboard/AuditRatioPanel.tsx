import { Gauge } from 'lucide-react'

type AuditRatioPanelProps = {
  auditRatioText?: string
  doneAmount?: string
  receivedAmount?: string
}

export default function AuditRatioPanel({
  auditRatioText,
  doneAmount,
  receivedAmount,
}: AuditRatioPanelProps) {
  return (
    <article className="panel panel-ratio">
      <h2>
        <Gauge size={18} />
        Audit Ratio
      </h2>

      <div className="ratio-ring" aria-label="Audit ratio ring">
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#1f2937" strokeWidth="8" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="#0d59f2" strokeWidth="8" strokeLinecap="round" strokeDasharray="150 251" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="#7c3aed" strokeWidth="8" strokeLinecap="round" strokeDasharray="100 251" strokeDashoffset="-160" />
        </svg>
        <div>
          <strong>{auditRatioText ?? '--'}</strong>
          <small>HEALTHY</small>
        </div>
      </div>

      <div className="ratio-legend">
        <span><i className="dot done" />Done ({doneAmount ?? '--'})</span>
        <span><i className="dot recv" />Received ({receivedAmount ?? '--'})</span>
      </div>
    </article>
  )
}
