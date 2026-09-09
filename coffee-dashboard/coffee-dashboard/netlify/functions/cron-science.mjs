import { runCron } from '../lib/feeds.mjs'
import { buildScience } from '../lib/builders.mjs'

export const config = { schedule: '30 5 * * *' }  // 05:30 UTC, tous les jours
export default () => runCron('science', buildScience)
