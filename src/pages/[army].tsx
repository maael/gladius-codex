import * as React from 'react'
import { Collapse, Text, Grid, Card, Avatar, useTheme, Button } from '@nextui-org/react'
import { getFactionInfo, getFactionNames } from '~/fns/static'
import { colorMap } from '~/util'

interface CardArmyTheme {
  color: string
  colorToken: string
}

function UnitCard(u: { type: string; readableName: string; description: string } & CardArmyTheme) {
  return (
    <Card bordered title={u.readableName} css={{ borderColor: u.colorToken }}>
      <Card.Header css={{ gap: 5 }}>
        <Avatar
          src={`/game/Units/${u.type}.png`}
          bordered
          color="secondary"
          css={{ '--nextui-colors-secondary': u.color }}
        />{' '}
        <Text b>{u.readableName}</Text>
      </Card.Header>
      <Card.Body>
        <Text small>{u.description}</Text>
      </Card.Body>
      <Card.Footer></Card.Footer>
    </Card>
  )
}
function BuildingCard(u: { type: string; readableName: string; description: string } & CardArmyTheme) {
  return (
    <Card bordered title={u.readableName} css={{ borderColor: u.colorToken }}>
      <Card.Header css={{ gap: 5 }}>
        <Avatar
          src={`/game/Buildings/${u.type}.png`}
          bordered
          color="secondary"
          css={{ '--nextui-colors-secondary': u.color }}
        />{' '}
        <Text b>{u.readableName}</Text>
      </Card.Header>
      <Card.Body>
        <Text small>{u.description}</Text>
      </Card.Body>
      <Card.Footer></Card.Footer>
    </Card>
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
function UpgradeCard(u: { type: string; readableName: string; description: string; icon: string } & CardArmyTheme) {
  return (
    <Card bordered title={u.readableName} css={{ borderColor: u.colorToken }}>
      <Card.Header css={{ gap: 5 }}>
        <Avatar src={`/game/${u.icon}.png`} bordered color="secondary" css={{ '--nextui-colors-secondary': u.color }} />{' '}
        <Text b>{u.readableName}</Text>
      </Card.Header>
      <Card.Body>
        <Text small>{u.description}</Text>
      </Card.Body>
      <Card.Footer></Card.Footer>
    </Card>
  )
}

export default function Index({ faction, army }: any) {
  const units = faction.units.filter((u) => u.name !== 'Headquarters')
  const buildings = faction.buildings || []
  const upgrades = faction.upgrades || []
  const upgradeTiers = upgrades.reduce((acc, i) => {
    acc[Number(i.position)] = (acc[Number(i.position)] || []).concat(i)
    return acc
  }, [])
  const { theme } = useTheme()
  const colorToken = colorMap[army]
  const color = (theme as any).colors[colorToken]?.value
  return (
    <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', paddingBottom: '2vh' }}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar
          size={'xl'}
          bordered
          src={`/game/Factions/${faction.name}.png`}
          color="secondary"
          css={{ '--nextui-colors-secondary': color }}
        />
        <Text h2>{faction.readableName}</Text>
      </div>
      <Button.Group ghost color="secondary" css={{ '--nextui-colors-secondary': color, margin: '0 auto' }} size="xl">
        <Button>Units</Button>
        <Button>Buildings</Button>
        <Button>Research</Button>
      </Button.Group>
      <Collapse
        title={
          <Text h4>
            Units <Text small>({units.length})</Text>
          </Text>
        }
        bordered
        color="secondary"
        css={{ '--nextui-colors-border': color }}
      >
        <Grid.Container gap={1} justify="center">
          {units.map((u) => (
            <Grid xs={12} md={3} key={u.name}>
              <UnitCard {...u} color={color} colorToken={`$${colorToken}`} />
            </Grid>
          ))}
        </Grid.Container>
      </Collapse>
      <Collapse
        title={
          <Text h4>
            Buildings <Text small>({buildings.length})</Text>
          </Text>
        }
        bordered
        color="secondary"
        css={{ '--nextui-colors-border': color }}
      >
        <Grid.Container gap={1} justify="center">
          {buildings.map((b) => (
            <Grid xs={12} md={3} key={b.name}>
              <BuildingCard {...b} color={color} colorToken={`$${colorToken}`} />
            </Grid>
          ))}
        </Grid.Container>
      </Collapse>
      <Collapse
        title={
          <Text h4>
            Research <Text small>({upgrades.length})</Text>
          </Text>
        }
        bordered
        color="secondary"
        css={{ '--nextui-colors-border': color }}
      >
        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
          {upgradeTiers.map((t, i) => (
            <Collapse
              title={<Text h4>{numeralMap[i]}</Text>}
              bordered
              key={i}
              color="secondary"
              css={{ '--nextui-colors-border': color }}
            >
              <Grid.Container gap={1} justify="center">
                {t.map((u) => (
                  <Grid xs={12} lg={3} key={u.name}>
                    <UpgradeCard {...u} color={color} colorToken={`$${colorToken}`} />
                  </Grid>
                ))}
              </Grid.Container>
            </Collapse>
          ))}
        </div>
      </Collapse>
    </div>
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
