import { runCron } from '../lib/feeds.mjs'
import { buildHarvest } from '../lib/builders.mjs'

export const config = { schedule: '40 5 * * 1' }  // 05:40 UTC, tous les lundis
export default () => runCron('harvest', buildHarvest)
