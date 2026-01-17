import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useVendor } from "../../context/VendorContext";
import {
  Store,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Building,
  ArrowRight,
  Leaf,
  ShieldCheck,
  Globe,
  ArrowLeft
} from "lucide-react";
import Logo from "../../assets/SIRABALOGO.png";
import BgImage2 from "../../assets/bgimage2.png";

const VendorLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    businessName: "",
    businessType: "manufacturer",
    contactPerson: "",
    phone: "",
    city: "",
    state: "",
    postalCode: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register, vendor } = useVendor();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.includes("register")) {
      setIsLogin(false);
    }
  }, [location]);

  // Redirect if already logged in
  React.useEffect(() => {
    if (vendor) {
      if (!vendor.onboardingComplete) {
        navigate("/vendor/onboarding");
      } else {
        navigate("/vendor/dashboard");
      }
    }
  }, [vendor, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData);
      }

      if (result.success) {
        if (!isLogin) {
          navigate("/vendor/onboarding");
        } else {
          if (!result.vendor?.onboardingComplete) {
            navigate("/vendor/onboarding");
          } else {
            navigate("/vendor/dashboard");
          }
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        {/* Back Button */}
        <div className="absolute top-6 left-6 z-30">
          <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sm font-bold text-white hover:bg-white/20 hover:shadow-lg transition-all">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
        <img
          src={BgImage2}
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/70" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-primary/80" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full animate-fade-in">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <img src={Logo} alt="Siraba Logo" className="h-16 mx-auto mb-6" />
            </Link>
            <span className="font-subheading text-accent text-xs tracking-[0.15em] uppercase font-bold text-shadow-sm border border-accent/30 px-4 py-2 rounded-full bg-black/20 backdrop-blur-sm">
              Vendor Portal
            </span>
            <h1 className="font-heading text-4xl md:text-5xl text-surface mt-6 mb-3 text-shadow">
              {isLogin ? "Welcome Back" : "Join Our Network"}
            </h1>
            <p className="text-white/80 font-light">
              {isLogin
                ? "Sign in to manage your organic spice store"
                : "Partner with Siraba Organic"}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-surface/95 backdrop-blur-sm rounded-sm shadow-2xl p-8 border border-white/20">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-sm text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <>
                  {/* Business Name */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2 tracking-wide uppercase">
                      Business Name *
                    </label>
                    <div className="relative">
                      <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        required={!isLogin}
                        className="w-full pl-12 pr-4 py-4 border border-secondary/20 rounded-sm focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all bg-background/50"
                        placeholder="Your business name"
                      />
                    </div>
                  </div>

                  {/* Business Type */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2 tracking-wide uppercase">
                      Business Type *
                    </label>
                    <div className="relative">
                      <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                      <select
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 border border-secondary/20 rounded-sm focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all bg-background/50 appearance-none"
                      >
                        <option value="manufacturer">Manufacturer</option>
                        <option value="distributor">Distributor</option>
                        <option value="farmer">Farmer / Producer</option>
                        <option value="processor">Processor</option>
                        <option value="wholesaler">Wholesaler</option>
                      </select>
                    </div>
                  </div>

                  {/* Contact Person */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2 tracking-wide uppercase">
                      Contact Person *
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                      <input
                        type="text"
                        name="contactPerson"
                        value={formData.contactPerson}
                        onChange={handleChange}
                        required={!isLogin}
                        className="w-full pl-12 pr-4 py-4 border border-secondary/20 rounded-sm focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all bg-background/50"
                        placeholder="Primary contact name"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2 tracking-wide uppercase">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required={!isLogin}
                        className="w-full pl-12 pr-4 py-4 border border-secondary/20 rounded-sm focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all bg-background/50"
                        placeholder="+91 XXXXXXXXXX"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2 tracking-wide uppercase">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required={!isLogin}
                        className="w-full px-4 py-4 border border-secondary/20 rounded-sm focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all bg-background/50"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2 tracking-wide uppercase">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required={!isLogin}
                        className="w-full px-4 py-4 border border-secondary/20 rounded-sm focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all bg-background/50"
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2 tracking-wide uppercase">
                        PIN *
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        required={!isLogin}
                        className="w-full px-4 py-4 border border-secondary/20 rounded-sm focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all bg-background/50"
                        placeholder="PIN"
                      />
                    </div>
                  </div>

                  <div className="border-t border-secondary/10 my-6" />
                </>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 tracking-wide uppercase">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-4 border border-secondary/20 rounded-sm focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all bg-background/50"
                    placeholder="vendor@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 tracking-wide uppercase">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-4 border border-secondary/20 rounded-sm focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all bg-background/50"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent text-primary py-4 font-bold text-sm tracking-widest uppercase hover:bg-primary hover:text-surface transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-3"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Sign In to Dashboard" : "Create Vendor Account"}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle */}
            <div className="mt-8 text-center">
              <p className="text-text-secondary">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-2 text-accent font-bold hover:text-primary transition-colors"
                >
                  {isLogin ? "Register as Vendor" : "Sign In"}
                </button>
              </p>
            </div>

            {/* Back to main site */}
            <div className="mt-6 text-center">
              <Link
                to="/"
                className="text-sm text-text-secondary hover:text-accent transition-colors inline-flex items-center gap-2"
              >
                ← Back to Siraba Organic
              </Link>
            </div>
          </div>

          {/* Benefits Section */}
          {!isLogin && (
            <div className="mt-10 bg-surface/10 backdrop-blur-sm rounded-sm p-8 border border-white/10">
              <h3 className="font-heading text-xl text-surface mb-6 text-center">
                Why Partner with <span className="text-accent">Siraba?</span>
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { icon: Leaf, text: "Access to premium organic marketplace" },
                  { icon: Globe, text: "Reach quality-conscious customers globally" },
                  { icon: ShieldCheck, text: "Easy inventory & order management tools" },
                  { icon: Store, text: "Dedicated vendor support team" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 text-white/80">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-accent" />
                    </div>
                    <span className="font-light">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorLogin;
