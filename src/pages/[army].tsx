import { getFactionInfo, getFactionNames } from '../fns/static'
import Image from 'next/image'

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
          <div className="flex flex-col gap-2">
            {(f.units || [])
              .filter((u) => u.name !== 'Headquarters')
              .map((u) => (
                <div key={u.type}>
                  <div className="flex flex-row items-center gap-2">
                    <Image src={`/game/Units/${u.type}.png`} height={40} width={40} />
                    {u.readableName}
                    {/* <pre>{JSON.stringify(u.weapons, undefined, 2)}</pre> */}
                  </div>
                  <div className="flex flex-col">
                    {(u.weapons || []).map((ws) =>
                      (ws.weapon || [])
                        .filter((w) => w.name !== 'None')
                        .map((w) => {
                          const upgrade = w.requiredUpgrade
                            ? f.upgrades.find((u) => u.type === w.requiredUpgrade)
                            : null
                          return (
                            <div key={w.name} className="ml-5">
                              {w.name} {w.count ? `x${w.count}` : null}
                              {upgrade ? `(${upgrade.name})` : null}
                            </div>
                          )
                        })
                    )}
                  </div>
                </div>
              ))}
          </div>
          <h4 className="mt-5 mb-1">Buildings</h4>
          <div className="flex flex-col gap-2">
            {(f.buildings || []).map((u) => (
              <div key={u.type}>
                <div className="flex flex-row items-center gap-2">
                  <Image src={`/game/Buildings/${u.type}.png`} height={40} width={40} />
                  {u.readableName}
                </div>
                {Object.entries((u.actions || [{}])[0]).map(([n, v]: any) => (
                  <div key={n} className="ml-5">
                    <div>{n}</div>
                    <div>
                      {v.map((item, i) => {
                        if (item.building) {
                          const building = f.buildings.find((u) => u.type === item.building)
                          return (
                            <div key={i} className="ml-5 flex flex-row items-center gap-1">
                              <Image src={`/game/Buildings/${building.type}.png`} width={20} height={20} />
                              {building.readableName}
                            </div>
                          )
                        } else if (item.unit) {
                          const unit = f.units.find((u) => u.type === item.unit)
                          const upgrade = item.requiredUpgrade
                            ? f.upgrades.find((u) => u.type === item.requiredUpgrade)
                            : null
                          return unit ? (
                            <div key={i} className="ml-5 flex flex-row items-center gap-1">
                              <Image src={`/game/Units/${unit.type}.png`} width={20} height={20} /> {unit.readableName}{' '}
                              {upgrade ? (
                                <>
                                  (<Image src={`/game/Units/${unit.type}.png`} width={20} height={20} />
                                  {upgrade.readableName} ({upgrade.position}))
                                </>
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
                <div key={i} className="flex flex-col gap-2">
                  {p.map((u) => (
                    <div key={u.type}>
                      <div className="flex flex-row items-center gap-2">
                        <Image
                          src={`/game/${u.icon || `Upgrades/${props.army}/${u.name}`}.png`}
                          height={40}
                          width={40}
                        />
                        {u.readableName}
                      </div>
                      <p className="text-xs">{u.flavour}</p>
                    </div>
                  ))}
                </div>
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
