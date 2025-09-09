import { RootProvider } from "fumadocs-ui/provider";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import "@/app/global.css";

export default function Layout({ children }: LayoutProps<"/">) {
	return (
		<html
			lang="en"
			className={`${GeistSans.variable} ${GeistMono.variable}`}
			suppressHydrationWarning
		>
			<body className="flex flex-col min-h-screen">
				<RootProvider>{children}</RootProvider>
			</body>
		</html>
	);
}
