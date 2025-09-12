import type { AppProps } from "next/app";
import { GeistSans } from "geist/font/sans";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import "./globals.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 30, // 30 minutes
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <div className={GeistSans.className}>
        <Component {...pageProps} />
      </div>
    </QueryClientProvider>
  );
}
