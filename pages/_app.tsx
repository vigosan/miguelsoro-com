import type { AppProps } from "next/app";
import type { NextPage } from "next";
import type { ReactElement, ReactNode } from "react";
import { GeistSans } from "geist/font/sans";
import { Archivo_Black, Anton } from "next/font/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { CartProvider } from "../contexts/CartContext";
import { SmoothScroll } from "@/components/SmoothScroll";

import "./globals.css";

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-poster",
});

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 30, // 30 minutes
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <SmoothScroll />
        <div
          className={`${GeistSans.className} ${archivoBlack.variable} ${anton.variable}`}
        >
          {(Component.getLayout ?? ((page: ReactElement) => page))(
            <Component {...pageProps} />,
          )}
        </div>
      </CartProvider>
    </QueryClientProvider>
  );
}
