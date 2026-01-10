import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../context/ProductContext';
import { useOrders } from '../../context/OrderContext';
import { useSocket } from '../../context/SocketContext';
import { useCurrency } from '../../context/CurrencyContext';
import { Navigate } from 'react-router-dom';
import { Users, ShoppingBag, Package, Settings, LogOut, Check, X, Plus, Edit2, Trash2, Eye, FileText, TicketPercent, ChevronDown, ChevronUp, Clock, CheckCircle, Truck, PackageCheck, Menu, LineChart as ChartIcon, Mail } from 'lucide-react';
import client from '../../api/client';
import Logo from '../../assets/SIRABALOGO.png';

const AdminDashboard = () => {
    const { isAdmin, logout } = useAuth();
    const { products, addProduct, updateProduct, deleteProduct, homeContent, updateHomeContent } = useProducts();
    const { orders, updateOrderStatus } = useOrders();
    const { activeUsers } = useSocket();
    const { formatPrice } = useCurrency();

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
        expiryDate: '',
        maxUses: ''
    });

    // B2B State
    const [b2bSection, setB2bSection] = useState('requests'); // requests, calculator, documents
    const [distributors, setDistributors] = useState([]);
    const [samples, setSamples] = useState([]);

    // Default Admin Settings for Calculator (In real app, fetch from backend)
    // Admin B2B Settings
    const [adminPricingProducts, setAdminPricingProducts] = useState([]);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [editingContent, setEditingContent] = useState(homeContent);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [contactMessages, setContactMessages] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [certSettings, setCertSettings] = useState({
        title: '',
        description: '',
        images: [],
        sectionTitle: '',
        sectionDescription: '',
        cards: []
    });

    React.useEffect(() => {
        // Fetch cert settings on load
        client.get('/settings/certifications').then(({ data }) => setCertSettings(data)).catch(console.error);
    }, []);

    React.useEffect(() => {
        setEditingContent(homeContent);
    }, [homeContent]);

    const handleSaveContent = () => {
        updateHomeContent(editingContent);
        alert('Homepage content updated successfully!');
    };

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
            } else if (activeTab === 'b2b') {
                try {
                    const [inqRes, distRes, sampRes, setRes] = await Promise.all([
                        client.get('/inquiries'),
                        client.get('/b2b/distributors'),
                        client.get('/b2b/samples'),
                        client.get('/b2b/settings')
                    ]);
                    setInquiries(inqRes.data);
                    setDistributors(distRes.data);
                    setSamples(sampRes.data);

                    // Populate settings forms
                    if (setRes.data) {
                        setAdminPricingProducts(setRes.data.pricingProducts.map((p, i) => ({ ...p, id: i }))); // Add temp ID for UI list handling
                    }
                } catch (error) {
                    console.error("Failed to fetch B2B data", error);
                }
            } else if (activeTab === 'reports') {
                try {
                    const { data } = await client.get('/orders/analytics');
                    setAnalyticsData(data);
                } catch (error) {
                    console.error("Failed to fetch analytics", error);
                }
            } else if (activeTab === 'messages') {
                try {
                    const { data } = await client.get('/contact');
                    setContactMessages(data);
                } catch (error) {
                    console.error("Failed to fetch contact messages", error);
                }
            } else if (activeTab === 'coupons') {
                try {
                    const { data } = await client.get('/coupons');
                    setCoupons(data);
                } catch (error) {
                    console.error("Failed to fetch coupons", error);
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
        image2: '',
        images: [''], // Initialize with one empty slot
        fullDescription: '',
        ingredients: '',
        features: ''
    };

    const [currentProduct, setCurrentProduct] = useState(initialProductState);
    const [isEditingData, setIsEditingData] = useState(false);

    if (!isAdmin) {
        return <Navigate to="/admin" />;
    }

    // --- Product Handlers ---
    const handleImageUpload = (index) => async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const { data } = await client.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const newImages = [...currentProduct.images];
            newImages[index] = data;
            setCurrentProduct(prev => ({ ...prev, images: newImages }));
        } catch (error) {
            console.error('File upload error', error);
            alert('Image upload failed');
        }
    };

    const handleImageChange = (index, value) => {
        const newImages = [...currentProduct.images];
        newImages[index] = value;
        setCurrentProduct(prev => ({ ...prev, images: newImages }));
    };

    const addImageSlot = () => {
        if (currentProduct.images.length < 5) {
            setCurrentProduct(prev => ({ ...prev, images: [...prev.images, ''] }));
        }
    };

    const removeImageSlot = (index) => {
        if (currentProduct.images.length > 1) {
            const newImages = currentProduct.images.filter((_, i) => i !== index);
            setCurrentProduct(prev => ({ ...prev, images: newImages }));
        }
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        const validImages = currentProduct.images.filter(img => img.trim() !== '');
        if (validImages.length < 1) {
            alert('Please add at least 1 image.');
            return;
        }

        const productToSave = {
            ...currentProduct,
            price: parseFloat(currentProduct.price),
            currency: '₹',
            rating: currentProduct.rating || 5,
            reviews: currentProduct.reviews || [],
            // Sync legacy fields
            image: validImages[0],
            image2: validImages[1] || '',
            images: validImages,
            fullDescription: currentProduct.fullDescription || '',
            ingredients: currentProduct.ingredients || '',
            features: typeof currentProduct.features === 'string'
                ? currentProduct.features.split(',').map(f => f.trim()).filter(Boolean)
                : currentProduct.features || []
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
        setCurrentProduct({
            ...product,
            images: product.images && product.images.length > 0 ? product.images : [product.image, product.image2].filter(Boolean),
            features: Array.isArray(product.features) ? product.features.join(', ') : product.features
        });
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
            expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            maxUses: '1'
        });
        setIsCouponModalOpen(true);
    };

    const handleCreateCoupon = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...couponData,
                discountValue: parseFloat(couponData.discountValue),
                discountType: 'percentage',
                maxUses: parseInt(couponData.maxUses)
            };
            if (activeTab === 'users' && selectedUser) {
                payload.assignedTo = selectedUser._id;
            } else {
                delete payload.assignedTo;
            }

            await client.post('/coupons', payload);
            alert('Coupon created successfully!');
            setIsCouponModalOpen(false);
            setCouponData({ code: '', discountValue: 10, expiryDate: '', maxUses: 1 });
            if (activeTab === 'coupons') {
                const { data } = await client.get('/coupons');
                setCoupons(data);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create coupon');
        }
    };

    const handleSaveB2BSettings = async () => {
        try {
            // Strip UI-only IDs if needed or backend ignores them. Backend schema expects objects without 'id' usually but mongoose handles extra fields gracefully or we strictly define schema.
            // Our schema is: pricingProducts: [{name, price}], exportDocs: [{name, type}]
            const payload = {
                pricingProducts: adminPricingProducts.map(({ name, price }) => ({ name, price }))
            };
            await client.put('/b2b/settings', payload);
            alert('Settings saved successfully!');
        } catch (error) {
            console.error('Save failed', error);
            alert('Failed to save settings.');
        }
    };

    const handlePrintInvoice = (order) => {
        const invoiceHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice #${order._id.slice(-8)}</title>
                <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
                <style>
                    body { font-family: 'Inter', sans-serif; padding: 40px; color: #1a1a1a; background: #fff; -webkit-print-color-adjust: exact; }
                    .invoice-container { max-width: 850px; margin: auto; padding: 40px; border: 1px solid #e5e7eb; box-shadow: 0 10px 30px rgba(0,0,0,0.05); position: relative; overflow: hidden; }
                    
                    /* Decorative Top Bar */
                    .invoice-container::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: 6px;
                        background: linear-gradient(90deg, #D4AF37, #F5D061, #D4AF37);
                    }

                    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 50px; padding-bottom: 20px; border-bottom: 2px solid #f3f4f6; }
                    .logo-section img { height: 80px; width: auto; object-fit: contain; }
                    .company-info { text-align: right; font-size: 13px; color: #6b7280; line-height: 1.6; }
                    .company-name { font-family: 'Cinzel', serif; font-size: 24px; font-weight: 700; color: #111827; margin-bottom: 5px; letter-spacing: 1px; }

                    .invoice-details { display: flex; justify-content: space-between; margin-bottom: 40px; }
                    .bill-to h3, .order-meta h3 { font-family: 'Cinzel', serif; font-size: 14px; color: #D4AF37; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 5px; display: inline-block; }
                    .bill-to p, .order-meta p { font-size: 14px; margin: 4px 0; color: #374151; }
                    .order-meta { text-align: right; }
                    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 99px; font-size: 11px; font-weight: 600; text-transform: uppercase; background: #f3f4f6; color: #374151; margin-top: 5px; }

                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    th { font-family: 'Cinzel', serif; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #fff; background: #1f2937; padding: 12px 16px; text-align: left; }
                    th:last-child { text-align: right; }
                    td { padding: 16px; border-bottom: 1px solid #f3f4f6; font-size: 14px; color: #374151; }
                    td:last-child { text-align: right; font-weight: 600; color: #111827; }
                    tr:last-child td { border-bottom: none; }
                    .item-name { font-weight: 600; color: #111827; display: block; margin-bottom: 4px; }
                    .item-sku { font-size: 11px; color: #9ca3af; }

                    .totals { width: 100%; display: flex; justify-content: flex-end; }
                    .totals-box { width: 300px; }
                    .total-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px; color: #6b7280; }
                    .total-row.final { font-family: 'Cinzel', serif; font-size: 18px; font-weight: 700; color: #111827; border-top: 2px solid #e5e7eb; margin-top: 10px; padding-top: 15px; }

                    .footer { text-align: center; margin-top: 60px; padding-top: 30px; border-top: 1px solid #f3f4f6; font-size: 12px; color: #9ca3af; }
                    .footer p { margin-bottom: 8px; }
                    .auth-sign { font-family: 'Cinzel', serif; color: #D4AF37; font-size: 16px; margin-top: 10px; }

                    @media print {
                        body { background: none; padding: 0; }
                        .invoice-container { box-shadow: none; border: none; margin: 0; padding: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="invoice-container">
                    <div class="header">
                        <div class="logo-section">
                            <img src="${Logo}" alt="Siraba Organic" />
                        </div>
                        <div class="company-info">
                            <div class="company-name">Siraba Organic</div>
                            <div>123 Saffron Valley, Pampore</div>
                            <div>Kashmir, India 192121</div>
                            <div>contact@sirabaorganic.com</div>
                            <div>+91 99066 93633</div>
                        </div>
                    </div>

                    <div class="invoice-details">
                        <div class="bill-to">
                            <h3>Bill To</h3>
                            <p><strong>${order.shippingAddress?.fullName || order.user?.name || 'Customer'}</strong></p>
                            <p>${order.shippingAddress?.address || ''}</p>
                            <p>${order.shippingAddress?.city || ''} ${order.shippingAddress?.postalCode ? ', ' + order.shippingAddress.postalCode : ''}</p>
                            <p>${order.shippingAddress?.country || ''}</p>
                            <p>${order.user?.email || 'N/A'}</p>
                        </div>
                        <div class="order-meta">
                            <h3>Invoice Details</h3>
                            <p><strong>Invoice No:</strong> #${order._id.slice(-8).toUpperCase()}</p>
                            <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                            <p><strong>Order ID:</strong> ${order._id}</p>
                            <span class="status-badge">${order.status}</span>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Item Description</th>
                                <th style="text-align: center;">Qty</th>
                                <th style="text-align: right;">Unit Price</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.orderItems.map(item => `
                                <tr>
                                    <td>
                                        <span class="item-name">${item.name}</span>
                                        <span class="item-sku">Premium Organic Selection</span>
                                    </td>
                                    <td style="text-align: center;">${item.quantity}</td>
                                    <td style="text-align: right;">₹${item.price.toFixed(2)}</td>
                                    <td>₹${(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="totals">
                        <div class="totals-box">
                            <div class="total-row">
                                <span>Subtotal</span>
                                <span>₹${order.totalPrice.toFixed(2)}</span>
                            </div>
                            <div class="total-row">
                                <span>Tax (Included)</span>
                                <span>₹0.00</span>
                            </div>
                            <div class="total-row">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                            <div class="total-row final">
                                <span>Grand Total</span>
                                <span>₹${order.totalPrice.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div class="footer">
                        <p>Thank you for choosing Siraba Organic.</p>
                        <p>For any queries, please contact support.</p>
                        <div class="auth-sign">Authorized Signatory</div>
                    </div>
                </div>
                <script>
                    window.onload = function() { setTimeout(() => window.print(), 500); }
                </script>
            </body>
            </html>
        `;

        const newWindow = window.open('', '_blank');
        newWindow.document.write(invoiceHTML);
        newWindow.document.close();
    };

    // --- Render Sections ---
    const renderStats = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-surface p-6 rounded-sm shadow-sm border border-secondary/10 flex items-center justify-between">
                <div>
                    <p className="text-text-secondary text-sm font-medium uppercase tracking-wider">Total Sales</p>
                    <h3 className="text-3xl font-bold text-primary mt-1">{formatPrice(orders.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0))}</h3>
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

    const [dateFilter, setDateFilter] = useState('all'); // 'all' or 'today'

    const renderOrders = () => {
        const filteredOrders = orders.filter(order => {
            if (dateFilter === 'today') {
                const orderDate = new Date(order.createdAt).toDateString();
                const today = new Date().toDateString();
                return orderDate === today;
            }
            return true;
        });

        return (
            <div className="bg-surface rounded-sm shadow-sm border border-secondary/10 overflow-hidden">
                <div className="p-6 border-b border-secondary/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-primary">Recent Orders</h2>
                        <p className="text-xs text-text-secondary mt-1">Manage order workflow: Pending → Approved → Packed → Shipped</p>
                    </div>
                    <div className="flex bg-secondary/5 rounded-sm p-1">
                        <button
                            onClick={() => setDateFilter('all')}
                            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-colors ${dateFilter === 'all' ? 'bg-white shadow-sm text-primary' : 'text-text-secondary hover:text-primary'}`}
                        >
                            All Orders
                        </button>
                        <button
                            onClick={() => setDateFilter('today')}
                            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-colors ${dateFilter === 'today' ? 'bg-white shadow-sm text-primary' : 'text-text-secondary hover:text-primary'}`}
                        >
                            Today
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-secondary/5 text-text-secondary font-medium uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 w-8"></th>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Items</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary/10">
                            {filteredOrders.map(order => {
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
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                                                    <span className="text-xs text-text-secondary">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </td>
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
                                            <td className="px-6 py-4 font-bold whitespace-nowrap">{formatPrice(order.totalPrice)}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-1">
                                                    <div className="relative">
                                                        <select
                                                            value={order.status}
                                                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                            className={`appearance-none px-3 py-1.5 pr-8 text-xs font-bold uppercase tracking-wider border rounded-sm focus:outline-none focus:ring-1 focus:ring-opacity-50 cursor-pointer
                                                            ${order.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 focus:ring-yellow-400' :
                                                                    order.status === 'Approved' ? 'bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-400' :
                                                                        order.status === 'Packed' ? 'bg-purple-50 text-purple-700 border-purple-200 focus:ring-purple-400' :
                                                                            order.status === 'Shipped' ? 'bg-indigo-50 text-indigo-700 border-indigo-200 focus:ring-indigo-400' :
                                                                                'bg-green-50 text-green-700 border-green-200 focus:ring-green-400'}`}
                                                        >
                                                            <option value="Pending">Placed</option>
                                                            <option value="Approved">Confirmed</option>
                                                            <option value="Packed">Packed</option>
                                                            <option value="Shipped">Shipped</option>
                                                            <option value="Delivered">Delivered</option>
                                                        </select>
                                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-secondary">
                                                            <ChevronDown size={12} />
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handlePrintInvoice(order)}
                                                        className="bg-white border border-secondary/20 hover:bg-secondary/5 text-text-secondary p-1.5 rounded-sm transition-colors"
                                                        title="Print Invoice"
                                                    >
                                                        <FileText size={16} />
                                                    </button>
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
                                                                            <p className="text-xs text-text-secondary">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                                                                        </div>
                                                                        <p className="font-bold text-primary">{formatPrice(item.quantity * item.price)}</p>
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
    }; const renderProducts = () => (
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
                                <td className="px-6 py-4 font-bold">{formatPrice(product.price)}</td>
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

    const handleSaveCertSettings = async () => {
        await client.put('/settings/certifications', certSettings);
        alert('Certification content saved!');
    };

    const defaultCards = [
        {
            title: "Global B2B Solutions",
            description: "We are having B2B business scenario and accordingly we do offer to you on your requirements and budget. We are flexible to accept orders even for small quantity of the products depends upon country and availability.",
            icon: ""
        },
        {
            title: "Multiple Certifications",
            description: "We have multiple organic certificates for organic cultivation, organic processing and handling of organic productions. We adhere to rigorous international standards.",
            icon: ""
        },
        {
            title: "Fine Trace Management",
            description: "We implement the fine trace management in producing. Please contact us if you are refused by other companies because of quantity or complicity of your order.",
            icon: ""
        }
    ];

    const loadDefaultCards = () => {
        if (window.confirm("This will replace current cards with the default 3 cards. Continue?")) {
            setCertSettings(prev => ({ ...prev, cards: defaultCards }));
        }
    };

    const handleCardImageUpload = (cardIndex) => async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        try {
            const { data } = await client.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            const newCards = [...(certSettings.cards || [])];
            newCards[cardIndex].icon = data;
            setCertSettings(prev => ({ ...prev, cards: newCards }));
        } catch (error) {
            console.error('File upload error', error);
            alert('Icon upload failed');
        }
    };

    // Helper to add card
    const addCard = () => {
        setCertSettings(prev => ({
            ...prev,
            cards: [...(prev.cards || []), { title: 'New Certification', description: 'Description here...', icon: '' }]
        }));
    };

    const removeCard = (index) => {
        setCertSettings(prev => ({
            ...prev,
            cards: prev.cards.filter((_, i) => i !== index)
        }));
    };

    const updateCard = (index, field, value) => {
        const newCards = [...(certSettings.cards || [])];
        newCards[index][field] = value;
        setCertSettings(prev => ({ ...prev, cards: newCards }));
    };

    const renderUsers = () => (
        <div className="bg-surface rounded-sm shadow-sm border border-secondary/10 overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-secondary/10">
                <h2 className="text-xl font-bold text-primary">Registered Users</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-secondary/5 text-text-secondary font-medium uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Admin</th>
                            <th className="px-6 py-4">Joined</th>
                            <th className="px-6 py-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary/10">
                        {users.map(user => (
                            <tr key={user._id} className="hover:bg-secondary/5 transition-colors">
                                <td className="px-6 py-4 font-medium text-primary">{user.name}</td>
                                <td className="px-6 py-4 text-text-secondary">{user.email}</td>
                                <td className="px-6 py-4">
                                    {user.isAdmin ?
                                        <span className="text-green-600 font-bold text-xs uppercase bg-green-50 px-2 py-1 rounded-full">Admin</span> :
                                        <span className="text-text-secondary text-xs uppercase">User</span>
                                    }
                                </td>
                                <td className="px-6 py-4 text-xs text-text-secondary">{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleOpenCouponModal(user)}
                                        className="text-accent hover:text-primary transition-colors flex items-center gap-1 text-xs font-bold uppercase tracking-wider"
                                    >
                                        <TicketPercent size={14} /> Send Coupon
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-surface rounded-sm shadow-sm border border-secondary/10 p-6">
                <h2 className="text-xl font-bold text-primary mb-6">Homepage Content</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Subheading</label>
                        <input
                            type="text"
                            value={editingContent?.subheading || ''}
                            onChange={(e) => setEditingContent({ ...editingContent, subheading: e.target.value })}
                            className="w-full bg-background border border-secondary/20 p-3 rounded-sm focus:border-accent outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Heading</label>
                        <input
                            type="text"
                            value={editingContent?.heading || ''}
                            onChange={(e) => setEditingContent({ ...editingContent, heading: e.target.value })}
                            className="w-full bg-background border border-secondary/20 p-3 rounded-sm focus:border-accent outline-none"
                        />
                    </div>

                    <div className="pt-4 border-t border-secondary/10">
                        <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Signature Collection Products</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[0, 1].map((index) => (
                                <div key={index}>
                                    <label className="block text-xs font-bold uppercase text-text-secondary mb-1">Slot {index + 1}</label>
                                    <select
                                        value={editingContent?.signatureProducts?.[index] || ''}
                                        onChange={(e) => {
                                            const newSignatureProducts = [...(editingContent?.signatureProducts || [])];
                                            newSignatureProducts[index] = e.target.value;
                                            setEditingContent({ ...editingContent, signatureProducts: newSignatureProducts.filter(Boolean) });
                                        }}
                                        className="w-full bg-background border border-secondary/20 p-2 rounded-sm focus:border-accent outline-none text-sm"
                                    >
                                        <option value="">Select Product...</option>
                                        {products.map(p => (
                                            <option key={p._id || p.id} value={p._id || p.id}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-secondary/10 mt-4">
                        <button
                            onClick={handleSaveContent}
                            className="bg-primary text-surface px-8 py-3 text-sm font-medium uppercase tracking-wider hover:bg-accent hover:text-primary transition-colors rounded-sm shadow-md"
                        >
                            Save Home Content
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-surface rounded-sm shadow-sm border border-secondary/10 p-6 h-fit">
                <h2 className="text-xl font-bold text-primary mb-6">Certifications Content</h2>
                <div className="space-y-6">
                    {/* Top Section */}
                    <div className="pb-6 border-b border-secondary/10 space-y-4">
                        <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Top Section (Hero)</h3>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Hero Title</label>
                            <input
                                type="text"
                                value={certSettings.title || ''}
                                onChange={(e) => setCertSettings({ ...certSettings, title: e.target.value })}
                                className="w-full bg-background border border-secondary/20 p-3 rounded-sm focus:border-accent outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Hero Description</label>
                            <textarea
                                rows={3}
                                value={certSettings.description || ''}
                                onChange={(e) => setCertSettings({ ...certSettings, description: e.target.value })}
                                className="w-full bg-background border border-secondary/20 p-3 rounded-sm focus:border-accent outline-none resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Hero Image</label>
                            <input
                                type="text"
                                value={certSettings?.images?.[0] || ''}
                                onChange={(e) => setCertSettings({ ...certSettings, images: [e.target.value] })}
                                className="w-full bg-background border border-secondary/20 p-2 rounded-sm mb-2 text-sm"
                                placeholder="Image URL"
                            />
                            {/* Re-using handleImageUpload logic but adapting might be needed if I removed it... assume I didn't fully remove, let's just make a dedicated one if needed. I'll stick to URL input for now or add upload if requested specifically for this image again. The card image upload is below. */}
                        </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="pb-6 border-b border-secondary/10 space-y-4">
                        <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Bottom Section (Our Certification)</h3>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Section Title</label>
                            <input
                                type="text"
                                value={certSettings.sectionTitle || ''}
                                onChange={(e) => setCertSettings({ ...certSettings, sectionTitle: e.target.value })}
                                className="w-full bg-background border border-secondary/20 p-3 rounded-sm focus:border-accent outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Section Description</label>
                            <textarea
                                rows={3}
                                value={certSettings.sectionDescription || ''}
                                onChange={(e) => setCertSettings({ ...certSettings, sectionDescription: e.target.value })}
                                className="w-full bg-background border border-secondary/20 p-3 rounded-sm focus:border-accent outline-none resize-none"
                            />
                        </div>
                    </div>

                    {/* Cards */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Certification Cards</h3>
                            <div className="flex gap-2">
                                <button onClick={loadDefaultCards} className="text-xs bg-secondary/10 text-text-secondary px-2 py-1 rounded-sm uppercase font-bold hover:bg-secondary/20 transition-colors">
                                    Load Defaults
                                </button>
                                <button onClick={addCard} className="text-xs bg-primary text-surface px-2 py-1 rounded-sm uppercase font-bold hover:bg-accent hover:text-primary transition-colors">
                                    + Add Card
                                </button>
                            </div>
                        </div>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {certSettings.cards?.map((card, idx) => (
                                <div key={idx} className="bg-background border border-secondary/20 p-4 rounded-sm relative group">
                                    <button onClick={() => removeCard(idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 size={16} />
                                    </button>
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={card.title}
                                            onChange={(e) => updateCard(idx, 'title', e.target.value)}
                                            className="w-full bg-surface border border-secondary/10 p-2 rounded-sm text-sm font-bold text-primary"
                                            placeholder="Card Title"
                                        />
                                        <textarea
                                            rows={2}
                                            value={card.description}
                                            onChange={(e) => updateCard(idx, 'description', e.target.value)}
                                            className="w-full bg-surface border border-secondary/10 p-2 rounded-sm text-xs resize-none"
                                            placeholder="Card Description"
                                        />
                                        <div className="flex items-center gap-2">
                                            {card.icon && <img src={card.icon} alt="Icon" className="w-8 h-8 object-contain" />}
                                            <input
                                                type="text"
                                                value={card.icon || ''}
                                                onChange={(e) => updateCard(idx, 'icon', e.target.value)}
                                                className="flex-1 bg-surface border border-secondary/10 p-1.5 rounded-sm text-xs"
                                                placeholder="Icon URL"
                                            />
                                            <label className="bg-secondary/10 p-1.5 rounded-sm cursor-pointer hover:bg-secondary/20 transition-colors">
                                                <Plus size={14} />
                                                <input type="file" className="hidden" onChange={handleCardImageUpload(idx)} accept="image/*" />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-secondary/10 mt-4">
                        <button
                            onClick={handleSaveCertSettings}
                            className="bg-primary text-surface px-8 py-3 text-sm font-medium uppercase tracking-wider hover:bg-accent hover:text-primary transition-colors rounded-sm shadow-md"
                        >
                            Save Certifications
                        </button>
                    </div>
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

    const renderB2B = () => (
        <div className="space-y-6">
            {/* B2B Sub-navigation */}
            <div className="flex bg-surface rounded-sm shadow-sm overflow-hidden p-1 border border-secondary/10 w-fit">
                {['requests', 'calculator'].map(opt => (
                    <button
                        key={opt}
                        onClick={() => setB2bSection(opt)}
                        className={`px-6 py-2 text-sm font-bold uppercase tracking-wider rounded-sm transition-all
                            ${b2bSection === opt ? 'bg-primary text-surface shadow-md' : 'text-text-secondary hover:text-primary hover:bg-secondary/5'}`}
                    >
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </button>
                ))}
            </div>

            {b2bSection === 'requests' && (
                <div className="space-y-8">
                    {/* Trade Inquiries Table */}
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
                                        <th className="px-6 py-4">Contact</th>
                                        <th className="px-6 py-4">Interest</th>
                                        <th className="px-6 py-4">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-secondary/10">
                                    {inquiries.map(item => (
                                        <tr key={item._id} className="hover:bg-secondary/5">
                                            <td className="px-6 py-4 text-xs">{new Date(item.createdAt || Date.now()).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 font-bold">{item.companyName}</td>
                                            <td className="px-6 py-4">
                                                <div>{item.contactPerson}</div>
                                                <div className="text-xs text-text-secondary">{item.email}</div>
                                                <div className="text-xs text-text-secondary">{item.phone}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {item.productInterest?.map((p, i) => <span key={i} className="bg-secondary/10 px-1 py-0.5 rounded text-xs">{p}</span>)}
                                                </div>
                                                <div className="text-xs text-text-secondary mt-1">Qty: {item.quantity}</div>
                                            </td>
                                            <td className="px-6 py-4 text-xs italic">{item.message}</td>
                                        </tr>
                                    ))}
                                    {inquiries.length === 0 && <tr><td colSpan="5" className="p-6 text-center text-text-secondary">No inquiries found.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Distributor Applications Table */}
                    <div className="bg-surface rounded-sm shadow-sm border border-secondary/10 overflow-hidden">
                        <div className="p-6 border-b border-secondary/10">
                            <h2 className="text-xl font-bold text-primary">Partner Onboarding</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-secondary/5 text-text-secondary font-medium uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Business Name</th>
                                        <th className="px-6 py-4">Contact</th>
                                        <th className="px-6 py-4">Region/Stats</th>
                                        <th className="px-6 py-4">Message</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-secondary/10">
                                    {distributors.map(item => (
                                        <tr key={item._id} className="hover:bg-secondary/5">
                                            <td className="px-6 py-4 text-xs">{new Date(item.date || Date.now()).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 font-bold">{item.businessName}</td>
                                            <td className="px-6 py-4">
                                                <div>{item.contactName}</div>
                                                <div className="text-xs text-text-secondary">{item.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>{item.region}</div>
                                                <div className="text-xs text-text-secondary">{item.yearsInBusiness} yrs | {item.annualTurnover}</div>
                                            </td>
                                            <td className="px-6 py-4 text-xs italic">{item.message}</td>
                                        </tr>
                                    ))}
                                    {distributors.length === 0 && <tr><td colSpan="5" className="p-6 text-center text-text-secondary">No applications found.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Sample Requests Table */}
                    <div className="bg-surface rounded-sm shadow-sm border border-secondary/10 overflow-hidden">
                        <div className="p-6 border-b border-secondary/10">
                            <h2 className="text-xl font-bold text-primary">Sample Requests</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-secondary/5 text-text-secondary font-medium uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Company</th>
                                        <th className="px-6 py-4">Recipient</th>
                                        <th className="px-6 py-4">Items Required</th>
                                        <th className="px-6 py-4">Shipping Info</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-secondary/10">
                                    {samples.map(item => (
                                        <tr key={item._id} className="hover:bg-secondary/5">
                                            <td className="px-6 py-4 text-xs">{new Date(item.date || Date.now()).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 font-bold">{item.companyName}</td>
                                            <td className="px-6 py-4 md:whitespace-nowrap">{item.recipient || item.contactName}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {item.items?.map((p, i) => <span key={i} className="bg-secondary/10 px-1 py-0.5 rounded text-xs">{p}</span>)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs">
                                                <div>{item.address}</div>
                                                <span className="font-bold text-primary">Acc: {item.shippingAccount || 'N/A'}</span>
                                            </td>
                                        </tr>
                                    ))}
                                    {samples.length === 0 && <tr><td colSpan="5" className="p-6 text-center text-text-secondary">No sample requests found.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {b2bSection === 'calculator' && (
                <div className="bg-surface rounded-sm shadow-sm border border-secondary/10 p-6 max-w-2xl">
                    <h2 className="text-xl font-bold text-primary mb-6">Bulk Savings Calculator Settings</h2>
                    <p className="text-sm text-text-secondary mb-6">Update the base prices used in the B2B calculator.</p>
                    <div className="space-y-4">
                        {adminPricingProducts.map((prod, idx) => (
                            <div key={prod.id} className="flex items-center gap-4 bg-background p-4 border border-secondary/10 rounded-sm">
                                <div className="flex-grow">
                                    <label className="block text-xs font-bold uppercase text-text-secondary mb-1">Product Name</label>
                                    <input
                                        type="text"
                                        value={prod.name}
                                        onChange={(e) => {
                                            const newProds = [...adminPricingProducts];
                                            newProds[idx].name = e.target.value;
                                            setAdminPricingProducts(newProds);
                                        }}
                                        className="w-full bg-surface border-b border-secondary/20 py-1 focus:outline-none focus:border-accent font-medium text-primary"
                                    />
                                </div>
                                <div className="w-32">
                                    <label className="block text-xs font-bold uppercase text-text-secondary mb-1">Price / KG (₹)</label>
                                    <input
                                        type="number"
                                        value={prod.price}
                                        onChange={(e) => {
                                            const newProds = [...adminPricingProducts];
                                            newProds[idx].price = parseInt(e.target.value);
                                            setAdminPricingProducts(newProds);
                                        }}
                                        className="w-full bg-surface border-b border-secondary/20 py-1 focus:outline-none focus:border-accent font-bold text-primary"
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        const newProds = adminPricingProducts.filter((_, i) => i !== idx);
                                        setAdminPricingProducts(newProds);
                                    }}
                                    className="text-red-500 hover:bg-red-50 p-2 rounded-sm mt-3"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => setAdminPricingProducts([...adminPricingProducts, { id: Date.now(), name: 'New Product', price: 0 }])}
                            className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2 mt-4"
                        >
                            <Plus size={16} /> Add Product
                        </button>

                        <div className="pt-6 border-t border-secondary/10 mt-6">
                            <button onClick={handleSaveB2BSettings} className="bg-primary text-surface px-8 py-3 text-sm font-medium uppercase tracking-wider hover:bg-accent hover:text-primary transition-colors rounded-sm shadow-md">
                                Save Settings
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );


    const [messageFilter, setMessageFilter] = useState('all'); // all, new, read, closed
    const [messageDateFilter, setMessageDateFilter] = useState('all'); // all, today, week, month
    const [expandedMessage, setExpandedMessage] = useState(null);

    const handleUpdateMessageStatus = async (id, newStatus) => {
        try {
            const { data } = await client.put(`/contact/${id}/status`, { status: newStatus });
            setContactMessages(contactMessages.map(msg => msg._id === id ? data : msg));
        } catch (error) {
            console.error('Error updating message status:', error);
            alert('Failed to update message status');
        }
    };

    const handleDeleteMessage = async (id) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;
        try {
            await client.delete(`/contact/${id}`);
            setContactMessages(contactMessages.filter(msg => msg._id !== id));
            alert('Message deleted successfully');
        } catch (error) {
            console.error('Error deleting message:', error);
            alert('Failed to delete message');
        }
    };

    const renderMessages = () => {
        // Filter messages by status
        const filteredByStatus = messageFilter === 'all'
            ? contactMessages
            : contactMessages.filter(msg => {
                if (messageFilter === 'new') return msg.status === 'New';
                if (messageFilter === 'read') return msg.status === 'Read' || msg.status === 'Replied';
                if (messageFilter === 'closed') return msg.status === 'Closed';
                return true;
            });

        // Filter by date
        const filteredMessages = filteredByStatus.filter(msg => {
            if (messageDateFilter === 'all') return true;
            const msgDate = new Date(msg.createdAt);
            const now = new Date();

            if (messageDateFilter === 'today') {
                return msgDate.toDateString() === now.toDateString();
            } else if (messageDateFilter === 'week') {
                const weekAgo = new Date(now.setDate(now.getDate() - 7));
                return msgDate >= weekAgo;
            } else if (messageDateFilter === 'month') {
                const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
                return msgDate >= monthAgo;
            }
            return true;
        });

        const unreadCount = contactMessages.filter(m => m.status === 'New').length;
        const closedCount = contactMessages.filter(m => m.status === 'Closed').length;

        return (
            <div className="bg-surface rounded-sm shadow-sm border border-secondary/10 overflow-hidden animate-fade-in">
                <div className="p-6 border-b border-secondary/10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-primary">Contact Messages</h2>
                            <p className="text-xs text-text-secondary mt-1">
                                {unreadCount} new • {closedCount} closed • {filteredMessages.length} total
                            </p>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap gap-4">
                            {/* Status Filter */}
                            <div className="flex bg-secondary/5 rounded-sm p-1">
                                {[
                                    { key: 'all', label: 'All' },
                                    { key: 'new', label: 'New', badge: unreadCount },
                                    { key: 'read', label: 'Read' },
                                    { key: 'closed', label: 'Closed' }
                                ].map(filter => (
                                    <button
                                        key={filter.key}
                                        onClick={() => setMessageFilter(filter.key)}
                                        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-colors relative ${messageFilter === filter.key
                                            ? 'bg-white shadow-sm text-primary'
                                            : 'text-text-secondary hover:text-primary'
                                            }`}
                                    >
                                        {filter.label}
                                        {filter.badge > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full">
                                                {filter.badge}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Date Filter */}
                            <div className="flex bg-secondary/5 rounded-sm p-1">
                                {[
                                    { key: 'all', label: 'All Time' },
                                    { key: 'today', label: 'Today' },
                                    { key: 'week', label: 'Week' },
                                    { key: 'month', label: 'Month' }
                                ].map(filter => (
                                    <button
                                        key={filter.key}
                                        onClick={() => setMessageDateFilter(filter.key)}
                                        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-colors ${messageDateFilter === filter.key
                                            ? 'bg-white shadow-sm text-primary'
                                            : 'text-text-secondary hover:text-primary'
                                            }`}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-secondary/5 text-text-secondary font-medium uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Subject</th>
                                <th className="px-6 py-4">Preview</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary/10">
                            {filteredMessages.map(msg => {
                                const isExpanded = expandedMessage === msg._id;
                                const getStatusInfo = (status) => {
                                    const statusMap = {
                                        'New': { color: 'blue', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
                                        'Read': { color: 'yellow', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
                                        'Replied': { color: 'green', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
                                        'Closed': { color: 'gray', bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' }
                                    };
                                    return statusMap[status] || statusMap['New'];
                                };
                                const statusInfo = getStatusInfo(msg.status);

                                return (
                                    <React.Fragment key={msg._id}>
                                        <tr className={`hover:bg-secondary/5 transition-colors ${msg.status === 'New' ? 'bg-blue-50/30' : ''}`}>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-sm text-xs font-bold uppercase border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                                                    {msg.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col text-xs">
                                                    <span className="font-medium text-primary">{new Date(msg.createdAt).toLocaleDateString()}</span>
                                                    <span className="text-text-secondary">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-primary whitespace-nowrap">
                                                {msg.firstName} {msg.lastName}
                                            </td>
                                            <td className="px-6 py-4">
                                                <a href={`mailto:${msg.email}`} className="text-accent hover:underline text-xs">
                                                    {msg.email}
                                                </a>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-secondary/10 text-primary px-2 py-1 rounded-sm text-xs font-bold">
                                                    {msg.subject}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 max-w-xs">
                                                <button
                                                    onClick={() => setExpandedMessage(isExpanded ? null : msg._id)}
                                                    className="text-text-secondary hover:text-primary text-left truncate max-w-[200px] text-xs"
                                                    title={msg.message}
                                                >
                                                    {msg.message}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => setExpandedMessage(isExpanded ? null : msg._id)}
                                                        className="bg-white border border-secondary/20 hover:bg-secondary/5 text-primary p-1.5 rounded-sm transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                    {msg.status === 'New' && (
                                                        <button
                                                            onClick={() => handleUpdateMessageStatus(msg._id, 'Read')}
                                                            className="bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 p-1.5 rounded-sm transition-colors"
                                                            title="Mark as Read"
                                                        >
                                                            <Check size={14} />
                                                        </button>
                                                    )}
                                                    {msg.status !== 'Closed' && (
                                                        <button
                                                            onClick={() => handleUpdateMessageStatus(msg._id, 'Closed')}
                                                            className="bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 p-1.5 rounded-sm transition-colors"
                                                            title="Close"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteMessage(msg._id)}
                                                        className="bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 p-1.5 rounded-sm transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr className="bg-secondary/5">
                                                <td colSpan="7" className="px-6 py-6">
                                                    <div className="bg-white rounded-sm border border-secondary/10 p-6 max-w-4xl">
                                                        <h3 className="text-sm font-bold text-primary mb-4 uppercase tracking-wider">Message Details</h3>
                                                        <div className="space-y-4">
                                                            <div>
                                                                <label className="block text-xs font-bold uppercase text-text-secondary mb-1">Full Message</label>
                                                                <p className="text-sm text-primary bg-background p-4 rounded-sm border border-secondary/10">
                                                                    {msg.message}
                                                                </p>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                                                <div>
                                                                    <span className="block text-text-secondary uppercase font-bold mb-1">Submitted</span>
                                                                    <span className="text-primary">{new Date(msg.createdAt).toLocaleString()}</span>
                                                                </div>
                                                                {msg.readAt && (
                                                                    <div>
                                                                        <span className="block text-text-secondary uppercase font-bold mb-1">Read At</span>
                                                                        <span className="text-primary">{new Date(msg.readAt).toLocaleString()}</span>
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <span className="block text-text-secondary uppercase font-bold mb-1">Contact</span>
                                                                    <a href={`mailto:${msg.email}`} className="text-accent hover:underline">
                                                                        Reply via Email
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                            {filteredMessages.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-text-secondary">
                                        No messages found for the selected filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const handleDeleteCoupon = async (id) => {
        if (!window.confirm("Are you sure you want to delete this coupon?")) return;
        try {
            await client.delete(`/coupons/${id}`);
            setCoupons(coupons.filter(c => c._id !== id));
            alert("Coupon deleted");
        } catch (error) {
            console.error(error);
            alert("Failed to delete coupon");
        }
    };

    const renderCoupons = () => (
        <div className="bg-surface rounded-sm shadow-sm border border-secondary/10 overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-secondary/10 flex justify-between items-center">
                <h2 className="text-xl font-bold text-primary">Coupon Management</h2>
                <button
                    onClick={() => handleOpenCouponModal(null)}
                    className="bg-primary text-surface px-4 py-2 rounded-sm text-sm font-bold uppercase tracking-wider hover:bg-accent hover:text-primary transition-colors flex items-center gap-2"
                >
                    <Plus size={16} /> Create Coupon
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-secondary/5 text-text-secondary font-medium uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Code</th>
                            <th className="px-6 py-4">Discount</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Assigned To</th>
                            <th className="px-6 py-4">Expiry</th>
                            <th className="px-6 py-4">Usage</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary/10">
                        {coupons.map(coupon => (
                            <tr key={coupon._id} className="hover:bg-secondary/5 transition-colors">
                                <td className="px-6 py-4 font-bold font-mono text-primary">{coupon.code}</td>
                                <td className="px-6 py-4 font-bold text-accent">{coupon.discountValue}%</td>
                                <td className="px-6 py-4 text-xs uppercase">{coupon.assignedTo ? 'User Specific' : 'General'}</td>
                                <td className="px-6 py-4 text-text-secondary">
                                    {coupon.assignedTo ? (
                                        <div className="flex flex-col text-xs">
                                            <span className="font-bold">{coupon.assignedTo.name}</span>
                                            <span>{coupon.assignedTo.email}</span>
                                        </div>
                                    ) : <span className="text-xs text-text-secondary italic">Anyone</span>}
                                </td>
                                <td className="px-6 py-4 text-xs text-text-secondary">
                                    {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'No Expiry'}
                                </td>
                                <td className="px-6 py-4 text-xs">
                                    {coupon.usedCount} / {coupon.maxUses}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-sm text-xs font-bold uppercase ${new Date(coupon.expiryDate) < new Date() ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                                        {new Date(coupon.expiryDate) < new Date() ? 'Expired' : 'Active'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button onClick={() => handleDeleteCoupon(coupon._id)} className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors" title="Delete Coupon">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {coupons.length === 0 && (
                            <tr>
                                <td colSpan="8" className="px-6 py-8 text-center text-text-secondary">
                                    No coupons active.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderReports = () => {
        if (!analyticsData) return <div className="p-12 text-center text-text-secondary">Loading Analytics...</div>;

        const maxSales = Math.max(...(analyticsData.salesByDate?.map(d => d.totalSales) || [100]), 100);
        const maxDemand = Math.max(...(analyticsData.mostDemanding?.map(p => p.totalQuantity) || [1]), 1);
        const maxRevenue = Math.max(...(analyticsData.topRevenueProducts?.map(p => p.totalRevenue) || [1]), 1);

        const downloadCSV = () => {
            const headers = ['Date', 'Orders', 'Revenue'];
            const rows = analyticsData.salesByDate.map(d => [d._id, d.count, d.totalSales.toFixed(2)]);
            const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "sales_report.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        return (
            <div className="space-y-8 animate-fade-in">
                {/* Business Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-surface p-6 rounded-sm shadow-sm border border-secondary/10">
                        <p className="text-xs uppercase tracking-wider text-text-secondary mb-1">Total Revenue</p>
                        <p className="text-2xl font-bold text-primary">{formatPrice(analyticsData.totalRevenue)}</p>
                        <p className="text-xs text-green-600 mt-2">↑ All time</p>
                    </div>
                    <div className="bg-surface p-6 rounded-sm shadow-sm border border-secondary/10">
                        <p className="text-xs uppercase tracking-wider text-text-secondary mb-1">Total Orders</p>
                        <p className="text-2xl font-bold text-primary">{analyticsData.totalOrders}</p>
                        <p className="text-xs text-text-secondary mt-2">All statuses</p>
                    </div>
                    <div className="bg-surface p-6 rounded-sm shadow-sm border border-secondary/10">
                        <p className="text-xs uppercase tracking-wider text-text-secondary mb-1">Completed Orders</p>
                        <p className="text-2xl font-bold text-green-600">{analyticsData.completedOrders || 0}</p>
                        <p className="text-xs text-text-secondary mt-2">{formatPrice(analyticsData.completedRevenue || 0)} revenue</p>
                    </div>
                    <div className="bg-surface p-6 rounded-sm shadow-sm border border-secondary/10">
                        <p className="text-xs uppercase tracking-wider text-text-secondary mb-1">Average Order Value</p>
                        <p className="text-2xl font-bold text-primary">{formatPrice(analyticsData.totalRevenue / (analyticsData.totalOrders || 1))}</p>
                        <p className="text-xs text-text-secondary mt-2">Per order</p>
                    </div>
                </div>

                {/* Graph Row 1: Completed vs Pending + Sales Trend */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Completed vs Pending - Pie Chart */}
                    <div className="bg-surface p-6 rounded-sm shadow-sm border border-secondary/10">
                        <h3 className="text-lg font-bold text-primary mb-6">Order Status: Completed vs Pending</h3>
                        <div className="flex items-center justify-center gap-8">
                            {/* Simple CSS Pie Chart */}
                            <div className="relative w-48 h-48">
                                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                                    {/* Completed (Green) */}
                                    <circle
                                        r="40"
                                        cx="50"
                                        cy="50"
                                        fill="transparent"
                                        stroke="#10b981"
                                        strokeWidth="20"
                                        strokeDasharray={`${((analyticsData.completedOrders || 0) / (analyticsData.totalOrders || 1) * 251.2)} 251.2`}
                                        className="transition-all duration-500"
                                    />
                                    {/* Pending (Orange) */}
                                    <circle
                                        r="40"
                                        cx="50"
                                        cy="50"
                                        fill="transparent"
                                        stroke="#f59e0b"
                                        strokeWidth="20"
                                        strokeDasharray={`${((analyticsData.pendingOrders || 0) / (analyticsData.totalOrders || 1) * 251.2)} 251.2`}
                                        strokeDashoffset={`-${((analyticsData.completedOrders || 0) / (analyticsData.totalOrders || 1) * 251.2)}`}
                                        className="transition-all duration-500"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-primary">{analyticsData.totalOrders}</p>
                                        <p className="text-xs text-text-secondary">Total</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
                                    <div>
                                        <p className="text-sm font-bold text-primary">Completed</p>
                                        <p className="text-xs text-text-secondary">{analyticsData.completedOrders || 0} orders ({((analyticsData.completedOrders || 0) / (analyticsData.totalOrders || 1) * 100).toFixed(0)}%)</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 bg-orange-500 rounded-sm"></div>
                                    <div>
                                        <p className="text-sm font-bold text-primary">Pending</p>
                                        <p className="text-xs text-text-secondary">{analyticsData.pendingOrders || 0} orders ({((analyticsData.pendingOrders || 0) / (analyticsData.totalOrders || 1) * 100).toFixed(0)}%)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sales Trend (Last 7 Days) - Enhanced */}
                    <div className="bg-surface p-6 rounded-sm shadow-sm border border-secondary/10">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-primary">Sales Trend (Last 7 Days)</h3>
                                <p className="text-xs text-text-secondary mt-1">Daily revenue and order count</p>
                            </div>
                            <button onClick={downloadCSV} className="text-xs text-accent uppercase font-bold tracking-wider hover:underline flex items-center gap-1">
                                <FileText size={14} />
                                Download CSV
                            </button>
                        </div>

                        {/* Chart with gridlines and improved visualization */}
                        <div className="relative">
                            {/* Y-axis labels */}
                            <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-right pr-2">
                                <span className="text-[10px] text-text-secondary">{formatPrice(maxSales)}</span>
                                <span className="text-[10px] text-text-secondary">{formatPrice(maxSales * 0.75)}</span>
                                <span className="text-[10px] text-text-secondary">{formatPrice(maxSales * 0.5)}</span>
                                <span className="text-[10px] text-text-secondary">{formatPrice(maxSales * 0.25)}</span>
                                <span className="text-[10px] text-text-secondary">0</span>
                            </div>

                            {/* Chart area */}
                            <div className="ml-14">
                                {/* Horizontal gridlines */}
                                <div className="relative h-56">
                                    <div className="absolute inset-0 flex flex-col justify-between">
                                        {[0, 1, 2, 3, 4].map(i => (
                                            <div key={i} className="border-t border-dashed border-secondary/20"></div>
                                        ))}
                                    </div>

                                    {/* Bars */}
                                    <div className="absolute inset-0 flex items-end justify-between gap-2 pt-4">
                                        {analyticsData.salesByDate && analyticsData.salesByDate.length > 0 ? analyticsData.salesByDate.map((day) => {
                                            const date = new Date(day._id);
                                            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                                            const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                            const heightPercent = (day.totalSales / maxSales) * 100;

                                            return (
                                                <div key={day._id} className="flex flex-col items-center gap-2 flex-1 group relative">
                                                    {/* Bar with value on top */}
                                                    <div className="w-full flex flex-col items-center">
                                                        {/* Value display on bar */}
                                                        <div className={`text-[10px] font-bold mb-1 transition-opacity ${heightPercent > 20 ? 'text-primary' : 'text-text-secondary'}`}>
                                                            {formatPrice(day.totalSales)}
                                                        </div>

                                                        {/* Bar */}
                                                        <div
                                                            className="w-full bg-gradient-to-t from-accent to-accent/60 hover:from-primary hover:to-primary/80 transition-all rounded-t-md relative shadow-sm"
                                                            style={{ height: `${Math.max(heightPercent, 5)}%` }}
                                                        >
                                                            {/* Enhanced tooltip */}
                                                            <div className="opacity-0 group-hover:opacity-100 absolute -top-16 left-1/2 transform -translate-x-1/2 bg-primary text-surface text-xs py-2 px-3 rounded-md shadow-lg z-10 pointer-events-none transition-opacity whitespace-nowrap">
                                                                <div className="font-bold mb-1">{dayName}, {monthDay}</div>
                                                                <div>Revenue: {formatPrice(day.totalSales)}</div>
                                                                <div>Orders: {day.count}</div>
                                                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-primary"></div>
                                                            </div>

                                                            {/* Order count badge */}
                                                            {heightPercent > 15 && (
                                                                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-white/90 text-primary text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                                                    {day.count}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Date labels */}
                                                    <div className="text-center">
                                                        <div className="text-[10px] font-bold text-primary">{dayName}</div>
                                                        <div className="text-[9px] text-text-secondary">{monthDay}</div>
                                                    </div>
                                                </div>
                                            );
                                        }) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <p className="text-sm text-text-secondary">No sales data available for this period</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Graph Row 2: Most Demanding Products */}
                <div className="bg-surface p-6 rounded-sm shadow-sm border border-secondary/10">
                    <h3 className="text-lg font-bold text-primary mb-6">Most Demanding Products (Top 5)</h3>
                    <div className="space-y-4">
                        {analyticsData.mostDemanding && analyticsData.mostDemanding.length > 0 ? analyticsData.mostDemanding.map((product, idx) => (
                            <div key={idx} className="group">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-bold text-primary">{product.name}</p>
                                    <p className="text-xs text-accent font-bold">{product.totalQuantity} units sold</p>
                                </div>
                                <div className="w-full bg-secondary/10 rounded-full h-8 relative overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full flex items-center px-3 transition-all duration-700"
                                        style={{ width: `${(product.totalQuantity / maxDemand) * 100}%` }}
                                    >
                                        <span className="text-white text-xs font-bold">{formatPrice(product.totalRevenue)}</span>
                                    </div>
                                </div>
                            </div>
                        )) : <p className="text-center text-sm text-text-secondary py-8">No product data available</p>}
                    </div>
                </div>

                {/* Graph Row 3: Least Demanding Products */}
                <div className="bg-surface p-6 rounded-sm shadow-sm border border-secondary/10">
                    <h3 className="text-lg font-bold text-primary mb-6">Least Demanding Products (Bottom 5)</h3>
                    <div className="space-y-4">
                        {analyticsData.leastDemanding && analyticsData.leastDemanding.length > 0 ? analyticsData.leastDemanding.map((product, idx) => (
                            <div key={idx}>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-bold text-primary">{product.name}</p>
                                    <p className="text-xs text-red-600 font-bold">{product.totalQuantity} units sold</p>
                                </div>
                                <div className="w-full bg-secondary/10 rounded-full h-8 relative overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-red-500 to-red-600 h-full rounded-full flex items-center px-3 transition-all duration-700"
                                        style={{ width: `${(product.totalQuantity / maxDemand) * 100}%` }}
                                    >
                                        <span className="text-white text-xs font-bold">{formatPrice(product.totalRevenue)}</span>
                                    </div>
                                </div>
                            </div>
                        )) : <p className="text-center text-sm text-text-secondary py-8">No product data available</p>}
                    </div>
                </div>

                {/* Graph Row 4: Top Revenue Products */}
                <div className="bg-surface p-6 rounded-sm shadow-sm border border-secondary/10">
                    <h3 className="text-lg font-bold text-primary mb-6">Top Revenue Generating Products (Top 5)</h3>
                    <div className="space-y-4">
                        {analyticsData.topRevenueProducts && analyticsData.topRevenueProducts.length > 0 ? analyticsData.topRevenueProducts.map((product, idx) => (
                            <div key={idx}>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-bold text-primary">{product.name}</p>
                                    <p className="text-xs text-primary font-bold">{formatPrice(product.totalRevenue)}</p>
                                </div>
                                <div className="w-full bg-secondary/10 rounded-full h-8 relative overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full flex items-center px-3 transition-all duration-700"
                                        style={{ width: `${(product.totalRevenue / maxRevenue) * 100}%` }}
                                    >
                                        <span className="text-white text-xs font-bold">{product.totalQuantity} units</span>
                                    </div>
                                </div>
                            </div>
                        )) : <p className="text-center text-sm text-text-secondary py-8">No product data available</p>}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-background pt-20 flex relative">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-10 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`w-64 bg-surface border-r border-secondary/10 fixed h-full left-0 top-20 z-20 transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6">
                    <div className="flex items-center gap-3 text-primary mb-8">
                        <Settings size={24} />
                        <span className="font-heading font-bold text-xl">Admin</span>
                    </div>
                    <nav className="space-y-2">
                        {[
                            { id: 'dashboard', icon: ShoppingBag, label: 'Dashboard' },
                            { id: 'products', icon: Package, label: 'Products' },
                            { id: 'b2b', icon: Truck, label: 'B2B Portal' },
                            { id: 'messages', icon: Mail, label: 'Messages' },
                            { id: 'coupons', icon: TicketPercent, label: 'Coupons' },
                            { id: 'reports', icon: ChartIcon, label: 'Analytics' },
                            { id: 'users', icon: Users, label: 'Users' },
                            { id: 'content', icon: Edit2, label: 'Content' }
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
            <main className="flex-grow md:ml-64 p-4 md:p-8 overflow-x-hidden">
                <div className="mb-8 flex items-center gap-4">
                    <button
                        className="md:hidden text-primary p-2 hover:bg-secondary/10 rounded-sm"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu size={24} />
                    </button>
                    <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary capitalize">{activeTab}</h1>
                </div>

                {activeTab === 'dashboard' && (
                    <>
                        {renderStats()}
                        {renderOrders()}
                    </>
                )}
                {activeTab === 'orders' && renderOrders()}
                {activeTab === 'products' && renderProducts()}
                {activeTab === 'b2b' && renderB2B()}
                {activeTab === 'users' && renderUsers()}
                {activeTab === 'messages' && renderMessages()}
                {activeTab === 'coupons' && renderCoupons()}
                {activeTab === 'content' && renderContent()}
                {activeTab === 'reports' && renderReports()}
            </main>

            {/* Product Modal */}
            {isProductModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-surface w-full max-w-4xl rounded-sm shadow-xl p-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-primary">{isEditingData ? 'Edit Product' : 'Add New Product'}</h2>
                            <button onClick={() => setIsProductModalOpen(false)} className="text-text-secondary hover:text-red-500">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveProduct} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column: Basic Details & Media */}
                                <div className="space-y-4">
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
                                            <select
                                                required
                                                value={currentProduct.category}
                                                onChange={e => setCurrentProduct({ ...currentProduct, category: e.target.value })}
                                                className="w-full bg-background border border-secondary/20 p-2 rounded-sm focus:border-accent outline-none appearance-none"
                                            >
                                                <option value="">Select Category</option>
                                                <option value="Spices">Spices</option>
                                                <option value="Dry Fruits">Dry Fruits</option>
                                                <option value="Honey">Honey</option>
                                                <option value="Oils">Oils</option>
                                                <option value="Tea">Tea</option>
                                                <option value="Herbs">Herbs</option>
                                                <option value="Gifts">Gifts</option>
                                            </select>
                                        </div>
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

                                    {/* Dynamic Image Fields */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <label className="block text-sm font-medium text-text-secondary">Product Images (Min 1, Max 5)</label>
                                            {currentProduct.images.length < 5 && (
                                                <button type="button" onClick={addImageSlot} className="text-xs text-primary font-bold uppercase hover:text-accent flex items-center gap-1">
                                                    <Plus size={14} /> Add Image
                                                </button>
                                            )}
                                        </div>
                                        {currentProduct.images.map((img, idx) => (
                                            <div key={idx} className="bg-background border border-secondary/20 p-3 rounded-sm relative">
                                                <div className="flex gap-2 items-center mb-2">
                                                    <span className="text-xs font-bold text-text-secondary w-6">#{idx + 1}</span>
                                                    <input
                                                        type="text"
                                                        value={img}
                                                        onChange={(e) => handleImageChange(idx, e.target.value)}
                                                        className="flex-grow bg-white border border-secondary/10 p-1.5 text-sm rounded-sm"
                                                        placeholder="Image URL"
                                                    />
                                                    <label className="bg-secondary/10 p-1.5 rounded-sm cursor-pointer hover:bg-secondary/20 transition-colors" title="Upload">
                                                        <Plus size={16} />
                                                        <input type="file" className="hidden" onChange={handleImageUpload(idx)} accept="image/*" />
                                                    </label>
                                                    {currentProduct.images.length > 1 && (
                                                        <button type="button" onClick={() => removeImageSlot(idx)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-sm">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                                {img && (
                                                    <div className="w-full h-32 bg-white flex items-center justify-center border border-secondary/5 rounded-sm overflow-hidden">
                                                        <img src={img} alt={`Preview ${idx + 1}`} className="max-w-full max-h-full object-contain" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Column: Descriptions & Details */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Short Description</label>
                                        <textarea required value={currentProduct.description} onChange={e => setCurrentProduct({ ...currentProduct, description: e.target.value })} className="w-full bg-background border border-secondary/20 p-2 rounded-sm h-32" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Full Description</label>
                                        <textarea value={currentProduct.fullDescription} onChange={e => setCurrentProduct({ ...currentProduct, fullDescription: e.target.value })} className="w-full bg-background border border-secondary/20 p-2 rounded-sm h-48" placeholder="Detailed product description..." />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Ingredients</label>
                                        <textarea value={currentProduct.ingredients} onChange={e => setCurrentProduct({ ...currentProduct, ingredients: e.target.value })} className="w-full bg-background border border-secondary/20 p-2 rounded-sm h-24" placeholder="List ingredients here..." />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Features (Comma separated)</label>
                                        <textarea value={currentProduct.features} onChange={e => setCurrentProduct({ ...currentProduct, features: e.target.value })} className="w-full bg-background border border-secondary/20 p-2 rounded-sm h-24" placeholder="Organic, Vegan, Gluten-Free..." />
                                    </div>
                                </div>
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
                                {selectedUser ? `Send Coupon to ${selectedUser.name}` : 'Create New Coupon'}
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
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Max Uses</label>
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    value={couponData.maxUses}
                                    onChange={e => setCouponData({ ...couponData, maxUses: e.target.value })}
                                    className="w-full bg-background border border-secondary/20 p-2 rounded-sm"
                                    placeholder="Number of times it can be used"
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
