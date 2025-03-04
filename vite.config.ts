import { defineConfig } from "vite";
import { vitePlugin as remix } from "@remix-run/dev";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { remixPWA } from "@remix-pwa/dev";

declare module "@remix-run/node" {
	interface Future {
		v3_singleFetch: true;
	}
}

export default defineConfig({
	plugins: [
		remix({
			buildDirectory: "build/remix",
			future: {
				v3_fetcherPersist: true,
				v3_lazyRouteDiscovery: true,
				v3_relativeSplatPath: true,
				v3_singleFetch: true,
				v3_throwAbortReason: true
			}
		}),
		tsconfigPaths(),
		tailwindcss(),
		remixPWA({
			workerBuildDirectory: "build/remix/client"
		})
	]
});
