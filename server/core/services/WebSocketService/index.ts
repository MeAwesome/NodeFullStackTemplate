import logger from "@logger";
import config from "@config";
import Service from "@/core/Service";

import fs from "node:fs";
import path from "node:path";
import { Server, Socket } from "socket.io";

import HTTPService from "@/core/services/HTTPService";

export class WebSocketService extends Service {
	private socketServer: Server;

	constructor() {
		super();

		this.socketServer = null!;
	}

	public async start(): Promise<void> {
		logger.verbose("Waiting for HTTP service to start...");
		await HTTPService.waitForActivation();
		this.socketServer = new Server(HTTPService.getServer().server);
		await this.registerRoutes();
		logger.verbose("WebSocket service started");
	}

	public async stop(): Promise<void> {
		await this.socketServer.close();
		logger.verbose("WebSocket service stopped");
	}

	private async registerRoutes(): Promise<void> {
		const eventsDir = path.resolve(import.meta.dirname, "../../../routes/websocket");
		const eventsRoutes = fs
			.readdirSync(eventsDir, {
				recursive: true,
				withFileTypes: true
			})
			.filter((dirent) => dirent.isFile())
			.sort((a, b) => {
				const aDepth = a.parentPath.split(path.sep).length;
				const bDepth = b.parentPath.split(path.sep).length;
				if (aDepth == bDepth) {
					return b.name.localeCompare(a.name);
				}
				return aDepth - bDepth;
			})
			.map((route) => path.join(route.parentPath, route.name));
		this.socketServer.on("connection", async (socket: Socket) => {
			if (config.services.core.websocket.latencyCheck.enabled) {
				socket.on("WebSocketService/latencyCheck", (startDate: number) => {
					socket.emit("WebSocketService/latencyCheck", startDate);
				});
			}
			for (const route of eventsRoutes) {
				const routePath = path.relative(eventsDir, route).replaceAll(path.sep, "/");
				const routeEventPath = routePath.split(".")[0];
				const routeImportPath = path.join("../../../routes/websocket", routePath).replaceAll(path.sep, "/");
				const routeModule = (await import(routeImportPath)).default;
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				socket.on(routeEventPath, (args: any[]) => {
					try {
						routeModule(socket, ...args);
					} catch (error) {
						logger.error(`Error in WebSocket route ${routeEventPath}: ${error}`);
					}
				});
				logger.verbose(`WebSocket route registered: ${routeEventPath}`);
				if (routeEventPath === "connect") {
					routeModule(socket);
				}
			}
		});
		logger.debug("WebSocket routes registered");
	}
}

export default new WebSocketService();
