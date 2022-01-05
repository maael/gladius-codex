import '~/styles/main.css'
import Head from 'next/head'
import Link from 'next/link'
import { AppProps } from 'next/app'
import { DefaultSeo } from 'next-seo'
import useFathom from '~/components/hooks/useFathom'
import SEO from '~/../next-seo.config'
import EmojiFavicon from '~/components/primitives/EmojiFavicon'

function App({ Component, pageProps }: AppProps) {
  useFathom()
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#fd015d" />
      </Head>
      <DefaultSeo {...SEO} />
      <div className="min-h-full bg-stone-800 text-white">
        <Link href="/">
          <a className="text-green-400 font-bold">Gladius Codex</a>
        </Link>
        <Component {...pageProps} />
      </div>
      <EmojiFavicon emoji="💀" />
    </>
  )
}

export default App
