import { Socket } from "socket.io";

export default async function disconnect(socket: Socket) {
	console.log(`Disconnected: ${socket.id}`);
}
