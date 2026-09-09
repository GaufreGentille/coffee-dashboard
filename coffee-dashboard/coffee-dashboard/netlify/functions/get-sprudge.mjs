// get-sprudge.mjs — sert le Sprudge Report depuis le blob « sprudge ».
import { serveFeed } from '../lib/feeds.mjs'
import { buildSprudge } from '../lib/builders.mjs'

export default (req) => serveFeed(req, { key: 'sprudge', build: buildSprudge, maxAge: 3600 })
