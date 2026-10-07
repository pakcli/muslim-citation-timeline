// Journey data only: nodes, edges, paths. No UI logic here.
// Coordinates are in SVG viewBox units (0 0 900 540), laid out like the reference picture.

export const NODE_W = 112
export const NODE_H = 58

export const GROUPS = {
  prelife: 'Pre-life',
  life: 'Life',
  barzakh: 'Barzakh',
  resurrection: 'Resurrection',
  land: 'Land of Resurrection',
  final: 'Final Destination',
}

export const NODES = [
  { id: 'dharr', label: 'World of Al-Dharr', group: 'prelife', x: 16, y: 56 },
  { id: 'womb', label: 'Womb of the Mother', group: 'prelife', x: 150, y: 56 },
  { id: 'dunya', label: 'Dunya', group: 'life', x: 284, y: 56, here: true },
  { id: 'grave', label: 'Grave', group: 'barzakh', x: 418, y: 56 },
  { id: 'horn', label: 'Blowing the Horn', group: 'resurrection', x: 552, y: 56 },
  { id: 'resurrection', label: 'Resurrection', group: 'resurrection', x: 686, y: 56 },

  { id: 'intercession', label: 'Intercession of the Prophet', group: 'land', x: 686, y: 200 },
  { id: 'judgement', label: 'Judgement', group: 'land', x: 552, y: 200 },
  { id: 'books', label: 'The Books', group: 'land', x: 418, y: 200 },
  { id: 'scale', label: 'The Scale', group: 'land', x: 284, y: 200 },
  { id: 'fountain', label: 'The Fountain', group: 'land', x: 150, y: 200 },
  { id: 'test', label: 'Test for the believers', group: 'land', x: 16, y: 200 },

  { id: 'hell', label: 'HELL', group: 'final', x: 284, y: 340, w: 112, h: 150, kind: 'hell' },
  { id: 'sirat', label: 'Sirat', group: 'final', x: 284, y: 400, w: 112, h: 36, kind: 'sirat' },
  { id: 'arch', label: 'The Arch', group: 'final', x: 470, y: 386, w: 90, h: 58 },
  { id: 'heaven', label: 'HEAVEN', group: 'final', x: 640, y: 340, w: 200, h: 150, kind: 'heaven' },
]

// type: neutral | believer | disbeliever | hypocrite
// pts: waypoints in viewBox coordinates (first = start, last = arrow tip)
export const EDGES = [
  { id: 'e1', from: 'dharr', to: 'womb', type: 'neutral', pts: [[128, 85], [148, 85]] },
  { id: 'e2', from: 'womb', to: 'dunya', type: 'neutral', pts: [[262, 85], [282, 85]] },

  { id: 'e3b', from: 'dunya', to: 'grave', type: 'believer', pts: [[398, 76], [416, 76]], label: 'Believers', lx: 407, ly: 44 },
  { id: 'e3d', from: 'dunya', to: 'grave', type: 'disbeliever', pts: [[398, 98], [416, 98]] },
  { id: 'e4b', from: 'grave', to: 'horn', type: 'believer', pts: [[532, 76], [550, 76]], label: 'Believers', lx: 541, ly: 44 },
  { id: 'e4d', from: 'grave', to: 'horn', type: 'disbeliever', pts: [[532, 98], [550, 98]] },
  { id: 'e5b', from: 'horn', to: 'resurrection', type: 'believer', pts: [[666, 76], [684, 76]], label: 'Believers', lx: 675, ly: 44 },
  { id: 'e5d', from: 'horn', to: 'resurrection', type: 'disbeliever', pts: [[666, 98], [684, 98]] },

  { id: 'e6b', from: 'resurrection', to: 'intercession', type: 'believer', pts: [[800, 74], [850, 74], [850, 212], [800, 212]] },
  { id: 'e6d', from: 'resurrection', to: 'intercession', type: 'disbeliever', pts: [[800, 96], [872, 96], [872, 238], [800, 238]] },

  { id: 'e7b', from: 'intercession', to: 'judgement', type: 'believer', pts: [[684, 218], [666, 218]], label: 'Believers', lx: 675, ly: 190 },
  { id: 'e7d', from: 'intercession', to: 'judgement', type: 'disbeliever', pts: [[684, 240], [666, 240]] },
  { id: 'e8b', from: 'judgement', to: 'books', type: 'believer', pts: [[550, 218], [532, 218]], label: 'Believers', lx: 541, ly: 190 },
  { id: 'e8d', from: 'judgement', to: 'books', type: 'disbeliever', pts: [[550, 240], [532, 240]] },
  { id: 'e9b', from: 'books', to: 'scale', type: 'believer', pts: [[416, 218], [398, 218]], label: 'Believers', lx: 407, ly: 190 },
  { id: 'e9d', from: 'books', to: 'scale', type: 'disbeliever', pts: [[416, 240], [398, 240]] },
  { id: 'e10b', from: 'scale', to: 'fountain', type: 'believer', pts: [[282, 218], [264, 218]], label: 'Believers', lx: 273, ly: 190 },

  { id: 'e10d', from: 'scale', to: 'hell', type: 'disbeliever', pts: [[340, 264], [340, 338]] },
  { id: 'e11h', from: 'scale', to: 'hell', type: 'hypocrite', pts: [[308, 264], [308, 300], [160, 300], [160, 264]], label: 'Hypocrites', lx: 234, ly: 316 },
  { id: 'e11b', from: 'fountain', to: 'test', type: 'believer', pts: [[148, 218], [130, 218]], label: 'Believers', lx: 139, ly: 190 },

  { id: 'e12h', from: 'test', to: 'hell', type: 'hypocrite', pts: [[40, 264], [40, 366], [282, 366]], label: 'Hypocrites', lx: 150, ly: 382 },
  { id: 'e12b', from: 'test', to: 'sirat', type: 'believer', pts: [[16, 250], [8, 250], [8, 418], [282, 418]], label: 'Believers', lx: 90, ly: 436 },

  { id: 'e13', from: 'sirat', to: 'arch', type: 'believer', pts: [[396, 418], [468, 418]] },
  { id: 'e14', from: 'arch', to: 'heaven', type: 'believer', pts: [[560, 418], [638, 418]] },
]

// Ordered stage lists for the timeline scrub, per path.
export const PATHS = {
  all: ['dharr', 'womb', 'dunya', 'grave', 'horn', 'resurrection', 'intercession', 'judgement', 'books', 'scale', 'fountain', 'test', 'sirat', 'arch', 'heaven', 'hell'],
  believer: ['dharr', 'womb', 'dunya', 'grave', 'horn', 'resurrection', 'intercession', 'judgement', 'books', 'scale', 'fountain', 'test', 'sirat', 'arch', 'heaven'],
  disbeliever: ['dharr', 'womb', 'dunya', 'grave', 'horn', 'resurrection', 'intercession', 'judgement', 'books', 'scale', 'hell'],
  hypocrite: ['dharr', 'womb', 'dunya', 'grave', 'horn', 'resurrection', 'intercession', 'judgement', 'books', 'scale', 'fountain', 'test', 'hell'],
}

export const PATH_META = {
  all: { label: 'All Roles', color: '#38bdf8' },
  believer: { label: 'Believers', color: '#34d399' },
  disbeliever: { label: 'Disbelievers', color: '#f87171' },
  hypocrite: { label: 'Hypocrites', color: '#fbbf24' },
}

export const nodeById = (id) => NODES.find((n) => n.id === id)
