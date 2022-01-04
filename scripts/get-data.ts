import { promises as fs } from 'fs'
import path from 'path'
import readdir from 'recursive-readdir'
import xml2js from 'xml2js'

const parser = new xml2js.Parser()

const BASE = path.join(
  'C:',
  'Program Files (x86)',
  'Steam',
  'steamapps',
  'common',
  'Warhammer 40000 Gladius - Relics of War',
  'Data',
  'World'
)

const FACTIONS = path.join(BASE, 'Factions')
const UNITS = path.join(BASE, 'Units')

console.info(BASE)

async function getDirFiles(path: string) {
  return readdir(path).then((files) => {
    return Promise.all(
      files.map(async (f) => ({
        path: f,
        relativePath: f.replace(path, ''),
        pathParts: f.replace(path, '').replace('.xml', '').split('\\').filter(Boolean),
        data: await parser.parseStringPromise(await fs.readFile(f)),
      }))
    )
  })
}

// eslint-disable-next-line @typescript-eslint/no-extra-semi
;(async () => {
  console.info('[start]')
  const factions = await getDirFiles(FACTIONS)
  console.info('f', factions[0].data)
  const units = await getDirFiles(UNITS)
  console.info('f', units[0])
  console.info('[end]')
})()

console.info('hey')

export {}
