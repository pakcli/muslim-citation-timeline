import { useState } from 'react'
import { EDGES, GROUPS, nodeById, MINOR_SIGNS_AZ } from '../data/journeyData'

const TYPE_LABEL = { neutral: 'Continues to', believer: 'Believers →', disbeliever: 'Disbelievers →', hypocrite: 'Hypocrites →' }

export default function NodeInfoCard({ node }) {
  const [showMinor, setShowMinor] = useState(false)
  if (!node) return null
  const out = EDGES.filter((e) => e.from === node.id)

  return (
    <div className="jny-card">
      <div className="jny-card-header-row">
        <div className="jny-card-group">{GROUPS[node.group]}{node.here ? ' • 📍 You are here' : ''}</div>
        {node.dalil && <span className="jny-card-dalil-tag">{node.dalil}</span>}
      </div>
      <div className="jny-card-title">{node.label}</div>

      {node.arabic && (
        <div className="jny-card-arabic" dir="rtl">{node.arabic}</div>
      )}

      {node.whatHappens && (
        <div className="jny-card-desc-box">
          <div className="jny-subhead">⚡ Peristiwa Wahyu:</div>
          <p>{node.whatHappens}</p>
        </div>
      )}

      {node.preparationGuide && (
        <div className="jny-card-prep-box">
          <div className="jny-subhead-accent">🛡️ Bekal & Cara Menghadapinya:</div>
          <p>{node.preparationGuide}</p>
        </div>
      )}

      {node.hasMinorSigns && (
        <div className="jny-card-minor-container">
          <button
            type="button"
            className="jny-minor-toggle-btn"
            onClick={() => setShowMinor(!showMinor)}
          >
            <span>📜 {showMinor ? 'Tutup' : 'Lihat'} Katalog Tanda Kiamat Shughra (Nested A–Z)</span>
            <span>{showMinor ? '▲' : '▼'}</span>
          </button>
          {showMinor && (
            <div className="jny-minor-list">
              {MINOR_SIGNS_AZ.map((m) => (
                <div key={m.code} className="jny-minor-item">
                  <div className="jny-minor-top">
                    <span className="jny-minor-code">[{m.code}]</span>
                    <strong>{m.name}</strong>
                    <span className="jny-minor-ref">({m.dalil})</span>
                  </div>
                  <div className="jny-minor-arabic" dir="rtl">{m.arabic}</div>
                  <div className="jny-minor-prep">🛡️ <em>Bekal:</em> {m.prep}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="jny-transitions-section">
        <div className="jny-trans-label">Alur Perjalanan Berikutnya:</div>
        {out.length === 0 ? (
          <div className="jny-card-end">🏁 Puncak Muara Akhir (Final Destination)</div>
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
    </div>
  )
}
