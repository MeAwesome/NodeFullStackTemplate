import { io, Socket } from "socket.io-client";
import { createContext, ReactNode, useEffect, useRef, useState } from "react";

interface SocketProviderProps {
	readonly children: ReactNode;
	readonly config: object;
}

export const SocketContext = createContext<Socket | null>(null);
export const SocketLatencyContext = createContext<number | null>(null);

export function SocketProvider({ children, config }: SocketProviderProps) {
	const socketRef = useRef<Socket | null>(null);
	const [latency, setLatency] = useState<number | null>(null);

	// @ts-expect-error testing
	if (!socketRef.current && config.enabled) {
		socketRef.current = io();
		// @ts-expect-error testing
		if (config.latencyCheck.enabled) {
			setInterval(() => {
				// @ts-expect-error testing
				socketRef.current.emit("WebSocketService/latencyCheck", Date.now());
				// @ts-expect-error testing
			}, config.latencyCheck.interval);
			socketRef.current.on("WebSocketService/latencyCheck", (startDate: number) => {
				setLatency(Date.now() - startDate);
			});
		}
	}

	useEffect(() => {
		return () => {
			socketRef.current?.disconnect();
		};
	}, []);

	return (
		<SocketContext.Provider value={socketRef.current}>
			<SocketLatencyContext.Provider value={latency}>{children}</SocketLatencyContext.Provider>
		</SocketContext.Provider>
	);
}
