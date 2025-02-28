import config from "@config";
import logger from "@logger";
import Service from "@/core/Service";

import fs from "node:fs";
import path from "node:path";
import fastify, { FastifyInstance } from "fastify";
import { remixFastify } from "@mcansh/remix-fastify";

import WebSocketService from "@/core/services/WebSocketService";

export class HTTPService extends Service {
	private fastifyServer: FastifyInstance;

	constructor() {
		super();

		this.fastifyServer = null!;
	}

	public async start(): Promise<void> {
		this.fastifyServer = await fastify();
		await this.fastifyServer.register(remixFastify, {
			buildDirectory: "build/remix"
		});
		await this.registerRoutes();
		await this.fastifyServer.listen({
			port: config.services.core.http.port,
			host: "0.0.0.0"
		});
		logger.info("HTTP service started");
	}

	public async stop(): Promise<void> {
		logger.info("Waiting for WebSocket service to stop...");
		await WebSocketService.waitForDeactivation();
		logger.info("Noticed WebSocket service stopped");
		logger.info("Stopping HTTP service...");
		await this.fastifyServer.close();
		logger.info("HTTP service stopped");
	}

	private async registerRoutes(): Promise<void> {
		const routesDir = path.resolve(import.meta.dirname, "../../../routes");
		console.log(routesDir);
		const routes = fs.readdirSync(routesDir, {
			recursive: true,
			withFileTypes: true
		});
		// sort routes by depth (largest to smallest) and then by name (alphabetical with underscores last)
		routes.sort((a, b) => {
			const aDepth = a.parentPath.split(path.sep).length;
			const bDepth = b.parentPath.split(path.sep).length;
			if (aDepth !== bDepth) {
				return bDepth - aDepth;
			}
			return a.name.localeCompare(b.name);
		});
		for (const dirent of routes) {
			if (!dirent.isFile()) return;
			if (!dirent.name.endsWith(".ts")) return;
			let route = dirent.parentPath
				.substring(routesDir.length)
				.replaceAll("\\", "/")
				.replace(/\[_(.*?)\]/g, ":$1?")
				.replace(/\[(.*?)\]/g, ":$1");
			const routeFunction = (
				await import(`../../../routes${dirent.parentPath.substring(routesDir.length)}/${dirent.name}`)
			).default;
			const routeMethod = dirent.name.replace(".ts", "").replace("_", "").toLowerCase();
			const isWildcard = dirent.name.startsWith("_");
			if (isWildcard) {
				route += "*";
			}
			switch (routeMethod) {
				case "get":
					this.fastifyServer.get(route, routeFunction);
					break;
				case "post":
					this.fastifyServer.post(route, routeFunction);
					break;
				case "put":
					this.fastifyServer.put(route, routeFunction);
					break;
				case "delete":
					this.fastifyServer.delete(route, routeFunction);
					break;
				case "patch":
					this.fastifyServer.patch(route, routeFunction);
					break;
				case "options":
					this.fastifyServer.options(route, routeFunction);
					break;
				case "head":
					this.fastifyServer.head(route, routeFunction);
					break;
				case "all":
					this.fastifyServer.all(route, routeFunction);
					break;
				default:
					logger.warn(`Unknown route method: ${routeMethod}`);
			}
			logger.verbose(`Registered route: ${routeMethod.toUpperCase()} ${route.replace("*", "/*")}`);
		}
	}

	public getServer(): FastifyInstance {
		return this.fastifyServer;
	}
}

export default new HTTPService();
