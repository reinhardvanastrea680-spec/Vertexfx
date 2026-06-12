import { useState, useEffect, useRef } from "react";

// Theme colors
const themes = {
  dark: {
    GOLD: "#C9A84C",
    DARK_NAVY: "#0A0F1E",
    NAVY: "#0D1526",
    NAVY2: "#111D35",
    TEAL: "#0BCEAF",
    LIGHT: "#F0F4FF",
    MUTED: "#8895B3",
    GREEN: "#22C55E",
    RED: "#EF4444",
    BORDER: "#1A2540",
    TICKER_BG: "#070B16",
  },
  light: {
    GOLD: "#C9A84C",
    DARK_NAVY: "#F8F9FA",
    NAVY: "#FFFFFF",
    NAVY2: "#F0F2F5",
    TEAL: "#0BCEAF",
    LIGHT: "#1A202C",
    MUTED: "#6B7280",
    GREEN: "#22C55E",
    RED: "#EF4444",
    BORDER: "#E2E8F0",
    TICKER_BG: "#F0F2F5",
  },
};

// Helper hook for theme
function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("vertexfx-theme");
    return saved || "dark";
  });

  useEffect(() => {
    localStorage.setItem("vertexfx-theme", theme);
  }, [theme]);

  const colors = themes[theme];
  return { theme, setTheme, colors };
}

const styles = {
  "@import": `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');`,
};

const tickers = [
  { sym: "EUR/USD", price: "1.0847", chg: "+0.12%", up: true },
  { sym: "BTC/USD", price: "67,420", chg: "+2.34%", up: true },
  { sym: "AAPL", price: "213.55", chg: "-0.41%", up: false },
  { sym: "GOLD", price: "2,384", chg: "+0.88%", up: true },
  { sym: "GBP/USD", price: "1.2734", chg: "-0.09%", up: false },
  { sym: "ETH/USD", price: "3,521", chg: "+1.67%", up: true },
  { sym: "OIL", price: "78.34", chg: "+0.55%", up: true },
  { sym: "S&P 500", price: "5,248", chg: "+0.22%", up: true },
  { sym: "TSLA", price: "167.90", chg: "-1.12%", up: false },
  { sym: "NAS 100", price: "18,432", chg: "+0.47%", up: true },
];

const markets = [
  {
    name: "Forex",
    icon: "💱",
    desc: "80+ currency pairs with tight spreads",
    instruments: "80+ Pairs",
  },
  {
    name: "Crypto",
    icon: "₿",
    desc: "Trade top digital assets 24/7",
    instruments: "50+ Coins",
  },
  {
    name: "Stocks",
    icon: "📈",
    desc: "Global equities & blue chips",
    instruments: "2,000+ Stocks",
  },
  {
    name: "Commodities",
    icon: "🪙",
    desc: "Gold, silver, oil & energy",
    instruments: "30+ Markets",
  },
  {
    name: "Indices",
    icon: "📊",
    desc: "Major world index CFDs",
    instruments: "20+ Indices",
  },
  {
    name: "ETFs",
    icon: "🏛",
    desc: "Diversified fund exposure",
    instruments: "300+ ETFs",
  },
];

const stats = [
  {
    label: "Assets Under Management",
    value: "$4.2B+",
    sub: "Globally managed",
  },
  { label: "Active Traders", value: "320K+", sub: "Worldwide clients" },
  { label: "Countries Served", value: "150+", sub: "Global reach" },
  { label: "Avg Execution", value: "< 12ms", sub: "Ultra-fast orders" },
];

const features = [
  {
    icon: "⚡",
    title: "Lightning Execution",
    desc: "Orders filled in under 12ms with our proprietary matching engine — zero requotes, zero slippage on market opens.",
  },
  {
    icon: "🔒",
    title: "Segregated Funds",
    desc: "Client funds are held in tier-1 bank accounts, fully segregated from company assets under regulatory oversight.",
  },
  {
    icon: "📉",
    title: "Ultra-Low Spreads",
    desc: "EUR/USD from 0.0 pips on our RAW account. Raw interbank pricing passed directly to you.",
  },
  {
    icon: "🤖",
    title: "Algo & Copy Trading",
    desc: "Automate strategies or copy top-performing traders with our integrated social trading suite.",
  },
  {
    icon: "📱",
    title: "All-Device Platform",
    desc: "Trade on MT4, MT5, and our proprietary WebTrader — seamlessly synced across all your devices.",
  },
  {
    icon: "🎓",
    title: "Trading Academy",
    desc: "300+ hours of video content, live webinars, and daily market analysis from our senior analysts.",
  },
];

