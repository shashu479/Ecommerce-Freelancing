import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Package, ShoppingBag, Settings,
    Plus, Search, Filter, ChevronDown, Upload, X,
    DollarSign, TrendingUp, Calendar, AlertCircle, CheckCircle,
    Store, Award, Users, Globe, ArrowLeft
} from "lucide-react";
import { useAuth } from '../../context/AuthContext';

const VendorIntro = () => {
    const { user, login } = useAuth();
    const navigate = useNavigate();

    // Redirect if already a vendor
    useEffect(() => {
        if (user && (user.role === 'admin' || user.isVendor)) {
            navigate('/vendor/dashboard');
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen bg-background pt-20">
            {/* Hero Section */}
            <section className="relative overflow-hidden py-24 md:py-32">
                {/* Back Button */}
                <div className="absolute top-6 left-6 z-20">
                    <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-secondary/10 rounded-full text-sm font-bold text-primary hover:bg-white hover:shadow-md transition-all">
                        <ArrowLeft size={16} />
                        Back to Home
                    </Link>
                </div>
                <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 rounded-l-full blur-3xl transform translate-x-1/2"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto space-y-6">
                        <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs font-bold uppercase tracking-widest rounded-full mb-4 animate-fade-in-up">
                            Join the Revolution
                        </span>
                        <h1 className="text-4xl md:text-6xl font-heading font-bold text-primary leading-tight animate-fade-in-up delay-100">
                            Monetize Your <br /> <span className="text-accent italic">Organic Passion</span>
                        </h1>
                        <p className="text-lg md:text-xl text-text-secondary font-light animate-fade-in-up delay-200">
                            Partner with Siraba Organic to reach thousands of health-conscious customers.
                            Manage your products, track orders, and grow your business with our powerful vendor dashboard.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 animate-fade-in-up delay-300">
                            <Link
                                to="/vendor/register"
                                className="px-8 py-4 bg-primary text-surface font-bold uppercase tracking-wider rounded-sm shadow-lg hover:bg-accent hover:text-primary transition-all transform hover:-translate-y-1"
                            >
                                Start Selling Today
                            </Link>
                            <Link
                                to="/vendor/login"
                                className="px-8 py-4 border border-secondary/20 bg-white text-primary font-bold uppercase tracking-wider rounded-sm shadow-sm hover:border-primary transition-all"
                            >
                                Login to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Dashboard Preview Section */}
            <section className="py-20 bg-surface border-y border-secondary/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <h2 className="text-3xl font-heading font-bold text-primary">
                                Everything You Need to <span className="text-accent">Succeed</span>
                            </h2>
                            <p className="text-text-secondary font-light">
                                Our vendor portal is designed to give you complete control over your business. From inventory management to real-time analytics, we provide the tools you need to thrive.
                            </p>

                            <div className="space-y-6">
                                <FeatureItem
                                    icon={LayoutDashboard}
                                    title="Intuitive Dashboard"
                                    description="Get a clear overview of your sales, latest orders, and business performance at a glance."
                                />
                                <FeatureItem
                                    icon={Package}
                                    title="Order Management"
                                    description="Process orders efficiently, print shipping labels, and manage returns seamlessly."
                                />
                                <FeatureItem
                                    icon={ShoppingBag}
                                    title="Product Control"
                                    description="Easily add and update your products with our advanced inventory management system."
                                />
                                <FeatureItem
                                    icon={DollarSign}
                                    title="Transparent Payouts"
                                    description="Track your earnings in real-time and receive timely payouts directly to your bank account."
                                />
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-primary/5 rounded-sm transform rotate-3 scale-105"></div>
                            {/* Mockup of Dashboard - Using CSS/HTML construction for a 'screenshot' look */}
                            <div className="relative bg-background rounded-sm shadow-2xl overflow-hidden border border-secondary/10">
                                {/* Fake Header */}
                                <div className="h-12 bg-white border-b border-secondary/10 flex items-center px-4 gap-2">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                    </div>
                                    <div className="flex-1 bg-secondary/5 h-6 rounded-sm ml-4 w-1/2"></div>
                                </div>
                                {/* Fake Content */}
                                <div className="flex h-[400px]">
                                    <div className="w-16 bg-primary/5 border-r border-secondary/10 hidden sm:block"></div>
                                    <div className="flex-1 p-6 space-y-6">
                                        <div className="flex gap-4">
                                            <div className="flex-1 h-24 bg-white rounded-sm shadow-sm border border-secondary/5"></div>
                                            <div className="flex-1 h-24 bg-white rounded-sm shadow-sm border border-secondary/5"></div>
                                            <div className="flex-1 h-24 bg-white rounded-sm shadow-sm border border-secondary/5"></div>
                                        </div>
                                        <div className="h-48 bg-white rounded-sm shadow-sm border border-secondary/5 flex items-center justify-center text-secondary/20 font-heading text-4xl">
                                            Analytics Graph
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Join Section */}
            <section className="py-20 bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-4">Why Sell on Siraba?</h2>
                        <p className="text-text-secondary max-w-2xl mx-auto">We're more than just a marketplace. We're a community dedicated to bringing purity and wellness to every home.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <BenefitCard
                            icon={Globe}
                            title="Global Reach"
                            description="Expand your customer base beyond your local area. We ship pan-India and globally."
                        />
                        <BenefitCard
                            icon={Users}
                            title="Loyal Community"
                            description="Tap into our established community of health-conscious buyers who trust the Siraba brand."
                        />
                        <BenefitCard
                            icon={Award}
                            title="Premium Positioning"
                            description="Showcase your products alongside the finest organic goods, elevating your brand perception."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary text-surface text-center">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">Ready to Grow Your Business?</h2>
                    <p className="text-lg text-surface/80 mb-10 max-w-2xl mx-auto">Join hundreds of successful vendors who have transformed their passion into profit with Siraba Organic.</p>
                    <Link
                        to="/vendor/register"
                        className="inline-block px-10 py-4 bg-accent text-primary font-bold uppercase tracking-widest rounded-sm shadow-lg hover:bg-white hover:text-primary transition-all transform hover:-translate-y-1"
                    >
                        Register Now
                    </Link>
                </div>
            </section>

        </div>
    );
};

const FeatureItem = ({ icon: Icon, title, description }) => (
    <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-sm bg-accent/10 flex items-center justify-center flex-shrink-0 text-accent">
            <Icon size={24} />
        </div>
        <div>
            <h3 className="font-bold text-primary text-lg">{title}</h3>
            <p className="text-sm text-text-secondary mt-1 leading-relaxed">{description}</p>
        </div>
    </div>
);

const BenefitCard = ({ icon: Icon, title, description }) => (
    <div className="bg-surface p-8 rounded-sm shadow-md border border-secondary/10 hover:shadow-lg transition-shadow text-center group">
        <div className="w-16 h-16 rounded-full bg-primary/5 mx-auto flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors mb-6">
            <Icon size={32} />
        </div>
        <h3 className="font-bold text-xl text-primary mb-3">{title}</h3>
        <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
    </div>
);

export default VendorIntro;
