import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

/** @type {import('eslint').Linter.Config[]} */
export default [
	{ files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
	{ ignores: ["node_modules", "dist", "build", "public/entry.worker.js"] },
	{ languageOptions: { globals: { ...globals.browser, ...globals.node } } },
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	pluginReact.configs.flat.recommended,
	{
		settings: {
			react: {
				version: "detect"
			}
		},
		rules: {
			"react/react-in-jsx-scope": "off",
			"no-restricted-imports": [
				"error",
				{
					paths: [
						{ name: "assert", message: "Please use 'node:assert' instead." },
						{ name: "async_hooks", message: "Please use 'node:async_hooks' instead." },
						{ name: "buffer", message: "Please use 'node:buffer' instead." },
						{ name: "child_process", message: "Please use 'node:child_process' instead." },
						{ name: "cluster", message: "Please use 'node:cluster' instead." },
						{ name: "console", message: "Please use 'node:console' instead." },
						{ name: "constants", message: "Please use 'node:constants' instead." },
						{ name: "crypto", message: "Please use 'node:crypto' instead." },
						{ name: "dgram", message: "Please use 'node:dgram' instead." },
						{ name: "dns", message: "Please use 'node:dns' instead." },
						{ name: "domain", message: "Please use 'node:domain' instead." },
						{ name: "events", message: "Please use 'node:events' instead." },
						{ name: "fs", message: "Please use 'node:fs' instead." },
						{ name: "http", message: "Please use 'node:http' instead." },
						{ name: "http2", message: "Please use 'node:http2' instead." },
						{ name: "https", message: "Please use 'node:https' instead." },
						{ name: "inspector", message: "Please use 'node:inspector' instead." },
						{ name: "module", message: "Please use 'node:module' instead." },
						{ name: "net", message: "Please use 'node:net' instead." },
						{ name: "os", message: "Please use 'node:os' instead." },
						{ name: "path", message: "Please use 'node:path' instead." },
						{ name: "perf_hooks", message: "Please use 'node:perf_hooks' instead." },
						{ name: "process", message: "Please use 'node:process' instead." },
						{ name: "punycode", message: "Please use 'node:punycode' instead." },
						{ name: "querystring", message: "Please use 'node:querystring' instead." },
						{ name: "readline", message: "Please use 'node:readline' instead." },
						{ name: "repl", message: "Please use 'node:repl' instead." },
						{ name: "stream", message: "Please use 'node:stream' instead." },
						{ name: "string_decoder", message: "Please use 'node:string_decoder' instead." },
						{ name: "timers", message: "Please use 'node:timers' instead." },
						{ name: "tls", message: "Please use 'node:tls' instead." },
						{ name: "trace_events", message: "Please use 'node:trace_events' instead." },
						{ name: "tty", message: "Please use 'node:tty' instead." },
						{ name: "url", message: "Please use 'node:url' instead." },
						{ name: "util", message: "Please use 'node:util' instead." },
						{ name: "v8", message: "Please use 'node:v8' instead." },
						{ name: "vm", message: "Please use 'node:vm' instead." },
						{ name: "worker_threads", message: "Please use 'node:worker_threads' instead." },
						{ name: "zlib", message: "Please use 'node:zlib' instead." }
					]
				}
			]
		}
	}
];
