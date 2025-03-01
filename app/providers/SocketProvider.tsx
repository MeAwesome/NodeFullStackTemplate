import { io, Socket } from 'socket.io-client';
import { createContext, ReactNode, useEffect, useRef } from 'react';

interface SocketProviderProps {
    readonly children: ReactNode;
    readonly enabled: boolean;
}

export const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children, enabled }: SocketProviderProps) {
    const socketRef = useRef<Socket | null>(null);

    if (!socketRef.current && enabled) {
        socketRef.current = io();
    }
    
    useEffect(() => {
        return () => {
            socketRef.current?.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={socketRef.current}>
            {children}
        </SocketContext.Provider>
    );
}