import React, { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const OrderContext = createContext();

export const useOrders = () => {
    return useContext(OrderContext);
};

export const OrderProvider = ({ children }) => {
    const { user, isAdmin } = useAuth();
    const { socket } = useSocket();
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;
            try {
                const url = isAdmin ? '/orders' : '/orders/myorders';
                const { data } = await client.get(url);
                setOrders(data);
            } catch (error) {
                console.error("Failed to fetch orders", error);
            }
        };
        fetchOrders();
    }, [user, isAdmin]);

    useEffect(() => {
        if (!socket) return;

        const handleNewOrder = (newOrder) => {
            if (isAdmin) {
                setOrders(prev => [newOrder, ...prev]);
            }
        };

        const handleOrderStatusUpdated = (updatedOrder) => {
            setOrders(prev => prev.map(order =>
                order._id === updatedOrder._id ? updatedOrder : order
            ));
        };

        socket.on('new-order', handleNewOrder);
        socket.on('order-status-updated', handleOrderStatusUpdated);

        return () => {
            socket.off('new-order', handleNewOrder);
            socket.off('order-status-updated', handleOrderStatusUpdated);
        };
    }, [socket, isAdmin]);

    const createOrder = async (orderData) => {
        try {
            const { data } = await client.post('/orders', orderData);
            setOrders(prev => [...prev, data]);
            return data;
        } catch (error) {
            console.error("Failed to create order", error);
            throw error;
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            const { data } = await client.put(`/orders/${orderId}/status`, { status });
            // Socket will handle the update for everyone, but we update locally for immediate feedback 
            // (though socket is fast enough, this double update is fine as react batches or id match handles it)
            setOrders(prev => prev.map(order =>
                order._id === orderId ? data : order
            ));
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    return (
        <OrderContext.Provider value={{ orders, createOrder, updateOrderStatus }}>
            {children}
        </OrderContext.Provider>
    );
};
