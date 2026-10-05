import { useJourney } from './hooks/useJourney'
import JourneyMap from './components/JourneyMap'
import JourneyTimeline from './components/JourneyTimeline'
import NodeInfoCard from './components/NodeInfoCard'
import { PATH_META } from './data/journeyData'
import './journey.css'

export default function App() {
  const j = useJourney()

  return (
    <div className="jny">
      <div className="jny-toolbar">
        <div className="jny-seg" role="tablist" aria-label="Journey view">
          <button type="button" className={j.sub === 'map' ? 'is-on' : ''} onClick={() => j.setSub('map')}>🗺️ Map</button>
          <button type="button" className={j.sub === 'timeline' ? 'is-on' : ''} onClick={() => j.setSub('timeline')}>⏱️ Timeline</button>
        </div>
        <div className="jny-seg" role="tablist" aria-label="Path">
          {Object.entries(PATH_META).map(([key, m]) => (
            <button key={key} type="button" className={j.pathKey === key ? 'is-on' : ''}
              style={{ '--seg-color': m.color }} onClick={() => j.setPathKey(key)}>
              <span className="jny-dot" /> {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="jny-stage">
        {j.sub === 'map' ? (
          <JourneyMap selectedId={j.selectedId} onSelect={j.setSelectedId} pathKey={j.pathKey} />
        ) : (
          <JourneyTimeline order={j.order} index={j.index} pathKey={j.pathKey} onSelect={j.setSelectedId} onStep={j.step} />
        )}
      </div>

      <NodeInfoCard node={j.selected} />
    </div>
  )
}
