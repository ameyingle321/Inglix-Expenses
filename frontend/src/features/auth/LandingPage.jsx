import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import clsx from 'clsx';

const LandingPage = () => {
  const { signIn, signUp } = useAuth();
  const toast = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const validateForm = () => {
    if (!email.trim() || !password.trim()) {
      return "Please fill in all fields.";
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return "Please enter a valid email address.";
    }
    
    if (password.length < 6) {
      return "Password must be at least 6 characters long.";
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setLoading(true);
    
    try {
      if (isLogin) {
        console.log("Attempting sign in for:", email);
        const { data, error: authError } = await signIn({ email: email.trim(), password });
        
        if (authError) {
          console.error("SignIn Error:", authError.message);
          throw authError;
        }
        
        console.log("Sign in successful:", data);
        toast.success("Welcome back!");
      } else {
        console.log("Attempting sign up for:", email);
        const { data, error: authError } = await signUp({ email: email.trim(), password });
        
        if (authError) {
          console.error("SignUp Error:", authError.message);
          throw authError;
        }
        
        console.log("Sign up successful:", data);
        
        // Check if email confirmation is required by Supabase settings
        if (data?.user && !data?.session) {
          toast.success("Account created! Please check your email to confirm.");
          setIsLogin(true); // Switch to login view
        } else {
          toast.success("Account created successfully!");
        }
      }
    } catch (err) {
      // Provide a clean message to the user
      const message = err.message || "An unexpected error occurred.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col relative overflow-hidden bg-cover bg-center bg-no-repeat" style={{backgroundImage: "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2400&auto=format&fit=crop')"}}>
      
      {/* Overlay to darken background slightly and add vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/60 pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 w-full p-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white font-semibold text-xl tracking-tight">
          <div className="w-6 h-6 bg-white/20 rounded-md flex items-center justify-center backdrop-blur-md border border-white/30">
            <div className="w-3 h-3 bg-white rounded-sm" />
          </div>
          Inglix Expenses
        </div>
        
        <nav className="hidden md:flex gap-8 text-sm font-medium text-white/80">
          <a href="#" className="hover:text-white transition-colors">Product</a>
          <a href="#" className="hover:text-white transition-colors">Use cases</a>
          <a href="#" className="hover:text-white transition-colors">Pricing</a>
        </nav>
        
        <button 
          onClick={() => {
            setIsLogin(!isLogin);
            setError(null);
          }}
          className="bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-white px-5 py-2 rounded-full text-sm font-medium transition-all"
        >
          {isLogin ? 'Sign up' : 'Sign in'}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-10 pb-20">
        
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-xs font-medium text-orange-100 uppercase tracking-wider">AI Built for teams that ship</span>
          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
        </div>
        
        {/* Hero Text */}
        <div className="text-center max-w-3xl mb-12">
          <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tight leading-tight mb-6 drop-shadow-lg">
            Think faster.<br/>
            <span className="text-white/80">Track smarter.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 font-medium max-w-2xl mx-auto drop-shadow-md">
            Inglix sits inside your workflow — answering, drafting, and deciding in real time. No context switching. No prompt engineering.
          </p>
        </div>

        {/* Auth Form (Glassmorphic) */}
        <div className="w-full max-w-md p-8 rounded-3xl glass-dark animate-fade-in-up">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 text-red-200 text-sm rounded-lg backdrop-blur-md animate-fade-in-up">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all backdrop-blur-sm"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all backdrop-blur-sm"
                placeholder="••••••••"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className={clsx(
                "w-full mt-2 flex items-center justify-center gap-2 bg-white text-black font-semibold rounded-full px-6 py-3.5 transition-all",
                "hover:bg-gray-100 hover:scale-[1.02] active:scale-95",
                loading && "opacity-70 cursor-not-allowed"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {isLogin ? 'Sign in to workspace' : 'Start tracking for free'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

      </main>
    </div>
  );
};

export default LandingPage;