const plans = [
  {
    name: "Standard",
    minDeposit: "$100",
    spread: "From 1.0 pip",
    leverage: "1:200",
    commission: "Zero",
    highlight: false,
  },
  {
    name: "Pro",
    minDeposit: "$500",
    spread: "From 0.3 pip",
    leverage: "1:400",
    commission: "$3/lot",
    highlight: true,
  },
  {
    name: "RAW ECN",
    minDeposit: "$2,000",
    spread: "From 0.0 pip",
    leverage: "1:500",
    commission: "$2/lot",
    highlight: false,
  },
];

const testimonials = [
  {
    name: "Amara Diallo",
    role: "FX Trader, 4 yrs",
    text: "The spreads are genuinely the tightest I've seen. My scalping strategy became profitable the moment I switched.",
    avatar: "AD",
  },
  {
    name: "James Okafor",
    role: "Portfolio Manager",
    text: "Outstanding institutional-grade infrastructure at retail pricing. The execution speed alone is worth every cent.",
    avatar: "JO",
  },
  {
    name: "Priya Nair",
    role: "Crypto Investor",
    text: "The 24/7 support team knows their stuff. A broker that actually answers at 3am when you need them — priceless.",
    avatar: "PN",
  },
];

function Ticker() {
  const [offset, setOffset] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    let frame;
    let pos = 0;
    const speed = 0.6;
    const animate = () => {
      pos += speed;
      if (ref.current) {
        const total = ref.current.scrollWidth / 2;
        if (pos >= total) pos = 0;
        ref.current.style.transform = `translateX(-${pos}px)`;
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const all = [...tickers, ...tickers];

  return (
    <div
      style={{
        background: "#070B16",
        borderBottom: `1px solid #1A2540`,
        overflow: "hidden",
        whiteSpace: "nowrap",
        height: 40,
        display: "flex",
        alignItems: "center",
      }}
    >
      <div ref={ref} style={{ display: "inline-flex", gap: 0 }}>
        {all.map((t, i) => (
          <span
            key={i}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "0 24px",
              borderRight: "1px solid #1A2540",
              height: 40,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
            }}
          >
            <span style={{ color: MUTED, fontWeight: 500 }}>{t.sym}</span>
            <span style={{ color: LIGHT, fontWeight: 600 }}>{t.price}</span>
            <span style={{ color: t.up ? GREEN : RED, fontWeight: 500 }}>
              {t.chg}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Nav({ onTrade }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 40,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: scrolled ? "rgba(10,15,30,0.97)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid #1A2540" : "none",
        transition: "all 0.3s ease",
        padding: "0 48px",
        height: 72,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            background: `linear-gradient(135deg, ${GOLD}, #8B6914)`,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              color: "#fff",
              fontWeight: 700,
              fontSize: 16,
              fontFamily: "serif",
            }}
          >
            V
          </span>
        </div>
        <span
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 22,
            fontWeight: 700,
            color: LIGHT,
            letterSpacing: 1,
          }}
        >
          VERTEX<span style={{ color: GOLD }}>FX</span>
        </span>
      </div>

      <div
        style={{
          display: "flex",
          gap: 36,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        {["Markets", "Platforms", "Accounts", "Education", "Company"].map(
          (n) => (
            <a
              key={n}
              href="#"
              style={{
                color: MUTED,
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.color = LIGHT)}
              onMouseLeave={(e) => (e.target.style.color = MUTED)}
            >
              {n}
            </a>
          ),
        )}
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button
          style={{
            background: "transparent",
            border: `1px solid #2A3555`,
            color: LIGHT,
            padding: "9px 22px",
            borderRadius: 6,
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          Log In
        </button>
        <button
          onClick={onTrade}
          style={{
            background: `linear-gradient(135deg, ${GOLD}, #A07728)`,
            border: "none",
            color: "#fff",
            padding: "9px 22px",
            borderRadius: 6,
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 600,
            boxShadow: `0 4px 20px rgba(201,168,76,0.35)`,
          }}
        >
          Open Account
        </button>
      </div>
    </nav>
  );
}

function HeroPage({ onStart }) {
  const [angle, setAngle] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setAngle((a) => (a + 0.15) % 360), 16);
    return () => clearInterval(id);
  }, []);

  const [count, setCount] = useState(0);
  useEffect(() => {
    let n = 0;
    const id = setInterval(() => {
      n += 1847;
      if (n >= 320000) {
        setCount(320000);
        clearInterval(id);
        return;
      }
      setCount(n);
    }, 8);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: DARK_NAVY,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        paddingTop: 112,
      }}
    >
      {/* Animated background orbs */}
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(11,206,175,0.07) 0%, transparent 70%)`,
          top: -200,
          right: -200,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)`,
          bottom: -100,
          left: -100,
          pointerEvents: "none",
        }}
      />

      {/* Grid lines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(rgba(26,37,64,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(26,37,64,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />

      {/* Rotating ring */}
      <div
        style={{
          position: "absolute",
          width: 560,
          height: 560,
          borderRadius: "50%",
          border: `1px solid rgba(201,168,76,0.12)`,
          transform: `rotate(${angle}deg)`,
          transition: "transform 0.016s linear",
          top: "50%",
          left: "50%",
          marginLeft: -280,
          marginTop: -280,
          pointerEvents: "none",
        }}
      >
        {[0, 90, 180, 270].map((d) => (
          <div
            key={d}
            style={{
              position: "absolute",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: GOLD,
              opacity: 0.8,
              top: "50%",
              left: "50%",
              transform: `rotate(${d}deg) translateX(279px) translateY(-4px)`,
            }}
          />
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          width: 420,
          height: 420,
          borderRadius: "50%",
          border: `1px solid rgba(11,206,175,0.08)`,
          transform: `rotate(${-angle * 0.6}deg)`,
          top: "50%",
          left: "50%",
          marginLeft: -210,
          marginTop: -210,
          pointerEvents: "none",
        }}
      />

      {/* Hero content */}
      <div
        style={{
          textAlign: "center",
          maxWidth: 820,
          padding: "0 24px",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(11,206,175,0.1)",
            border: `1px solid rgba(11,206,175,0.25)`,
            borderRadius: 100,
            padding: "6px 16px",
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: TEAL,
              boxShadow: `0 0 8px ${TEAL}`,
            }}
          />
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              color: TEAL,
              fontWeight: 500,
              letterSpacing: 1,
            }}
          >
            MARKETS LIVE · {count.toLocaleString()}+ ACTIVE TRADERS
          </span>
        </div>

        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(52px, 8vw, 88px)",
            fontWeight: 700,
            color: LIGHT,
            lineHeight: 1.05,
            margin: "0 0 16px",
            textShadow: "0 0 80px rgba(201,168,76,0.15)",
          }}
        >
          Trade the World's
          <br />
          <span style={{ color: GOLD, fontStyle: "italic" }}>
            Finest Markets
          </span>
        </h1>

        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 18,
            color: MUTED,
            lineHeight: 1.7,
            maxWidth: 580,
            margin: "0 auto 48px",
            fontWeight: 300,
          }}
        >
          Institutional-grade execution. Razor-thin spreads. Over 2,000
          instruments across forex, crypto, stocks and commodities.
        </p>

        <div
          style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={onStart}
            style={{
              background: `linear-gradient(135deg, ${GOLD} 0%, #A07728 100%)`,
              border: "none",
              color: "#fff",
              padding: "16px 44px",
              borderRadius: 8,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 16,
              fontWeight: 600,
              boxShadow: `0 8px 32px rgba(201,168,76,0.4)`,
              transition: "transform 0.2s, box-shadow 0.2s",
              letterSpacing: 0.5,
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = `0 12px 40px rgba(201,168,76,0.55)`;
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = `0 8px 32px rgba(201,168,76,0.4)`;
            }}
          >
            Start Trading →
          </button>
          <button
            style={{
              background: "transparent",
              border: `1px solid #2A3555`,
              color: LIGHT,
              padding: "16px 36px",
              borderRadius: 8,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              fontWeight: 500,
              transition: "border-color 0.2s, background 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = TEAL;
              e.target.style.background = "rgba(11,206,175,0.06)";
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = "#2A3555";
              e.target.style.background = "transparent";
            }}
          >
            View Live Demo
          </button>
        </div>

        <div
          style={{
            display: "flex",
            gap: 40,
            justifyContent: "center",
            marginTop: 56,
            flexWrap: "wrap",
          }}
        >
          {[
            ["FCA Regulated", "🏛"],
            ["Zero Commission", "✦"],
            ["24/7 Support", "🔔"],
          ].map(([l, ic]) => (
            <div
              key={l}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                color: MUTED,
              }}
            >
              <span style={{ fontSize: 14 }}>{ic}</span> {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatsBar() {
  return (
    <div
      style={{
        background: NAVY,
        borderTop: `1px solid #1A2540`,
        borderBottom: `1px solid #1A2540`,
        padding: "0 48px",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 0,
        }}
      >
        {stats.map((s, i) => (
          <div
            key={i}
            style={{
              padding: "32px 0",
              textAlign: "center",
              borderRight: i < 3 ? `1px solid #1A2540` : "none",
            }}
          >
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 40,
                fontWeight: 700,
                color: GOLD,
                lineHeight: 1,
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                color: LIGHT,
                fontWeight: 600,
                marginTop: 6,
              }}
            >
              {s.label}
            </div>
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                color: MUTED,
                marginTop: 3,
              }}
            >
              {s.sub}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MarketsSection() {
  const [active, setActive] = useState(0);
  return (
    <section style={{ background: DARK_NAVY, padding: "96px 48px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 64, textAlign: "center" }}>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              letterSpacing: 3,
              color: GOLD,
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            Instruments
          </span>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 48,
              fontWeight: 700,
              color: LIGHT,
              margin: "12px 0 16px",
            }}
          >
            Markets We Offer
          </h2>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: MUTED,
              fontSize: 16,
              maxWidth: 520,
              margin: "0 auto",
            }}
          >
            Access over 2,000 tradeable instruments across six major asset
            classes from a single account.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 2,
          }}
        >
          {markets.map((m, i) => (
            <div
              key={i}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(-1)}
              style={{
                background: active === i ? "rgba(201,168,76,0.07)" : NAVY2,
                border: `1px solid ${active === i ? "rgba(201,168,76,0.3)" : "#1A2540"}`,
                padding: "36px 32px",
                cursor: "pointer",
                transition: "all 0.25s ease",
                borderRadius:
                  i === 0
                    ? "12px 0 0 0"
                    : i === 2
                      ? "0 12px 0 0"
                      : i === 3
                        ? "0 0 0 12px"
                        : i === 5
                          ? "0 0 12px 0"
                          : 0,
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 16 }}>{m.icon}</div>
              <h3
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 26,
                  fontWeight: 700,
                  color: LIGHT,
                  margin: "0 0 8px",
                }}
              >
                {m.name}
              </h3>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  color: MUTED,
                  margin: "0 0 16px",
                  lineHeight: 1.6,
                }}
              >
                {m.desc}
              </p>
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  color: TEAL,
                  fontWeight: 600,
                  letterSpacing: 0.5,
                }}
              >
                {m.instruments} →
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section
      style={{
        background: NAVY,
        padding: "96px 48px",
        borderTop: `1px solid #1A2540`,
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 80,
            alignItems: "start",
          }}
        >
          <div>
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11,
                letterSpacing: 3,
                color: GOLD,
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              Why VertexFX
            </span>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 52,
                fontWeight: 700,
                color: LIGHT,
                margin: "16px 0 24px",
                lineHeight: 1.1,
              }}
            >
              Built for Serious
              <br />
              <span style={{ color: GOLD, fontStyle: "italic" }}>Traders</span>
            </h2>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: MUTED,
                fontSize: 16,
                lineHeight: 1.8,
                marginBottom: 36,
              }}
            >
              Every feature we've built is informed by feedback from
              professional traders. We don't build for casual users — we build
              for those who treat trading as a craft.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "MT4 & MT5 Compatible",
                "FSCA & FCA Regulated",
                "Negative Balance Protection",
                "Two-Factor Authentication",
              ].map((f) => (
                <div
                  key={f}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14,
                    color: LIGHT,
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: "rgba(11,206,175,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{ color: TEAL, fontSize: 11, fontWeight: 700 }}
                    >
                      ✓
                    </span>
                  </div>
                  {f}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            {features.map((f, i) => (
              <div
                key={i}
                style={{
                  background: NAVY2,
                  border: `1px solid #1A2540`,
                  borderRadius: 12,
                  padding: "24px 20px",
                  transition: "border-color 0.2s, transform 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(201,168,76,0.35)";
                  e.currentTarget.style.transform = "translateY(-3px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#1A2540";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ fontSize: 26, marginBottom: 12 }}>{f.icon}</div>
                <h4
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14,
                    fontWeight: 600,
                    color: LIGHT,
                    margin: "0 0 8px",
                  }}
                >
                  {f.title}
                </h4>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 12,
                    color: MUTED,
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingSection({ onStart }) {
  return (
    <section
      style={{
        background: DARK_NAVY,
        padding: "96px 48px",
        borderTop: `1px solid #1A2540`,
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              letterSpacing: 3,
              color: GOLD,
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            Account Types
          </span>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 48,
              fontWeight: 700,
              color: LIGHT,
              margin: "12px 0 16px",
            }}
          >
            Choose Your Account
          </h2>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: MUTED,
              fontSize: 16,
              maxWidth: 480,
              margin: "0 auto",
            }}
          >
            Select the account that matches your trading style and capital.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
          }}
        >
          {plans.map((p, i) => (
            <div
              key={i}
              style={{
                background: p.highlight
                  ? `linear-gradient(160deg, rgba(201,168,76,0.12), rgba(201,168,76,0.04))`
                  : NAVY2,
                border: `1px solid ${p.highlight ? "rgba(201,168,76,0.5)" : "#1A2540"}`,
                borderRadius: 16,
                padding: "36px 28px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {p.highlight && (
                <div
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    background: GOLD,
                    color: "#000",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 100,
                    fontFamily: "'DM Sans', sans-serif",
                    letterSpacing: 0.5,
                  }}
                >
                  MOST POPULAR
                </div>
              )}
              <h3
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 30,
                  fontWeight: 700,
                  color: p.highlight ? GOLD : LIGHT,
                  margin: "0 0 24px",
                }}
              >
                {p.name}
              </h3>
              {[
                ["Min. Deposit", p.minDeposit],
                ["Spread", p.spread],
                ["Max Leverage", p.leverage],
                ["Commission", p.commission],
              ].map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "12px 0",
                    borderBottom: `1px solid #1A2540`,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <span style={{ fontSize: 13, color: MUTED }}>{k}</span>
                  <span style={{ fontSize: 13, color: LIGHT, fontWeight: 600 }}>
                    {v}
                  </span>
                </div>
              ))}
              <button
                onClick={onStart}
                style={{
                  marginTop: 28,
                  width: "100%",
                  padding: "12px 0",
                  borderRadius: 8,
                  background: p.highlight
                    ? `linear-gradient(135deg, ${GOLD}, #A07728)`
                    : "transparent",
                  border: p.highlight ? "none" : `1px solid #2A3555`,
                  color: p.highlight ? "#000" : LIGHT,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: p.highlight
                    ? `0 4px 20px rgba(201,168,76,0.3)`
                    : "none",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Open {p.name} Account
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section
      style={{
        background: NAVY,
        padding: "96px 48px",
        borderTop: `1px solid #1A2540`,
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              letterSpacing: 3,
              color: GOLD,
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            Client Stories
          </span>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 48,
              fontWeight: 700,
              color: LIGHT,
              margin: "12px 0",
            }}
          >
            What Traders Say
          </h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
          }}
        >
          {testimonials.map((t, i) => (
            <div
              key={i}
              style={{
                background: NAVY2,
                border: `1px solid #1A2540`,
                borderRadius: 16,
                padding: "32px 28px",
              }}
            >
              <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
                {[...Array(5)].map((_, s) => (
                  <span key={s} style={{ color: GOLD, fontSize: 14 }}>
                    ★
                  </span>
                ))}
              </div>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 15,
                  color: LIGHT,
                  lineHeight: 1.8,
                  margin: "0 0 28px",
                  fontWeight: 300,
                  fontStyle: "italic",
                }}
              >
                "{t.text}"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${GOLD}, #8B6914)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  {t.avatar}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 14,
                      fontWeight: 600,
                      color: LIGHT,
                    }}
                  >
                    {t.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 12,
                      color: MUTED,
                    }}
                  >
                    {t.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection({ onStart }) {
  return (
    <section
      style={{
        background: DARK_NAVY,
        padding: "96px 48px",
        borderTop: `1px solid #1A2540`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)`,
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          textAlign: "center",
          position: "relative",
        }}
      >
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 56,
            fontWeight: 700,
            color: LIGHT,
            margin: "0 0 20px",
            lineHeight: 1.1,
          }}
        >
          Ready to Start
          <br />
          <span style={{ color: GOLD, fontStyle: "italic" }}>Trading?</span>
        </h2>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: MUTED,
            fontSize: 17,
            lineHeight: 1.8,
            marginBottom: 44,
            fontWeight: 300,
          }}
        >
          Open a live or demo account in under 5 minutes. No obligations, no
          hidden fees — just world-class trading infrastructure at your
          fingertips.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          <button
            onClick={onStart}
            style={{
              background: `linear-gradient(135deg, ${GOLD} 0%, #A07728 100%)`,
              border: "none",
              color: "#fff",
              padding: "18px 52px",
              borderRadius: 8,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 16,
              fontWeight: 600,
              boxShadow: `0 8px 32px rgba(201,168,76,0.45)`,
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = `0 14px 40px rgba(201,168,76,0.6)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = `0 8px 32px rgba(201,168,76,0.45)`;
            }}
          >
            Start Trading Now
          </button>
          <button
            style={{
              background: "transparent",
              border: `1px solid #2A3555`,
              color: LIGHT,
              padding: "18px 36px",
              borderRadius: 8,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              fontWeight: 500,
            }}
          >
            Try Free Demo
          </button>
        </div>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            color: MUTED,
            marginTop: 24,
          }}
        >
          ⚠️ CFDs carry risk. 74% of retail accounts lose money. Trade
          responsibly.
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      style={{
        background: "#070B16",
        borderTop: `1px solid #1A2540`,
        padding: "60px 48px 32px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
            gap: 48,
            marginBottom: 48,
            paddingBottom: 48,
            borderBottom: `1px solid #1A2540`,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  background: `linear-gradient(135deg, ${GOLD}, #8B6914)`,
                  borderRadius: 7,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 14,
                    fontFamily: "serif",
                  }}
                >
                  V
                </span>
              </div>
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 20,
                  fontWeight: 700,
                  color: LIGHT,
                }}
              >
                VERTEX<span style={{ color: GOLD }}>FX</span>
              </span>
            </div>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                color: MUTED,
                lineHeight: 1.8,
                maxWidth: 280,
              }}
            >
              VertexFX is a premier multi-asset broker offering
              institutional-grade trading infrastructure to retail and
              professional clients worldwide.
            </p>
          </div>
          {[
            {
              title: "Trading",
              links: ["Forex", "Crypto", "Stocks", "Commodities", "Indices"],
            },
            {
              title: "Platform",
              links: [
                "MetaTrader 4",
                "MetaTrader 5",
                "WebTrader",
                "Mobile App",
                "API Access",
              ],
            },
            {
              title: "Company",
              links: [
                "About Us",
                "Careers",
                "Press",
                "Partnerships",
                "Contact",
              ],
            },
            {
              title: "Support",
              links: [
                "Help Centre",
                "Live Chat",
                "FAQ",
                "Legal Docs",
                "Risk Warning",
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h5
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  fontWeight: 600,
                  color: LIGHT,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  marginBottom: 20,
                }}
              >
                {col.title}
              </h5>
              {col.links.map((l) => (
                <a
                  key={l}
                  href="#"
                  style={{
                    display: "block",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    color: MUTED,
                    textDecoration: "none",
                    marginBottom: 10,
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.target.style.color = LIGHT)}
                  onMouseLeave={(e) => (e.target.style.color = MUTED)}
                >
                  {l}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              color: MUTED,
            }}
          >
            © 2025 VertexFX Ltd. All rights reserved. Regulated by FCA (UK) ·
            FSCA (SA) · ASIC (AU)
          </span>
          <div style={{ display: "flex", gap: 24 }}>
            {["Privacy", "Terms", "Risk"].map((l) => (
              <a
                key={l}
                href="#"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  color: MUTED,
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.color = LIGHT)}
                onMouseLeave={(e) => (e.target.style.color = MUTED)}
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// Welcome Splash Screen
function WelcomeScreen({ onEnter }) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => setReady(true), 400);
          return 100;
        }
        return p + 1.2;
      });
    }, 28);
    return () => clearInterval(interval);
  }, []);

  const words = ["FOREX", "CRYPTO", "STOCKS", "FUTURES"];
  const [wordIdx, setWordIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setWordIdx((i) => (i + 1) % words.length),
      900,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#05080F",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.6s ease",
      }}
    >
      {/* Animated background */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              width: i % 3 === 0 ? 2 : 1,
              height: `${20 + ((i * 17) % 60)}px`,
              background: `rgba(201,168,76,${0.03 + (i % 4) * 0.02})`,
              animation: `floatUp ${3 + (i % 4)}s ease-in-out infinite`,
              animationDelay: `${(i * 0.3) % 3}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes floatUp { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes slideWord { 0% { opacity:0; transform: translateY(10px); } 20%,80% { opacity:1; transform: translateY(0); } 100% { opacity:0; transform: translateY(-10px); } }
      `}</style>

      <div
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          maxWidth: 600,
          padding: "0 32px",
        }}
      >
        {/* Logo */}
        <div
          style={{
            marginBottom: 40,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              background: `linear-gradient(135deg, ${GOLD} 0%, #8B6914 100%)`,
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 60px rgba(201,168,76,0.4)`,
            }}
          >
            <span
              style={{
                color: "#fff",
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 44,
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              V
            </span>
          </div>
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 36,
              fontWeight: 700,
              color: LIGHT,
              letterSpacing: 4,
            }}
          >
            VERTEX<span style={{ color: GOLD }}>FX</span>
          </div>
        </div>

        <div style={{ height: 52, overflow: "hidden", marginBottom: 16 }}>
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 44,
              fontWeight: 700,
              color: GOLD,
              fontStyle: "italic",
              animation: "slideWord 0.9s ease-in-out infinite",
              display: "inline-block",
            }}
          >
            {words[wordIdx]}
          </span>
        </div>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15,
            color: MUTED,
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 56,
            fontWeight: 300,
          }}
        >
          Premium Global Broker
        </p>

        {/* Progress */}
        <div
          style={{
            width: 280,
            margin: "0 auto 24px",
            height: 1,
            background: "#1A2540",
            position: "relative",
          }}
        >
          <div
            style={{
              height: 1,
              background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
              width: `${progress}%`,
              transition: "width 0.05s linear",
              position: "absolute",
              top: 0,
              left: 0,
              boxShadow: `0 0 8px ${GOLD}`,
            }}
          />
        </div>

        {ready ? (
          <button
            onClick={onEnter}
            style={{
              background: `linear-gradient(135deg, ${GOLD}, #A07728)`,
              border: "none",
              color: "#fff",
              padding: "16px 52px",
              borderRadius: 8,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: 1,
              boxShadow: `0 8px 32px rgba(201,168,76,0.5)`,
              animation: "pulse 2s ease-in-out infinite",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.animationPlayState = "paused")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.animationPlayState = "running")
            }
          >
            ENTER PLATFORM
          </button>
        ) : (
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              color: MUTED,
              letterSpacing: 2,
            }}
          >
            LOADING MARKETS... {Math.round(progress)}%
          </span>
        )}

        <div
          style={{
            display: "flex",
            gap: 32,
            justifyContent: "center",
            marginTop: 48,
          }}
        >
          {[
            ["FCA", "Regulated"],
            ["256-bit", "SSL Secure"],
            ["24/7", "Support"],
          ].map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 22,
                  fontWeight: 700,
                  color: GOLD,
                }}
              >
                {v}
              </div>
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 11,
                  color: MUTED,
                  letterSpacing: 1,
                }}
              >
                {l.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Trading Dashboard Preview
function TradingDashboard({ onBack }) {
  const [prices, setPrices] = useState(
    tickers
      .slice(0, 6)
      .map((t) => ({
        ...t,
        bid: parseFloat(t.price.replace(",", "")),
        ask: parseFloat(t.price.replace(",", "")) + 0.0003,
      })),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setPrices((p) =>
        p.map((t) => {
          const delta = (Math.random() - 0.499) * 0.002 * t.bid;
          const newBid = parseFloat((t.bid + delta).toFixed(4));
          return {
            ...t,
            bid: newBid,
            ask: parseFloat((newBid + 0.0003).toFixed(4)),
            up: delta > 0,
          };
        }),
      );
    }, 1200);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#080C18", paddingTop: 112 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 48px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 36,
                fontWeight: 700,
                color: LIGHT,
                margin: 0,
              }}
            >
              Trading <span style={{ color: GOLD }}>Dashboard</span>
            </h2>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                color: MUTED,
                margin: "4px 0 0",
              }}
            >
              Live market rates — demo environment
            </p>
          </div>
          <button
            onClick={onBack}
            style={{
              background: "transparent",
              border: `1px solid #2A3555`,
              color: LIGHT,
              padding: "10px 24px",
              borderRadius: 6,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
            }}
          >
            ← Back to Home
          </button>
        </div>

        {/* Account summary */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            marginBottom: 32,
          }}
        >
          {[
            ["Balance", "$10,000.00", TEAL],
            ["Equity", "$10,243.50", GREEN],
            ["Margin Used", "$1,200.00", GOLD],
            ["Free Margin", "$9,043.50", LIGHT],
          ].map(([l, v, c]) => (
            <div
              key={l}
              style={{
                background: NAVY2,
                border: `1px solid #1A2540`,
                borderRadius: 12,
                padding: "20px 24px",
              }}
            >
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  color: MUTED,
                  marginBottom: 8,
                }}
              >
                {l}
              </div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 28,
                  fontWeight: 700,
                  color: c,
                }}
              >
                {v}
              </div>
            </div>
          ))}
        </div>

        {/* Live rates */}
        <div
          style={{
            background: NAVY2,
            border: `1px solid #1A2540`,
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "20px 24px",
              borderBottom: `1px solid #1A2540`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15,
                fontWeight: 600,
                color: LIGHT,
                margin: 0,
              }}
            >
              Live Market Watch
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: GREEN,
                  boxShadow: `0 0 6px ${GREEN}`,
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  color: GREEN,
                }}
              >
                LIVE
              </span>
            </div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid #1A2540` }}>
                {["Symbol", "Bid", "Ask", "Spread", "Change", "Action"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 24px",
                        textAlign: "left",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 11,
                        color: MUTED,
                        fontWeight: 600,
                        letterSpacing: 1,
                        textTransform: "uppercase",
                      }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {prices.map((t, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom: `1px solid #0F1928`,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255,255,255,0.02)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td
                    style={{
                      padding: "16px 24px",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 14,
                      fontWeight: 600,
                      color: LIGHT,
                    }}
                  >
                    {t.sym}
                  </td>
                  <td
                    style={{
                      padding: "16px 24px",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 14,
                      color: t.up ? GREEN : RED,
                      fontWeight: 600,
                      transition: "color 0.3s",
                    }}
                  >
                    {t.bid.toFixed(4)}
                  </td>
                  <td
                    style={{
                      padding: "16px 24px",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 14,
                      color: LIGHT,
                    }}
                  >
                    {t.ask.toFixed(4)}
                  </td>
                  <td
                    style={{
                      padding: "16px 24px",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 12,
                      color: MUTED,
                    }}
                  >
                    0.3
                  </td>
                  <td
                    style={{
                      padding: "16px 24px",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 13,
                      color: t.up ? GREEN : RED,
                      fontWeight: 500,
                    }}
                  >
                    {t.chg}
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        style={{
                          background: "rgba(239,68,68,0.15)",
                          border: `1px solid rgba(239,68,68,0.3)`,
                          color: RED,
                          padding: "5px 14px",
                          borderRadius: 5,
                          cursor: "pointer",
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        SELL
                      </button>
                      <button
                        style={{
                          background: "rgba(34,197,94,0.15)",
                          border: `1px solid rgba(34,197,94,0.3)`,
                          color: GREEN,
                          padding: "5px 14px",
                          borderRadius: 5,
                          cursor: "pointer",
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        BUY
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            color: MUTED,
            textAlign: "center",
            marginTop: 24,
          }}
        >
          This is a demo view. Sign in to access full trading functionality and
          manage real funds.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("welcome"); // welcome | home | trading

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${DARK_NAVY}; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes slideWord { 0% { opacity:0; transform:translateY(10px); } 20%,80% { opacity:1; transform:translateY(0); } 100% { opacity:0; transform:translateY(-10px); } }
      `}</style>

      {screen === "welcome" && (
        <WelcomeScreen onEnter={() => setScreen("home")} />
      )}

      {screen !== "welcome" && (
        <>
          <Ticker />
          <Nav onTrade={() => setScreen("trading")} />
          {screen === "home" && (
            <>
              <HeroPage onStart={() => setScreen("trading")} />
              <StatsBar />
              <MarketsSection />
              <FeaturesSection />
              <PricingSection onStart={() => setScreen("trading")} />
              <TestimonialsSection />
              <CTASection onStart={() => setScreen("trading")} />
              <Footer />
            </>
          )}
          {screen === "trading" && (
            <TradingDashboard onBack={() => setScreen("home")} />
          )}
        </>
      )}
    </div>
  );
}
