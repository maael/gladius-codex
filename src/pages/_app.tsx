import '~/styles/main.css'
import * as React from 'react'
import Head from 'next/head'
import NextLink from 'next/link'
import { AppProps } from 'next/app'
import { NextUIProvider, Link, Text, Container, createTheme } from '@nextui-org/react'
import { DefaultSeo } from 'next-seo'
import useFathom from '~/components/hooks/useFathom'
import SEO from '~/../next-seo.config'
import EmojiFavicon from '~/components/primitives/EmojiFavicon'

const theme = createTheme({ type: 'dark' })

function App({ Component, pageProps }: AppProps) {
  useFathom()
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#fd015d" />
      </Head>
      <DefaultSeo {...SEO} />
      <NextUIProvider theme={theme}>
        <Container>
          <NextLink href="/">
            <Link>
              <Text h1 b>
                💀 Gladius Codex
              </Text>
            </Link>
          </NextLink>
          <Component {...pageProps} />
        </Container>
      </NextUIProvider>
      <EmojiFavicon emoji="💀" />
    </>
  )
}

export default App
