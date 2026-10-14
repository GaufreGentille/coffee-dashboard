// get-gear.mjs — sert les nouveautés matériel depuis le blob « gear ».
import { serveFeed } from '../lib/feeds.mjs'
import { buildGear } from '../lib/builders.mjs'

export default (req) => serveFeed(req, { key: 'gear', build: buildGear, maxAge: 3600 })
