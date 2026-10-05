import { EDGES, GROUPS, nodeById } from '../data/journeyData'

const TYPE_LABEL = { neutral: 'Continues to', believer: 'Believers →', disbeliever: 'Disbelievers →', hypocrite: 'Hypocrites →' }

export default function NodeInfoCard({ node }) {
  if (!node) return null
  const out = EDGES.filter((e) => e.from === node.id)
  return (
    <div className="jny-card">
      <div className="jny-card-group">{GROUPS[node.group]}{node.here ? ' • 📍 You are here' : ''}</div>
      <div className="jny-card-title">{node.label}</div>
      {out.length === 0 ? (
        <div className="jny-card-end">Final stage</div>
      ) : (
        <ul className="jny-card-list">
          {out.map((e) => (
            <li key={e.id} className={`is-${e.type}`}>
              <span>{TYPE_LABEL[e.type]}</span> <strong>{nodeById(e.to).label}</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
