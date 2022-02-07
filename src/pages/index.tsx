import { getFactionInfo } from '../fns/static'
import Image from 'next/image'
import Link from 'next/link'
import { Grid, Button, Text } from '@nextui-org/react'
import { colorMap } from '~/util'

export default function Index(props) {
  return (
    <Grid.Container gap={4} css={{ margin: '0 auto' }} justify="center">
      {props.factions.map((f) => (
        <Grid xs={12} sm={6} lg={2} key={f.name} css={{ textAlign: 'center' }} justify="center">
          <Link href={`/${f.name}`}>
            <a>
              <Image src={`/game/Factions/${f.name}.png`} height={100} width={100} />
              <Button
                css={{ backgroundColor: `$${colorMap[f.name]}` }}
                iconRight={<Text css={{ color: f.name === 'Tau' ? '$black' : '$white' }}>→</Text>}
              >
                <Text css={{ color: f.name === 'Tau' ? '$black' : '$white' }}>{f.readableName}</Text>
              </Button>
            </a>
          </Link>
        </Grid>
      ))}
    </Grid.Container>
  )
}

export async function getStaticProps() {
  return {
    props: { factions: await getFactionInfo({ limited: true }) },
  }
}
