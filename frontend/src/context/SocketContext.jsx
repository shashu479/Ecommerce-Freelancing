import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [activeUsers, setActiveUsers] = useState(0);

    useEffect(() => {
        // Connect to the backend
        // In development, it's localhost:5000, in prod it's the relative path or env var
        const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

        const newSocket = io(socketUrl, {
            withCredentials: true
        });

        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id);
        });

        newSocket.on('activeUsers', (count) => {
            console.log('Active users update:', count);
            setActiveUsers(count);
        });

        return () => {
            newSocket.close();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, activeUsers }}>
            {children}
        </SocketContext.Provider>
    );
};
