import { getFactionInfo } from '../fns/static'
import Image from 'next/image'
import Link from 'next/link'

export default function Index(props) {
  console.info(props)
  return (
    <>
      <div className="grid grid-cols-4 gap-10">
        {props.factions.map((f) => (
          <Link key={f.name} href={`/${f.name}`}>
            <a className="flex flex-col justify-center items-center gap-2">
              <Image src={`/game/Factions/${f.name}.png`} height={100} width={100} />
              <div>{f.readableName}</div>
            </a>
          </Link>
        ))}
      </div>
    </>
  )
}

export async function getStaticProps() {
  return {
    props: { factions: await getFactionInfo({ limited: true }) },
  }
}
