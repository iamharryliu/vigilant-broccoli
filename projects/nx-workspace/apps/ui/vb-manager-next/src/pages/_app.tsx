import { AppProps } from 'next/app';
import Head from 'next/head';
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';

function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <Theme>
      <Head>
        <title>Welcome to vb-manager-next!</title>
      </Head>
      <main className="app">
        <Component {...pageProps} />
      </main>
    </Theme>
  );
}

export default CustomApp;
