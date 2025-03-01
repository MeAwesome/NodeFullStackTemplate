import { Links, Meta, Outlet, Scripts, useLoaderData } from "@remix-run/react";
import globalStylesheet from "~/public/global.css?url";
import { SocketProvider } from "./providers/SocketProvider";
import configJSON from "@root/config.json";

export function meta() {
	return [
		{ title: "Node FullStack Template" },
		{ charSet: "utf-8" },
		{ name: "viewport", content: "width=device-width, initial-scale=1" }
	];
}

export function links() {
	return [
		{ rel: "stylesheet", href: globalStylesheet },
		{ rel: "icon", href: "data:image/x-icon;base64,AA" }
	];
}

export function loader() {
	return {
		websocketConfig: configJSON.services.core.websocket
	}
}

export default function Root() {
	const { websocketConfig } = useLoaderData<typeof loader>();
	return (
		<html lang="en">
			<head>
				<Meta />
				<Links />
			</head>
			<body>
				<SocketProvider enabled={websocketConfig.enabled}>
					<Outlet />
				</SocketProvider>
				<Scripts />
			</body>
		</html>
	);
}
