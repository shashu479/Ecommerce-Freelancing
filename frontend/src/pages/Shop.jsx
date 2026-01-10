import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Star, Info, ArrowRight, Filter, X, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

const Shop = () => {
    const { addToCart } = useCart();
    const { searchProducts } = useProducts();
    const { toggleWishlist, user } = useAuth();
    const { formatPrice } = useCurrency();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    // URL Params
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);

    // Filter State
    const [filters, setFilters] = useState({
        keyword: queryParams.get('keyword') || '',
        category: queryParams.get('category') || '',
        minPrice: queryParams.get('minPrice') || '',
        maxPrice: queryParams.get('maxPrice') || '',
        sort: queryParams.get('sort') || ''
    });

    useEffect(() => {
        const fetchFilteredProducts = async () => {
            setLoading(true);
            const params = {};
            if (filters.keyword) params.keyword = filters.keyword;
            if (filters.category) params.category = filters.category;
            if (filters.minPrice) params.minPrice = filters.minPrice;
            if (filters.maxPrice) params.maxPrice = filters.maxPrice;
            if (filters.sort) params.sort = filters.sort;

            const data = await searchProducts(params);
            setProducts(data);
            setLoading(false);
        };

        fetchFilteredProducts();
    }, [filters, searchProducts]);

    // Update filters when URL changes (e.g. from Navbar search)
    useEffect(() => {
        const currentParams = new URLSearchParams(location.search);
        setFilters(prev => ({
            ...prev,
            keyword: currentParams.get('keyword') || '',
            category: currentParams.get('category') || '',
            minPrice: currentParams.get('minPrice') || '',
            maxPrice: currentParams.get('maxPrice') || '',
            sort: currentParams.get('sort') || ''
        }));
    }, [location.search]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
        updateUrl(newFilters);
    };

    const updateUrl = (newFilters) => {
        const params = new URLSearchParams();
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value) params.append(key, value);
        });
        navigate({ search: params.toString() });
    };

    const clearFilters = () => {
        const emptyFilters = { keyword: '', category: '', minPrice: '', maxPrice: '', sort: '' };
        setFilters(emptyFilters);
        updateUrl(emptyFilters);
    };

    return (
        <div className="w-full pt-20 bg-background min-h-screen">
            {/* Header */}
            <div className="bg-primary pt-16 pb-12 px-4 text-center text-surface">
                <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-wide mb-4">Shop Premium Organics</h1>
                <p className="text-white/80 font-light max-w-2xl mx-auto text-lg">
                    Discover our exclusive collection of certified organic treasures. Directly from farm to your home.
                </p>
            </div>

            {/* Mobile Filter Toggle */}
            <div className="md:hidden px-4 py-4 flex justify-between items-center border-b border-secondary/10">
                <span className="text-primary font-bold">{products.length} Products</span>
                <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 text-primary border border-primary/20 px-3 py-2 rounded-sm text-sm uppercase tracking-wider">
                    <Filter size={16} /> Filters
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Sidebar / Filters */}
                    <aside className={`md:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden md:block'} space-y-8`}>
                        <div className="flex justify-between items-center md:hidden mb-4">
                            <h2 className="font-heading text-xl font-bold">Filters</h2>
                            <button onClick={() => setShowFilters(false)}><X size={24} /></button>
                        </div>

                        {/* Search */}
                        <div>
                            <h3 className="font-body text-sm font-bold uppercase tracking-widest text-primary mb-3">Search</h3>
                            <input
                                type="text"
                                name="keyword"
                                value={filters.keyword}
                                onChange={handleFilterChange}
                                placeholder="Search products..."
                                className="w-full bg-surface border border-secondary/20 p-2 text-sm rounded-sm focus:outline-none focus:border-primary"
                            />
                        </div>

                        {/* Categories */}
                        <div>
                            <h3 className="font-body text-sm font-bold uppercase tracking-widest text-primary mb-3">Category</h3>
                            <div className="space-y-2">
                                {['Spices', 'Dry Fruits', 'Honey', 'Oils'].map(cat => (
                                    <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="category"
                                            value={cat}
                                            checked={filters.category === cat}
                                            onChange={handleFilterChange}
                                            className="accent-primary"
                                        />
                                        <span className="text-text-secondary group-hover:text-primary transition-colors text-sm">{cat}</span>
                                    </label>
                                ))}
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="category"
                                        value=""
                                        checked={filters.category === ''}
                                        onChange={handleFilterChange}
                                        className="accent-primary"
                                    />
                                    <span className="text-text-secondary group-hover:text-primary transition-colors text-sm">All Categories</span>
                                </label>
                            </div>
                        </div>

                        {/* Price Range */}
                        <div>
                            <h3 className="font-body text-sm font-bold uppercase tracking-widest text-primary mb-3">Price Range</h3>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    name="minPrice"
                                    placeholder="Min"
                                    value={filters.minPrice}
                                    onChange={handleFilterChange}
                                    className="w-full bg-surface border border-secondary/20 p-2 text-sm rounded-sm focus:outline-none focus:border-primary"
                                />
                                <input
                                    type="number"
                                    name="maxPrice"
                                    placeholder="Max"
                                    value={filters.maxPrice}
                                    onChange={handleFilterChange}
                                    className="w-full bg-surface border border-secondary/20 p-2 text-sm rounded-sm focus:outline-none focus:border-primary"
                                />
                            </div>
                        </div>

                        {/* Sort */}
                        <div>
                            <h3 className="font-body text-sm font-bold uppercase tracking-widest text-primary mb-3">Sort By</h3>
                            <select
                                name="sort"
                                value={filters.sort}
                                onChange={handleFilterChange}
                                className="w-full bg-surface border border-secondary/20 p-2 text-sm rounded-sm focus:outline-none focus:border-primary"
                            >
                                <option value="">Default</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="newest">Newest Arrivals</option>
                            </select>
                        </div>

                        <button onClick={clearFilters} className="text-xs text-text-secondary underline hover:text-red-500">
                            Clear All Filters
                        </button>
                    </aside>

                    {/* Product Grid */}
                    <div className="flex-grow">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[1, 2, 3, 4, 5, 6].map(n => (
                                    <div key={n} className="bg-surface rounded-sm h-96 animate-pulse"></div>
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {products.map((product) => (
                                    <div key={product._id || product.id} className="group bg-surface rounded-sm shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 border border-secondary/10 flex flex-col">
                                        {/* Image Container */}
                                        <div className="relative aspect-square overflow-hidden bg-background p-8 flex items-center justify-center">
                                            <span className="absolute top-4 left-4 bg-accent text-primary text-xs font-bold px-3 py-1 uppercase tracking-widest z-10">
                                                {product.tag}
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    toggleWishlist(product._id || product.id);
                                                }}
                                                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-red-500 hover:bg-red-50 transition-colors"
                                            >
                                                <Heart
                                                    size={16}
                                                    className={user?.wishlist?.some(item => (typeof item === 'object' ? item._id : item) === (product._id || product.id)) ? "fill-current" : ""}
                                                />
                                            </button>
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-700 ease-out"
                                            />
                                            {/* Quick Action Overlay */}
                                            <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                                <Link to={`/product/${product.slug}`} className="block w-full text-center bg-white/90 backdrop-blur text-primary py-3 uppercase tracking-wider text-xs font-bold hover:bg-primary hover:text-white transition-colors shadow-lg">
                                                    Quick View
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Product Details */}
                                        <div className="p-8 flex flex-col flex-grow">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex text-accent text-sm">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={14} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} className={i < Math.floor(product.rating) ? "text-accent" : "text-gray-300"} />
                                                    ))}
                                                    <span className="ml-2 text-text-secondary text-xs">({product.reviews})</span>
                                                </div>
                                                <span className="text-secondary text-xs uppercase tracking-wider font-medium">In Stock</span>
                                            </div>

                                            <Link to={`/product/${product.slug}`}>
                                                <h2 className="font-heading text-2xl text-primary font-bold mb-3 group-hover:text-accent transition-colors">
                                                    {product.name}
                                                </h2>
                                            </Link>
                                            <p className="text-text-secondary text-sm font-light leading-relaxed mb-6 flex-grow line-clamp-2">
                                                {product.description}
                                            </p>

                                            <div className="flex items-center justify-between pt-4 border-t border-secondary/10 mt-auto">
                                                <span className="text-xl font-bold text-primary">
                                                    {formatPrice(product.price)}
                                                </span>
                                                <button
                                                    onClick={() => addToCart(product)}
                                                    className="bg-primary text-surface px-6 py-3 text-xs font-medium uppercase tracking-widest hover:bg-accent hover:text-primary transition-all duration-300 flex items-center gap-2 rounded-sm group-btn">
                                                    Add <ShoppingBag size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <h3 className="text-2xl font-bold text-primary mb-4">No Products Found</h3>
                                <p className="text-text-secondary mb-8">Try adjusting your search or filters.</p>
                                <button onClick={clearFilters} className="bg-primary text-white px-6 py-3 rounded-sm text-sm font-bold uppercase tracking-widest hover:bg-accent hover:text-primary transition-colors">
                                    View All Products
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Trust Section */}
            <section className="bg-surface border-t border-secondary/10 py-16 mt-16">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="space-y-3">
                        <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                            <Info size={24} />
                        </div>
                        <h3 className="font-heading text-lg font-bold text-primary">Lab Tested</h3>
                        <p className="text-text-secondary text-sm font-light">Every batch tested by Eurofins Germany</p>
                    </div>
                    <div className="space-y-3">
                        <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                            <ShoppingBag size={24} />
                        </div>
                        <h3 className="font-heading text-lg font-bold text-primary">Secure Checkout</h3>
                        <p className="text-text-secondary text-sm font-light">256-bit SSL encrypted payments</p>
                    </div>
                    <div className="space-y-3">
                        <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                            <ArrowRight size={24} />
                        </div>
                        <h3 className="font-heading text-lg font-bold text-primary">Fast Delivery</h3>
                        <p className="text-text-secondary text-sm font-light">Express shipping worldwide</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Shop;
