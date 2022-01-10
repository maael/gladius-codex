import Image from 'next/image'
import cls from 'classnames'
import { getFactionInfo, getFactionNames } from '../fns/static'

function Unit({ info: u, faction: f }: any) {
  return (
    <div className="px-2 py-3 rounded-md bg-stone-600">
      <a className="flex flex-row items-center gap-2" id={`Units/${u.type}`} href={`#Units/${u.type}`}>
        <Image src={`/game/Units/${u.type}.png`} height={40} width={40} />
        {u.readableName}
        {/* <pre>{JSON.stringify(u.weapons, undefined, 2)}</pre> */}
      </a>
      <div className="text-sm">{u.description}</div>
      <div className="flex flex-row gap-4">
        {(u.weapons || []).map((ws) =>
          (ws.weapon || [])
            .filter((w) => w.name !== 'None')
            .map((w, i) => {
              const upgrade = w.requiredUpgrade ? f.upgrades.find((u) => u.type === w.requiredUpgrade) : null
              return (
                <div
                  key={`${w.name}${i}`}
                  className={cls('flex flex-row justify-center gap-1', { 'requires-upgrade': upgrade })}
                  title={w.name}
                >
                  <Image src={`/game/Weapons/${w.name}.png`} height={20} width={20} />
                  {w.count ? `x${w.count}` : null}
                  {upgrade ? (
                    <a
                      className="flex flex-row items-center justify-center px-1.5 border border-white border-solid rounded-md gap-1 text-sm"
                      href={`#Upgrades/${upgrade.type}`}
                    >
                      <Image src={`/game/Weapons/${w.name}.png`} width={16} height={16} />
                      {numeralMap[upgrade.position]}
                    </a>
                  ) : null}
                </div>
              )
            })
        )}
      </div>
    </div>
  )
}

const numeralMap = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
  5: 'V',
  6: 'VI',
  7: 'VII',
  8: 'VIII',
  9: 'IX',
  10: 'X',
}

function Building({ info: u, faction: f }: any) {
  console.info('b', u)
  return (
    <div className="bg-stone-600">
      <a className="flex flex-row items-center gap-2" id={`Buildings/${u.type}`} href={`#Buildings/${u.type}`}>
        <Image src={`/game/Buildings/${u.type}.png`} height={40} width={40} />
        {u.readableName}
      </a>
      {Object.entries((u.actions || [{}])[0]).map(([n, v]: any) => (
        <div key={n} className="ml-5">
          <div>{n}</div>
          <div
            className={cls({ 'grid grid-cols-3': n === 'constructBuilding', 'grid grid-cols-2': n === 'produceUnit' })}
          >
            {v.map((item, i) => {
              if (item.visible === '0' || item.enabled === '0') return null
              if (item.building) {
                const building = f.buildings.find((u) => u.type === item.building)
                return (
                  <div key={i} className="flex flex-row items-center gap-1 ml-5">
                    <Image src={`/game/Buildings/${building.type}.png`} width={20} height={20} />
                    {building.readableName}
                  </div>
                )
              } else if (item.unit) {
                const unit = f.units.find((u) => u.type === item.unit)
                const upgrade = item.requiredUpgrade ? f.upgrades.find((u) => u.type === item.requiredUpgrade) : null
                return unit ? (
                  <div
                    key={i}
                    className={cls('flex flex-row items-center gap-1 ml-5', { 'requires-upgrade': upgrade })}
                  >
                    <a href={`#Units/${unit.type}`}>
                      <Image src={`/game/Units/${unit.type}.png`} width={20} height={20} /> {unit.readableName}{' '}
                    </a>
                    {upgrade ? (
                      <a
                        className="flex flex-row items-center justify-center px-1.5 border border-white border-solid rounded-md gap-1 text-sm"
                        href={`#Upgrades/${upgrade.type}`}
                      >
                        <Image src={`/game/Units/${unit.type}.png`} width={16} height={16} />
                        {numeralMap[upgrade.position]}
                      </a>
                    ) : null}
                  </div>
                ) : (
                  item.unit
                )
              }
              return (
                <div key={i} className="ml-5">
                  {JSON.stringify(item)}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function UpgradeTier({ info: p, army, tier }: any) {
  return (
    <>
      <p>{numeralMap[tier]}</p>
      <div className="grid grid-cols-2 gap-2 bg-stone-700">
        {p.map((u) => (
          <a
            key={u.type}
            className="bg-stone-600"
            id={u.type ? `Upgrades/${u.type}` : undefined}
            href={u.type ? `#Upgrades/${u.type}` : undefined}
          >
            <div className="flex flex-row items-center gap-2">
              <Image src={`/game/${u.icon || `Upgrades/${army}/${u.name}`}.png`} height={40} width={40} />
              {u.readableName}
            </div>
            <p className="text-xs">{u.flavour}</p>
          </a>
        ))}
      </div>
    </>
  )
}

export default function Index(props) {
  const f = props.faction
  return (
    <>
      <div>
        <div>
          <Image src={`/game/Factions/${f.name}.png`} height={100} width={100} />
          <div>{f.readableName}</div>
          <p
            style={{ fontSize: '0.8rem' }}
            dangerouslySetInnerHTML={{
              __html: `${(f.flavour || '')
                .replace(/<br\/>/g, '<br>')
                .replace("<style name='Italic'/>", '<i>')
                .replace("<style name='Default'/>", '</i><p style="margin-top:-1rem;">')
                .trim()}</p>`,
            }}
          />
          <h4 className="mt-5 mb-1">Units</h4>
          <div className="grid grid-cols-3 gap-2 mx-2">
            {(f.units || [])
              .filter((u) => u.name !== 'Headquarters')
              .map((u) => (
                <Unit key={u.type} info={u} faction={f} />
              ))}
          </div>
          <h4 className="mt-5 mb-1">Buildings</h4>
          <div className="grid grid-cols-2 gap-2">
            {(f.buildings || []).map((u) => (
              <Building key={u.type} info={u} faction={f} />
            ))}
          </div>
          <h4 className="mt-5 mb-1">Upgrades</h4>
          <div className="flex flex-col gap-10">
            {(f.upgrades || [])
              .reduce((acc, i) => {
                acc[Number(i.position)] = (acc[Number(i.position)] || []).concat(i)
                return acc
              }, [])
              .map((p, i) => (
                <UpgradeTier key={i} tier={i} info={p} army={props.army} />
              ))}
          </div>
        </div>
      </div>
    </>
  )
}

export async function getStaticPaths() {
  return { paths: (await getFactionNames()).map((n) => ({ params: { army: n } })), fallback: false }
}

export async function getStaticProps({ params }) {
  return {
    props: { faction: (await getFactionInfo({ name: params.army }))[0], army: params.army },
  }
}
