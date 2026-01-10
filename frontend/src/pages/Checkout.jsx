import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useCurrency } from '../context/CurrencyContext';
import { MapPin, Phone, CreditCard, CheckCircle, Plus, Truck, AlertCircle, ChevronLeft } from 'lucide-react';

const Checkout = () => {
    const { user, updateProfile } = useAuth();
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { createOrder } = useOrders();
    const { formatPrice } = useCurrency();
    const navigate = useNavigate();
    const location = useLocation();

    // Get discount from navigation state
    const discount = location.state?.discount || { amount: 0, code: '' };

    const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
    const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
    const [loading, setLoading] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

    // New Address Form State
    const [newAddress, setNewAddress] = useState({
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        phone: ''
    });

    useEffect(() => {
        if (!user) {
            navigate('/login?redirect=checkout');
        } else if (cartItems.length === 0 && !orderSuccess) {
            navigate('/cart');
        }
    }, [user, cartItems, navigate, orderSuccess]);

    // Set default selected address if available
    useEffect(() => {
        if (user?.addresses?.length > 0) {
            const defaultIndex = user.addresses.findIndex(addr => addr.isDefault);
            setSelectedAddressIndex(defaultIndex >= 0 ? defaultIndex : 0);
        } else {
            setIsAddingNewAddress(true); // Force add address if none exist
        }
    }, [user]);

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setNewAddress(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Create updated addresses array
            const updatedAddresses = [...(user.addresses || []), { ...newAddress, isDefault: user.addresses?.length === 0 }];

            // If phone is not set on user profile, update it too
            const profileUpdate = {
                addresses: updatedAddresses,
                phone: user.phone || newAddress.phone
            };

            const res = await updateProfile(profileUpdate);
            if (res.success) {
                setIsAddingNewAddress(false);
                setSelectedAddressIndex(updatedAddresses.length - 1); // Select the new address
                // Reset form
                setNewAddress({
                    address: '',
                    city: '',
                    state: '',
                    postalCode: '',
                    country: 'India',
                    phone: ''
                });
            } else {
                alert(res.message);
            }
        } catch (error) {
            console.error("Error saving address:", error);
            alert("Failed to save address");
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (user?.addresses?.length === 0 && !isAddingNewAddress) {
            alert("Please add a shipping address");
            setIsAddingNewAddress(true);
            return;
        }

        if (isAddingNewAddress) {
            alert("Please save your address first");
            return;
        }

        const selectedAddress = user.addresses[selectedAddressIndex];
        if (!selectedAddress) {
            alert("Please select a valid address");
            return;
        }

        setLoading(true);

        const orderItems = cartItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            image: item.image,
            price: item.price,
            product: item._id || item.id
        }));

        const subtotal = getCartTotal();
        const discountedSubtotal = Math.max(0, subtotal - discount.amount);
        const taxPrice = discountedSubtotal * 0.18; // 18% Tax
        const shippingPrice = discountedSubtotal > 1000 ? 0 : 50;
        const totalPrice = discountedSubtotal + taxPrice + shippingPrice;

        const orderData = {
            orderItems,
            shippingAddress: selectedAddress,
            paymentMethod: 'COD',
            itemsPrice: subtotal,
            taxPrice,
            shippingPrice,
            totalPrice,
            // We can add discount info to backend later if needed
            // discountAmount: discount.amount, 
        };

        try {
            const newOrder = await createOrder(orderData);
            setOrderSuccess(true);
            clearCart();
            // Navigate to order success page
            navigate('/order-success', { state: { order: newOrder } });
        } catch (error) {
            alert('Failed to place order. Please try again.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    const subtotal = getCartTotal();
    const discountedSubtotal = Math.max(0, subtotal - discount.amount);
    const taxPrice = discountedSubtotal * 0.18;
    const shippingPrice = discountedSubtotal > 1000 ? 0 : 50;
    const totalPrice = discountedSubtotal + taxPrice + shippingPrice;

    return (
        <div className="min-h-screen bg-background pt-28 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="mb-8">
                    <Link to="/cart" className="inline-flex items-center text-secondary hover:text-primary transition-colors text-sm font-medium mb-4">
                        <ChevronLeft size={16} className="mr-1" /> Back to Cart
                    </Link>
                    <h1 className="font-heading text-3xl font-bold text-primary">Checkout</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Address & Payment */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Shipping Address Section */}
                        <div className="bg-surface p-8 rounded-sm shadow-sm border border-secondary/10">
                            <h2 className="font-heading text-xl font-bold text-primary mb-6 flex items-center">
                                <MapPin className="mr-2" size={20} /> Shipping Address
                            </h2>

                            {!isAddingNewAddress && user.addresses && user.addresses.length > 0 ? (
                                <div className="space-y-4">
                                    {user.addresses.map((addr, index) => (
                                        <div
                                            key={index}
                                            className={`relative border p-4 rounded-sm cursor-pointer transition-all ${selectedAddressIndex === index ? 'border-primary bg-primary/5' : 'border-secondary/20 hover:border-secondary/40'}`}
                                            onClick={() => setSelectedAddressIndex(index)}
                                        >
                                            <div className="flex items-start">
                                                <div className="mt-1 mr-3">
                                                    <div className={`w-4 h-4 rounded-full border border-primary flex items-center justify-center ${selectedAddressIndex === index ? 'bg-primary' : 'bg-transparent'}`}>
                                                        {selectedAddressIndex === index && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                                    </div>
                                                </div>
                                                <div className="flex-grow">
                                                    <p className="font-bold text-primary text-sm">{user.name}</p>
                                                    <p className="text-sm text-text-secondary">{addr.address}</p>
                                                    <p className="text-sm text-text-secondary">{addr.city}, {addr.state} {addr.postalCode}</p>
                                                    <p className="text-sm text-text-secondary">{addr.country}</p>
                                                    <p className="text-sm text-text-secondary mt-1 flex items-center"><Phone size={12} className="mr-1" /> {user.phone || addr.phone || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        onClick={() => setIsAddingNewAddress(true)}
                                        className="mt-4 flex items-center text-sm font-bold text-secondary hover:text-primary transition-colors uppercase tracking-wider"
                                    >
                                        <Plus size={16} className="mr-1" /> Add New Address
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSaveAddress} className="space-y-4 animate-fade-in">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1">Street Address</label>
                                            <input
                                                required
                                                type="text"
                                                name="address"
                                                value={newAddress.address}
                                                onChange={handleAddressChange}
                                                className="w-full bg-background border border-secondary/20 rounded-sm p-3 text-sm focus:outline-none focus:border-primary"
                                                placeholder="123 Organic Lane"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1">City</label>
                                            <input
                                                required
                                                type="text"
                                                name="city"
                                                value={newAddress.city}
                                                onChange={handleAddressChange}
                                                className="w-full bg-background border border-secondary/20 rounded-sm p-3 text-sm focus:outline-none focus:border-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1">State / Province</label>
                                            <input
                                                required
                                                type="text"
                                                name="state"
                                                value={newAddress.state}
                                                onChange={handleAddressChange}
                                                className="w-full bg-background border border-secondary/20 rounded-sm p-3 text-sm focus:outline-none focus:border-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1">Postal Code</label>
                                            <input
                                                required
                                                type="text"
                                                name="postalCode"
                                                value={newAddress.postalCode}
                                                onChange={handleAddressChange}
                                                className="w-full bg-background border border-secondary/20 rounded-sm p-3 text-sm focus:outline-none focus:border-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1">Phone Number</label>
                                            <input
                                                required
                                                type="tel"
                                                name="phone"
                                                value={newAddress.phone}
                                                onChange={handleAddressChange}
                                                className="w-full bg-background border border-secondary/20 rounded-sm p-3 text-sm focus:outline-none focus:border-primary"
                                                placeholder="+91 98765 43210"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-4 pt-4">
                                        {user?.addresses?.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => setIsAddingNewAddress(false)}
                                                className="text-text-secondary text-sm hover:text-primary transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="bg-primary text-white px-6 py-2 rounded-sm text-sm font-bold uppercase tracking-widest hover:bg-accent hover:text-primary transition-colors disabled:opacity-50"
                                        >
                                            {loading ? 'Saving...' : 'Save Address'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Payment Method */}
                        <div className="bg-surface p-8 rounded-sm shadow-sm border border-secondary/10">
                            <h2 className="font-heading text-xl font-bold text-primary mb-6 flex items-center">
                                <CreditCard className="mr-2" size={20} /> Payment Method
                            </h2>

                            <div className="p-4 border border-primary bg-primary/5 rounded-sm flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full border border-primary flex items-center justify-center bg-primary">
                                        <div className="w-2 h-2 rounded-full bg-white"></div>
                                    </div>
                                    <span className="font-bold text-primary text-sm">Cash on Delivery (COD)</span>
                                </div>
                                <Truck size={20} className="text-secondary" />
                            </div>
                            <p className="text-xs text-text-secondary mt-3 ml-1">
                                <AlertCircle size={10} className="inline mr-1" />
                                Pay securely with cash or UPI upon delivery.
                            </p>
                        </div>

                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-surface p-8 rounded-sm shadow-sm border border-secondary/10 sticky top-32">
                            <h2 className="font-heading text-xl font-bold text-primary mb-6">Order Summary</h2>

                            <div className="space-y-4 max-h-60 overflow-y-auto pr-2 mb-6 custom-scrollbar">
                                {cartItems.map((item) => (
                                    <div key={item._id || item.id} className="flex gap-4 items-start">
                                        <div className="w-16 h-16 bg-background rounded-sm border border-secondary/10 flex-shrink-0 p-1">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-grow">
                                            <p className="text-sm font-bold text-primary line-clamp-2">{item.name}</p>
                                            <p className="text-xs text-text-secondary mt-1">{item.quantity} x {formatPrice(item.price)}</p>
                                        </div>
                                        <p className="text-sm font-bold text-primary">{formatPrice(item.price * item.quantity)}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 pt-6 border-t border-secondary/10 text-sm">
                                <div className="flex justify-between text-text-secondary">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                                {discount.amount > 0 && (
                                    <div className="flex justify-between text-green-600 font-medium">
                                        <span>Discount ({discount.code})</span>
                                        <span>-{formatPrice(discount.amount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-text-secondary">
                                    <span>Shipping</span>
                                    <span>{shippingPrice === 0 ? 'Free' : formatPrice(shippingPrice)}</span>
                                </div>
                                <div className="flex justify-between text-text-secondary">
                                    <span>Tax (18% GST)</span>
                                    <span>{formatPrice(taxPrice)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-primary pt-3 border-t border-secondary/10 mt-3">
                                    <span>Total</span>
                                    <span>{formatPrice(totalPrice)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={loading}
                                className="w-full mt-6 bg-primary text-surface py-4 text-sm font-bold uppercase tracking-widest hover:bg-accent hover:text-primary transition-all duration-300 shadow-lg flex items-center justify-center gap-2 rounded-sm disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing...' : 'Place Order'}
                                {!loading && <CheckCircle size={18} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
