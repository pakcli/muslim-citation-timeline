import { useRef } from 'react'
import { nodeById, PATH_META } from '../data/journeyData'

// Premiere-style track: one clip per stage on the active path, draggable playhead with snap.
export default function JourneyTimeline({ order, index, pathKey, onSelect, onStep }) {
  const trackRef = useRef(null)
  const dragging = useRef(false)
  const n = order.length
  const color = PATH_META[pathKey]?.color || '#38bdf8'

  const scrub = (clientX) => {
    const rect = trackRef.current.getBoundingClientRect()
    const ratio = Math.min(0.9999, Math.max(0, (clientX - rect.left) / rect.width))
    onSelect(order[Math.floor(ratio * n)]) // snaps to clip under the pointer
  }

  const onDown = (e) => {
    dragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    scrub(e.clientX)
  }
  const onMove = (e) => dragging.current && scrub(e.clientX)
  const onUp = () => { dragging.current = false }

  return (
    <div className="jny-tl">
      <div className="jny-tl-bar">
        <div className="jny-tl-time">{String(index + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</div>
        <div className="jny-tl-btns">
          <button type="button" onClick={() => onStep(-1)} disabled={index === 0}>⏮ Step</button>
          <button type="button" onClick={() => onStep(1)} disabled={index === n - 1}>Step ⏭</button>
        </div>
      </div>

      <div className="jny-tl-ruler">
        {order.map((id, i) => (
          <span key={id} className={i === index ? 'is-on' : ''}>{i + 1}</span>
        ))}
      </div>

      <div className="jny-tl-track" ref={trackRef} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        {order.map((id, i) => {
          const node = nodeById(id)
          return (
            <div key={id} className={`jny-clip${i === index ? ' is-on' : ''}${i < index ? ' is-past' : ''}`}
              style={{ '--clip-color': color }}>
              <span className="jny-clip-name">{node.label}</span>
            </div>
          )
        })}
        <div className="jny-playhead" style={{ left: `${((index + 0.5) / n) * 100}%` }}>
          <div className="jny-playhead-head" />
          <div className="jny-playhead-line" />
        </div>
      </div>
    </div>
  )
}
