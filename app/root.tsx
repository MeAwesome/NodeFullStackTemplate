import { Links, Meta, Outlet, Scripts } from "@remix-run/react";
import globalStylesheet from "~/public/global.css?url";

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

export default function Root() {
	return (
		<html lang="en">
			<head>
				<Meta />
				<Links />
			</head>
			<body>
				<Outlet />
				<Scripts />
			</body>
		</html>
	);
}
