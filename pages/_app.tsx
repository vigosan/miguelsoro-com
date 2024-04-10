import type { AppProps } from "next/app";
import { GeistSans } from "geist/font/sans";

import "./globals.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className={GeistSans.className}>
      <Component {...pageProps} />
    </div>
  );
}
