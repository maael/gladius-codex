import { promises as fs } from 'fs'
import path from 'path'

export async function getFactionNames() {
  return (await fs.readdir(path.join(process.cwd(), 'data')))
    .filter((n) => !n.startsWith('.'))
    .map((f) => f.replace('.json', ''))
}

export async function getFactionInfo(options: { name?: string; limited?: boolean } = {}) {
  const factions = (await getFactionNames()).filter((n) => (options.name ? n === options.name : true))
  const factionInfo = await Promise.all(
    factions.map(async (f) =>
      Object.assign({ name: f }, JSON.parse(await fs.readFile(path.join(process.cwd(), 'data', `${f}.json`), 'utf-8')))
    )
  )
  if (options.limited) {
    factionInfo.forEach((i) => {
      Object.entries(i).forEach(([k, v]) => {
        if (typeof v === 'object') {
          delete i[k]
        }
      })
    })
  }
  return factionInfo
}
