import { defineConfig } from "vite";
import { vitePlugin as remix } from "@remix-run/dev";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
	plugins: [
		remix({
			buildDirectory: "build/remix"
		}),
		tsconfigPaths(),
		tailwindcss()
	]
});
