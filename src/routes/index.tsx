import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Heart, 
  Shield, 
  Zap, 
  Globe, 
  ArrowRight, 
  CheckCircle2
} from "lucide-react";
import { cn } from "~/lib/utils";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function AgeGate({ onAccept }: { onAccept: () => void }) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
      <div className="max-w-md w-full bg-zinc-900 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500" />
        
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-pink-500/10 rounded-full flex items-center justify-center border-2 border-pink-500/20">
            <span className="text-3xl font-black text-pink-500 italic">18+</span>
          </div>
        </div>

        <h2 className="text-3xl font-black text-center text-white mb-4 uppercase italic tracking-tighter">Warning: Adult Only</h2>
        
        <div className="space-y-4 text-zinc-400 text-sm leading-relaxed mb-8">
          <p>
            You are about to enter a website that contains adult-oriented content, including live video chat with strangers that may include nudity.
          </p>
          <p>
            By clicking "Enter", you confirm that you are at least <span className="text-white font-bold">18 years of age</span> (or the legal age of majority in your jurisdiction) and that you agree to be bound by our <span className="text-pink-400 underline cursor-pointer">Terms of Service</span> and <span className="text-pink-400 underline cursor-pointer">Privacy Policy</span>.
          </p>
        </div>

        <div className="flex items-start gap-3 mb-8 group shrink-0">
          <div 
            onClick={() => setAgreed(!agreed)}
            className={cn(
              "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 mt-0.5 cursor-pointer",
              agreed ? "bg-pink-600 border-pink-600 text-white" : "border-white/20 hover:border-pink-500/50"
            )}
          >
            {agreed && <CheckCircle2 className="w-4 h-4" />}
          </div>
          <span className="text-xs text-zinc-500 leading-tight">
            I certify that I am over 18 and I agree to the terms, guidelines and privacy policy of Kamacam. This site is labeled with the <a href="https://www.rtalabel.org/index.html" target="_blank" rel="noopener noreferrer" className="text-pink-400 underline hover:text-pink-300">RTA (Restricted to Adults)</a> label.
          </span>
        </div>

        <div className="space-y-3">
          <button 
            onClick={onAccept}
            disabled={!agreed}
            className={cn(
              "w-full font-black py-5 rounded-2xl transition-all uppercase tracking-widest text-sm italic shadow-lg shadow-pink-500/20",
              agreed 
                ? "bg-pink-600 hover:bg-pink-700 text-white cursor-pointer" 
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50"
            )}
          >
            Enter Website
          </button>
          <button 
            onClick={() => window.location.href = "https://www.google.com"}
            className="w-full bg-transparent hover:bg-zinc-800 text-zinc-500 font-bold py-4 rounded-2xl transition-all text-xs uppercase tracking-widest"
          >
            I am under 18 - Exit
          </button>
        </div>
      </div>
    </div>
  );
}

function LandingPage() {
  const [ageVerified, setAgeVerified] = useState<boolean>(false);
  const [userGender, setUserGender] = useState<string>("random");

  useEffect(() => {
    const verified = localStorage.getItem("age-verified");
    const savedGender = localStorage.getItem("user-gender");
    
    if (verified === "true") {
      setAgeVerified(true);
    }
    if (savedGender) {
      setUserGender(savedGender);
    }
  }, []);

  const handleVerify = () => {
    localStorage.setItem("age-verified", "true");
    setAgeVerified(true);
  };

  const handleGenderSelect = (gender: string) => {
    setUserGender(gender);
    localStorage.setItem("user-gender", gender);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-200 selection:bg-pink-500/30 font-sans relative">
      {!ageVerified && (
        <AgeGate onAccept={handleVerify} />
      )}

      {/* Header */}
      <nav className="fixed top-0 w-full z-40 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Heart className="w-6 h-6 text-white fill-current" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white uppercase italic text-pink-500">Kamacam</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#safety" className="hover:text-white transition-colors">Safety</a>
            <Link to="/" className="text-pink-400 hover:text-pink-300 font-bold uppercase tracking-widest text-xs">Login</Link>
            <button className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2.5 rounded-full transition-all uppercase tracking-wider text-xs font-black shadow-lg shadow-pink-500/20">
              Join Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-pink-600/10 blur-[120px] rounded-full" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-pink-500 mb-6"
            >
              <Zap className="w-3 h-3 fill-current" />
              <span>Instant Matching • 100% Free • Secure</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-6xl md:text-8xl font-black tracking-tight text-white mb-8 italic uppercase"
            >
              Connect with <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">Strangers</span> Instantly.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-zinc-400 mb-6 leading-relaxed max-w-2xl"
            >
              The world's most advanced random video chat platform. No sign-up required. Just click start and meet someone new from around the globe.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mb-10"
            >
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">I am a:</p>
              <div className="flex gap-3">
                {["male", "female", "random"].map((g) => (
                  <button
                    key={g}
                    onClick={() => handleGenderSelect(g)}
                    className={cn(
                      "px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border italic",
                      userGender === g 
                        ? "bg-pink-600 border-pink-500 text-white shadow-lg shadow-pink-500/20" 
                        : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link 
                to="/chat" 
                className="group relative flex items-center justify-center gap-2 bg-pink-600 text-white font-black py-5 px-12 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-pink-500/20 uppercase tracking-widest italic"
              >
                Start Video Chat
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 font-bold py-5 px-12 rounded-2xl transition-all uppercase tracking-widest text-xs">
                Learn More
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="w-6 h-6" />}
              title="Ultra Fast"
              description="Our global relay network ensures the lowest latency video calls possible, no matter where you are."
            />
            <FeatureCard 
              icon={<Shield className="w-6 h-6" />}
              title="Private & Secure"
              description="Calls are peer-to-peer and encrypted. We don't store your video or audio data, ever."
            />
            <FeatureCard 
              icon={<Globe className="w-6 h-6" />}
              title="Global Community"
              description="Connect with millions of users from over 190 countries instantly with live translation support."
            />
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section id="safety" className="py-24 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black text-white mb-4 uppercase italic tracking-tight text-pink-500">Adult Freedom & Safety</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto mb-16">
            We believe in complete freedom of expression for adults. We do not censor content between consenting adults, but we maintain a zero-tolerance policy for any illegal content or harassment.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              "Consenting Adult Content",
              "Illegal Content Detection",
              "Anonymity Guaranteed",
              "Instant Ban for Abuse"
            ].map((text, i) => (
              <div key={i} className="flex items-center justify-center gap-3 text-zinc-300">
                <CheckCircle2 className="w-5 h-5 text-pink-500" />
                <span className="font-bold text-xs uppercase tracking-widest">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="text-lg font-black text-white tracking-tight uppercase italic">Kamacam</span>
          </div>
          <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">
            © 2024 Kamacam Inc. Adult only. Chat responsibly.
          </p>
          <div className="flex items-center gap-6 text-[10px] text-zinc-400 font-black uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Guidelines</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-[2rem] bg-zinc-900/50 border border-white/5 hover:border-pink-500/30 transition-all group">
      <div className="w-12 h-12 bg-pink-600/10 rounded-2xl flex items-center justify-center text-pink-500 mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-black text-white mb-3 uppercase italic tracking-tight">{title}</h3>
      <p className="text-zinc-400 leading-relaxed text-sm">{description}</p>
    </div>
  );
}
