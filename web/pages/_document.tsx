import { Html, Head, Main, NextScript } from 'next/document'
import { ENV_CONFIG } from '../../common/envs/constants'

export default function Document() {
  return (
    <Html data-theme="mantic" className="min-h-screen">
      <Head>
        <link rel="icon" href={ENV_CONFIG.faviconPath} />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Major+Mono+Display&family=Readex+Pro:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <body className="font-readex-pro bg-base-200 min-h-screen">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
