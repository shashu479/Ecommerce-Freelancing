import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../context/ProductContext';
import { useOrders } from '../../context/OrderContext';
import { Navigate } from 'react-router-dom';
import { Users, ShoppingBag, Package, Settings, LogOut, Check, X, Plus, Edit2, Trash2, Eye, FileText, TicketPercent, ChevronDown, ChevronUp, Clock, CheckCircle, Truck, PackageCheck } from 'lucide-react';
import client from '../../api/client';

const AdminDashboard = () => {
    const { isAdmin, logout } = useAuth();
    const { products, addProduct, updateProduct, deleteProduct, homeContent, updateHomeContent } = useProducts();
    const { orders, updateOrderStatus, activeUsers } = useOrders();

    const [activeTab, setActiveTab] = useState('dashboard');
    const [expandedOrders, setExpandedOrders] = useState({});
    const [inquiries, setInquiries] = useState([]);
    const [users, setUsers] = useState([]);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [couponData, setCouponData] = useState({
        code: '',
        discountValue: '',
        expiryDate: ''
    });

    React.useEffect(() => {
        const fetchInquiries = async () => {
            if (activeTab === 'inquiries') {
                try {
                    const { data } = await client.get('/inquiries');
                    setInquiries(data);
                } catch (error) {
                    console.error("Failed to fetch inquiries", error);
                }
            } else if (activeTab === 'users') {
                try {
                    const { data } = await client.get('/auth/users');
                    setUsers(data);
                } catch (error) {
                    console.error("Failed to fetch users", error);
                }
            }
        };
        fetchInquiries();
    }, [activeTab]);

    // Initial Product State
    const initialProductState = {
        name: '',
        slug: '',
        description: '',
        price: '',
        category: '',
        tag: '',
        image: '',
    };

    const [currentProduct, setCurrentProduct] = useState(initialProductState);
    const [isEditingData, setIsEditingData] = useState(false);

    if (!isAdmin) {
        return <Navigate to="/admin" />;
    }

    // --- Product Handlers ---
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            // Note: client interceptor handles auth, but content-type might need explicit handling or let axios do it
            // Using standard fetch or axios directly for upload to be safe with FormData
            const { data } = await client.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' } // Browser sets boundary automatically
            });

            setCurrentProduct(prev => ({ ...prev, image: data }));
        } catch (error) {
            console.error('File upload error', error);
            alert('Image upload failed');
        }
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        const productToSave = {
            ...currentProduct,
            price: parseFloat(currentProduct.price),
            currency: '₹',
            rating: currentProduct.rating || 5, // Keep existing or default
            reviews: currentProduct.reviews || 0,
            image: currentProduct.image || '/images/Saffron.png' // Fallback
        };

        if (isEditingData) {
            await updateProduct(productToSave);
        } else {
            await addProduct(productToSave);
        }
        setIsProductModalOpen(false);
        setCurrentProduct(initialProductState);
        setIsEditingData(false);
    };

    const handleEditClick = (product) => {
        setCurrentProduct(product);
        setIsEditingData(true);
        setIsProductModalOpen(true);
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            await deleteProduct(id);
        }
    };

    const handleAddNewClick = () => {
        setCurrentProduct(initialProductState);
        setIsEditingData(false);
        setIsProductModalOpen(true);
    };

    // --- Coupon Handlers ---
    const handleOpenCouponModal = (user = null) => {
        setSelectedUser(user);
        setCouponData({
            code: user ? `WELCOME-${user.name.split(' ')[0].toUpperCase()}-${Math.floor(Math.random() * 100)}` : '',
            discountValue: '10',
            expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
        setIsCouponModalOpen(true);
    };

    const handleCreateCoupon = async (e) => {
        e.preventDefault();
        try {
            await client.post('/coupons', {
                ...couponData,
                discountValue: parseFloat(couponData.discountValue),
                assignedTo: selectedUser?._id,
                discountType: 'percentage'
            });
            alert(`Coupon ${couponData.code} created successfully!`);
            setIsCouponModalOpen(false);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create coupon');
        }
    };

    // --- Render Sections ---
    const renderStats = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-surface p-6 rounded-sm shadow-sm border border-secondary/10 flex items-center justify-between">
                <div>
                    <p className="text-text-secondary text-sm font-medium uppercase tracking-wider">Total Sales</p>
                    <h3 className="text-3xl font-bold text-primary mt-1">₹{orders.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0).toFixed(2)}</h3>
                </div>
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                    <ShoppingBag size={24} />
                </div>
            </div>
            <div className="bg-surface p-6 rounded-sm shadow-sm border border-secondary/10 flex items-center justify-between">
                <div>
                    <p className="text-text-secondary text-sm font-medium uppercase tracking-wider">Active Orders</p>
                    <h3 className="text-3xl font-bold text-primary mt-1">{orders.filter(o => o.status !== 'Completed' && o.status !== 'Delivered').length}</h3>
                </div>
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                    <Package size={24} />
                </div>
            </div>
            <div className="bg-surface p-6 rounded-sm shadow-sm border border-secondary/10 flex items-center justify-between">
                <div>
                    <p className="text-text-secondary text-sm font-medium uppercase tracking-wider">Active Users (Live)</p>
                    <h3 className="text-3xl font-bold text-primary mt-1">{activeUsers}</h3>
                </div>
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
                    <Users size={24} />
                </div>
            </div>
        </div>
    );

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

    const toggleOrderExpand = (orderId) => {
        setExpandedOrders(prev => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
    };

    const renderOrders = () => (
        <div className="bg-surface rounded-sm shadow-sm border border-secondary/10 overflow-hidden">
            <div className="p-6 border-b border-secondary/10">
                <h2 className="text-xl font-bold text-primary">Recent Orders</h2>
                <p className="text-xs text-text-secondary mt-1">Manage order workflow: Pending → Approved → Packed → Shipped</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-secondary/5 text-text-secondary font-medium uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4 w-8"></th>
                            <th className="px-6 py-4">Order ID</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Items</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary/10">
                        {orders.map(order => {
                            const isExpanded = expandedOrders[order._id];
                            const statusInfo = getOrderStatusInfo(order.status);
                            return (
                                <React.Fragment key={order._id}>
                                    <tr className="hover:bg-secondary/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleOrderExpand(order._id)}
                                                className="text-text-secondary hover:text-primary transition-colors"
                                                title="Toggle tracking view"
                                            >
                                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs">{order._id.slice(-8)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-medium">{order.user?.name || "Guest"}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-text-secondary">
                                                {order.orderItems?.length || 0} item(s)
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide text-center
                                                    ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        order.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                                                            order.status === 'Packed' ? 'bg-purple-100 text-purple-800' :
                                                                order.status === 'Shipped' ? 'bg-indigo-100 text-indigo-800' :
                                                                    'bg-green-100 text-green-800'}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold whitespace-nowrap">₹{order.totalPrice?.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-1">
                                                {order.status === 'Pending' && (
                                                    <button
                                                        onClick={() => updateOrderStatus(order._id, 'Approved')}
                                                        className="px-3 py-1 text-xs font-bold bg-green-50 text-green-700 hover:bg-green-100 rounded transition-colors whitespace-nowrap"
                                                        title="Approve Order"
                                                    >
                                                        ✓ Approve
                                                    </button>
                                                )}
                                                {order.status === 'Approved' && (
                                                    <button
                                                        onClick={() => updateOrderStatus(order._id, 'Packed')}
                                                        className="px-3 py-1 text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 rounded transition-colors whitespace-nowrap"
                                                        title="Mark as Packed"
                                                    >
                                                        📦 Pack
                                                    </button>
                                                )}
                                                {order.status === 'Packed' && (
                                                    <button
                                                        onClick={() => updateOrderStatus(order._id, 'Shipped')}
                                                        className="px-3 py-1 text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded transition-colors whitespace-nowrap"
                                                        title="Mark as Shipped"
                                                    >
                                                        🚚 Ship
                                                    </button>
                                                )}
                                                {order.status === 'Shipped' && (
                                                    <span className="px-3 py-1 text-xs text-text-secondary italic">In Transit</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr className="bg-secondary/5">
                                            <td colSpan="8" className="px-6 py-6">
                                                <div className="max-w-4xl">
                                                    {/* Tracking Timeline */}
                                                    <div className="mb-6">
                                                        <p className="text-xs font-bold uppercase text-text-secondary mb-4 tracking-wider">Order Tracking</p>
                                                        <div className="flex items-center justify-between relative">
                                                            {/* Progress Line */}
                                                            <div className="absolute top-5 left-0 right-0 h-1 bg-secondary/20">
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
                                                                                isCurrent ? 'bg-primary text-white ring-4 ring-primary/20' :
                                                                                    'bg-white border-2 border-secondary/20 text-text-secondary'
                                                                            }`}>
                                                                            <StepIcon size={18} />
                                                                        </div>
                                                                        <p className={`text-xs font-medium text-center ${isComplete || isCurrent ? 'text-primary font-bold' : 'text-text-secondary'
                                                                            }`}>
                                                                            {stepInfo.label}
                                                                        </p>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    {/* Order Items */}
                                                    <div className="bg-white rounded-sm border border-secondary/10 p-4">
                                                        <p className="text-xs font-bold uppercase text-text-secondary mb-3">Order Items</p>
                                                        <div className="space-y-2">
                                                            {order.orderItems?.map((item, idx) => (
                                                                <div key={idx} className="flex items-center gap-3 text-sm">
                                                                    <div className="w-10 h-10 bg-background rounded-sm border border-secondary/10 p-1 flex-shrink-0">
                                                                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                                                    </div>
                                                                    <div className="flex-grow">
                                                                        <p className="font-medium text-primary">{item.name}</p>
                                                                        <p className="text-xs text-text-secondary">Qty: {item.quantity} × ₹{item.price}</p>
                                                                    </div>
                                                                    <p className="font-bold text-primary">₹{(item.quantity * item.price).toFixed(2)}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
                {orders.length === 0 && <div className="p-8 text-center text-text-secondary">No orders found.</div>}
            </div>
        </div>
    );

    const renderProducts = () => (
        <div className="bg-surface rounded-sm shadow-sm border border-secondary/10 overflow-hidden">
            <div className="p-6 border-b border-secondary/10 flex justify-between items-center">
                <h2 className="text-xl font-bold text-primary">Product Inventory</h2>
                <button onClick={handleAddNewClick} className="bg-primary text-surface px-4 py-2 text-sm font-bold uppercase tracking-widest hover:bg-accent hover:text-primary transition-all rounded-sm flex items-center gap-2">
                    <Plus size={16} /> Add Product
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-secondary/5 text-text-secondary font-medium uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Image</th>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Price</th>
                            <th className="px-6 py-4">Tag</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary/10">
                        {products.map(product => (
                            <tr key={product._id || product.id} className="hover:bg-secondary/5 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="w-10 h-10 bg-white rounded-sm border border-secondary/10 p-1">
                                        <img src={product.image} alt="" className="w-full h-full object-contain" />
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-medium text-primary">{product.name}</td>
                                <td className="px-6 py-4 text-text-secondary">{product.category}</td>
                                <td className="px-6 py-4 font-bold">₹{product.price}</td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-accent/20 text-accent text-xs font-bold uppercase rounded-sm">
                                        {product.tag}
                                    </span>
                                </td>
                                <td className="px-6 py-4 flex gap-2">
                                    <button onClick={() => handleEditClick(product)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => handleDeleteClick(product._id || product.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderContent = () => (
        <div className="bg-surface rounded-sm shadow-sm border border-secondary/10 p-6 max-w-2xl">
            <h2 className="text-xl font-bold text-primary mb-6">Homepage Content</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Subheading</label>
                    <input
                        type="text"
                        value={homeContent.subheading}
                        onChange={(e) => updateHomeContent({ subheading: e.target.value })}
                        className="w-full bg-background border border-secondary/20 p-3 rounded-sm focus:border-accent outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Heading</label>
                    <input
                        type="text"
                        value={homeContent.heading}
                        onChange={(e) => updateHomeContent({ heading: e.target.value })}
                        className="w-full bg-background border border-secondary/20 p-3 rounded-sm focus:border-accent outline-none"
                    />
                </div>
                <div className="mt-4 p-4 bg-secondary/5 rounded-sm text-sm text-text-secondary">
                    Changes save automatically and reflect on the homepage immediately.
                </div>
            </div>
        </div>
    );

    const renderInquiries = () => (
        <div className="bg-surface rounded-sm shadow-sm border border-secondary/10 overflow-hidden">
            <div className="p-6 border-b border-secondary/10">
                <h2 className="text-xl font-bold text-primary">Trade Inquiries</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-secondary/5 text-text-secondary font-medium uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Company</th>
                            <th className="px-6 py-4">Direct Contact</th>
                            <th className="px-6 py-4">Product Interest</th>
                            <th className="px-6 py-4">Destination</th>
                            <th className="px-6 py-4">Message</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary/10">
                        {inquiries.map(inquiry => (
                            <tr key={inquiry._id} className="hover:bg-secondary/5 transition-colors align-top">
                                <td className="px-6 py-4 text-xs text-text-secondary whitespace-nowrap">
                                    {new Date(inquiry.createdAt || Date.now()).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-primary">{inquiry.companyName}</div>
                                    <div className="text-xs text-text-secondary">{inquiry.contactPerson}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-primary">{inquiry.email}</div>
                                    <div className="text-xs text-text-secondary">{inquiry.phone}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {inquiry.productInterest.map((p, i) => (
                                            <span key={i} className="px-2 py-1 bg-secondary/10 text-primary text-xs rounded-sm">
                                                {p}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="mt-1 text-xs text-text-secondary">Qty: {inquiry.quantity}</div>
                                </td>
                                <td className="px-6 py-4 font-medium">{inquiry.destination}</td>
                                <td className="px-6 py-4 text-text-secondary italic max-w-xs truncate" title={inquiry.message}>
                                    {inquiry.message}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {inquiries.length === 0 && <div className="p-8 text-center text-text-secondary">No inquiries found.</div>}
            </div>
        </div>
    );

    const renderUsers = () => (
        <div className="bg-surface rounded-sm shadow-sm border border-secondary/10 overflow-hidden">
            <div className="p-6 border-b border-secondary/10 flex justify-between items-center">
                <h2 className="text-xl font-bold text-primary">Registered Users</h2>
                <button onClick={() => handleOpenCouponModal()} className="bg-accent text-primary px-4 py-2 text-sm font-bold uppercase tracking-widest hover:bg-white transition-all rounded-sm flex items-center gap-2">
                    <TicketPercent size={16} /> Create General Coupon
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-secondary/5 text-text-secondary font-medium uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Total Orders</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary/10">
                        {users.map(user => (
                            <tr key={user._id} className="hover:bg-secondary/5 transition-colors">
                                <td className="px-6 py-4 font-medium text-primary">{user.name}</td>
                                <td className="px-6 py-4 text-text-secondary">{user.email}</td>
                                <td className="px-6 py-4">
                                    {user.isAdmin ? <span className="text-red-500 font-bold">Admin</span> : 'Customer'}
                                </td>
                                <td className="px-6 py-4 font-bold">{user.totalOrders}</td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleOpenCouponModal(user)}
                                        className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide bg-blue-50 text-blue-700 px-3 py-1 rounded-sm hover:bg-blue-100 transition-colors"
                                    >
                                        <TicketPercent size={14} /> Send Coupon
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && <div className="p-8 text-center text-text-secondary">No users found.</div>}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background pt-20 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-surface border-r border-secondary/10 fixed h-full left-0 top-20 hidden md:block z-10">
                <div className="p-6">
                    <div className="flex items-center gap-3 text-primary mb-8">
                        <Settings size={24} />
                        <span className="font-heading font-bold text-xl">Admin</span>
                    </div>
                    <nav className="space-y-2">
                        {[

                            { id: 'dashboard', label: 'Dashboard', icon: Users },
                            { id: 'users', label: 'Users', icon: Users },
                            { id: 'orders', label: 'Orders', icon: Package },
                            { id: 'products', label: 'Products', icon: ShoppingBag },
                            { id: 'inquiries', label: 'Inquiries', icon: FileText },
                            { id: 'content', label: 'Content', icon: Edit2 },
                        ].map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-sm transition-colors
                                    ${activeTab === item.id ? 'bg-primary text-surface' : 'text-text-secondary hover:bg-secondary/5'}`}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="absolute bottom-24 w-full px-6">
                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-sm transition-colors">
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow md:ml-64 p-8">
                <div className="mb-8">
                    <h1 className="font-heading text-3xl font-bold text-primary capitalize">{activeTab}</h1>
                </div>

                {activeTab === 'dashboard' && (
                    <>
                        {renderStats()}
                        {renderOrders()}
                    </>
                )}
                {activeTab === 'orders' && renderOrders()}
                {activeTab === 'products' && renderProducts()}
                {activeTab === 'inquiries' && renderInquiries()}
                {activeTab === 'users' && renderUsers()}
                {activeTab === 'content' && renderContent()}
            </main>

            {/* Product Modal */}
            {isProductModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-surface w-full max-w-lg rounded-sm shadow-xl p-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-primary">{isEditingData ? 'Edit Product' : 'Add New Product'}</h2>
                            <button onClick={() => setIsProductModalOpen(false)} className="text-text-secondary hover:text-red-500">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveProduct} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Name</label>
                                <input required type="text" value={currentProduct.name} onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })} className="w-full bg-background border border-secondary/20 p-2 rounded-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Slug (URL)</label>
                                <input required type="text" value={currentProduct.slug} onChange={e => setCurrentProduct({ ...currentProduct, slug: e.target.value })} className="w-full bg-background border border-secondary/20 p-2 rounded-sm" placeholder="e.g. kashmiri-saffron" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Price</label>
                                    <input required type="number" value={currentProduct.price} onChange={e => setCurrentProduct({ ...currentProduct, price: e.target.value })} className="w-full bg-background border border-secondary/20 p-2 rounded-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Category</label>
                                    <input required type="text" value={currentProduct.category} onChange={e => setCurrentProduct({ ...currentProduct, category: e.target.value })} className="w-full bg-background border border-secondary/20 p-2 rounded-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Image</label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        value={currentProduct.image}
                                        onChange={(e) => setCurrentProduct({ ...currentProduct, image: e.target.value })}
                                        className="w-full bg-background border border-secondary/20 p-2 rounded-sm"
                                        placeholder="Image path or URL"
                                    />
                                    <label className="bg-secondary/10 px-3 py-2 rounded-sm cursor-pointer hover:bg-secondary/20 transition-colors">
                                        <Plus size={18} />
                                        <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                    </label>
                                </div>
                                {currentProduct.image && (
                                    <div className="mt-2 w-16 h-16 border rounded-sm overflow-hidden">
                                        <img src={currentProduct.image} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Tag</label>
                                <select
                                    value={currentProduct.tag}
                                    onChange={e => setCurrentProduct({ ...currentProduct, tag: e.target.value })}
                                    className="w-full bg-background border border-secondary/20 p-2 rounded-sm focus:border-accent outline-none appearance-none"
                                >
                                    <option value="">Select Tag</option>
                                    <option value="Best Seller">Best Seller</option>
                                    <option value="New Arrival">New Arrival</option>
                                    <option value="Premium">Premium</option>
                                    <option value="Trending">Trending</option>
                                    <option value="Essential">Essential</option>
                                    <option value="Organic">Organic</option>
                                    <option value="Limited Edition">Limited Edition</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Short Description</label>
                                <textarea required value={currentProduct.description} onChange={e => setCurrentProduct({ ...currentProduct, description: e.target.value })} className="w-full bg-background border border-secondary/20 p-2 rounded-sm h-24" />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsProductModalOpen(false)} className="px-4 py-2 text-sm font-medium text-text-secondary hover:bg-secondary/10 rounded-sm">Cancel</button>
                                <button type="submit" className="px-6 py-2 text-sm font-bold uppercase tracking-widest bg-primary text-surface hover:bg-accent hover:text-primary transition-colors rounded-sm">Save Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Coupon Modal */}
            {isCouponModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-surface w-full max-w-md rounded-sm shadow-xl p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-primary">
                                {selectedUser ? `Send Coupon to ${selectedUser.name}` : 'Create General Coupon'}
                            </h2>
                            <button onClick={() => setIsCouponModalOpen(false)} className="text-text-secondary hover:text-red-500">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateCoupon} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Coupon Code</label>
                                <input
                                    required
                                    type="text"
                                    value={couponData.code}
                                    onChange={e => setCouponData({ ...couponData, code: e.target.value.toUpperCase() })}
                                    className="w-full bg-background border border-secondary/20 p-2 rounded-sm font-mono tracking-widest uppercase"
                                    placeholder="SUMMER2026"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Discount Percentage (%)</label>
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={couponData.discountValue}
                                    onChange={e => setCouponData({ ...couponData, discountValue: e.target.value })}
                                    className="w-full bg-background border border-secondary/20 p-2 rounded-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Expiry Date</label>
                                <input
                                    required
                                    type="date"
                                    value={couponData.expiryDate}
                                    onChange={e => setCouponData({ ...couponData, expiryDate: e.target.value })}
                                    className="w-full bg-background border border-secondary/20 p-2 rounded-sm"
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsCouponModalOpen(false)} className="px-4 py-2 text-sm font-medium text-text-secondary hover:bg-secondary/10 rounded-sm">Cancel</button>
                                <button type="submit" className="px-6 py-2 text-sm font-bold uppercase tracking-widest bg-primary text-surface hover:bg-accent hover:text-primary transition-colors rounded-sm">Create Coupon</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
