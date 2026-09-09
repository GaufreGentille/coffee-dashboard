// get-harvest.mjs — sert le calendrier des origines depuis le blob « harvest ».
// Le JSON brut est stocké tel quel ; les statuts sont recalculés à chaque
// lecture, donc un blob vieux d'une semaine reste juste au jour près.
import { serveFeed } from '../lib/feeds.mjs'
import { buildHarvest, enrichHarvest } from '../lib/builders.mjs'

export default (req) => serveFeed(req, {
  key: 'harvest',
  build: buildHarvest,
  transform: enrichHarvest,
  maxAge: 3600,
})
