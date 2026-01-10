import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Globe, Truck, Package, FileText, Send, Calculator, Download, Users, CheckCircle, ArrowRight } from 'lucide-react';
import BgImage1 from '../assets/bgimage1.png';
import { useCurrency } from '../context/CurrencyContext';

import client from '../api/client';

const B2B = () => {
    const { formatPrice } = useCurrency();
    const [activeTab, setActiveTab] = useState('inquiry'); // inquiry, distributor, sample
    const [pricingQuantity, setPricingQuantity] = useState(10);
    const [selectedPricingProduct, setSelectedPricingProduct] = useState('');
    const [pricingProducts, setPricingProducts] = useState({});
    const [exportDocs, setExportDocs] = useState([]);

    const [loadingSettings, setLoadingSettings] = useState(true);

    // Fetch B2B Settings
    React.useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await client.get('/b2b/settings');
                // Backend sends pricingProducts as array of objects {name, price}
                const pProducts = {};
                if (data.pricingProducts && data.pricingProducts.length > 0) {
                    data.pricingProducts.forEach(p => pProducts[p.name] = p.price);
                    setSelectedPricingProduct(data.pricingProducts[0].name);
                }
                setPricingProducts(pProducts);
                setExportDocs(data.exportDocs || []);
            } catch (error) {
                console.error("Failed to fetch B2B settings", error);
            } finally {
                setLoadingSettings(false);
            }
        };
        fetchSettings();
    }, []);

    // Form States
    const [inquiryForm, setInquiryForm] = useState({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        productInterest: [],
        quantity: '',
        destination: '',
        message: ''
    });

    const [distributorForm, setDistributorForm] = useState({
        businessName: '',
        contactName: '',
        email: '',
        region: '',
        yearsInBusiness: '',
        annualTurnover: '',
        message: ''
    });

    const [sampleForm, setSampleForm] = useState({
        companyName: '',
        contactName: '',
        address: '',
        shippingAccount: '', // DHL/FedEx etc
        items: []
    });

    const handleInquiryChange = (e) => setInquiryForm({ ...inquiryForm, [e.target.name]: e.target.value });
    const handleDistributorChange = (e) => setDistributorForm({ ...distributorForm, [e.target.name]: e.target.value });
    const handleSampleChange = (e) => setSampleForm({ ...sampleForm, [e.target.name]: e.target.value });

    const handleProductInterestChange = (e, formType) => {
        const { value, checked } = e.target;
        const form = formType === 'inquiry' ? inquiryForm : sampleForm;
        const setForm = formType === 'inquiry' ? setInquiryForm : setSampleForm;
        const field = formType === 'inquiry' ? 'productInterest' : 'items';

        if (checked) {
            setForm({ ...form, [field]: [...form[field], value] });
        } else {
            setForm({ ...form, [field]: form[field].filter(p => p !== value) });
        }
    };

    const submitForm = async (endpoint, data, resetFn) => {
        try {
            await client.post(endpoint, data);
            alert('Request submitted successfully! Our team will review and contact you shortly.');
            resetFn();
        } catch (error) {
            console.error('Submission failed', error);
            alert('Submission failed. Please try again later.');
        }
    };

    // Bulk Pricing Logic with improved tiered discounts
    const calculateBulkPrice = (qty) => {
        const basePrice = pricingProducts[selectedPricingProduct] || 2500; // Base price per kg
        let discount = 0;

        // More granular discount tiers
        if (qty >= 100) discount = 0.30;      // 20% off for 100+ kg
        else if (qty >= 50) discount = 0.15;  // 15% off for 50-99 kg
        else if (qty >= 20) discount = 0.18;  // 12% off for 20-49 kg
        else if (qty >= 10) discount = 0.10;  // 8% off for 10-19 kg
        else if (qty >= 5) discount = 0.8;   // 5% off for 5-9 kg

        const discountedPrice = basePrice * (1 - discount);
        const total = discountedPrice * qty;
        const savings = (basePrice * qty) - total;

        return { pricePerUnit: discountedPrice, total, savings, discount: discount * 100 };
    };

    const bulkCalculation = calculateBulkPrice(pricingQuantity);

    return (
        <div className="w-full pt-20 bg-background text-primary">
            {/* Hero Section */}
            <div className="relative h-72 md:h-96 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <img src={BgImage1} alt="Global Trade" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-primary/85 mix-blend-multiply" />
                </div>
                <div className="relative z-10 text-center space-y-6 animate-fade-in-up px-4">
                    <h1 className="font-heading text-4xl md:text-6xl text-surface font-bold tracking-tight">Enterprise & Wholesale</h1>
                    <p className="text-surface/80 text-lg md:text-xl font-light max-w-2xl mx-auto">
                        End-to-end B2B solutions: From bulk sourcing to global export logistics.
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-sm text-surface/60 font-mono uppercase tracking-widest">
                        <Link to="/" className="hover:text-accent transition-colors">Home</Link>
                        <span>/</span>
                        <span className="text-accent">B2B Solutions</span>
                    </div>
                </div>
            </div>

            {/* Feature Grid */}
            <section className="py-16 px-4 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-surface p-6 rounded-sm border border-secondary/10 hover:border-accent/50 transition-colors group">
                        <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mb-4 group-hover:bg-accent/10 transition-colors">
                            <Container className="text-primary group-hover:text-accent" size={24} />
                        </div>
                        <h3 className="font-heading font-bold text-lg mb-2">Bulk Pricing</h3>
                        <p className="text-sm text-text-secondary">Tiered discounts for high-volume orders with transparent calculation.</p>
                    </div>
                    <div className="bg-surface p-6 rounded-sm border border-secondary/10 hover:border-accent/50 transition-colors group">
                        <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mb-4 group-hover:bg-accent/10 transition-colors">
                            <Users className="text-primary group-hover:text-accent" size={24} />
                        </div>
                        <h3 className="font-heading font-bold text-lg mb-2">Distributor Network</h3>
                        <p className="text-sm text-text-secondary">Join our global network of verified distributors and partners.</p>
                    </div>
                    <div className="bg-surface p-6 rounded-sm border border-secondary/10 hover:border-accent/50 transition-colors group">
                        <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mb-4 group-hover:bg-accent/10 transition-colors">
                            <FileText className="text-primary group-hover:text-accent" size={24} />
                        </div>
                        <h3 className="font-heading font-bold text-lg mb-2">Export Ready</h3>
                        <p className="text-sm text-text-secondary">Full documentation support including Phyto, Origin, and Organic certs.</p>
                    </div>
                    <div className="bg-surface p-6 rounded-sm border border-secondary/10 hover:border-accent/50 transition-colors group">
                        <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mb-4 group-hover:bg-accent/10 transition-colors">
                            <Package className="text-primary group-hover:text-accent" size={24} />
                        </div>
                        <h3 className="font-heading font-bold text-lg mb-2">Sample Requests</h3>
                        <p className="text-sm text-text-secondary">Quality assurance workflow with quick sample dispatching.</p>
                    </div>
                </div>
            </section>

            {/* Main Interactive Section */}
            <section className="bg-secondary/5 py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Tabs */}
                    <div className="flex flex-wrap justify-center mb-10 gap-4">
                        <button
                            onClick={() => setActiveTab('inquiry')}
                            className={`px-8 py-3 text-sm font-bold uppercase tracking-wider rounded-sm transition-all shadow-sm ${activeTab === 'inquiry' ? 'bg-primary text-surface' : 'bg-surface text-text-secondary hover:bg-white'}`}
                        >
                            Trade Inquiry
                        </button>
                        <button
                            onClick={() => setActiveTab('distributor')}
                            className={`px-8 py-3 text-sm font-bold uppercase tracking-wider rounded-sm transition-all shadow-sm ${activeTab === 'distributor' ? 'bg-primary text-surface' : 'bg-surface text-text-secondary hover:bg-white'}`}
                        >
                            Partner Onboarding
                        </button>
                        <button
                            onClick={() => setActiveTab('sample')}
                            className={`px-8 py-3 text-sm font-bold uppercase tracking-wider rounded-sm transition-all shadow-sm ${activeTab === 'sample' ? 'bg-primary text-surface' : 'bg-surface text-text-secondary hover:bg-white'}`}
                        >
                            Request Samples
                        </button>
                    </div>

                    <div className="bg-surface p-8 md:p-12 rounded-sm shadow-xl border border-secondary/10">
                        {/* Trade Inquiry Form */}
                        {activeTab === 'inquiry' && (
                            <div className="animate-fade-in">
                                <h2 className="font-heading text-2xl font-bold mb-6 text-center">General Trade Inquiry</h2>
                                <form onSubmit={(e) => { e.preventDefault(); submitForm('/inquiries', inquiryForm, () => { }); }} className="space-y-6 max-w-3xl mx-auto">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <input type="text" name="companyName" placeholder="Company Name" className="p-3 bg-transparent border-b border-secondary/20 focus:border-accent outline-none w-full" onChange={handleInquiryChange} required />
                                        <input type="text" name="contactPerson" placeholder="Contact Person" className="p-3 bg-transparent border-b border-secondary/20 focus:border-accent outline-none w-full" onChange={handleInquiryChange} required />
                                        <input type="email" name="email" placeholder="Email Address" className="p-3 bg-transparent border-b border-secondary/20 focus:border-accent outline-none w-full" onChange={handleInquiryChange} required />
                                        <input type="tel" name="phone" placeholder="Phone Number" className="p-3 bg-transparent border-b border-secondary/20 focus:border-accent outline-none w-full" onChange={handleInquiryChange} />
                                    </div>

                                    <div className="space-y-3 pt-4">
                                        <label className="text-xs uppercase font-bold text-text-secondary">Products of Interest</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {['Kashmiri Saffron', 'Organic Walnuts', 'Himalayan Shilajit', 'Asafoetida (Heeng)'].map(item => (
                                                <label key={item} className="flex items-center space-x-3 cursor-pointer">
                                                    <input type="checkbox" value={item} onChange={(e) => handleProductInterestChange(e, 'inquiry')} className="accent-accent" />
                                                    <span className="text-sm">{item}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <input type="text" name="quantity" placeholder="Est. Quantity (e.g. 50kg)" className="p-3 bg-transparent border-b border-secondary/20 focus:border-accent outline-none w-full" onChange={handleInquiryChange} />
                                        <input type="text" name="destination" placeholder="Destination Country" className="p-3 bg-transparent border-b border-secondary/20 focus:border-accent outline-none w-full" onChange={handleInquiryChange} required />
                                    </div>

                                    <textarea name="message" rows="4" placeholder="Additional details..." className="w-full p-3 bg-background border border-secondary/20 rounded-sm focus:border-accent outline-none" onChange={handleInquiryChange}></textarea>

                                    <button type="submit" className="w-full bg-primary text-surface py-4 font-bold uppercase tracking-widest hover:bg-accent hover:text-primary transition-all">Submit Inquiry</button>
                                </form>
                            </div>
                        )}

                        {/* Distributor Onboarding Form */}
                        {activeTab === 'distributor' && (
                            <div className="animate-fade-in">
                                <h2 className="font-heading text-2xl font-bold mb-2 text-center">Become a Verified Distributor</h2>
                                <p className="text-center text-text-secondary text-sm mb-8">Join our network and get access to exclusive pricing and priority support.</p>
                                <form onSubmit={(e) => { e.preventDefault(); submitForm('/b2b/distributors', distributorForm, () => { }); }} className="space-y-6 max-w-3xl mx-auto">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <input type="text" name="businessName" placeholder="Legal Business Name" className="p-3 bg-transparent border-b border-secondary/20 focus:border-accent outline-none w-full" onChange={handleDistributorChange} required />
                                        <input type="text" name="contactName" placeholder="Primary Contact" className="p-3 bg-transparent border-b border-secondary/20 focus:border-accent outline-none w-full" onChange={handleDistributorChange} required />
                                        <input type="email" name="email" placeholder="Business Email" className="p-3 bg-transparent border-b border-secondary/20 focus:border-accent outline-none w-full" onChange={handleDistributorChange} required />
                                        <input type="text" name="region" placeholder="Region / Territory of Operation" className="p-3 bg-transparent border-b border-secondary/20 focus:border-accent outline-none w-full" onChange={handleDistributorChange} required />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <input type="number" name="yearsInBusiness" placeholder="Years in Business" className="p-3 bg-transparent border-b border-secondary/20 focus:border-accent outline-none w-full" onChange={handleDistributorChange} />
                                        <input type="text" name="annualTurnover" placeholder="Approx. Annual Turnover (USD)" className="p-3 bg-transparent border-b border-secondary/20 focus:border-accent outline-none w-full" onChange={handleDistributorChange} />
                                    </div>
                                    <textarea name="message" rows="4" placeholder="Tell us about your distribution channels..." className="w-full p-3 bg-background border border-secondary/20 rounded-sm focus:border-accent outline-none" onChange={handleDistributorChange}></textarea>
                                    <button type="submit" className="w-full bg-primary text-surface py-4 font-bold uppercase tracking-widest hover:bg-accent hover:text-primary transition-all">Apply for Partnership</button>
                                </form>
                            </div>
                        )}

                        {/* Sample Request Form */}
                        {activeTab === 'sample' && (
                            <div className="animate-fade-in">
                                <h2 className="font-heading text-2xl font-bold mb-2 text-center">Request Product Samples</h2>
                                <p className="text-center text-text-secondary text-sm mb-8">Experience our quality before placing a bulk order. Shipping charges may apply.</p>
                                <form onSubmit={(e) => { e.preventDefault(); submitForm('/b2b/samples', sampleForm, () => { }); }} className="space-y-6 max-w-3xl mx-auto">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <input type="text" name="companyName" placeholder="Company Name" className="p-3 bg-transparent border-b border-secondary/20 focus:border-accent outline-none w-full" onChange={handleSampleChange} required />
                                        <input type="text" name="contactName" placeholder="Recipient Name" className="p-3 bg-transparent border-b border-secondary/20 focus:border-accent outline-none w-full" onChange={handleSampleChange} required />
                                        <input type="text" name="shippingAccount" placeholder="Courier Account # (DHL/FedEx) - Optional" className="p-3 bg-transparent border-b border-secondary/20 focus:border-accent outline-none w-full" onChange={handleSampleChange} />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs uppercase font-bold text-text-secondary">Select Samples Needed</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {['Saffron (1g)', 'Walnut Kernels (50g)', 'Shilajit Resin (5g)', 'Asafoetida (10g)'].map(item => (
                                                <label key={item} className="flex items-center space-x-3 cursor-pointer">
                                                    <input type="checkbox" value={item} onChange={(e) => handleProductInterestChange(e, 'sample')} className="accent-accent" />
                                                    <span className="text-sm">{item}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <textarea name="address" rows="3" placeholder="Full Shipping Address" className="w-full p-3 bg-background border border-secondary/20 rounded-sm focus:border-accent outline-none" onChange={handleSampleChange} required></textarea>
                                    <button type="submit" className="w-full bg-primary text-surface py-4 font-bold uppercase tracking-widest hover:bg-accent hover:text-primary transition-all">Request Samples</button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Tools Section: Calculator & Docs */}
            <section className="py-20 px-4 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* Bulk Pricing Calculator */}
                    <div className="bg-background border border-secondary/10 p-8 rounded-sm shadow-md">
                        <div className="flex items-center gap-3 mb-6">
                            <Calculator className="text-accent" size={28} />
                            <h2 className="font-heading text-2xl font-bold">Bulk Savings Calculator</h2>
                        </div>
                        <p className="text-text-secondary text-sm mb-6">Estimate your savings with our tiered pricing model.</p>

                        <div className="mb-6">
                            <label className="block text-xs uppercase font-bold text-text-secondary mb-2">Select Product for Calculation</label>
                            <div className="relative">
                                <select
                                    value={selectedPricingProduct}
                                    onChange={(e) => {
                                        setSelectedPricingProduct(e.target.value);
                                        // Reset quantity to 1 for better UX or keep as is? Let's keep it.
                                    }}
                                    className="w-full appearance-none bg-surface border border-secondary/20 rounded-sm p-3 text-sm focus:outline-none focus:border-accent cursor-pointer"
                                >
                                    {Object.keys(pricingProducts).map(product => (
                                        <option key={product} value={product}>{product}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-secondary">
                                    <ArrowRight size={14} className="rotate-90" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="font-bold text-sm">Quantity (KG)</label>
                                    <span className="text-accent font-bold">{pricingQuantity} kg</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="200"
                                    value={pricingQuantity}
                                    onChange={(e) => setPricingQuantity(parseInt(e.target.value))}
                                    className="w-full h-2 bg-secondary/20 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <div className="flex justify-between mt-1 text-xs text-text-secondary">
                                    <span>1 kg</span>
                                    <span>200 kg</span>
                                </div>
                            </div>

                            <div className="bg-secondary/5 p-6 rounded-sm space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-secondary">Base Price (Per KG)</span>
                                    <span>{formatPrice(pricingProducts[selectedPricingProduct] || 0)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-secondary">Discount Tier</span>
                                    <span className="text-accent font-bold">{bulkCalculation.discount}% Off</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-secondary">Your Price (Per KG)</span>
                                    <span className="font-bold">{formatPrice(bulkCalculation.pricePerUnit)}</span>
                                </div>
                                <div className="h-px bg-secondary/20 my-2"></div>
                                <div className="flex justify-between text-lg font-bold text-primary">
                                    <span>Est. Total</span>
                                    <span>{formatPrice(bulkCalculation.total)}</span>
                                </div>
                                {bulkCalculation.savings > 0 && (
                                    <div className="text-center text-xs text-white bg-green-600 py-1 rounded-sm mt-2">
                                        You save {formatPrice(bulkCalculation.savings)} on this order!
                                    </div>
                                )}
                            </div>

                            {/* Discount Tier Guide */}
                            <div className="mt-6 pt-6 border-t border-secondary/10">
                                <p className="text-xs font-bold uppercase text-text-secondary mb-3">Volume Discount Tiers</p>
                                <div className="space-y-2">
                                    {[
                                        { qty: '5-9 kg', discount: '5%', color: 'blue' },
                                        { qty: '10-19 kg', discount: '8%', color: 'indigo' },
                                        { qty: '20-49 kg', discount: '12%', color: 'purple' },
                                        { qty: '50-99 kg', discount: '15%', color: 'pink' },
                                        { qty: '100+ kg', discount: '20%', color: 'green' }
                                    ].map((tier, idx) => (
                                        <div key={idx} className={`flex items-center justify-between text-xs p-2 rounded-sm ${pricingQuantity >= parseInt(tier.qty)
                                            ? `bg-${tier.color}-50 border border-${tier.color}-200`
                                            : 'bg-secondary/5'
                                            }`}>
                                            <span className="font-medium text-primary">{tier.qty}</span>
                                            <span className={`font-bold ${pricingQuantity >= parseInt(tier.qty)
                                                ? `text-${tier.color}-700`
                                                : 'text-text-secondary'
                                                }`}>{tier.discount} OFF</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Export Documentation */}
                    <div className="bg-background border border-secondary/10 p-8 rounded-sm shadow-md">
                        <div className="flex items-center gap-3 mb-6">
                            <FileText className="text-accent" size={28} />
                            <h2 className="font-heading text-2xl font-bold">Export Documentation</h2>
                        </div>
                        <p className="text-text-secondary text-sm mb-8">We ensure compliance with global standards. Available documentation included with shipments:</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {exportDocs.map((doc, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 border border-secondary/10 rounded-sm hover:bg-secondary/5 transition-colors">
                                    <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                                    <div>
                                        <p className="font-bold text-sm text-primary">{doc.name}</p>
                                        <span className="text-[10px] uppercase font-bold text-text-secondary bg-secondary/10 px-1.5 py-0.5 rounded-sm">{doc.type}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-secondary/10">
                            <button className="flex items-center justify-between w-full p-4 bg-primary text-surface rounded-sm hover:bg-accent hover:text-primary transition-all group">
                                <span className="font-bold uppercase tracking-wider text-sm">Download Compliance Kit</span>
                                <Download size={20} className="group-hover:translate-y-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
};

export default B2B;
