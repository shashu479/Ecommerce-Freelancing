import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Award, Feather, Quote, ChevronDown, CheckCircle2, ArrowRight } from 'lucide-react';
import BgImage1 from '../assets/bgimage1.png';
import BgImage2 from '../assets/profileimage.png';
import SaffronImage from '../assets/Saffron.png';
import HingImage from '../assets/Hing.png';


const About = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="w-full bg-background text-primary selection:bg-accent selection:text-white">
            {/* Parallax Hero Section */}
            <div className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-fixed bg-cover bg-center transition-transform duration-1000 scale-105"
                    style={{ backgroundImage: `url(${BgImage1})` }}></div>
                <div className="absolute inset-0 bg-primary/40 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90" />

                <div className="relative z-10 text-center max-w-4xl px-4 animate-fade-in-up space-y-8">
                    <span className="inline-block py-1 px-3 border border-surface/30 rounded-full text-surface/80 text-xs md:text-sm tracking-[0.3em] uppercase font-bold backdrop-blur-sm">
                        Since Inception
                    </span>
                    <h1 className="font-heading text-6xl md:text-8xl text-surface font-bold tracking-tight leading-none text-shadow-lg">
                        The Siraba Legacy
                    </h1>
                    <p className="text-xl md:text-2xl font-heading italic text-surface/90 font-light">
                        "Purity is not just a standard. It is our religion."
                    </p>

                    <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce opacity-70">
                        <ChevronDown className="text-surface w-8 h-8" />
                    </div>
                </div>
            </div>

            {/* The Founder's Vision - Asymmetrical Layout */}
            <section className="py-24 md:py-32 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row gap-16 lg:gap-24 items-center">
                        {/* Text Block */}
                        <div className="w-full md:w-1/2 space-y-10 order-2 md:order-1 animate-slide-in-right">
                            <div className="space-y-4">
                                <span className="text-accent text-sm tracking-[0.2em] uppercase font-bold flex items-center gap-2">
                                    <span className="w-8 h-[1px] bg-accent"></span> Our Origin
                                </span>
                                <h2 className="font-heading text-5xl md:text-6xl text-primary font-bold leading-tight">
                                    Solving the Global <br /><span className="italic text-accent">Trust Deficit</span>
                                </h2>
                            </div>

                            <div className="space-y-6 text-text-secondary font-light text-lg md:text-xl leading-relaxed">
                                <p>
                                    <strong className="text-primary font-bold">Siraba Organic</strong> was born from a singular, powerful realization: in a world flooding with "organic" labels, authentic trust was the rarest ingredient of all.
                                </p>
                                <p>
                                    Founded by <strong className="text-primary">Rajesh Thakur</strong>, a visionary entrepreneur dedicated to building global-grade brands, Siraba isn't just a business—it's a bridge. A bridge connecting India’s finest ancient agricultural heritage with the rigorous validation of modern German laboratories.
                                </p>
                                <blockquote className="border-l-4 border-accent pl-6 py-2 my-8 text-primary font-heading text-2xl italic">
                                    "We don't sell products. We deliver verified truth."
                                </blockquote>
                            </div>
                        </div>

                        {/* Image Block with Artistic Borders */}
                        <div className="w-full md:w-1/2 relative order-1 md:order-2 group">
                            <div className="absolute -inset-4 border border-secondary/20 translate-x-4 translate-y-4 transition-transform duration-500 group-hover:translate-x-2 group-hover:translate-y-2"></div>
                            <div className="relative aspect-[4/3] max-w-lg mx-auto overflow-hidden shadow-2xl">
                                <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors duration-500 z-10 mx-auto"></div>
                                <img
                                    src={BgImage2}
                                    alt="Founder Vision"
                                    className="w-full h-full object-cover object-top transform scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out grayscale hover:grayscale-0"
                                />
                            </div>
                            <div className="absolute -bottom-8 -left-8 bg-surface p-8 shadow-xl max-w-xs z-20 hidden lg:block">
                                <p className="font-heading text-xl font-bold text-primary">Rajesh Thakur</p>
                                <p className="text-sm text-accent uppercase tracking-wider mt-1">Founder & CEO</p>
                                <p className="text-4xl text-blue-700 mt-4 transform -rotate-6 opacity-90" style={{ fontFamily: '"Great Vibes", cursive' }}>Rajesh Thakur</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Transition Strip */}
            <div className="w-full bg-primary text-surface py-12 overflow-hidden whitespace-nowrap">
                <div className="inline-block animate-marquee">
                    <span className="text-4xl font-heading font-thin mx-8">• HONESTY</span>
                    <span className="text-4xl font-heading font-thin mx-8">• INTEGRITY</span>
                    <span className="text-4xl font-heading font-thin mx-8">• PURITY</span>
                    <span className="text-4xl font-heading font-thin mx-8">• TRADITION</span>
                    <span className="text-4xl font-heading font-thin mx-8">• HONESTY</span>
                    <span className="text-4xl font-heading font-thin mx-8">• INTEGRITY</span>
                    <span className="text-4xl font-heading font-thin mx-8">• PURITY</span>
                    <span className="text-4xl font-heading font-thin mx-8">• TRADITION</span>
                    {/* Duplicate for seamless loop */}
                    <span className="text-4xl font-heading font-thin mx-8">• HONESTY</span>
                    <span className="text-4xl font-heading font-thin mx-8">• INTEGRITY</span>
                    <span className="text-4xl font-heading font-thin mx-8">• PURITY</span>
                    <span className="text-4xl font-heading font-thin mx-8">• TRADITION</span>
                    <span className="text-4xl font-heading font-thin mx-8">• HONESTY</span>
                    <span className="text-4xl font-heading font-thin mx-8">• INTEGRITY</span>
                    <span className="text-4xl font-heading font-thin mx-8">• PURITY</span>
                    <span className="text-4xl font-heading font-thin mx-8">• TRADITION</span>
                </div>
            </div>

            {/* The Pillars (SI-RA-BA) - Specialized Grid */}
            <section className="py-24 md:py-32 bg-secondary/5 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20 space-y-4">
                        <span className="text-accent text-sm tracking-[0.2em] uppercase font-bold">The Ethos</span>
                        <h2 className="font-heading text-4xl md:text-5xl text-primary font-bold">The Meaning of Siraba</h2>
                        <div className="w-24 h-1 bg-accent mx-auto mt-6"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                        {/* SI */}
                        <div className="group bg-surface p-10 hover:bg-primary transition-colors duration-500 shadow-md hover:shadow-2xl border-t-2 border-accent relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-5 transition-opacity">
                                <Feather size={120} />
                            </div>
                            <h3 className="text-6xl font-heading font-bold text-accent/40 mb-2 group-hover:text-accent/60">SI</h3>
                            <h4 className="text-2xl font-bold text-primary mb-4 group-hover:text-white">Sita <span className="text-sm font-normal text-text-secondary group-hover:text-white/60 ml-2 uppercase tracking-wider">// Purity</span></h4>
                            <p className="text-text-secondary group-hover:text-white/80 leading-relaxed transition-colors duration-300">
                                Uncompromised quality resembling the purest elements of nature. We strip away the unnecessary to reveal the essential.
                            </p>
                        </div>

                        {/* RA */}
                        <div className="group bg-surface p-10 hover:bg-primary transition-colors duration-500 shadow-md hover:shadow-2xl border-t-2 border-primary relative overflow-hidden transform md:-translate-y-8">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-5 transition-opacity">
                                <Award size={120} />
                            </div>
                            <h3 className="text-6xl font-heading font-bold text-accent/40 mb-2 group-hover:text-accent/60">RA</h3>
                            <h4 className="text-2xl font-bold text-primary mb-4 group-hover:text-white">Ram <span className="text-sm font-normal text-text-secondary group-hover:text-white/60 ml-2 uppercase tracking-wider">// Integrity</span></h4>
                            <p className="text-text-secondary group-hover:text-white/80 leading-relaxed transition-colors duration-300">
                                Honest practices, transparent sourcing, and ethical business standards. We do what is right, even when no one is watching.
                            </p>
                        </div>

                        {/* BA */}
                        <div className="group bg-surface p-10 hover:bg-primary transition-colors duration-500 shadow-md hover:shadow-2xl border-t-2 border-accent relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-5 transition-opacity">
                                <Shield size={120} />
                            </div>
                            <h3 className="text-6xl font-heading font-bold text-accent/40 mb-2 group-hover:text-accent/60">BA</h3>
                            <h4 className="text-2xl font-bold text-primary mb-4 group-hover:text-white">Balaji <span className="text-sm font-normal text-text-secondary group-hover:text-white/60 ml-2 uppercase tracking-wider">// Strength</span></h4>
                            <p className="text-text-secondary group-hover:text-white/80 leading-relaxed transition-colors duration-300">
                                The robustness of our global supply chain and the potency of our products. Reliability you can build upon.
                            </p>
                        </div>
                    </div>
                </div>
            </section>



            {/* Mission Statement - Big Type */}
            <section className="py-32 px-4 bg-background border-t border-secondary/10 flex items-center justify-center">
                <div className="max-w-5xl mx-auto text-center space-y-12">
                    <Quote className="mx-auto text-accent w-12 h-12 md:w-16 md:h-16 mb-8 opacity-80" />
                    <h2 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-primary leading-tight">
                        "Our mission is simple: deliver food that is <span className="text-accent underline decoration-1 underline-offset-8">honest</span>, <span className="text-accent underline decoration-1 underline-offset-8">tested</span>, and globally <span className="text-accent underline decoration-1 underline-offset-8">trusted</span>."
                    </h2>
                    <div className="pt-8">
                        <Link to="/contact" className="inline-flex items-center gap-2 border-b-2 border-primary pb-1 text-primary font-bold uppercase tracking-widest hover:text-accent hover:border-accent transition-all">
                            Partner With Us <span className="text-xl">→</span>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
