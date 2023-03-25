import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Script from 'next/script';

export default function App ({ Component, pageProps }: AppProps) {
  return (
    <>
      <Script src="https://unpkg.com/node-forge@1.0.0/dist/forge.min.js" />
      <Component {...pageProps} />
    </>
  )
}
