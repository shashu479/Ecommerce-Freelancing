import React, { useState, useEffect } from 'react';
import { Search, Package, CheckCircle, Truck, Clock, MapPin } from 'lucide-react';
import client from '../api/client';
import { useSearchParams } from 'react-router-dom';

const TrackOrder = () => {
    const [searchParams] = useSearchParams();
    const [orderId, setOrderId] = useState('');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchOrder = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await client.get(`/orders/track/${id}`);
            setOrder(data);
        } catch (err) {
            console.error(err);
            setError('Order not found or invalid ID');
            setOrder(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const queryOrderId = searchParams.get('orderId');
        if (queryOrderId) {
            setOrderId(queryOrderId);
            fetchOrder(queryOrderId);
        }
    }, [searchParams]);

    const handleTrack = (e) => {
        e.preventDefault();
        if (orderId) {
            fetchOrder(orderId);
        }
    };

    const getStatusStep = (status) => {
        switch (status) {
            case 'Pending': return 1;
            case 'Approved': return 2;
            case 'Shipped': return 3;
            case 'Delivered': return 4;
            default: return 0;
        }
    };

    const currentStep = order ? getStatusStep(order.status) : 0;

    return (
        <div className="min-h-screen bg-background pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12 animate-fade-in-up">
                    <h1 className="font-heading text-4xl font-bold text-primary mb-4">Track Your Order</h1>
                    <p className="text-text-secondary">Enter your Order ID to see the current status of your shipment.</p>
                </div>

                <div className="bg-surface shadow-lg rounded-sm p-6 md:p-10 mb-10 border border-secondary/10">
                    <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-grow relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
                            <input
                                type="text"
                                placeholder="Enter Order ID (e.g. 64f1...)"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-background border border-secondary/20 rounded-sm focus:outline-none focus:border-accent transition-colors"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-primary text-surface px-8 py-4 font-bold uppercase tracking-widest hover:bg-accent hover:text-primary transition-colors rounded-sm disabled:opacity-70"
                        >
                            {loading ? 'Tracking...' : 'Track Order'}
                        </button>
                    </form>
                    {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
                </div>

                {order && (
                    <div className="bg-surface shadow-lg rounded-sm p-8 border border-secondary/10 animate-fade-in">
                        <div className="flex flex-wrap justify-between items-end mb-8 border-b border-secondary/10 pb-6">
                            <div>
                                <p className="text-sm text-text-secondary uppercase tracking-wider mb-1">Order ID</p>
                                <p className="text-xl font-mono font-bold text-primary">{order._id || order.id}</p>
                            </div>
                            <div className="text-right mt-4 sm:mt-0">
                                <p className="text-sm text-text-secondary uppercase tracking-wider mb-1">Estimated Delivery</p>
                                <p className="text-lg font-bold text-primary">3-5 Business Days</p>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="relative py-8 px-4 md:px-12">
                            {/* Progress Line */}
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-secondary/10 -translate-y-1/2 hidden md:block"></div>
                            <div
                                className="absolute top-1/2 left-0 h-1 bg-accent -translate-y-1/2 transition-all duration-1000 hidden md:block"
                                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                            ></div>

                            <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-0 relative z-10">
                                {/* Step 1: Placed */}
                                <div className={`flex flex-col items-center gap-3 transition-colors ${currentStep >= 1 ? 'text-primary' : 'text-text-secondary/50'}`}>
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 bg-surface transition-all
                                        ${currentStep >= 1 ? 'border-accent text-accent shadow-lg scale-110' : 'border-secondary/20'}`}>
                                        <Package size={20} />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-sm uppercase tracking-wide">Order Placed</p>
                                        <p className="text-xs text-text-secondary mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                {/* Step 2: Processing (Approved) */}
                                <div className={`flex flex-col items-center gap-3 transition-colors ${currentStep >= 2 ? 'text-primary' : 'text-text-secondary/50'}`}>
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 bg-surface transition-all
                                        ${currentStep >= 2 ? 'border-accent text-accent shadow-lg scale-110' : 'border-secondary/20'}`}>
                                        <Clock size={20} />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-sm uppercase tracking-wide">Processing</p>
                                        <p className="text-xs text-text-secondary mt-1">{currentStep >= 2 ? 'Verified' : 'Pending'}</p>
                                    </div>
                                </div>

                                {/* Step 3: Shipped */}
                                <div className={`flex flex-col items-center gap-3 transition-colors ${currentStep >= 3 ? 'text-primary' : 'text-text-secondary/50'}`}>
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 bg-surface transition-all
                                        ${currentStep >= 3 ? 'border-accent text-accent shadow-lg scale-110' : 'border-secondary/20'}`}>
                                        <Truck size={20} />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-sm uppercase tracking-wide">Shipped</p>
                                        <p className="text-xs text-text-secondary mt-1">{currentStep >= 3 ? 'In Transit' : 'Pending'}</p>
                                    </div>
                                </div>

                                {/* Step 4: Delivered */}
                                <div className={`flex flex-col items-center gap-3 transition-colors ${currentStep >= 4 ? 'text-primary' : 'text-text-secondary/50'}`}>
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 bg-surface transition-all
                                        ${currentStep >= 4 ? 'border-accent text-accent shadow-lg scale-110' : 'border-secondary/20'}`}>
                                        <CheckCircle size={20} />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-sm uppercase tracking-wide">Delivered</p>
                                        <p className="text-xs text-text-secondary mt-1">{currentStep >= 4 ? 'Arrived' : 'In Progress'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackOrder;
