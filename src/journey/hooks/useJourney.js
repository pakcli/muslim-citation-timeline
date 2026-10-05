import { useCallback, useMemo, useState } from 'react'
import { PATHS, nodeById } from '../data/journeyData'

// Shared state for Map + Timeline: selected node and active path.
export function useJourney() {
  const [pathKey, setPathKeyRaw] = useState('believer')
  const [selectedId, setSelectedId] = useState('dunya')
  const [sub, setSub] = useState('map')

  const order = PATHS[pathKey]
  const index = Math.max(0, order.indexOf(selectedId))

  const setPathKey = useCallback((key) => {
    setPathKeyRaw(key)
    // keep selection if still on the new path, otherwise fall back to Dunya
    setSelectedId((cur) => (PATHS[key].includes(cur) ? cur : 'dunya'))
  }, [])

  const step = useCallback(
    (delta) => {
      const next = Math.min(order.length - 1, Math.max(0, index + delta))
      setSelectedId(order[next])
    },
    [order, index],
  )

  const selected = useMemo(() => nodeById(selectedId), [selectedId])

  return { pathKey, setPathKey, selectedId, setSelectedId, selected, order, index, step, sub, setSub }
}
