import { Links, Meta, Outlet, Scripts, useLoaderData } from "@remix-run/react";
import globalStylesheet from "~/public/global.css?url";
import { SocketProvider } from "~/providers/socket-provider";
import config from "@root/server/core/util/config";

export function meta() {
	return [{ title: "Node FullStack Template" }];
}

export function links() {
	return [
		{ rel: "stylesheet", href: globalStylesheet },
		{ rel: "icon", href: "data:image/x-icon;base64,AA" }
	];
}

export function loader() {
	return {
		websocketConfig: config.services.core.websocket
	};
}

export default function Root() {
	const { websocketConfig } = useLoaderData<typeof loader>();
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<Meta />
				<Links />
			</head>
			<body>
				<SocketProvider config={websocketConfig}>
					<Outlet />
				</SocketProvider>
				<Scripts />
			</body>
		</html>
	);
}
