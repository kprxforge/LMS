import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

/* ─────────────────────────────────────────────────────────────────────────────
   Particle type for canvas animation
───────────────────────────────────────────────────────────────────────────── */
interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  radius: number;
  alpha: number; maxAlpha: number;
  phase: number; pulseSpeed: number;
}

/* ─────────────────────────────────────────────────────────────────────────────
   WallpaperLayer — Premium pre-login animated background
   ✦ ONLY renders on /login and /  (unauthenticated)
   ✦ Fades out with 950ms exit animation on login success
   ✦ Restarts cleanly after logout
───────────────────────────────────────────────────────────────────────────── */
export function WallpaperLayer() {
  /* ── Admin wallpaper settings ──────────────────────────────────────────── */
  const [wallpaper,    setWallpaper]    = useState<string | null>(null);
  const [wBrightness,  setWBrightness]  = useState(100);
  const [wBlur,        setWBlur]        = useState(0);
  const [wOpacity,     setWOpacity]     = useState(100);

  /* ── Lifecycle ─────────────────────────────────────────────────────────── */
  const [alive,   setAlive]   = useState(false); // controls render
  const [visible, setVisible] = useState(false); // controls opacity (fade in/out)

  /* ── Mouse parallax ────────────────────────────────────────────────────── */
  const [mousePos,  setMousePos]  = useState({ x: 0, y: 0 }); // CSS parallax
  const rawMouseRef    = useRef({ x: 0, y: 0 });  // raw mouse [-1,1]
  const smoothMouseRef = useRef({ x: 0, y: 0 });  // lerped smooth mouse
  const prevSmoothRef  = useRef({ x: 0, y: 0 });  // for minimal re-renders

  /* ── Hooks ─────────────────────────────────────────────────────────────── */
  const { user }   = useAuth();
  const { theme }  = useTheme();
  const location   = useLocation();
  const canvasRef  = useRef<HTMLCanvasElement | null>(null);

  /* ── Track previous user for exit animation ────────────────────────────── */
  const prevUserRef = useRef(user);

  /* ── Route gate ────────────────────────────────────────────────────────── */
  const isPreLogin = location.pathname === '/login' || location.pathname === '/';

  /* ── Load admin wallpaper from localStorage ────────────────────────────── */
  const loadWallpaper = useCallback(() => {
    setWallpaper(localStorage.getItem('admin_wallpaper'));
    const b  = localStorage.getItem('admin_wallpaper_brightness');
    const bl = localStorage.getItem('admin_wallpaper_blur');
    const op = localStorage.getItem('admin_wallpaper_opacity');
    setWBrightness(b  ? Number(b)  : 100);
    setWBlur(       bl ? Number(bl) : 0);
    setWOpacity(    op ? Number(op) : 100);
  }, []);

  /* ── One-time: wallpaper listener + raw mouse tracker ─────────────────── */
  useEffect(() => {
    loadWallpaper();
    window.addEventListener('wallpaper-changed', loadWallpaper);
    const onMove = (e: MouseEvent) => {
      rawMouseRef.current = {
        x: (e.clientX / window.innerWidth)  * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      };
    };
    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('wallpaper-changed', loadWallpaper);
      window.removeEventListener('mousemove', onMove);
    };
  }, [loadWallpaper]);

  /* ── Visibility controller — handles enter + exit animations ───────────── */
  useEffect(() => {
    const prev = prevUserRef.current;
    prevUserRef.current = user;

    /* Not a pre-login route → hide immediately */
    if (!isPreLogin) {
      setVisible(false);
      setAlive(false);
      return;
    }

    /* Pre-login, unauthenticated → show with fade-in */
    if (!user) {
      setAlive(true);
      const t = setTimeout(() => setVisible(true), 80);
      return () => clearTimeout(t);
    }

    /* Login event: null → user  → cinematic fade-out then unmount */
    if (prev === null && user !== null) {
      setVisible(false);
      const t = setTimeout(() => setAlive(false), 950);
      return () => clearTimeout(t);
    }

    /* Authenticated on login page (edge case) → instant hide */
    setVisible(false);
    setAlive(false);
  }, [user, isPreLogin]);

  /* ── Smooth inertia mouse → React state for CSS parallax ──────────────── */
  useEffect(() => {
    if (!alive) return;
    let raf: number;
    const tick = () => {
      const sm = smoothMouseRef.current;
      const rm = rawMouseRef.current;
      sm.x += (rm.x - sm.x) * 0.045;
      sm.y += (rm.y - sm.y) * 0.045;
      const pv = prevSmoothRef.current;
      if (Math.abs(sm.x - pv.x) > 0.0008 || Math.abs(sm.y - pv.y) > 0.0008) {
        prevSmoothRef.current = { x: sm.x, y: sm.y };
        setMousePos({ x: sm.x, y: sm.y });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [alive]);

  /* ── Canvas: particles + dotted wave-modulated connection lines ─────────── */
  useEffect(() => {
    if (!alive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let raf: number;
    let waveT = 0;

    const buildParticles = () => {
      const count = Math.min(62, Math.floor((canvas.width * canvas.height) / 21000));
      particles = Array.from({ length: count }, () => {
        const alpha = Math.random() * 0.20 + 0.07;
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.17,
          vy: (Math.random() - 0.5) * 0.17,
          radius:     Math.random() * 1.8 + 1.0,
          alpha,
          maxAlpha:   alpha,
          phase:      Math.random() * Math.PI * 2,
          pulseSpeed: 0.004 + Math.random() * 0.007,
        };
      });
    };

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      buildParticles();
    };

    window.addEventListener('resize', resize);
    resize();

    const dark = theme === 'dark';

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      waveT += 0.006; // very slow wave

      /* Parallax offset from smooth mouse */
      ctx.save();
      ctx.translate(
        smoothMouseRef.current.x * 12,
        smoothMouseRef.current.y * 12,
      );

      /* ── Particles ── */
      particles.forEach(p => {
        /* Move + wrap edges */
        p.x += p.vx; p.y += p.vy;
        if (p.x < -20) p.x = canvas.width  + 20;
        if (p.x > canvas.width  + 20) p.x = -20;
        if (p.y < -20) p.y = canvas.height + 20;
        if (p.y > canvas.height + 20) p.y = -20;

        /* Pulsing alpha × wave modulation */
        p.phase += p.pulseSpeed;
        const wave  = 0.6 + 0.4 * Math.sin(p.x * 0.007 + waveT);
        const pulse = 0.5 + 0.5 * Math.sin(p.phase);
        const a     = p.maxAlpha * pulse * wave;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        if (dark) {
          ctx.fillStyle   = `rgba(250,213,61,${a})`;
          ctx.shadowColor = 'rgba(250,213,61,0.45)';
        } else {
          ctx.fillStyle   = `rgba(88,56,212,${a * 0.62})`;
          ctx.shadowColor = 'rgba(88,56,212,0.28)';
        }
        ctx.shadowBlur = 9;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      /* ── Dotted connection lines ── */
      ctx.setLineDash([2, 9]);
      ctx.lineWidth = 0.7;

      for (let i = 0; i < particles.length - 1; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx   = particles[i].x - particles[j].x;
          const dy   = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 178) {
            const a = (1 - dist / 178) * (dark ? 0.13 : 0.09);
            ctx.strokeStyle = dark
              ? `rgba(255,255,200,${a})`
              : `rgba(60,38,180,${a})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      ctx.restore();
      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, [alive, theme]);

  /* ── CSS parallax helper ────────────────────────────────────────────────── */
  const par = (factor: number): React.CSSProperties => ({
    transform:   `translate(${mousePos.x * factor}px, ${mousePos.y * factor}px)`,
    willChange:  'transform',
    transition:  'transform 0.05s linear',
  });

  /* ── Early return: don't render when not needed ─────────────────────────── */
  if (!alive) return null;

  const dark = theme === 'dark';

  /* ── Design tokens ── */
  const T = {
    stroke:    dark ? '#b0b0b0' : '#0f0f0f',
    pageWhite: dark ? '#1c1c1c' : '#fefefe',
    pageLine:  dark ? '#3a3a3a' : '#e0e4ea',
    book1:     dark ? '#173554' : '#dbeafe',
    book2:     dark ? '#1a3a2e' : '#d1fae5',
    book3:     dark ? '#2e1a4a' : '#ede9fe',
    book4:     dark ? '#3d2010' : '#fef3c7',
    capFill:   dark ? '#1e1b55' : '#e0e7ff',
    capStroke: dark ? '#818cf8' : '#4338ca',
    pencil:    dark ? '#78350f' : '#fef3c7',
    notebook:  dark ? '#1e3a5f' : '#dbeafe',
    nbLine:    dark ? '#264a72' : '#93c5fd',
    bkFill:    dark ? '#7f1d1d' : '#fee2e2',
    bkStroke:  dark ? '#f87171' : '#dc2626',
    quillGreen:dark ? '#a7f3d0' : '#059669',
    starGold:  dark ? '#fbbf24' : '#d97706',
  };

  return (
    <div
      style={{
        position:   'fixed',
        inset:      0,
        zIndex:     0,
        overflow:   'hidden',
        pointerEvents: 'none',
        userSelect: 'none',
        opacity:    visible ? 1 : 0,
        transition: 'opacity 0.95s cubic-bezier(0.4,0,0.2,1)',
        willChange: 'opacity',
      }}
    >
      {/* ══════════════════════════════════════════════════════════════════════
          CSS KEYFRAMES — all animations defined once
      ══════════════════════════════════════════════════════════════════════ */}
      <style>{`
        /* ── Background breathing ── */
        @keyframes wl-breathe {
          0%,100% { transform: scale(1.00); }
          50%      { transform: scale(1.025); }
        }

        /* ── Background drift (wallpaper) ── */
        @keyframes wl-drift {
          0%   { transform: scale(1.04) translate(0px,   0px); }
          25%  { transform: scale(1.01) translate(12px, -9px); }
          50%  { transform: scale(1.05) translate(-8px,  7px); }
          75%  { transform: scale(1.02) translate(6px,  -5px); }
          100% { transform: scale(1.04) translate(0px,   0px); }
        }

        /* ── 5 floating variants — very slow, elegant ── */
        @keyframes wl-fa {
          0%,100% { transform: translateY(0px)   rotate( 0deg); }
          50%      { transform: translateY(-24px) rotate( 3deg); }
        }
        @keyframes wl-fb {
          0%,100% { transform: translateY(0px)   rotate(  0deg); }
          50%      { transform: translateY(-18px) rotate(-4deg); }
        }
        @keyframes wl-fc {
          0%,100% { transform: translateY(0px)   rotate( 0deg); }
          50%      { transform: translateY(-30px) rotate( 5deg); }
        }
        @keyframes wl-fd {
          0%,100% { transform: translateY(0px)   rotate(  0deg); }
          50%      { transform: translateY(-14px) rotate(-2deg); }
        }
        @keyframes wl-fe {
          0%,100% { transform: translateY(0px)   rotate(-5deg); }
          50%      { transform: translateY(-20px) rotate( 3deg); }
        }
        .wl-fa { animation: wl-fa 18s ease-in-out infinite; }
        .wl-fb { animation: wl-fb 22s ease-in-out infinite; }
        .wl-fc { animation: wl-fc 26s ease-in-out infinite; }
        .wl-fd { animation: wl-fd 20s ease-in-out infinite; }
        .wl-fe { animation: wl-fe 24s ease-in-out infinite; }

        /* ── Page-flip ── */
        @keyframes wl-flip {
          0%,28%  { transform: rotateY(0deg);    opacity: 1; }
          46%,54% { transform: rotateY(-172deg); opacity: 0.65; }
          72%,100%{ transform: rotateY(0deg);    opacity: 1; }
        }

        /* ── Pencil write bobble ── */
        @keyframes wl-pencil {
          0%,100% { transform: translateY(0px)   rotate(-13deg); }
          50%      { transform: translateY(-16px) rotate(-8deg); }
        }

        /* ── Lightbulb glow pulse ── */
        @keyframes wl-glow {
          0%,100% { filter: drop-shadow(0 0 2px rgba(251,191,36,0.15)); }
          50%      { filter: drop-shadow(0 0 18px rgba(251,191,36,0.95)) drop-shadow(0 0 40px rgba(251,191,36,0.35)); }
        }

        /* ── Ambient blob drifts ── */
        @keyframes wl-blob-a {
          0%,100% { transform: translate(  0px,   0px) scale(1.00); }
          33%      { transform: translate( 45px, -35px) scale(1.12); }
          66%      { transform: translate(-28px,  38px) scale(0.88); }
        }
        @keyframes wl-blob-b {
          0%,100% { transform: translate(  0px,  0px) scale(1.00); }
          40%      { transform: translate(-38px, 24px) scale(1.10); }
          70%      { transform: translate( 32px,-28px) scale(0.92); }
        }
        @keyframes wl-blob-c {
          0%,100% { transform: translate( 0px,  0px) scale(1.00); }
          50%      { transform: translate(22px, 32px) scale(1.08); }
        }

        /* ── Atom electrons (pure CSS rotation) ── */
        @keyframes wl-espin1 { from{transform:rotate(  0deg);} to{transform:rotate( 360deg);} }
        @keyframes wl-espin2 { from{transform:rotate( 60deg);} to{transform:rotate( 420deg);} }
        @keyframes wl-espin3 { from{transform:rotate(-60deg);} to{transform:rotate( 300deg);} }

        /* ── Slow spin for star/compass ── */
        @keyframes wl-spin-slow { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }

        /* ── Shimmer overlay ── */
        @keyframes wl-shimmer {
          0%   { background-position: -300% center; }
          100% { background-position:  300% center; }
        }
      `}</style>

      {/* ══ LAYER 1 ─ Background: wallpaper or warm gradient fallback ════════ */}
      {wallpaper ? (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage:    `url(${wallpaper})`,
          backgroundSize:     'cover',
          backgroundPosition: 'center',
          filter:  `brightness(${wBrightness}%) blur(${wBlur}px)`,
          opacity: wOpacity / 100,
          animation: 'wl-drift 70s ease-in-out infinite',
        }} />
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          background: dark
            ? 'linear-gradient(140deg,#080810 0%,#0e0c1a 30%,#130f1a 55%,#0b0d10 80%,#080810 100%)'
            : 'linear-gradient(140deg,#fffdf5 0%,#fef9ee 18%,#f5f0ff 42%,#eef4ff 68%,#fff5f8 85%,#fffdf5 100%)',
          animation: 'wl-breathe 38s ease-in-out infinite',
        }} />
      )}

      {/* ══ LAYER 2 ─ Subtle dot-grid ════════════════════════════════════════ */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: dark
          ? 'radial-gradient(circle, rgba(255,255,255,0.028) 1px, transparent 1px)'
          : 'radial-gradient(circle, rgba(0,0,0,0.038) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
      }} />

      {/* ══ LAYER 3 ─ Ambient glow blobs (GPU: transform + opacity only) ═════ */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-8%', left: '-4%',
          width: '52vw', height: '52vh',
          background: dark
            ? 'radial-gradient(ellipse, rgba(139,92,246,0.07) 0%, transparent 70%)'
            : 'radial-gradient(ellipse, rgba(167,139,250,0.14) 0%, transparent 70%)',
          filter: 'blur(48px)',
          animation: 'wl-blob-a 42s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-8%', right: '-4%',
          width: '58vw', height: '55vh',
          background: dark
            ? 'radial-gradient(ellipse, rgba(251,146,60,0.055) 0%, transparent 70%)'
            : 'radial-gradient(ellipse, rgba(254,210,160,0.22) 0%, transparent 70%)',
          filter: 'blur(55px)',
          animation: 'wl-blob-b 48s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', top: '22%', left: '28%',
          width: '44vw', height: '44vh',
          background: dark
            ? 'radial-gradient(ellipse, rgba(99,102,241,0.045) 0%, transparent 70%)'
            : 'radial-gradient(ellipse, rgba(220,232,255,0.28) 0%, transparent 70%)',
          filter: 'blur(65px)',
          animation: 'wl-blob-c 55s ease-in-out infinite',
        }} />
      </div>

      {/* ══ LAYER 4 ─ Vignette (keeps edges soft, centre open for UI) ════════ */}
      <div style={{
        position: 'absolute', inset: 0,
        background: dark
          ? 'radial-gradient(ellipse at center, transparent 22%, rgba(0,0,0,0.42) 100%)'
          : 'radial-gradient(ellipse at center, transparent 22%, rgba(255,253,245,0.62) 100%)',
      }} />

      {/* ══ LAYER 5 ─ Canvas (particles + dotted lines) ══════════════════════ */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />

      {/* ══ LAYER 6 ─ Floating Educational Illustrations ════════════════════ */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2,
        opacity:  dark ? 0.155 : 0.185,
      }}>

        {/* ─── LEFT EDGE ───────────────────────────────────────────────────── */}

        {/* Open book — top-left hero element */}
        <div style={{ position: 'absolute', left: '3.5%', top: '12%', ...par(20) }}>
          <div className="wl-fa"><OpenBook T={T} size={84} /></div>
        </div>

        {/* Pencil — left mid with write animation */}
        <div style={{ position: 'absolute', left: '7.5%', top: '47%', ...par(13) }}>
          <div style={{ animation: 'wl-pencil 22s ease-in-out infinite' }}>
            <Pencil T={T} />
          </div>
        </div>

        {/* Notebook — lower-left */}
        <div style={{ position: 'absolute', left: '4%', top: '69%', ...par(9) }}>
          <div className="wl-fc"><Notebook T={T} /></div>
        </div>

        {/* ─── RIGHT EDGE ──────────────────────────────────────────────────── */}

        {/* Graduation cap — top-right */}
        <div style={{ position: 'absolute', right: '4.5%', top: '14%', ...par(11) }}>
          <div className="wl-fb"><GradCap T={T} /></div>
        </div>

        {/* Stacked books — right mid */}
        <div style={{ position: 'absolute', right: '3.5%', top: '43%', ...par(18) }}>
          <div className="wl-fa"><StackedBooks T={T} /></div>
        </div>

        {/* Bookmark — lower-right */}
        <div style={{ position: 'absolute', right: '6.5%', top: '70%', ...par(10) }}>
          <div className="wl-fd"><Bookmark T={T} /></div>
        </div>

        {/* ─── TOP STRIP (small depth elements) ────────────────────────────── */}

        {/* Small open book — upper-left-center */}
        <div style={{ position: 'absolute', left: '20%', top: '4%', ...par(7) }}>
          <div className="wl-fd">
            <MiniBook T={T} coverColor={T.book2} flipDelay="-2s" />
          </div>
        </div>

        {/* Quill pen — upper-right-center */}
        <div style={{ position: 'absolute', right: '18%', top: '5%', ...par(8) }}>
          <div className="wl-fe"><Quill T={T} /></div>
        </div>

        {/* Small book — upper-center-right */}
        <div style={{ position: 'absolute', right: '34%', top: '3%', ...par(5) }}>
          <div className="wl-fd">
            <MiniBook T={T} coverColor={T.book3} flipDelay="-6s" />
          </div>
        </div>

        {/* ─── BOTTOM STRIP ────────────────────────────────────────────────── */}

        {/* Knowledge star — bottom-left-center */}
        <div style={{ position: 'absolute', left: '16%', bottom: '6%', ...par(9) }}>
          <div style={{ animation: 'wl-spin-slow 55s linear infinite' }}>
            <KnowledgeStar T={T} />
          </div>
        </div>

        {/* Small open book — bottom-center */}
        <div style={{ position: 'absolute', left: '44%', bottom: '4%', ...par(6) }}>
          <div className="wl-fe">
            <MiniBook T={T} coverColor={T.book4} flipDelay="-4s" />
          </div>
        </div>

        {/* Atom ornament — bottom-right-center */}
        <div style={{ position: 'absolute', right: '15%', bottom: '5%', ...par(10) }}>
          <div className="wl-fd"><AtomIcon T={T} /></div>
        </div>

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ILLUSTRATION COMPONENTS — pure SVG, no animateMotion
═══════════════════════════════════════════════════════════════════════════ */

/* Design-token shorthand type */
type Tokens = {
  stroke: string; pageWhite: string; pageLine: string;
  book1: string; book2: string; book3: string; book4: string;
  capFill: string; capStroke: string;
  pencil: string; notebook: string; nbLine: string;
  bkFill: string; bkStroke: string;
  quillGreen: string; starGold: string;
};

/* ── Open book with animated page-flip ────────────────────────────────────── */
function OpenBook({ T, size = 84 }: { T: Tokens; size?: number }) {
  const h = Math.round(size * 0.7);
  return (
    <svg viewBox="0 0 88 62" width={size} height={h} fill="none">
      {/* Cover */}
      <rect x="1" y="3" width="86" height="57" rx="3"
        fill={T.book1} stroke={T.stroke} strokeWidth="2.2" />
      {/* Spine */}
      <line x1="44" y1="3" x2="44" y2="60"
        stroke={T.stroke} strokeWidth="2.8" />
      {/* Left page */}
      <rect x="3" y="5" width="39" height="53" fill={T.pageWhite} />
      {/* Right page */}
      <rect x="46" y="5" width="39" height="53" fill={T.pageWhite} />
      {/* Text lines — left */}
      {[16,23,30,37,44].map(y => (
        <line key={y} x1="10" y1={y} x2={y === 44 ? 30 : 38} y2={y}
          stroke={T.pageLine} strokeWidth="1.4" strokeLinecap="round" />
      ))}
      {/* Text lines — right */}
      {[16,23,30,37,44].map(y => (
        <line key={y} x1="50" y1={y} x2={y === 44 ? 70 : 78} y2={y}
          stroke={T.pageLine} strokeWidth="1.4" strokeLinecap="round" />
      ))}
      {/* Animated flipping page */}
      <g style={{ transformOrigin: '46px 33px' }}>
        <rect x="46" y="5" width="39" height="53" fill={T.pageWhite}
          stroke={T.stroke} strokeWidth="1.2"
          style={{ transformOrigin: '46px 33px',
            animation: 'wl-flip 11s ease-in-out infinite' }} />
      </g>
      {/* Corner fold detail */}
      <polyline points="46,5 44,9 48,9"
        fill={T.pageWhite} stroke={T.stroke} strokeWidth="1" />
    </svg>
  );
}

/* ── Three stacked books ─────────────────────────────────────────────────── */
function StackedBooks({ T }: { T: Tokens }) {
  return (
    <svg viewBox="0 0 72 82" width="66" height="75" fill="none">
      {/* Bottom book — slight CCW tilt */}
      <g transform="rotate(-2, 36, 68)">
        <rect x="2" y="60" width="68" height="18" rx="2"
          fill={T.book1} stroke={T.stroke} strokeWidth="2" />
        <line x1="10" y1="60" x2="10" y2="78"
          stroke={T.stroke} strokeWidth="1.8" />
        <line x1="10" y1="69" x2="68" y2="69"
          stroke={T.pageWhite} strokeWidth="0.8" opacity="0.4" />
      </g>
      {/* Middle book — slight CW tilt */}
      <g transform="rotate(1.5, 36, 47)">
        <rect x="6" y="39" width="62" height="18" rx="2"
          fill={T.book2} stroke={T.stroke} strokeWidth="2" />
        <line x1="14" y1="39" x2="14" y2="57"
          stroke={T.stroke} strokeWidth="1.8" />
        <line x1="14" y1="48" x2="66" y2="48"
          stroke={T.pageWhite} strokeWidth="0.8" opacity="0.4" />
      </g>
      {/* Top book — slight CCW */}
      <g transform="rotate(-1, 36, 27)">
        <rect x="10" y="18" width="54" height="18" rx="2"
          fill={T.book3} stroke={T.stroke} strokeWidth="2" />
        <line x1="18" y1="18" x2="18" y2="36"
          stroke={T.stroke} strokeWidth="1.8" />
        <line x1="18" y1="27" x2="62" y2="27"
          stroke={T.pageWhite} strokeWidth="0.8" opacity="0.4" />
      </g>
      {/* Topmost thin book */}
      <g transform="rotate(2, 36, 12)">
        <rect x="14" y="5" width="46" height="12" rx="2"
          fill={T.book4} stroke={T.stroke} strokeWidth="1.8" />
        <line x1="20" y1="5" x2="20" y2="17"
          stroke={T.stroke} strokeWidth="1.5" />
      </g>
    </svg>
  );
}

/* ── Graduation mortarboard ──────────────────────────────────────────────── */
function GradCap({ T }: { T: Tokens }) {
  return (
    <svg viewBox="0 0 82 62" width="74" height="56" fill="none">
      {/* Diamond top */}
      <polygon points="41,4 76,20 41,36 6,20"
        fill={T.capFill} stroke={T.capStroke} strokeWidth="2.5" strokeLinejoin="round" />
      {/* Cap body cylinder */}
      <path d="M21 20 v16 a20 8 0 0 0 40 0 v-16"
        fill={T.capFill} stroke={T.capStroke} strokeWidth="2.2" />
      {/* Band */}
      <ellipse cx="41" cy="36" rx="20" ry="6"
        fill={T.capFill} stroke={T.capStroke} strokeWidth="1.8" />
      {/* Tassel cord */}
      <line x1="70" y1="20" x2="70" y2="40"
        stroke={T.capStroke} strokeWidth="2.5" strokeLinecap="round" />
      {/* Tassel ball */}
      <circle cx="70" cy="40" r="4"
        fill="#fbbf24" stroke={T.capStroke} strokeWidth="1.5" />
      {/* Tassel fringe */}
      <line x1="67" y1="40" x2="64" y2="54" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
      <line x1="70" y1="40" x2="70" y2="54" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
      <line x1="73" y1="40" x2="76" y2="54" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ── Pencil ──────────────────────────────────────────────────────────────── */
function Pencil({ T }: { T: Tokens }) {
  const bandColor  = '#9ca3af';
  const eraserColor = '#fbcfe8';
  const graphite   = '#374151';
  return (
    <svg viewBox="0 0 26 84" width="24" height="78" fill="none">
      {/* Eraser */}
      <rect x="5" y="2" width="16" height="11" rx="3"
        fill={eraserColor} stroke={T.stroke} strokeWidth="1.6" />
      {/* Metal band */}
      <rect x="5" y="13" width="16" height="6"
        fill={bandColor} stroke={T.stroke} strokeWidth="1.6" />
      {/* Body */}
      <rect x="5" y="19" width="16" height="48"
        fill={T.pencil} stroke={T.stroke} strokeWidth="1.6" />
      {/* Edge grain lines */}
      <line x1="9"  y1="20" x2="9"  y2="65" stroke={T.stroke} strokeWidth="0.7" opacity="0.25" />
      <line x1="17" y1="20" x2="17" y2="65" stroke={T.stroke} strokeWidth="0.7" opacity="0.25" />
      {/* Wood sharpening cone */}
      <polygon points="5,67 21,67 13,80"
        fill="#d4a97a" stroke={T.stroke} strokeWidth="1.6" strokeLinejoin="round" />
      {/* Graphite tip */}
      <polygon points="11,76 15,76 13,82"
        fill={graphite} />
    </svg>
  );
}

/* ── Spiral notebook ─────────────────────────────────────────────────────── */
function Notebook({ T }: { T: Tokens }) {
  const spiralColor = '#94a3b8';
  return (
    <svg viewBox="0 0 64 78" width="58" height="72" fill="none">
      {/* Cover */}
      <rect x="10" y="2" width="52" height="74" rx="3"
        fill={T.notebook} stroke={T.stroke} strokeWidth="2" />
      {/* Pages visible on right */}
      <rect x="12" y="4" width="48" height="70" fill={T.pageWhite} />
      {/* Margin line */}
      <line x1="22" y1="4" x2="22" y2="74"
        stroke={T.nbLine} strokeWidth="1.4" />
      {/* Ruling lines */}
      {[18,25,32,39,46,53,60].map(y => (
        <line key={y} x1="26" y1={y} x2="56" y2={y}
          stroke={T.pageLine} strokeWidth="1.1" strokeLinecap="round" />
      ))}
      {/* Spiral binding */}
      {[10,18,26,34,42,50,58,66].map(cy => (
        <ellipse key={cy} cx="10" cy={cy} rx="5" ry="4"
          fill="none" stroke={spiralColor} strokeWidth="1.6" />
      ))}
    </svg>
  );
}

/* ── Ribbon bookmark ─────────────────────────────────────────────────────── */
function Bookmark({ T }: { T: Tokens }) {
  return (
    <svg viewBox="0 0 30 56" width="28" height="52" fill="none">
      <path d="M2 2 H28 V52 L15 43 L2 52 Z"
        fill={T.bkFill} stroke={T.bkStroke} strokeWidth="2.2" strokeLinejoin="round" />
      {/* Star on bookmark */}
      <path d="M15 16 L16.8 21.5 H22.5 L17.8 24.6 L19.6 30.1 L15 27 L10.4 30.1 L12.2 24.6 L7.5 21.5 H13.2 Z"
        fill={T.bkStroke} opacity="0.6" />
    </svg>
  );
}

/* ── Small open book (for depth elements) ────────────────────────────────── */
function MiniBook({
  T, coverColor, flipDelay = '0s',
}: { T: Tokens; coverColor: string; flipDelay?: string }) {
  return (
    <svg viewBox="0 0 48 58" width="40" height="48" fill="none">
      <rect x="1" y="1" width="46" height="56" rx="2"
        fill={coverColor} stroke={T.stroke} strokeWidth="1.8" />
      <line x1="24" y1="1" x2="24" y2="57"
        stroke={T.stroke} strokeWidth="2.2" />
      <rect x="3"  y="3" width="19" height="52" fill={T.pageWhite} />
      <rect x="26" y="3" width="19" height="52" fill={T.pageWhite} />
      {/* Left lines */}
      {[13,20,27,34].map(y => (
        <line key={y} x1="7" y1={y} x2={y===34?16:20} y2={y}
          stroke={T.pageLine} strokeWidth="1" strokeLinecap="round" />
      ))}
      {/* Right lines */}
      {[13,20,27,34].map(y => (
        <line key={y} x1="29" y1={y} x2={y===34?38:42} y2={y}
          stroke={T.pageLine} strokeWidth="1" strokeLinecap="round" />
      ))}
      {/* Flipping page */}
      <rect x="26" y="3" width="19" height="52" fill={T.pageWhite}
        style={{
          transformOrigin: '26px 30px',
          animation: `wl-flip 13s ${flipDelay} ease-in-out infinite`,
        }} />
    </svg>
  );
}

/* ── 8-pointed knowledge star ────────────────────────────────────────────── */
function KnowledgeStar({ T }: { T: Tokens }) {
  const g = T.starGold;
  return (
    <svg viewBox="0 0 54 54" width="48" height="48" fill="none">
      {/* 8-ray starburst */}
      <path
        d="M27 2 L29.5 18 L44 10 L34 22 L50 25 L34 29 L44 42 L29.5 34 L27 50 L24.5 34 L10 42 L20 29 L4 25 L20 22 L10 10 L24.5 18 Z"
        fill={g} opacity="0.55" />
      {/* Inner circle */}
      <circle cx="27" cy="27" r="9" fill="none" stroke={g} strokeWidth="2" />
      {/* Centre dot */}
      <circle cx="27" cy="27" r="4" fill={g} opacity="0.9" />
    </svg>
  );
}

/* ── Feather quill pen ────────────────────────────────────────────────────── */
function Quill({ T }: { T: Tokens }) {
  const c = T.quillGreen;
  return (
    <svg viewBox="0 0 38 82" width="32" height="74" fill="none">
      {/* Feather right vane */}
      <path d="M19 6 Q32 22 30 54 L19 64 Q28 44 19 6Z"
        fill={c} stroke={T.stroke} strokeWidth="1" opacity="0.85" />
      {/* Feather left vane */}
      <path d="M19 6 Q6 22 8 54 L19 64 Q10 44 19 6Z"
        fill={c} stroke={T.stroke} strokeWidth="1" opacity="0.65" />
      {/* Shaft */}
      <line x1="19" y1="4" x2="19" y2="80"
        stroke="#4b5563" strokeWidth="2.2" strokeLinecap="round" />
      {/* Nib */}
      <polygon points="16,74 22,74 19,82"
        fill={T.stroke} />
      {/* Barb lines right */}
      {[20,30,40,50].map(y => (
        <path key={y} d={`M19 ${y} Q${y > 30 ? 26 : 28} ${y+3} ${y > 30 ? 28 : 30} ${y+7}`}
          stroke={c} strokeWidth="0.9" fill="none" opacity="0.55" />
      ))}
      {/* Barb lines left */}
      {[20,30,40,50].map(y => (
        <path key={y} d={`M19 ${y} Q${y > 30 ? 12 : 10} ${y+3} ${y > 30 ? 10 : 8} ${y+7}`}
          stroke={c} strokeWidth="0.9" fill="none" opacity="0.45" />
      ))}
    </svg>
  );
}

/* ── Atom with CSS-rotating electrons ────────────────────────────────────── */
function AtomIcon({ T }: { T: Tokens }) {
  const c = T.capStroke;
  return (
    <svg viewBox="0 0 80 80" width="58" height="58" fill="none" overflow="visible">
      {/* Nucleus */}
      <circle cx="40" cy="40" r="5.5" fill={c} opacity="0.9" />
      {/* Three orbit ellipses */}
      <ellipse cx="40" cy="40" rx="32" ry="13"
        stroke={c} strokeWidth="1.6" opacity="0.42" transform="rotate(0   40 40)" />
      <ellipse cx="40" cy="40" rx="32" ry="13"
        stroke={c} strokeWidth="1.6" opacity="0.42" transform="rotate(60  40 40)" />
      <ellipse cx="40" cy="40" rx="32" ry="13"
        stroke={c} strokeWidth="1.6" opacity="0.42" transform="rotate(-60 40 40)" />
      {/* Electron 1 */}
      <g style={{
        transformBox: 'fill-box', transformOrigin: '40px 40px',
        animation: 'wl-espin1 11s linear infinite',
      }}>
        <circle cx="72" cy="40" r="3.8" fill={c} opacity="0.9" />
      </g>
      {/* Electron 2 */}
      <g style={{
        transformBox: 'fill-box', transformOrigin: '40px 40px',
        transform: 'rotate(60deg)',
        animation: 'wl-espin2 8s linear infinite',
      }}>
        <circle cx="72" cy="40" r="3.0" fill={c} opacity="0.75" />
      </g>
      {/* Electron 3 */}
      <g style={{
        transformBox: 'fill-box', transformOrigin: '40px 40px',
        transform: 'rotate(-60deg)',
        animation: 'wl-espin3 15s linear infinite',
      }}>
        <circle cx="72" cy="40" r="2.5" fill={c} opacity="0.6" />
      </g>
    </svg>
  );
}
