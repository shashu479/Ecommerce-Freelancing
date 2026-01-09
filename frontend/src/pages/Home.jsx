import { ArrowRight, Star, Leaf, ShieldCheck, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import HeroVideo from '../assets/Siraba_s_Organic_Spices_Video_Ready.mp4';
import SaffronImg from '../assets/Saffron.png';
import HingImg from '../assets/Hing.png';
import BgImage2 from '../assets/bgimage2.png';
import BgImage1 from '../assets/bgimage1.png'; // Fallback or extra usage

const Home = () => {
    const { homeContent, products } = useProducts();

    return (
        <div className="w-full">
            {/* Hero Section */}
            <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                        poster={BgImage1}
                    >
                        <source src={HeroVideo} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    <div className="absolute inset-0 bg-primary/40 md:bg-primary/30 mix-blend-multiply" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent" />
                </div>

                <div className="relative z-10 text-center px-4 max-w-5xl mx-auto space-y-6 md:space-y-8 animate-fade-in-up">
                    <span className="font-subheading text-accent text-lg md:text-xl tracking-[0.2em] uppercase font-bold text-shadow-sm">
                        Pure • Rare • Certified
                    </span>
                    <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl text-surface leading-tight text-shadow">
                        The Red Gold <br /> of Kashmir
                    </h1>
                    <p className="font-body text-white/90 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
                        Experience the world's finest Grade A1 organic saffron. <br className="hidden md:block" />
                        Directly from the heritage farms of Pampore to your kitchen.
                    </p>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4">
                        <Link
                            to="/shop"
                            className="bg-accent text-primary font-medium text-sm tracking-widest uppercase px-10 py-4 hover:bg-surface transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
                        >
                            Shop Collection
                        </Link>
                        <Link
                            to="/our-story"
                            className="group flex items-center gap-2 text-surface font-light tracking-wide hover:text-accent transition-colors duration-300"
                        >
                            Our Heritage <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Trust Indicators */}
            <section className="bg-background py-16 md:py-24 border-b border-secondary/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="flex flex-col items-center space-y-4 p-6 hover:bg-white/50 rounded-xl transition-colors duration-300">
                            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-primary mb-2">
                                <Leaf size={32} strokeWidth={1} />
                            </div>
                            <h3 className="font-heading text-xl text-primary font-bold">100% Certified Organic</h3>
                            <p className="text-text-secondary text-sm leading-relaxed max-w-xs font-light">
                                USDA NPOP certified. Free from pesticides, additives, and artificial colors. Pure nature.
                            </p>
                        </div>
                        <div className="flex flex-col items-center space-y-4 p-6 hover:bg-white/50 rounded-xl transition-colors duration-300">
                            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-primary mb-2">
                                <ShieldCheck size={32} strokeWidth={1} />
                            </div>
                            <h3 className="font-heading text-xl text-primary font-bold">Lab Tested Quality</h3>
                            <p className="text-text-secondary text-sm leading-relaxed max-w-xs font-light">
                                Rigorously tested by Eurofins (Germany). Guaranteed potency and purity in every strand.
                            </p>
                        </div>
                        <div className="flex flex-col items-center space-y-4 p-6 hover:bg-white/50 rounded-xl transition-colors duration-300">
                            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-primary mb-2">
                                <Globe size={32} strokeWidth={1} />
                            </div>
                            <h3 className="font-heading text-xl text-primary font-bold">Farm to Global</h3>
                            <p className="text-text-secondary text-sm leading-relaxed max-w-xs font-light">
                                Ethically sourced directly from farmers, delivered to connoisseurs worldwide.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-20 md:py-32 bg-surface">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 space-y-4">
                        <span className="text-accent text-sm tracking-[0.2em] uppercase font-bold">{homeContent.subheading}</span>
                        <h2 className="font-heading text-4xl md:text-5xl text-primary">{homeContent.heading}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                        {products.slice(0, 2).map((product) => (
                            <Link key={product._id || product.id} to={`/product/${product.slug}`} className="group cursor-pointer">
                                <div className="relative aspect-[4/5] overflow-hidden bg-background mb-6 rounded-sm">
                                    <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors duration-500" />
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-contain p-8 transform scale-100 group-hover:scale-110 transition-transform duration-700 ease-out"
                                    />
                                    <div className="absolute bottom-6 left-6 right-6">
                                        <button className="w-full bg-white/90 backdrop-blur text-primary py-4 uppercase tracking-wider text-xs font-bold hover:bg-accent hover:text-primary transition-colors duration-300 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 shadow-md">
                                            View Details
                                        </button>
                                    </div>
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="font-heading text-2xl text-primary group-hover:text-accent transition-colors duration-300">{product.name}</h3>
                                    <p className="text-text-secondary text-sm font-light">From {product.currency}{product.price}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-20 md:py-32 bg-primary text-surface relative overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0 opacity-20">
                    <img src={BgImage2} alt="Background" className="w-full h-full object-cover" />
                </div>
                {/* Gradient Overlay */}
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-primary/90 via-primary/80 to-primary/90"></div>

                <div className="max-w-4xl mx-auto px-4 text-center relative z-10 space-y-8">
                    <div className="inline-block border border-accent/30 p-8 rounded-full mb-4 backdrop-blur-sm">
                        <span className="font-heading text-6xl text-accent">“</span>
                    </div>
                    <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl leading-tight">
                        We believe true luxury lies in <span className="text-accent italic">purity</span> and <span className="text-accent italic">origin</span>.
                    </h2>
                    <p className="text-lg md:text-xl font-light text-white/80 leading-relaxed max-w-3xl mx-auto">
                        Siraba Organic was born from a desire to preserve the ancient wisdom of Indian agriculture. Every strand of our saffron tells a story of the soil, the hands that tended it, and the pristine Himalayan air that nurtured it.
                    </p>
                    <div className="pt-8">
                        <Link to="/our-story" className="text-accent hover:text-white border-b border-accent pb-1 transition-colors duration-300 font-medium tracking-wide uppercase text-sm">
                            Read Our Full Story
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
