import { ReactNode } from "react";
import Head from "next/head";
import { Footer } from "./Footer";
import { Header } from "./Header";

type Props = {
  children?: ReactNode;
  title?: string;
};

const Layout = ({ children, title = "Miguel Soro" }: Props) => (
  <div className="mx-auto min-h-screen flex flex-col max-w-5xl px-6 py-12 antialiased lg:px-24 lg:py-16 gap-6 lg:gap-12">
    <Head>
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    <Header />
    <div className="flex-1">{children}</div>
    <Footer className="text-right" />
  </div>
);

export default Layout;
