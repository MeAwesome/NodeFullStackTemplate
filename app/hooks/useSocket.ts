/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext } from 'react';
import { SocketContext } from '~/providers/SocketProvider';

export function useSocket() {
    const socket = useContext(SocketContext);
    if (!socket) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return {
        socket,
        emit: (event: string, ...args: any[]) => {
            socket.emit(event, args);
        },
        on: (event: string, callback: (...args: any[]) => void) => {
            socket.on(event, callback);
        },
        off: (event: string, callback: (...args: any[]) => void) => {
            socket.off(event, callback);
        }
    }
}