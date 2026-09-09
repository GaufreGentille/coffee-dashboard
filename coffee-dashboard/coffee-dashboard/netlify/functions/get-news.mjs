// get-news.mjs — sert les actualités depuis le blob « news ».
import { serveFeed } from '../lib/feeds.mjs'
import { buildNews } from '../lib/builders.mjs'

export default (req) => serveFeed(req, { key: 'news', build: buildNews, maxAge: 3600 })
