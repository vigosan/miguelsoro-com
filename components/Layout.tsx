import { Analytics } from "@vercel/analytics/react";
import Head from "next/head";
import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";

type Props = {
	children?: ReactNode;
	title?: string;
	description?: string;
	image?: string;
	url?: string;
};

export function Layout({ 
	children, 
	title = "Miguel Soro",
	description = "Cycling-inspired artwork by Miguel Soro. Explore contemporary art that captures the beauty and energy of cycling culture.",
	image = "/biography.webp",
	url = "https://www.miguelsoro.com"
}: Props) {
	return (
		<div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 py-12 px-6 antialiased lg:gap-12 lg:py-16 lg:px-24">
			<Head>
				<title>{title}</title>
				<meta charSet="utf-8" />
				<meta name="viewport" content="initial-scale=1.0, width=device-width" />
				<meta name="description" content={description} />
				
				{/* Open Graph / Facebook */}
				<meta property="og:type" content="website" />
				<meta property="og:url" content={url} />
				<meta property="og:title" content={title} />
				<meta property="og:description" content={description} />
				<meta property="og:image" content={`${url}${image}`} />
				<meta property="og:image:width" content="1200" />
				<meta property="og:image:height" content="630" />
				<meta property="og:site_name" content="Miguel Soro" />
				<meta property="og:locale" content="en_US" />
				
				{/* Twitter */}
				<meta property="twitter:card" content="summary_large_image" />
				<meta property="twitter:url" content={url} />
				<meta property="twitter:title" content={title} />
				<meta property="twitter:description" content={description} />
				<meta property="twitter:image" content={`${url}${image}`} />
				
				{/* Additional SEO */}
				<meta name="author" content="Miguel Soro" />
				<meta name="keywords" content="Miguel Soro, cycling art, contemporary art, bicycle art, sports art, cycling culture" />
				<link rel="canonical" content={url} />
			</Head>
			<Header />
			<div className="flex-1">{children}</div>
			<Footer className="text-right" />
			<Analytics />
		</div>
	);
}
