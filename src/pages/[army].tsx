import { getFactionInfo, getFactionNames } from '../fns/static'
import Image from 'next/image'

export default function Index(props) {
  const f = props.faction
  console.info('f', f.flavour)
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
          <div>
            {(f.units || [])
              .filter((u) => u.name !== 'Headquarters')
              .map((u) => (
                <div key={u.type} className="flex flex-row items-center gap-2">
                  <Image src={`/game/Units/${u.type}.png`} height={40} width={40} />
                  {u.readableName}
                </div>
              ))}
          </div>
          <h4 className="mt-5 mb-1">Buildings</h4>
          <div>
            {(f.buildings || []).map((u) => (
              <div key={u.type} className="flex flex-row items-center gap-2">
                <Image src={`/game/Buildings/${u.type}.png`} height={40} width={40} />
                {u.readableName}
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
                <div key={i}>
                  {p.map((u) => (
                    <div key={u.type} className="flex flex-row items-center gap-2">
                      <Image src={`/game/${u.icon || `Upgrades/${props.army}/${u.name}`}.png`} height={40} width={40} />
                      {u.readableName}
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
