import config from "@root/server/core/util/config";
import logger from "@root/server/core/util/logger";
import Service from "@root/server/core/Service";

import fs from "node:fs";
import path from "node:path";
import fastify, { FastifyInstance } from "fastify";
import { remixFastify } from "@mcansh/remix-fastify";

import WebSocketService from "@root/server/core/services/WebSocketService";

export class HTTPService extends Service {
	private fastifyServer: FastifyInstance;

	constructor() {
		super();

		this.fastifyServer = null!;
	}

	public async start(): Promise<void> {
		this.fastifyServer = await fastify({
			ignoreTrailingSlash: true
		});
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
		const apiDir = path.resolve(import.meta.dirname, "../../../routes/api");
		const apiRoutes = fs.readdirSync(apiDir, {
			recursive: true,
			withFileTypes: true
		}).filter((dirent) => dirent.isFile()).sort((a, b) => {
			const aDepth = a.parentPath.split(path.sep).length;
			const bDepth = b.parentPath.split(path.sep).length;
			if (aDepth == bDepth) {
				return a.name.localeCompare(b.name);
			}
			return bDepth - aDepth;
		}).map((route) => path.join(route.parentPath, route.name));
		for (const route of apiRoutes) {
			const routePath = path.relative(apiDir, route).replaceAll(path.sep, "/");
			const routeHTTPPath = `/api/${routePath.split("/").slice(0, -1).join("/")}`.replaceAll(/\[(.*?)\]/g, ":$1").replace(/\/$/, "");
			const routeImportPath = path.join("../../../routes/api", routePath).replaceAll(path.sep, "/");
			const routeMethod = routePath.split("/").slice(-1)[0].split(".")[0];
			switch (routeMethod) {
				case "get":
					this.fastifyServer.get(routeHTTPPath, (await import(routeImportPath)).default);
					break;
				case "post":
					this.fastifyServer.post(routeHTTPPath, (await import(routeImportPath)).default);
					break;
				case "put":
					this.fastifyServer.put(routeHTTPPath, (await import(routeImportPath)).default);
					break;
				case "delete":
					this.fastifyServer.delete(routeHTTPPath, (await import(routeImportPath)).default);
					break;
				case "patch":
					this.fastifyServer.patch(routeHTTPPath, (await import(routeImportPath)).default);
					break;
				case "options":
					this.fastifyServer.options(routeHTTPPath, (await import(routeImportPath)).default);
					break;
				case "head":
					this.fastifyServer.head(routeHTTPPath, (await import(routeImportPath)).default);
					break;
				case "all":
					this.fastifyServer.all(routeHTTPPath, (await import(routeImportPath)).default);
					break;
				default:
					logger.warn(`Unknown route method ${routeMethod} for route ${routeHTTPPath}`);
					continue;
			}
			logger.verbose(`Registered route ${routeMethod.toUpperCase()} ${routeHTTPPath}`);	
		}
		this.fastifyServer.all("/api/*", async (req, res) => {
			res.status(404).send({ error: "Not found" });
		});
		logger.debug("Registered all API routes");
	}

	public getServer(): FastifyInstance {
		return this.fastifyServer;
	}
}

export default new HTTPService();
