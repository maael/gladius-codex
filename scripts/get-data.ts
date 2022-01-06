/* eslint-disable @typescript-eslint/no-explicit-any */
import { promises as fs } from 'fs'
import path from 'path'
import readdir from 'recursive-readdir'
import xml2js from 'xml2js'
import copy from 'copy'

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
const OUT = path.join(__dirname, '..', 'data')
const ASSETS = path.join(__dirname, '..', 'public', 'game')

const TEXTS = path.join(BASE, '..', 'Core', 'Languages', 'English')
const FACTIONS = path.join(BASE, 'Factions')
const UNITS = path.join(BASE, 'Units')
const BUILDINGS = path.join(BASE, 'Buildings')
const UPGRADES = path.join(BASE, 'Upgrades')
const WEAPONS = path.join(BASE, 'Weapons')
const TRAITS = path.join(BASE, 'Traits')

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

async function updateFile(path: string, update: any) {
  const existing = JSON.parse(await fs.readFile(path, 'utf-8'))
  await fs.writeFile(path, JSON.stringify(cleanObject({ ...existing, ...update }), undefined, 2), 'utf-8')
}

function traverse(obj, fn) {
  const clone = JSON.parse(JSON.stringify(obj))
  traverseItem(clone, fn)
  return clone
}

function traverseItem(obj, fn) {
  if (Array.isArray(obj)) {
    obj.forEach((i) => traverseItem(i, fn))
  } else if (typeof obj === 'object') {
    traverseObject(obj, fn)
  }
}

function traverseObject(obj, fn) {
  Object.entries(obj).forEach(([k, i]) => {
    if (typeof i === 'object') {
      fn(k, i, obj)
      traverseItem(i, fn)
    } else {
      fn(k, i, obj)
    }
  })
}

function cleanObject(obj) {
  return traverse(obj, (k, i, parent) => {
    if (k === '$') {
      delete parent.$
      Object.assign(parent, i)
    } else if (k === 'model') {
      delete parent.model
    }
  })
}

const textsCache: any = {}
async function resolveText(name: string, key: string) {
  if (!textsCache[name]) {
    console.info('reading', name)
    textsCache[name] = getText(name)
  }
  const texts = await textsCache[name]
  const prelim = texts.find(({ name }) => name === key)?.value
  if (!prelim || !prelim.startsWith("<string name='")) return prelim
  const cleaned = prelim.replace("<string name='", '').replace("'/>", '').split('/')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return resolveText(cleaned[0], cleaned.slice(1).join('/'))
}

async function getText(name: string) {
  try {
    return cleanObject(
      (
        await xml2js.parseStringPromise(
          (await fs.readFile(path.join(TEXTS, `${name}.xml`), 'utf-8')).replace(/&/g, '&#38;')
        )
      ).language.entry
    )
  } catch (e) {
    console.error(`Error reading: ${name}`, e)
    return []
  }
}

async function getTexts(name: string) {
  if (!textsCache[name]) {
    textsCache[name] = getText(name)
  }
  const texts = await textsCache[name]
  return {
    texts,
    async getTexts(key: string) {
      const data = {
        readableName: await resolveText(name, `${key}`),
        description: await resolveText(name, `${key}Description`),
        flavour: await resolveText(name, `${key}Flavor`),
      }
      return data
    },
  }
}

async function copyPromise(path: string, dest: string, opts: any) {
  return new Promise((resolve, reject) => {
    copy(path, dest, opts, (err) => {
      if (err) {
        reject(err)
        return
      }
      resolve(null)
    })
  })
}

const INCLUDE_ASSETs = true

