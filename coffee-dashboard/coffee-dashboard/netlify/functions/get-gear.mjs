// get-gear.mjs — sert les nouveautés matériel depuis le blob « gear ».
import { serveFeed } from '../lib/feeds.mjs'
import { buildGear } from '../lib/builders.mjs'
import { enrichGearImages } from '../lib/gear-images.mjs'

export default (req) => serveFeed(req, { key: 'gear', build: buildGear, transform: enrichGearImages, maxAge: 900 })
