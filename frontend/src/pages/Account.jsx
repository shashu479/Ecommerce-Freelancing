import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, User, Package, MapPin,
    Heart, Settings, HelpCircle, LogOut, CheckCircle, Clock,
    Lock, Mail, Truck, PackageCheck
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';

const Account = () => {
    const { user, login, register, logout, isAdmin } = useAuth();
    const { orders } = useOrders();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');

    // Redirect admin users to admin dashboard
    useEffect(() => {
        if (user && isAdmin) {
            navigate('/admin/dashboard');
        }
    }, [user, isAdmin, navigate]);

    // Auth Form State
    const [isRegistering, setIsRegistering] = useState(false);
    const [authData, setAuthData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [authError, setAuthError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mock Data - B2C Customer (Fallback for missing backend fields)
    const userProfile = {
        name: user?.name || "Guest User",
        email: user?.email || "guest@example.com",
        phone: "+91 98765 43210", // Placeholder as backend doesn't have phone yet
        address: "B-45, Greater Kailash I, New Delhi", // Placeholder
        country: "India", // Placeholder
        loyaltyPoints: 120 // Placeholder
    };

    // Helper function to get order status details
    const getOrderStatusInfo = (status) => {
        const statusMap = {
            'Pending': { color: 'yellow', icon: Clock, step: 1, label: 'Order Placed' },
            'Approved': { color: 'blue', icon: CheckCircle, step: 2, label: 'Confirmed' },
            'Packed': { color: 'purple', icon: PackageCheck, step: 3, label: 'Packed' },
            'Shipped': { color: 'indigo', icon: Truck, step: 4, label: 'Shipped' },
            'Delivered': { color: 'green', icon: CheckCircle, step: 5, label: 'Delivered' }
        };
        return statusMap[status] || statusMap['Pending'];
    };

    const handleAuthChange = (e) => {
        setAuthData({ ...authData, [e.target.name]: e.target.value });
    };

    const handleAuthSubmit = async (e) => {
        e.preventDefault();
        setAuthError('');
        setIsSubmitting(true);

        try {
            let result;
            if (isRegistering) {
                result = await register(authData.name, authData.email, authData.password);
            } else {
                result = await login(authData.email, authData.password);
            }

            if (!result.success) {
                setAuthError(result.message);
            }
        } catch (err) {
            setAuthError('An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const MenuButton = ({ id, icon: Icon, label }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors rounded-sm ${activeTab === id
                ? 'bg-primary text-surface'
                : 'text-text-secondary hover:bg-secondary/10 hover:text-primary'
                }`}
        >
            <Icon size={18} />
            <span>{label}</span>
        </button>
    );

    if (!user) {
        return (
            <div className="w-full pt-20 bg-background min-h-screen flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-surface p-8 rounded-sm shadow-md border border-secondary/10">
                    <div className="text-center mb-8">
                        <h2 className="font-heading text-3xl font-bold text-primary mb-2">
                            {isRegistering ? 'Create Account' : 'Welcome Back'}
                        </h2>
                        <p className="text-text-secondary text-sm">
                            {isRegistering
                                ? 'Join Siraba Organic for a premium experience.'
                                : 'Sign in to access your orders and profile.'}
                        </p>
                    </div>

                    {authError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-sm">
                            {authError}
                        </div>
                    )}

                    <form onSubmit={handleAuthSubmit} className="space-y-5">
                        {isRegistering && (
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-text-secondary tracking-wider">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 text-secondary" size={18} />
                                    <input
                                        type="text"
                                        name="name"
                                        value={authData.name}
                                        onChange={handleAuthChange}
                                        className="w-full pl-10 pr-4 py-2.5 border border-secondary/20 rounded-sm focus:border-accent focus:outline-none transition-colors"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-text-secondary tracking-wider">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-secondary" size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    value={authData.email}
                                    onChange={handleAuthChange}
                                    className="w-full pl-10 pr-4 py-2.5 border border-secondary/20 rounded-sm focus:border-accent focus:outline-none transition-colors"
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-text-secondary tracking-wider">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-secondary" size={18} />
                                <input
                                    type="password"
                                    name="password"
                                    value={authData.password}
                                    onChange={handleAuthChange}
                                    className="w-full pl-10 pr-4 py-2.5 border border-secondary/20 rounded-sm focus:border-accent focus:outline-none transition-colors"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-primary text-surface py-3 font-bold uppercase tracking-widest hover:bg-accent hover:text-primary transition-all duration-300 shadow-lg mt-2 disabled:opacity-70"
                        >
                            {isSubmitting ? 'Processing...' : (isRegistering ? 'Register' : 'Login')}
                        </button>
                    </form>

                    <div className="mt-6 text-center border-t border-secondary/10 pt-6">
                        <button
                            onClick={() => {
                                setIsRegistering(!isRegistering);
                                setAuthError('');
                            }}
                            className="text-sm text-text-secondary hover:text-primary transition-colors"
                        >
                            {isRegistering
                                ? 'Already have an account? Login here'
                                : "Don't have an account? Create one"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full pt-20 bg-background min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Sidebar / Navigation */}
                    <div className="w-full md:w-64 flex-shrink-0 space-y-6">
                        <div className="bg-surface p-6 rounded-sm shadow-sm border border-secondary/10">
                            <div className="flex flex-col items-center text-center space-y-2 mb-6">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-heading text-2xl font-bold">
                                    {userProfile.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-heading text-lg font-bold text-primary">{userProfile.name}</h3>
                                    <p className="text-xs text-text-secondary">Loyalty Member</p>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <MenuButton id="dashboard" icon={LayoutDashboard} label="Dashboard" />
                                <MenuButton id="profile" icon={User} label="My Profile" />
                                <MenuButton id="orders" icon={Package} label="My Orders" />
                                <MenuButton id="addresses" icon={MapPin} label="Addresses" />
                                <MenuButton id="wishlist" icon={Heart} label="Wishlist" />
                                <MenuButton id="settings" icon={Settings} label="Settings" />
                                <MenuButton id="support" icon={HelpCircle} label="Support" />
                            </div>
                        </div>

                        <div className="mt-4 md:mt-0">
                            <button
                                onClick={logout}
                                className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-sm transition-colors"
                            >
                                <LogOut size={18} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 bg-surface rounded-sm shadow-md border border-secondary/10 overflow-hidden min-h-[600px]">

                        {/* 1. Dashboard View */}
                        {activeTab === 'dashboard' && (
                            <div className="p-6 md:p-8 space-y-8 animate-fade-in">
                                <div className="flex justify-between items-center border-b border-secondary/10 pb-6">
                                    <div>
                                        <h2 className="font-heading text-3xl text-primary font-bold">My Account</h2>
                                        <p className="text-text-secondary text-sm font-light mt-1">Hello, {userProfile.name}</p>
                                    </div>
                                    <Link to="/shop" className="bg-accent text-primary px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-white transition-colors shadow-sm">
                                        Continue Shopping
                                    </Link>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-background p-6 rounded-sm border-t-4 border-accent shadow-sm">
                                        <p className="text-text-secondary text-xs uppercase tracking-wider font-medium">Total Orders</p>
                                        <h3 className="text-3xl font-bold text-primary mt-2">{orders.length}</h3>
                                    </div>
                                    <div className="bg-background p-6 rounded-sm border-t-4 border-primary shadow-sm">
                                        <p className="text-text-secondary text-xs uppercase tracking-wider font-medium">Pending Delivery</p>
                                        <h3 className="text-3xl font-bold text-primary mt-2">
                                            {orders.filter(o => o.status !== 'Delivered').length}
                                        </h3>
                                    </div>
                                    <div className="bg-background p-6 rounded-sm border-t-4 border-secondary shadow-sm">
                                        <p className="text-text-secondary text-xs uppercase tracking-wider font-medium">Total Spent</p>
                                        <h3 className="text-3xl font-bold text-primary mt-2">
                                            ₹{orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0).toFixed(0)}
                                        </h3>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-heading text-xl text-primary font-bold mb-4">Recent Orders</h3>
                                    {orders.length > 0 ? (
                                        <div className="space-y-4">
                                            {orders.slice(0, 3).map((order) => {
                                                const statusInfo = getOrderStatusInfo(order.status);
                                                const StatusIcon = statusInfo.icon;
                                                return (
                                                    <div key={order._id} className="flex flex-col md:flex-row justify-between items-center border border-secondary/10 p-4 rounded-sm bg-background/50 hover:bg-background transition-colors">
                                                        <div className="flex items-center gap-4 w-full md:w-auto">
                                                            <div className={`p-2 rounded-full bg-${statusInfo.color}-100 text-${statusInfo.color}-700`}>
                                                                <StatusIcon size={20} />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-primary text-sm">
                                                                    {order.orderItems?.[0]?.name || 'Order'}
                                                                    {order.orderItems?.length > 1 && ` +${order.orderItems.length - 1} more`}
                                                                </h4>
                                                                <p className="text-xs text-text-secondary">
                                                                    Order {order._id.slice(-8)} • {new Date(order.createdAt).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-6 mt-4 md:mt-0 w-full md:w-auto justify-between md:justify-end">
                                                            <span className="font-bold text-primary">₹{order.totalPrice?.toFixed(2)}</span>
                                                            <button
                                                                onClick={() => setActiveTab('orders')}
                                                                className="text-xs text-accent uppercase font-bold tracking-wider hover:text-primary transition-colors"
                                                            >
                                                                Track
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-text-secondary text-center py-8">No orders yet. Start shopping!</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 2. Profile View */}
                        {activeTab === 'profile' && (
                            <div className="p-6 md:p-8 space-y-8 animate-fade-in">
                                <div className="border-b border-secondary/10 pb-6">
                                    <h2 className="font-heading text-3xl text-primary font-bold">My Profile</h2>
                                    <p className="text-text-secondary text-sm font-light mt-1">Manage your personal information.</p>
                                </div>

                                <div className="space-y-6 max-w-2xl">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase text-text-secondary tracking-wider font-bold">Full Name</label>
                                            <input type="text" defaultValue={userProfile.name} className="w-full border-b border-secondary/20 bg-transparent py-2 focus:outline-none focus:border-accent text-primary" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase text-text-secondary tracking-wider font-bold">Phone Number</label>
                                            <input type="text" defaultValue={userProfile.phone} className="w-full border-b border-secondary/20 bg-transparent py-2 focus:outline-none focus:border-accent text-primary" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase text-text-secondary tracking-wider font-bold">Email Address</label>
                                        <input type="email" defaultValue={userProfile.email} className="w-full border-b border-secondary/20 bg-transparent py-2 focus:outline-none focus:border-accent text-primary" />
                                    </div>
                                    <div className="pt-4">
                                        <button className="bg-primary text-surface px-8 py-3 text-sm font-medium uppercase tracking-wider hover:bg-accent hover:text-primary transition-colors rounded-sm shadow-md">
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. Orders View */}
                        {activeTab === 'orders' && (
                            <div className="p-6 md:p-8 space-y-8 animate-fade-in">
                                <div className="border-b border-secondary/10 pb-6">
                                    <h2 className="font-heading text-3xl text-primary font-bold">My Orders</h2>
                                    <p className="text-text-secondary text-sm font-light mt-1">Track your shipment status and order history.</p>
                                </div>

                                {orders.length > 0 ? (
                                    <div className="space-y-6">
                                        {orders.map((order) => {
                                            const statusInfo = getOrderStatusInfo(order.status);
                                            return (
                                                <div key={order._id} className="border border-secondary/10 p-6 rounded-sm bg-background hover:shadow-md transition-shadow">
                                                    <div className="flex flex-col md:flex-row justify-between mb-4">
                                                        <div>
                                                            <div className="flex items-center gap-3">
                                                                <h3 className="font-heading text-lg font-bold text-primary">#{order._id.slice(-8)}</h3>
                                                                <span className={`text-xs px-2 py-1 rounded-full bg-${statusInfo.color}-100 text-${statusInfo.color}-800 font-bold`}>
                                                                    {order.status}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-text-secondary mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                        <div className="text-right mt-2 md:mt-0">
                                                            <p className="font-bold text-primary text-xl">₹{order.totalPrice?.toFixed(2)}</p>
                                                            <p className="text-xs text-text-secondary">{order.orderItems?.length || 0} item(s)</p>
                                                        </div>
                                                    </div>

                                                    {/* Order Tracking Timeline */}
                                                    <div className="my-6 py-6 border-y border-secondary/10">
                                                        <p className="text-xs font-bold uppercase text-text-secondary mb-4 tracking-wider">Order Progress</p>
                                                        <div className="flex items-center justify-between relative">
                                                            {/* Progress Line */}
                                                            <div className="absolute top-5 left-0 right-0 h-1 bg-secondary/10">
                                                                <div
                                                                    className="h-full bg-primary transition-all duration-500"
                                                                    style={{ width: `${((statusInfo.step - 1) / 3) * 100}%` }}
                                                                />
                                                            </div>

                                                            {/* Steps */}
                                                            {['Pending', 'Approved', 'Packed', 'Shipped'].map((status, idx) => {
                                                                const stepInfo = getOrderStatusInfo(status);
                                                                const isComplete = statusInfo.step > idx + 1;
                                                                const isCurrent = statusInfo.step === idx + 1;
                                                                const StepIcon = stepInfo.icon;

                                                                return (
                                                                    <div key={status} className="flex flex-col items-center relative z-10">
                                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${isComplete ? 'bg-primary text-white' :
                                                                            isCurrent ? 'bg-primary text-white animate-pulse' :
                                                                                'bg-secondary/10 text-text-secondary'
                                                                            }`}>
                                                                            <StepIcon size={18} />
                                                                        </div>
                                                                        <p className={`text-xs font-medium text-center ${isComplete || isCurrent ? 'text-primary' : 'text-text-secondary'
                                                                            }`}>
                                                                            {stepInfo.label}
                                                                        </p>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    {/* Order Items */}
                                                    <div className="space-y-3 mb-4">
                                                        {order.orderItems?.map((item, idx) => (
                                                            <div key={idx} className="flex items-start gap-4 py-3 border-b border-secondary/5 last:border-0">
                                                                <div className="w-12 h-12 bg-surface rounded-sm flex-shrink-0 border border-secondary/10 p-1">
                                                                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                                                </div>
                                                                <div className="flex-grow">
                                                                    <p className="font-medium text-primary text-sm">{item.name}</p>
                                                                    <p className="text-xs text-text-secondary">Qty: {item.quantity} × ₹{item.price}</p>
                                                                </div>
                                                                <p className="font-bold text-primary">₹{(item.quantity * item.price).toFixed(2)}</p>
                                                            </div>
                                                        ))}
                                                    </div>


                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Package size={48} className="mx-auto text-secondary/30 mb-4" />
                                        <p className="text-text-secondary mb-4">No orders yet</p>
                                        <Link to="/shop" className="text-accent underline hover:text-primary">Start Shopping</Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Placeholder for other B2C tabs */}
                        {['addresses', 'wishlist', 'settings', 'support'].includes(activeTab) && (
                            <div className="p-6 md:p-8 space-y-8 animate-fade-in flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                                <Settings size={48} className="text-secondary/30 mb-4" />
                                <h3 className="text-xl font-bold text-primary capitalize">{activeTab}</h3>
                                <p className="text-text-secondary max-w-md">Manage your {activeTab} here. (Feature coming soon)</p>
                                <button onClick={() => setActiveTab('dashboard')} className="text-accent underline mt-4 hover:text-primary">Return to Dashboard</button>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Account;
