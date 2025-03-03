import { Socket } from "socket.io";

export default async function connect(socket: Socket) {
	console.log(`Connected: ${socket.id}`);
}