// eslint-disable-next-line @typescript-eslint/no-extra-semi
;(async () => {
  console.info('[start]')
  await fs.mkdir(path.join(OUT, 'army'))
  if (INCLUDE_ASSETs) {
    console.info('[icons:start]')
    await copyPromise('**/*.dds', ASSETS, { cwd: path.join(BASE, '..', 'Video', 'Textures', 'Icons') })
    console.info('[icons:end]')
  } else {
    console.info('[icons:skip]')
  }
  const factions = await getDirFiles(FACTIONS)
  const { getTexts: getFactionTexts } = await getTexts('Factions')
  for (const f of factions) {
    try {
      if (f.data.faction.$.auxiliary === '1' || f.data.faction.$.visible === '0') continue
      const toWrite = cleanObject({
        ...f.data.faction.$,
        quests: f.data.faction.quests,
        startingUnits: f.data.faction.startingUnits,
        actions: f.data.faction.actions,
        ...(await getFactionTexts(f.pathParts[0])),
      })
      await fs.writeFile(
        path.join(OUT, 'army', `${f.pathParts[0]}.json`),
        JSON.stringify(toWrite, undefined, 2),
        'utf-8'
      )
    } catch (e) {
      console.info('e', e.message.split('\n')[0])
    }
  }
  console.info('[weapons:start]')
  const { getTexts: getWeaponTexts } = await getTexts('Weapons')
  const weapons = await Promise.all(
    (
      await getDirFiles(WEAPONS)
    ).map(async (w) => {
      return {
        name: w.pathParts[0],
        ...(await getWeaponTexts(w.pathParts[0])),
        ...w.data.weapon,
      }
    })
  )
  await fs.writeFile(path.join(OUT, `weapons.json`), JSON.stringify(cleanObject(weapons), undefined, 2), 'utf-8')
  console.info('[weapons:end]')
  console.info('[traits:start]')
  const { getTexts: getTraitTexts } = await getTexts('Traits')
  const traits = await Promise.all(
    (
      await getDirFiles(TRAITS)
    ).map(async (t) => {
      return {
        army: t.pathParts[0],
        name: t.pathParts[0],
        type: [t.pathParts[0], t.pathParts[1]].filter(Boolean).join('/'),
        ...(await getTraitTexts(t.pathParts[0])),
        ...t.data.trait,
      }
    })
  )
  await fs.writeFile(path.join(OUT, `traits.json`), JSON.stringify(cleanObject(traits), undefined, 2), 'utf-8')
  console.info('[traits:end]')
  console.info('[units:start]')
  const units = await getDirFiles(UNITS)
  const { getTexts: getUnitTexts } = await getTexts('Units')
  const unitsByArmy = {}
  for (const u of units) {
    unitsByArmy[u.pathParts[0]] = (unitsByArmy[u.pathParts[0]] || []).concat(
      Object.assign(u.data.unit, {
        army: u.pathParts[0],
        name: u.pathParts[1],
        type: `${u.pathParts[0]}/${u.pathParts[1]}`,
        weapons: (u.data.unit.weapons || []).flatMap((ws) =>
          (ws.weapon || []).map((w) => {
            return Object.assign(
              w.$,
              weapons.find(({ name }) => w.$.name === name)
            )
          })
        ),
        ...(await getUnitTexts(`${u.pathParts[0]}/${u.pathParts[1]}`)),
      })
    )
  }
  for (const [army, units] of Object.entries(unitsByArmy)) {
    await updateFile(path.join(OUT, 'army', `${army}.json`), { units })
  }
  console.info('[units:end]')
  console.info('[buildings:start]')
  const buildings = await getDirFiles(BUILDINGS)
  const { getTexts: getBuildingTexts } = await getTexts('Buildings')
  const buildingsByArmy = {}
  for (const u of buildings) {
    buildingsByArmy[u.pathParts[0]] = (buildingsByArmy[u.pathParts[0]] || []).concat(
      Object.assign(u.data.building, {
        army: u.pathParts[0],
        name: u.pathParts[1],
        type: `${u.pathParts[0]}/${u.pathParts[1]}`,
        ...(await getBuildingTexts(`${u.pathParts[0]}/${u.pathParts[1]}`)),
      })
    )
  }
  for (const [army, buildings] of Object.entries(buildingsByArmy)) {
    await updateFile(path.join(OUT, 'army', `${army}.json`), { buildings })
  }
  console.info('[buildings:end]')
  console.info('[upgrades:start]')
  const upgrades = await getDirFiles(UPGRADES)
  const { getTexts: getUpgradeTexts } = await getTexts('Upgrades')
  const upgradesByArmy = {}
  for (const u of upgrades.filter((u) => u.pathParts[0] !== 'Missing')) {
    upgradesByArmy[u.pathParts[0]] = (upgradesByArmy[u.pathParts[0]] || []).concat(
      Object.assign(u.data.upgrade, {
        army: u.pathParts[0],
        name: u.pathParts[1],
        type: `${u.pathParts[0]}/${u.pathParts[1]}`,
        ...(await getUpgradeTexts(`${u.pathParts[0]}/${u.pathParts[1]}`)),
      })
    )
  }
  for (const [army, upgrades] of Object.entries(upgradesByArmy)) {
    await updateFile(path.join(OUT, 'army', `${army}.json`), { upgrades })
  }
  console.info('[upgrades:end]')
  console.info('[end]')
})()

export {}
