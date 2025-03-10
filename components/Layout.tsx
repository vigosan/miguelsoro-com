import { Analytics } from "@vercel/analytics/react";
import Head from "next/head";
import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";

type Props = {
	children?: ReactNode;
	title?: string;
};

export function Layout({ children, title = "Miguel Soro" }: Props) {
	return (
		<div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 py-12 px-6 antialiased lg:gap-12 lg:py-16 lg:px-24">
			<Head>
				<title>{title}</title>
				<meta charSet="utf-8" />
				<meta name="viewport" content="initial-scale=1.0, width=device-width" />
			</Head>
			<Header />
			<div className="flex-1">{children}</div>
			<Footer className="text-right" />
			<Analytics />
		</div>
	);
}
