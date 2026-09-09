import { runCron } from '../lib/feeds.mjs'
import { buildGear } from '../lib/builders.mjs'

export const config = { schedule: '20 5 * * *' }  // 05:20 UTC, tous les jours
export default () => runCron('gear', buildGear)
