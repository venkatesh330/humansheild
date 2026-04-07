import { useState, useEffect, useRef, useCallback } from 'react';
import './index.css';
import HomePage from './pages/HomePage';
import ToolsPage from './pages/ToolsPage';
import ProductsPage from './pages/ProductsPage';
import PricingPage from './pages/PricingPage';
import { SafeCareersPage } from './pages/SafeCareersPage';
import { LearningHubPage } from './pages/LearningHubPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { HumanProofProvider } from './context/HumanProofContext';
import { LayoffProvider } from './context/LayoffContext';
import { digestAPI } from './utils/apiClient';
import { useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { ToastProvider } from './components/Toast';
import { SpeedInsights } from '@vercel/speed-insights/react';

type Page = 'home' | 'calculator' | 'products' | 'pricing' | 'safe-careers' | 'learning-hub' | 'audit-log';

function useParticleBackground(canvasId: string) {
  useEffect(() => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let particles: { x: number; y: number; vx: number; vy: number; r: number }[] = [];
    const count = 50;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    const init = () => {
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 2 + 1,
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(100, 150, 255, 0.2)';
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(draw);
    };
    window.addEventListener('resize', resize);
    resize();
    init();
    draw();
    return () => window.removeEventListener('resize', resize);
  }, [canvasId]);
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [subEmail, setSubEmail] = useState('');
  const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [initialParams, setInitialParams] = useState<any>(null);
  const { user, signOut } = useAuth();

  useParticleBackground('bg-canvas');

  useEffect(() => {
    const handleNav = (e: any) => {
      // Fix BUG-010: Support both string and object payloads
      if (typeof e.detail === 'string') {
        setCurrentPage(e.detail as Page);
        setInitialParams(null);
      } else if (e.detail?.page) {
        setCurrentPage(e.detail.page as Page);
        setInitialParams(e.detail.params || null);
      }
    };
    window.addEventListener('navigate', handleNav);
    return () => window.removeEventListener('navigate', handleNav);
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subEmail) return;
    setSubStatus('loading');
    try {
      await digestAPI.subscribe(subEmail);
      setSubStatus('success');
      setSubEmail(''); // Clear on success
      setTimeout(() => setSubStatus('idle'), 3000);
    } catch (err) {
      setSubStatus('error');
      // Fix BUG-016: Clear on error too for better UX
      setSubEmail('');
      setTimeout(() => setSubStatus('idle'), 3000);
    }
  };

  return (
    <ToastProvider>
      <HumanProofProvider>
        <LayoffProvider>
          <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-cyan-500/30">
            <canvas id="bg-canvas" className="fixed inset-0 pointer-events-none opacity-40" />
            
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/50 bg-[#020617]/80 backdrop-blur-md">
              <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div 
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => setCurrentPage('home')}
                  >
                    <div className="w-10 h-10 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                      <span className="text-white font-bold text-xl">H</span>
                    </div>
                    <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                      HUMANPROOF
                    </span>
                  </div>
                  
                  <div className="hidden md:flex items-center gap-1 bg-slate-900/50 p-1 rounded-lg border border-slate-800/50">
                    {[
                      { id: 'home', label: 'Home' },
                      { id: 'calculator', label: 'AI Risk' },
                      { id: 'safe-careers', label: 'Safe Jobs' },
                      { id: 'learning-hub', label: 'Upskill' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setCurrentPage(item.id as Page)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          currentPage === item.id 
                            ? 'bg-slate-800 text-white shadow-sm' 
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {user ? (
                    <div className="flex items-center gap-4">
                      <div className="h-8 w-px bg-slate-800 mx-2" />
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-slate-500">ACCOUNT</span>
                        <span className="text-sm font-medium text-slate-300">{user.email?.split('@')[0]}</span>
                      </div>
                      <button 
                        onClick={() => signOut()}
                        className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsAuthModalOpen(true)}
                      className="px-6 py-2.5 bg-white text-black font-bold rounded-full hover:bg-cyan-50 transition-all active:scale-95 shadow-lg shadow-white/10"
                    >
                      Login / Join
                    </button>
                  )}
                </div>
              </div>
            </nav>

            <main className="pt-20">
              {currentPage === 'home' && <HomePage onStart={() => setCurrentPage('calculator')} />}
              {currentPage === 'calculator' && <ToolsPage />}
              {currentPage === 'safe-careers' && <SafeCareersPage />}
              {currentPage === 'learning-hub' && <LearningHubPage initialRoleKey={initialParams?.roleKey} />}
              {currentPage === 'audit-log' && <AuditLogPage />}
              {currentPage === 'products' && <ProductsPage />}
              {currentPage === 'pricing' && <PricingPage />}
            </main>

            <footer className="mt-20 border-t border-slate-800/50 bg-slate-950/50 py-16">
              <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                  <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">H</span>
                      </div>
                      <span className="font-bold text-lg tracking-tight">HUMANPROOF</span>
                    </div>
                    <p className="text-slate-400 max-w-sm mb-8 leading-relaxed">
                      Equipping the workforce for the AI era. We provide data-driven insights 
                      and personalized learning paths to keep your career future-proof.
                    </p>
                    <div className="flex gap-4">
                      {['Twitter', 'LinkedIn', 'Github'].map(social => (
                        <a key={social} href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-all">
                          <span className="sr-only">{social}</span>
                          <div className="w-5 h-5 bg-current opacity-20 rounded-sm" />
                        </a>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-slate-500">Platform</h4>
                    <ul className="space-y-4">
                      <li><button onClick={() => setCurrentPage('calculator')} className="text-slate-400 hover:text-white transition-colors">Risk Assessment</button></li>
                      <li><button onClick={() => setCurrentPage('learning-hub')} className="text-slate-400 hover:text-white transition-colors">Upskill Path</button></li>
                      <li><button onClick={() => setCurrentPage('safe-careers')} className="text-slate-400 hover:text-white transition-colors">Safe Careers</button></li>
                      <li><button onClick={() => setCurrentPage('pricing')} className="text-slate-400 hover:text-white transition-colors">Pro Access</button></li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-slate-500">Stay Human</h4>
                    <p className="text-slate-400 text-sm mb-4">Get the weekly 'Human Advantage' digest.</p>
                    <form onSubmit={handleSubscribe} className="flex gap-2">
                      <input 
                        type="email" 
                        placeholder="Email" 
                        value={subEmail}
                        onChange={(e) => setSubEmail(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-cyan-500 w-full"
                        required
                      />
                      <button 
                        type="submit"
                        disabled={subStatus === 'loading'}
                        className="bg-cyan-500 text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-cyan-400 transition-colors disabled:opacity-50"
                      >
                        {subStatus === 'loading' ? '...' : subStatus === 'success' ? '✓' : 'Join'}
                      </button>
                    </form>
                    {subStatus === 'error' && <p className="text-red-400 text-xs mt-2">Failed to join. Try again.</p>}
                  </div>
                </div>
                
                <div className="mt-16 pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
                  <p className="text-slate-500 text-sm">© 2026 HumanProof AI. All rights reserved.</p>
                  <div className="flex gap-8 text-sm">
                    <a href="#" className="text-slate-500 hover:text-slate-300">Privacy Policy</a>
                    <a href="#" className="text-slate-500 hover:text-slate-300">Terms of Service</a>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </LayoffProvider>
      </HumanProofProvider>
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
      <SpeedInsights />
    </ToastProvider>
  );
}

export default App;
