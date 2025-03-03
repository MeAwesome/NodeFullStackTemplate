/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useEffect } from "react";
import { SocketContext, SocketLatencyContext } from "~/providers/socket-provider";

export function useSocket() {
	const socket = useContext(SocketContext);
	const latency = useContext(SocketLatencyContext);
	if (!socket) {
		throw new Error("useSocket must be used within a SocketProvider");
	}
	return {
		emit: (event: string, ...args: any[]) => {
			socket.emit(event, args);
		},
		on: (event: string, callback: (...args: any[]) => void) => {
			useEffect(() => {
				socket.on(event, callback);
				return () => {
					socket.off(event);
				};
			}, []);
		},
		off: (event: string) => {
			socket.off(event);
		},
		latency: latency
	};
}
