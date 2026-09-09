import { runCron } from '../lib/feeds.mjs'
import { buildNews } from '../lib/builders.mjs'

export const config = { schedule: '0 5 * * *' }   // 05:00 UTC, tous les jours
export default () => runCron('news', buildNews)
