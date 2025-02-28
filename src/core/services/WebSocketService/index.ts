import logger from "@logger";
import Service from "@/core/Service";

import { SocketEvent } from "@/core/services/WebSocketService/enums";

import { Server, Socket } from "socket.io";

import HTTPService from "@/core/services/HTTPService";

export class WebSocketService extends Service {
	private socketServer: Server;

	constructor() {
		super();

		this.socketServer = null!;
	}

	public async start(): Promise<void> {
		logger.info("Waiting for HTTP service to start...");
		await HTTPService.waitForActivation();
		this.socketServer = new Server(HTTPService.getServer().server);
		this.socketServer.on("connection", this.onConnection.bind(this));
		logger.info("WebSocket service started");
	}

	public async stop(): Promise<void> {
		this.socketServer.close();
		logger.info("WebSocket service stopped");
	}

	private onConnection(socket: Socket): void {
		logger.debug("New WebSocket connection");
		this.emit(SocketEvent.CONNECTION, socket);
	}
}

export default new WebSocketService();
