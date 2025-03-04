import { defineConfig, UserConfig } from "vite";
import { vitePlugin as remix, VitePluginConfig } from "@remix-run/dev";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { remixPWA } from "@remix-pwa/dev";
import config from "./server/core/util/config";

declare module "@remix-run/node" {
	interface Future {
		v3_singleFetch: true;
	}
}

const remixConfig: VitePluginConfig = {
	future: {
		v3_fetcherPersist: true,
		v3_lazyRouteDiscovery: true,
		v3_relativeSplatPath: true,
		v3_singleFetch: true,
		v3_throwAbortReason: true
	}
};

const userConfig: UserConfig = {
	plugins: [remix(remixConfig), tsconfigPaths(), tailwindcss()]
};

if (config.enablePWA) {
	userConfig.plugins?.push(remixPWA());
}

export default defineConfig(userConfig);
