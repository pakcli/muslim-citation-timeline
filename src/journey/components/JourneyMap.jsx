import { EDGES, NODES, NODE_W, NODE_H, PATHS, PATH_META } from '../data/journeyData'

const TYPE_COLOR = {
  neutral: '#38bdf8',
  believer: PATH_META.believer.color,
  disbeliever: PATH_META.disbeliever.color,
  hypocrite: PATH_META.hypocrite.color,
}

const toPath = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'} ${p[0]} ${p[1]}`).join(' ')

export default function JourneyMap({ selectedId, onSelect, pathKey }) {
  const onPath = PATHS[pathKey] || PATHS.all
  const edgeOnPath = (e) =>
    pathKey === 'all'
      ? true
      : e.type === 'neutral' ||
        (e.type === pathKey && onPath.includes(e.from) && onPath.includes(e.to))

  return (
    <svg className="jny-map" viewBox="0 0 900 540" role="img" aria-label="Akhirat journey map">
      <defs>
        {Object.entries(TYPE_COLOR).map(([k, c]) => (
          <marker key={k} id={`jny-arrow-${k}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={c} />
          </marker>
        ))}
      </defs>

      {/* Land of Resurrection band */}
      <rect className="jny-band" x="0" y="172" width="900" height="132" rx="6" />
      <text className="jny-band-label" x="700" y="296" textAnchor="middle">The Land of Resurrection</text>

      {/* Edges */}
      {EDGES.map((e) => {
        const active = e.from === selectedId
        const on = edgeOnPath(e)
        return (
          <g key={e.id} className={`jny-edge${active ? ' is-active' : ''}${on ? '' : ' is-dim'}`}>
            <path d={toPath(e.pts)} stroke={TYPE_COLOR[e.type]} markerEnd={`url(#jny-arrow-${e.type})`} />
            {e.label && (
              <text x={e.lx} y={e.ly} textAnchor="middle" className="jny-edge-label">{e.label}</text>
            )}
          </g>
        )
      })}

      {/* Nodes */}
      {NODES.map((n) => {
        const w = n.w || NODE_W
        const h = n.h || NODE_H
        const selected = n.id === selectedId
        const cls = `jny-node${n.kind ? ` is-${n.kind}` : ''}${selected ? ' is-selected' : ''}`
        return (
          <g key={n.id} className={cls} onClick={() => onSelect(n.id)} tabIndex={0}
            onKeyDown={(ev) => (ev.key === 'Enter' || ev.key === ' ') && onSelect(n.id)}
            role="button" aria-label={n.label}>
            <rect x={n.x} y={n.y} width={w} height={h} rx={n.kind === 'heaven' ? 22 : 8} />
            <NodeLabel n={n} w={w} h={h} />
          </g>
        )
      })}

      {/* You are here */}
      <g className="jny-here" pointerEvents="none">
        <text x="340" y="14" textAnchor="middle" className="jny-here-title">You are here</text>
        <text x="340" y="48" textAnchor="middle" className="jny-pin">📍</text>
      </g>
    </svg>
  )
}

// Wrap long labels on spaces so text always stays horizontal inside the box.
function NodeLabel({ n, w, h }) {
  const maxChars = n.kind === 'heaven' || n.kind === 'hell' ? 12 : 14
  const words = n.label.split(' ')
  const lines = []
  words.forEach((word) => {
    const last = lines[lines.length - 1]
    if (last && (last + ' ' + word).length <= maxChars) lines[lines.length - 1] = last + ' ' + word
    else lines.push(word)
  })
  const cx = n.x + w / 2
  const lineH = 15
  const top = n.kind === 'hell' ? n.y + 28 : n.y + h / 2 - ((lines.length - 1) * lineH) / 2
  return (
    <text className="jny-node-text" textAnchor="middle" dominantBaseline="central">
      {lines.map((ln, i) => (
        <tspan key={i} x={cx} y={top + i * lineH}>{ln}</tspan>
      ))}
    </text>
  )
}
