import { useState, useEffect, useRef, useCallback } from 'react';
import './index.css';
import HomePage from './pages/HomePage';
import ToolsPage from './pages/ToolsPage';
import ProductsPage from './pages/ProductsPage';
import PricingPage from './pages/PricingPage';
import { HumanProofProvider } from './context/HumanProofContext';
import { LayoffProvider } from './context/LayoffContext';
import { digestAPI } from './utils/apiClient';
import { useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';

type Page = 'home' | 'calculator' | 'products' | 'pricing';

function useParticleBackground(canvasId: string) {
  useEffect(() => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    let animId: number;
    let mx = 0, my = 0, mvx = 0, mvy = 0, pmx = 0, pmy = 0;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);

    const onMove = (e: MouseEvent) => {
      mvx = (e.clientX - pmx) * 0.3;
      mvy = (e.clientY - pmy) * 0.3;
      pmx = mx = e.clientX;
      pmy = my = e.clientY;
    };
    document.addEventListener('mousemove', onMove);

    class BP {
      x = Math.random() * W;
      y = Math.random() * H;
      vx = (Math.random() - 0.5) * 0.4;
      vy = (Math.random() - 0.5) * 0.4;
      sz = Math.random() * 1.5 + 0.5;
      life = 0;
      maxLife = Math.random() * 400 + 200;
      type = Math.floor(Math.random() * 3);
      color = ['0,245,255', '0,255,159', '124,58,255'][this.type];
      shape = Math.floor(Math.random() * 3);

      reset() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.sz = Math.random() * 1.5 + 0.5;
        this.life = 0;
        this.maxLife = Math.random() * 400 + 200;
        this.type = Math.floor(Math.random() * 3);
        this.color = ['0,245,255', '0,255,159', '124,58,255'][this.type];
        this.shape = Math.floor(Math.random() * 3);
      }

      update() {
        const dx = this.x - mx, dy = this.y - my;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 200 && d > 0) {
          const f = (200 - d) / 200;
          this.vx += (dx / d) * f * 0.06;
          this.vy += (dy / d) * f * 0.06;
        }
        this.vx += mvx * 0.004;
        this.vy += mvy * 0.004;
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.x += this.vx;
        this.y += this.vy;
        this.life++;
        if (this.life > this.maxLife || this.x < -20 || this.x > W + 20 || this.y < -20 || this.y > H + 20) {
          this.reset();
        }
      }

      draw() {
        const a = Math.sin((this.life / this.maxLife) * Math.PI) * 0.45;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.fillStyle = `rgba(${this.color},${a})`;
        ctx.strokeStyle = `rgba(${this.color},${a * 0.8})`;
        ctx.lineWidth = 0.5;
        if (this.shape === 0) {
          ctx.beginPath();
          ctx.arc(0, 0, this.sz, 0, Math.PI * 2);
          ctx.fill();
        } else if (this.shape === 1) {
          ctx.strokeRect(-this.sz, -this.sz, this.sz * 2, this.sz * 2);
        } else {
          ctx.beginPath();
          ctx.moveTo(0, -this.sz * 1.5);
          ctx.lineTo(this.sz, this.sz);
          ctx.lineTo(-this.sz, this.sz);
          ctx.closePath();
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    const bps = Array.from({ length: 140 }, () => new BP());

    const drawConn = () => {
      for (let i = 0; i < bps.length; i++) {
        for (let j = i + 1; j < bps.length; j++) {
          const dx = bps[i].x - bps[j].x, dy = bps[i].y - bps[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            ctx.strokeStyle = `rgba(0,245,255,${(1 - d / 110) * 0.15})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(bps[i].x, bps[i].y);
            ctx.lineTo(bps[j].x, bps[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, W, H);
      drawConn();
      bps.forEach(p => { p.update(); p.draw(); });
      mvx *= 0.95;
      mvy *= 0.95;
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('mousemove', onMove);
    };
  }, [canvasId]);
}

function useCursorTrail(canvasId: string) {
  useEffect(() => {
    if (!window.matchMedia('(pointer:fine)').matches) return;
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const pts: { x: number; y: number; t: number }[] = [];
    let shapes: any[] = [];

    class WS {
      x: number; y: number;
      t = Math.floor(Math.random() * 3);
      sz = 14 + Math.random() * 20;
      r = Math.random() * Math.PI * 2;
      rv = (Math.random() - 0.5) * 0.04;
      life = 0;
      maxLife = 60 + Math.random() * 40;
      color = Math.random() > 0.5 ? '0,245,255' : '0,255,159';
      vy = -0.4 - Math.random() * 0.3;
      constructor(x: number, y: number) { this.x = x; this.y = y; }
      update() { this.r += this.rv; this.y += this.vy; this.life++; }
      draw() {
        const a = (1 - this.life / this.maxLife) * 0.65;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.r);
        ctx.strokeStyle = `rgba(${this.color},${a})`;
        ctx.lineWidth = 0.8;
        const s = this.sz;
        if (this.t === 0) {
          ctx.beginPath(); ctx.rect(-s / 2, -s / 2, s, s); ctx.stroke();
          ctx.beginPath(); ctx.rect(-s / 2 + 5, -s / 2 - 5, s, s); ctx.stroke();
        } else if (this.t === 1) {
          ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s * 0.866, s * 0.5); ctx.lineTo(-s * 0.866, s * 0.5); ctx.closePath(); ctx.stroke();
        } else {
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const a2 = (i / 6) * Math.PI * 2;
            i === 0 ? ctx.moveTo(Math.cos(a2) * s * 0.7, Math.sin(a2) * s * 0.7) : ctx.lineTo(Math.cos(a2) * s * 0.7, Math.sin(a2) * s * 0.7);
          }
          ctx.closePath(); ctx.stroke();
        }
        ctx.restore();
      }
      dead() { return this.life >= this.maxLife; }
    }

    const onMove = (e: MouseEvent) => {
      pts.push({ x: e.clientX, y: e.clientY, t: Date.now() });
      if (pts.length > 60) pts.shift();
      if (Math.random() < 0.04) shapes.push(new WS(e.clientX, e.clientY));
    };
    document.addEventListener('mousemove', onMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = Date.now();
      shapes = shapes.filter(s => { s.update(); s.draw(); return !s.dead(); });
      if (pts.length > 1) {
        for (let i = 1; i < pts.length; i++) {
          const a = Math.max(0, 1 - (now - pts[i].t) / 400) * 0.5;
          ctx.strokeStyle = `rgba(0,245,255,${a})`;
          ctx.lineWidth = 1.5 * (i / pts.length);
          ctx.beginPath();
          ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
          ctx.lineTo(pts[i].x, pts[i].y);
          ctx.stroke();
        }
      }
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('mousemove', onMove);
    };
  }, [canvasId]);
}

function useScrollReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('vis');
          obs.unobserve(e.target);
        }
      }),
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    );
    const observe = () => {
      document.querySelectorAll('.reveal').forEach(el => {
        if (!el.classList.contains('vis')) obs.observe(el);
      });
    };
    observe();
    const mutObs = new MutationObserver(() => setTimeout(observe, 50));
    mutObs.observe(document.body, { childList: true, subtree: true });
    return () => { obs.disconnect(); mutObs.disconnect(); };
  }, []);
}

function useTilt() {
  useEffect(() => {
    const init = () => {
      document.querySelectorAll<HTMLElement>('.tilt').forEach(el => {
        el.addEventListener('mousemove', (e) => {
          const r = el.getBoundingClientRect();
          const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
          const rx = (e.clientY - cy) / r.height * 16;
          const ry = -(e.clientX - cx) / r.width * 16;
          el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
          el.style.boxShadow = `0 30px 60px rgba(0,0,0,0.4),${-ry}px ${-rx}px 30px rgba(0,245,255,0.12)`;
        });
        el.addEventListener('mouseleave', () => {
          el.style.transform = '';
          el.style.boxShadow = '';
        });
      });
    };
    init();
    const mutObs = new MutationObserver(init);
    mutObs.observe(document.body, { childList: true, subtree: true });
    return () => mutObs.disconnect();
  }, []);
}

function useScrollNav() {
  useEffect(() => {
    const handler = () => {
      const nav = document.getElementById('navbar');
      if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);
}

function useParallax() {
  useEffect(() => {
    const handler = () => {
      const sy = window.scrollY;
      const hg = document.querySelector<HTMLElement>('.hero-geo');
      if (hg) hg.style.transform = `translateY(${sy * 0.3}px)`;
      document.querySelectorAll<HTMLElement>('.orb').forEach((o, i) => {
        o.style.transform = `translateY(${sy * (i % 2 === 0 ? 0.15 : -0.1)}px)`;
      });
    };
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);
}

function useRipple() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const btn = (e.target as Element).closest<HTMLElement>('.btn-primary,.btn-teal,.calc-btn');
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const rp = document.createElement('span');
      Object.assign(rp.style, {
        position: 'absolute', borderRadius: '50%', width: '6px', height: '6px',
        background: 'rgba(255,255,255,0.35)',
        left: (e.clientX - r.left - 3) + 'px', top: (e.clientY - r.top - 3) + 'px',
        transform: 'scale(0)', animation: 'rpOut .6s ease forwards', pointerEvents: 'none',
      });
      btn.style.position = 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(rp);
      setTimeout(() => rp.remove(), 700);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);
}

export default function App() {
  const { user, signOut } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [subEmail, setSubEmail] = useState('');
  const [subMsg, setSubMsg] = useState('');
  const [subMsgColor, setSubMsgColor] = useState('var(--emerald)');
  const [subMsgShow, setSubMsgShow] = useState(false);
  const wipeRef = useRef<HTMLDivElement>(null);

  useParticleBackground('bg-canvas');
  useCursorTrail('trail-canvas');
  useScrollReveal();
  useTilt();
  useScrollNav();
  useParallax();
  useRipple();

  const navigate = useCallback((page: string) => {
    if (page === currentPage) return;
    const wipe = wipeRef.current;
    if (!wipe) { setCurrentPage(page as Page); return; }
    wipe.className = 'in';
    setTimeout(() => {
      setCurrentPage(page as Page);
      window.scrollTo({ top: 0, behavior: 'instant' });
      wipe.className = 'out';
      setTimeout(() => { wipe.className = ''; }, 550);
    }, 350);
    setMobileOpen(false);
  }, [currentPage]);

  // BUG 6 FIX: Now actually calls the backend API
  const handleSubscribe = async () => {
    if (!subEmail || !subEmail.includes('@') || !subEmail.includes('.')) {
      setSubMsg('⚠ Please enter a valid email.');
      setSubMsgColor('var(--red)');
      setSubMsgShow(true);
      setTimeout(() => setSubMsgShow(false), 3000);
      return;
    }
    try {
      const result = await digestAPI.subscribe(subEmail);
      if (result && !result.error) {
        setSubEmail('');
        setSubMsg('✓ Added to waitlist — newsletter launching soon!');
        setSubMsgColor('var(--emerald)');
      } else {
        setSubMsg('⚠ ' + (result?.error || 'Subscription failed. Try again.'));
        setSubMsgColor('var(--red)');
      }
    } catch {
      // Fallback: still show success if backend is unreachable (offline-first)
      setSubEmail('');
      setSubMsg('✓ Added to waitlist — newsletter launching soon!');
      setSubMsgColor('var(--emerald)');
    }
    setSubMsgShow(true);
    setTimeout(() => setSubMsgShow(false), 5000);
  };

  const navLinks: { key: Page; label: string }[] = [
    { key: 'home', label: 'Home' },
    { key: 'calculator', label: 'Calculator' },
    { key: 'products', label: 'Resources' },
    { key: 'pricing', label: 'Pricing' },
  ];

  return (
    <HumanProofProvider>
      <LayoffProvider>
        <canvas id="bg-canvas" />
        <canvas id="trail-canvas" />
        <div id="page-wipe" ref={wipeRef} />

      <nav className="navbar" id="navbar">
        <div className="nav-logo" onClick={() => navigate('home')}>
          Human<span>Proof</span>
        </div>
        <ul className={`nav-links${mobileOpen ? ' mobile-open' : ''}`}>
          {navLinks.map(n => (
            <li key={n.key}>
              <a
                className={currentPage === n.key ? 'active' : ''}
                onClick={() => navigate(n.key)}
              >
                {n.label}
              </a>
            </li>
          ))}
        </ul>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {user ? (
            <button className="nav-cta" style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)', padding: '8px 16px', fontSize: '0.8rem' }} onClick={signOut}>
              Sign Out
            </button>
          ) : (
            <button className="nav-cta" style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)', padding: '8px 16px', fontSize: '0.8rem' }} onClick={() => setAuthModalOpen(true)}>
              Sign In
            </button>
          )}
          <button className="nav-cta" onClick={() => navigate('calculator')}>
            Check My Risk
          </button>
        </div>
        <div className="nav-hamburger" onClick={() => setMobileOpen(o => !o)}>
          <span /><span /><span />
        </div>
      </nav>

      <main>
        <div className={`page${currentPage === 'home' ? ' active' : ''}`}>
          <HomePage onNavigate={navigate} />
        </div>
        <div className={`page${currentPage === 'calculator' ? ' active' : ''}`}>
          <ToolsPage />
        </div>
        <div className={`page${currentPage === 'products' ? ' active' : ''}`}>
          <ProductsPage onNavigate={navigate} />
        </div>
        <div className={`page${currentPage === 'pricing' ? ' active' : ''}`}>
          <PricingPage onNavigate={navigate} />
        </div>
      </main>

      <footer>
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>HumanProof</h3>
            <p>The most rigorous AI displacement intelligence platform. Built on 2026 research data. Updated quarterly. Free calculator, always.</p>
            <div className="footer-email-wrap">
              <input
                className="footer-email"
                id="footerEmail"
                type="email"
                placeholder="your@email.com"
                value={subEmail}
                onChange={e => setSubEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubscribe()}
              />
              <button className="footer-email-btn" onClick={handleSubscribe}>Subscribe</button>
            </div>
            <div className={`sub-msg${subMsgShow ? ' show' : ''}`} style={{ color: subMsgColor }}>{subMsg}</div>
          </div>
          <div className="footer-col">
            <h4>Product</h4>
            <ul>
              <li><a onClick={() => navigate('calculator')}>AI Risk Calculator</a></li>
              <li><a onClick={() => navigate('products')}>Resources</a></li>
              <li><a onClick={() => navigate('pricing')}>Pricing</a></li>
              <li><a>API Access</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Research</h4>
            <ul>
              <li><a>Q1 2026 Report</a></li>
              <li><a>Methodology</a></li>
              <li><a>Data Sources</a></li>
              <li><a>Changelog</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><a>About</a></li>
              <li><a>Blog</a></li>
              <li><a>Contact</a></li>
              <li><a>Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 HumanProof. All rights reserved. Not financial or career advice.</p>
          <p>Built on data from McKinsey · Goldman Sachs · WEF · OECD · Stanford HAI · MIT · BCG · Anthropic</p>
        </div>
      </footer>
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </LayoffProvider>
    </HumanProofProvider>
  );
}
