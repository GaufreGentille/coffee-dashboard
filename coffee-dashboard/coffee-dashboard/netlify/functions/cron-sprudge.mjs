import { runCron } from '../lib/feeds.mjs'
import { buildSprudge } from '../lib/builders.mjs'

export const config = { schedule: '10 5 * * *' }  // 05:10 UTC, tous les jours
export default () => runCron('sprudge', buildSprudge)
