// get-science.mjs — sert la veille scientifique depuis le blob « science ».
import { serveFeed } from '../lib/feeds.mjs'
import { buildScience } from '../lib/builders.mjs'

export default (req) => serveFeed(req, { key: 'science', build: buildScience, maxAge: 3600 })
