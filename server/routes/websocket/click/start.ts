import { Socket } from "socket.io";

import TimingsService from "@/core/services/TimingsService";

export default async function start(socket: Socket) {
	console.log("Start Button Clicked");
	TimingsService.setInterval(
		"heartbeat",
		() => {
			socket.emit("heartbeat");
			socket.broadcast.emit("heartbeat");
		},
		1000
	);
}
