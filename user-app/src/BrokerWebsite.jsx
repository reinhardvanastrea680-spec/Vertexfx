import { useState, useEffect, useRef } from "react";
import Login from "./Login";
import SignUp from "./SignUp";
import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketContext";
import TradingDashboard from "./TradingDashboard";
import KycPage from "./KycPage";
import NotificationsBell from "./NotificationsBell";
import { walletApi, tradingApi, usersApi, marketApi } from "./api";

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
    GOLD: "#B8922A",
    DARK_NAVY: "#F5F7FA",
    NAVY: "#FFFFFF",
    NAVY2: "#EDF0F7",
    TEAL: "#0AAB90",
    LIGHT: "#1A202C",
    MUTED: "#6B7280",
    GREEN: "#16A34A",
    RED: "#DC2626",
    BORDER: "#D8DEE9",
    TICKER_BG: "#EDF0F7",
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
    icon: "FX",
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
    icon: "EQ",
    desc: "Global equities & blue chips",
    instruments: "2,000+ Stocks",
  },
  {
    name: "Commodities",
    icon: "CM",
    desc: "Gold, silver, oil & energy",
    instruments: "30+ Markets",
  },
  {
    name: "Indices",
    icon: "IX",
    desc: "Major world index CFDs",
    instruments: "20+ Indices",
  },
  {
    name: "ETFs",
    icon: "EF",
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
    icon: "▸",
    title: "Lightning Execution",
    desc: "Orders filled in under 12ms with our proprietary matching engine — zero requotes, zero slippage on market opens.",
  },
  {
    icon: "◈",
    title: "Segregated Funds",
    desc: "Client funds are held in tier-1 bank accounts, fully segregated from company assets under regulatory oversight.",
  },
  {
    icon: "▽",
    title: "Ultra-Low Spreads",
    desc: "EUR/USD from 0.0 pips on our RAW account. Raw interbank pricing passed directly to you.",
  },
  {
    icon: "≡",
    title: "Algo & Copy Trading",
    desc: "Automate strategies or copy top-performing traders with our integrated social trading suite.",
  },
  {
    icon: "□",
    title: "All-Device Platform",
    desc: "Trade on MT4, MT5, and our proprietary WebTrader — seamlessly synced across all your devices.",
  },
  {
    icon: "▲",
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

const marketDetails = {
  Forex: ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CHF"],
  Crypto: ["BTC/USD", "ETH/USD", "SOL/USD", "XRP/USD", "BNB/USD"],
  Stocks: ["AAPL", "TSLA", "MSFT", "GOOGL", "AMZN"],
  Commodities: ["GOLD", "SILVER", "OIL", "NATGAS", "COPPER"],
  Indices: ["S&P 500", "NASDAQ 100", "FTSE 100", "DAX 40", "NIKKEI"],
  ETFs: ["SPY", "QQQ", "GLD", "ARKK", "VTI"],
};

// --- SVG Illustrations ---
function SparklineSVG({ color, data, width, height }) {
  const w = width || 120;
  const h = height || 40;
  const pts = data || [30, 35, 28, 40, 38, 50, 45, 55, 52, 60, 58, 65, 62, 70];
  const max = Math.max(...pts);
  const min = Math.min(...pts);
  const range = max - min || 1;
  const step = w / (pts.length - 1);
  const points = pts
    .map((v, i) => `${i * step},${h - ((v - min) / range) * (h - 4) - 2}`)
    .join(" ");
  const fillPoints = `0,${h} ${points} ${w},${h}`;
  const c = color || "#0BCEAF";
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient
          id={`spark-${c.replace("#", "")}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={c} stopOpacity="0.25" />
          <stop offset="100%" stopColor={c} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fillPoints} fill={`url(#spark-${c.replace("#", "")})`} />
      <polyline
        points={points}
        fill="none"
        stroke={c}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DashboardChartSVG({ colors }) {
  return (
    <svg
      viewBox="0 0 600 200"
      fill="none"
      style={{ width: "100%", height: "auto" }}
    >
      <defs>
        <linearGradient id="dashChartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0BCEAF" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#0BCEAF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="dashGoldGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[40, 80, 120, 160].map((y) => (
        <line
          key={y}
          x1="30"
          y1={y}
          x2="580"
          y2={y}
          stroke={colors?.BORDER || "#1A2540"}
          strokeWidth="0.5"
        />
      ))}
      <path
        d="M30 160 L70 140 L110 148 L150 120 L190 130 L230 100 L270 110 L310 85 L350 95 L390 70 L430 80 L470 60 L510 68 L550 50"
        stroke="#0BCEAF"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M30 160 L70 140 L110 148 L150 120 L190 130 L230 100 L270 110 L310 85 L350 95 L390 70 L430 80 L470 60 L510 68 L550 50 L550 180 L30 180 Z"
        fill="url(#dashChartGrad)"
      />
      <path
        d="M30 150 L70 155 L110 142 L150 145 L190 135 L230 128 L270 120 L310 118 L350 108 L390 102 L430 95 L470 88 L510 82 L550 75"
        stroke="#C9A84C"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        fill="none"
      />
      <path
        d="M30 150 L70 155 L110 142 L150 145 L190 135 L230 128 L270 120 L310 118 L350 108 L390 102 L430 95 L470 88 L510 82 L550 75 L550 180 L30 180 Z"
        fill="url(#dashGoldGrad)"
      />
      <circle cx="390" cy="70" r="4" fill="#0BCEAF" />
      <circle cx="390" cy="70" r="8" fill="#0BCEAF" opacity="0.2" />
      <circle cx="470" cy="88" r="3" fill="#C9A84C" />
      {""}
      <text
        x="30"
        y="195"
        fill={colors?.MUTED || "#8895B3"}
        fontSize="9"
        fontFamily="sans-serif"
      >
        Jan
      </text>
      <text
        x="150"
        y="195"
        fill={colors?.MUTED || "#8895B3"}
        fontSize="9"
        fontFamily="sans-serif"
      >
        Mar
      </text>
      <text
        x="270"
        y="195"
        fill={colors?.MUTED || "#8895B3"}
        fontSize="9"
        fontFamily="sans-serif"
      >
        May
      </text>
      <text
        x="390"
        y="195"
        fill={colors?.MUTED || "#8895B3"}
        fontSize="9"
        fontFamily="sans-serif"
      >
        Jul
      </text>
      <text
        x="510"
        y="195"
        fill={colors?.MUTED || "#8895B3"}
        fontSize="9"
        fontFamily="sans-serif"
      >
        Sep
      </text>
    </svg>
  );
}

function TradingChartSVG() {
  return (
    <svg
      viewBox="0 0 480 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "auto" }}
    >
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0BCEAF" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0BCEAF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C9A84C" />
          <stop offset="100%" stopColor="#8B6914" />
        </linearGradient>
      </defs>
      <rect width="480" height="320" rx="16" fill="#0D1526" stroke="#1A2540" />
      <path
        d="M30 240 L80 200 L130 220 L180 150 L230 170 L280 110 L330 130 L380 80 L430 100 L460 70"
        stroke="#0BCEAF"
        strokeWidth="2.5"
        fill="none"
      />
      <path
        d="M30 240 L80 200 L130 220 L180 150 L230 170 L280 110 L330 130 L380 80 L430 100 L460 70 L460 280 L30 280 Z"
        fill="url(#chartGrad)"
      />
      <path
        d="M30 220 L80 230 L130 200 L180 210 L230 190 L280 185 L330 175 L380 160 L430 155 L460 140"
        stroke="#C9A84C"
        strokeWidth="2"
        strokeDasharray="4 4"
        fill="none"
      />
      {[80, 180, 280, 380].map((x, i) => (
        <g key={i}>
          <line
            x1={x}
            y1="40"
            x2={x}
            y2="280"
            stroke="#1A2540"
            strokeWidth="1"
          />
        </g>
      ))}
      {[80, 140, 200, 260].map((y, i) => (
        <g key={i}>
          <line
            x1="30"
            y1={y}
            x2="460"
            y2={y}
            stroke="#1A2540"
            strokeWidth="1"
          />
        </g>
      ))}
      <circle cx="280" cy="110" r="6" fill="#0BCEAF" />
      <circle cx="280" cy="110" r="12" fill="#0BCEAF" opacity="0.2" />
      <rect x="252" y="84" width="56" height="20" rx="4" fill="#0BCEAF" />
      <text
        x="280"
        y="98"
        textAnchor="middle"
        fill="white"
        fontSize="10"
        fontFamily="sans-serif"
        fontWeight="600"
      >
        $2,384
      </text>
      <rect
        x="320"
        y="250"
        width="140"
        height="44"
        rx="8"
        fill="#111D35"
        stroke="#1A2540"
      />
      <text x="332" y="268" fill="#8895B3" fontSize="9" fontFamily="sans-serif">
        XAU/USD
      </text>
      <text
        x="332"
        y="284"
        fill="#22C55E"
        fontSize="12"
        fontFamily="sans-serif"
        fontWeight="700"
      >
        +1.24%
      </text>
      <rect
        x="20"
        y="250"
        width="130"
        height="44"
        rx="8"
        fill="#111D35"
        stroke="#1A2540"
      />
      <text x="32" y="268" fill="#8895B3" fontSize="9" fontFamily="sans-serif">
        Portfolio Value
      </text>
      <text
        x="32"
        y="284"
        fill="#C9A84C"
        fontSize="12"
        fontFamily="sans-serif"
        fontWeight="700"
      >
        $48,294.50
      </text>
    </svg>
  );
}

function GoldBarSVG() {
  return (
    <svg
      viewBox="0 0 200 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "auto" }}
    >
      <defs>
        <linearGradient id="goldBar" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F5D77A" />
          <stop offset="50%" stopColor="#C9A84C" />
          <stop offset="100%" stopColor="#8B6914" />
        </linearGradient>
        <linearGradient id="goldShine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF8DC" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M40 100 L60 50 L140 50 L160 100 Z"
        fill="url(#goldBar)"
        stroke="#8B6914"
        strokeWidth="1"
      />
      <path d="M60 50 L65 45 L145 45 L140 50 Z" fill="#F5D77A" />
      <path d="M140 50 L145 45 L165 95 L160 100 Z" fill="#A07728" />
      <path
        d="M55 95 L65 60 L135 60 L145 95 Z"
        fill="url(#goldShine)"
        opacity="0.4"
      />
      <text
        x="100"
        y="82"
        textAnchor="middle"
        fill="#8B6914"
        fontSize="14"
        fontFamily="serif"
        fontWeight="700"
      >
        999.9
      </text>
      <text
        x="100"
        y="94"
        textAnchor="middle"
        fill="#8B6914"
        fontSize="8"
        fontFamily="serif"
      >
        FINE GOLD
      </text>
      <ellipse cx="100" cy="115" rx="70" ry="8" fill="#C9A84C" opacity="0.15" />
    </svg>
  );
}

function PlatformSVG() {
  return (
    <svg
      viewBox="0 0 440 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "auto" }}
    >
      <defs>
        <linearGradient id="screenGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0D1526" />
          <stop offset="100%" stopColor="#0A0F1E" />
        </linearGradient>
      </defs>
      <rect
        x="10"
        y="10"
        width="420"
        height="260"
        rx="12"
        fill="url(#screenGrad)"
        stroke="#1A2540"
        strokeWidth="2"
      />
      <rect x="10" y="10" width="420" height="32" rx="12" fill="#111D35" />
      <circle cx="28" cy="26" r="5" fill="#EF4444" />
      <circle cx="44" cy="26" r="5" fill="#C9A84C" />
      <circle cx="60" cy="26" r="5" fill="#22C55E" />
      <rect x="20" y="52" width="90" height="210" rx="6" fill="#111D35" />
      {[
        ["EUR/USD", "1.0847", "+0.12%", "#22C55E"],
        ["BTC/USD", "67,420", "+2.34%", "#22C55E"],
        ["GOLD", "2,384", "+0.88%", "#22C55E"],
        ["GBP/USD", "1.2734", "-0.09%", "#EF4444"],
      ].map(([sym, p, chg, col], i) => (
        <g key={i}>
          <rect
            x="26"
            y={62 + i * 48}
            width="78"
            height="40"
            rx="4"
            fill="#0D1526"
          />
          <text
            x="34"
            y={78 + i * 48}
            fill="#F0F4FF"
            fontSize="9"
            fontFamily="sans-serif"
            fontWeight="600"
          >
            {sym}
          </text>
          <text
            x="34"
            y={92 + i * 48}
            fill={col}
            fontSize="8"
            fontFamily="sans-serif"
          >
            {p} {chg}
          </text>
        </g>
      ))}
      <rect x="120" y="52" width="200" height="130" rx="6" fill="#111D35" />
      <path
        d="M130 160 L155 140 L180 148 L205 120 L230 128 L255 100 L280 108 L305 90"
        stroke="#0BCEAF"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M130 160 L155 140 L180 148 L205 120 L230 128 L255 100 L280 108 L305 90 L305 172 L130 172 Z"
        fill="#0BCEAF"
        opacity="0.1"
      />
      <rect x="120" y="190" width="200" height="72" rx="6" fill="#111D35" />
      <rect x="130" y="200" width="80" height="22" rx="4" fill="#22C55E" />
      <text
        x="170"
        y="215"
        textAnchor="middle"
        fill="white"
        fontSize="9"
        fontFamily="sans-serif"
        fontWeight="700"
      >
        BUY
      </text>
      <rect x="220" y="200" width="80" height="22" rx="4" fill="#EF4444" />
      <text
        x="260"
        y="215"
        textAnchor="middle"
        fill="white"
        fontSize="9"
        fontFamily="sans-serif"
        fontWeight="700"
      >
        SELL
      </text>
      <rect x="130" y="232" width="180" height="20" rx="4" fill="#0D1526" />
      <text x="140" y="246" fill="#8895B3" fontSize="9" fontFamily="sans-serif">
        Lot: 0.10 | SL: 2340 | TP: 2420
      </text>
      <rect x="330" y="52" width="100" height="210" rx="6" fill="#111D35" />
      <text
        x="340"
        y="72"
        fill="#8895B3"
        fontSize="9"
        fontFamily="sans-serif"
        fontWeight="600"
      >
        POSITIONS
      </text>
      {[
        ["EUR/USD", "BUY", "+$125"],
        ["XAU/USD", "BUY", "+$84"],
        ["BTC", "SELL", "-$32"],
      ].map(([s, d, pnl], i) => (
        <g key={i}>
          <rect
            x="336"
            y={82 + i * 52}
            width="88"
            height="42"
            rx="4"
            fill="#0D1526"
          />
          <text
            x="344"
            y={98 + i * 52}
            fill="#F0F4FF"
            fontSize="8"
            fontFamily="sans-serif"
            fontWeight="600"
          >
            {s}
          </text>
          <text
            x="344"
            y={112 + i * 52}
            fill={pnl.startsWith("+") ? "#22C55E" : "#EF4444"}
            fontSize="9"
            fontFamily="sans-serif"
            fontWeight="700"
          >
            {pnl}
          </text>
        </g>
      ))}
    </svg>
  );
}

function TraderAvatarSVG({ seed, bg }) {
  const hue = (seed * 37) % 360;
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", borderRadius: "50%" }}
    >
      <circle cx="40" cy="40" r="40" fill={bg || `hsl(${hue},40%,20%)`} />
      <circle cx="40" cy="32" r="14" fill={`hsl(${hue},45%,60%)`} />
      <ellipse cx="40" cy="68" rx="22" ry="18" fill={`hsl(${hue},45%,60%)`} />
      <circle cx="35" cy="30" r="2" fill="#fff" />
      <circle cx="45" cy="30" r="2" fill="#fff" />
      <path
        d="M36 37 Q40 41 44 37"
        stroke="#fff"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GlobeSVG() {
  return (
    <svg
      viewBox="0 0 300 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "auto" }}
    >
      <defs>
        <radialGradient id="globeGrad" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#0BCEAF" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#0A0F1E" stopOpacity="0.8" />
        </radialGradient>
      </defs>
      <circle
        cx="150"
        cy="150"
        r="120"
        fill="url(#globeGrad)"
        stroke="#1A2540"
        strokeWidth="1"
      />
      <ellipse
        cx="150"
        cy="150"
        rx="120"
        ry="40"
        stroke="#1A2540"
        strokeWidth="0.5"
        fill="none"
      />
      <ellipse
        cx="150"
        cy="150"
        rx="80"
        ry="120"
        stroke="#1A2540"
        strokeWidth="0.5"
        fill="none"
      />
      <ellipse
        cx="150"
        cy="150"
        rx="40"
        ry="120"
        stroke="#1A2540"
        strokeWidth="0.5"
        fill="none"
      />
      <line
        x1="30"
        y1="150"
        x2="270"
        y2="150"
        stroke="#1A2540"
        strokeWidth="0.5"
      />
      <line
        x1="150"
        y1="30"
        x2="150"
        y2="270"
        stroke="#1A2540"
        strokeWidth="0.5"
      />
      {[
        [90, 80],
        [200, 100],
        [130, 180],
        [210, 170],
        [100, 130],
        [180, 200],
      ].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="4" fill="#C9A84C" opacity="0.9" />
          <circle cx={x} cy={y} r="10" fill="#C9A84C" opacity="0.15" />
        </g>
      ))}
    </svg>
  );
}

// Helper: generate mock price for instrument
function mockPrice(sym) {
  const base = sym.includes("BTC")
    ? 67420
    : sym.includes("ETH")
      ? 3521
      : sym.includes("GOLD")
        ? 2384
        : sym.includes("S&P")
          ? 5248
          : sym.includes("NAS")
            ? 18432
            : sym.includes("SILVER")
              ? 28.4
              : sym.includes("OIL")
                ? 78.3
                : sym.includes("NATGAS")
                  ? 2.18
                  : sym.includes("COPPER")
                    ? 4.52
                    : sym.includes("FTSE")
                      ? 8120
                      : sym.includes("DAX")
                        ? 18240
                        : sym.includes("NIKKEI")
                          ? 38400
                          : sym.includes("SPY")
                            ? 524
                            : sym.includes("QQQ")
                              ? 448
                              : sym.includes("GLD")
                                ? 222
                                : sym.includes("ARKK")
                                  ? 52
                                  : sym.includes("VTI")
                                    ? 258
                                    : sym.includes("AAPL")
                                      ? 213
                                      : sym.includes("TSLA")
                                        ? 168
                                        : sym.includes("MSFT")
                                          ? 442
                                          : sym.includes("GOOGL")
                                            ? 176
                                            : sym.includes("AMZN")
                                              ? 192
                                              : sym.includes("SOL")
                                                ? 148
                                                : sym.includes("XRP")
                                                  ? 0.52
                                                  : sym.includes("BNB")
                                                    ? 598
                                                    : 1.0847;
  return base;
}

function mockSpread(sym) {
  if (
    sym.includes("/") &&
    !sym.includes("BTC") &&
    !sym.includes("ETH") &&
    !sym.includes("SOL") &&
    !sym.includes("XRP") &&
    !sym.includes("BNB")
  )
    return 0.0002;
  if (sym.includes("BTC")) return 5;
  if (sym.includes("ETH")) return 1.5;
  return mockPrice(sym) * 0.001;
}

function Ticker({ colors }) {
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
        background: colors.TICKER_BG,
        borderBottom: `1px solid ${colors.BORDER}`,
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
              borderRight: `1px solid ${colors.BORDER}`,
              height: 40,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
            }}
          >
            <span style={{ color: colors.MUTED, fontWeight: 500 }}>
              {t.sym}
            </span>
            <span style={{ color: colors.LIGHT, fontWeight: 600 }}>
              {t.price}
            </span>
            <span
              style={{
                color: t.up ? colors.GREEN : colors.RED,
                fontWeight: 500,
              }}
            >
              {t.chg}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Nav({ onTrade, colors, setTheme, theme, onOpenLogin, onOpenSignup }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    const handleResize = () => setIsMobile(window.innerWidth <= 900);

    window.addEventListener("scroll", h);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", h);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 40,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: scrolled ? colors.NAVY : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? `1px solid ${colors.BORDER}` : "none",
          transition: "all 0.3s ease",
          padding: isMobile ? "0 20px" : "0 48px",
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
              background: `linear-gradient(135deg, ${colors.GOLD}, #8B6914)`,
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
              color: colors.LIGHT,
              letterSpacing: 1,
            }}
          >
            VERTEX<span style={{ color: colors.GOLD }}>FX</span>
          </span>
        </div>

        {/* Desktop nav links */}
        {!isMobile && (
          <div
            style={{
              display: "flex",
              gap: 36,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {[
              { label: "Markets", id: "markets" },
              { label: "Platforms", id: "features" },
              { label: "Accounts", id: "pricing" },
              { label: "Education", id: "education" },
              { label: "Company", id: "company" },
            ].map((n) => (
              <a
                key={n.label}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(n.id);
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                style={{
                  color: colors.MUTED,
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.color = colors.LIGHT)}
                onMouseLeave={(e) => (e.target.style.color = colors.MUTED)}
              >
                {n.label}
              </a>
            ))}
          </div>
        )}

        {/* Desktop buttons */}
        {!isMobile && (
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              style={{
                background: "transparent",
                border: `1px solid ${colors.BORDER}`,
                color: colors.LIGHT,
                padding: "9px 16px",
                borderRadius: 6,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
            <button
              onClick={onOpenLogin}
              style={{
                background: "transparent",
                border: `1px solid ${colors.BORDER}`,
                color: colors.LIGHT,
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
              onClick={onOpenSignup}
              style={{
                background: `linear-gradient(135deg, ${colors.GOLD}, #A07728)`,
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
        )}

        {/* Mobile hamburger button */}
        {isMobile && (
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: "transparent",
              border: "none",
              color: colors.LIGHT,
              fontSize: 28,
              cursor: "pointer",
            }}
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        )}
      </nav>

      {/* Mobile menu */}
      {isMobile && mobileMenuOpen && (
        <div
          style={{
            position: "fixed",
            top: 112, // 40 + 72
            left: 0,
            right: 0,
            bottom: 0,
            background: colors.NAVY,
            zIndex: 999,
            padding: "32px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 24,
            borderTop: `1px solid ${colors.BORDER}`,
          }}
        >
          {[
            { label: "Markets", id: "markets" },
            { label: "Platforms", id: "features" },
            { label: "Accounts", id: "pricing" },
            { label: "Education", id: "education" },
            { label: "Company", id: "company" },
          ].map((n) => (
            <a
              key={n.label}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                const el = document.getElementById(n.id);
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              style={{
                color: colors.LIGHT,
                textDecoration: "none",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 20,
                fontWeight: 500,
              }}
            >
              {n.label}
            </a>
          ))}
          <div
            style={{
              borderTop: `1px solid ${colors.BORDER}`,
              paddingTop: 24,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <button
              onClick={() => {
                setTheme(theme === "dark" ? "light" : "dark");
                setMobileMenuOpen(false);
              }}
              style={{
                background: "transparent",
                border: `1px solid ${colors.BORDER}`,
                color: colors.LIGHT,
                padding: "12px 20px",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 16,
                fontWeight: 500,
              }}
            >
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
            <button
              onClick={() => {
                onOpenLogin();
                setMobileMenuOpen(false);
              }}
              style={{
                background: "transparent",
                border: `1px solid ${colors.BORDER}`,
                color: colors.LIGHT,
                padding: "12px 20px",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 16,
                fontWeight: 500,
              }}
            >
              Log In
            </button>
            <button
              onClick={() => {
                onOpenSignup();
                setMobileMenuOpen(false);
              }}
              style={{
                background: `linear-gradient(135deg, ${colors.GOLD}, #A07728)`,
                border: "none",
                color: "#fff",
                padding: "12px 20px",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              Open Account
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function HeroPage({ onStart, colors }) {
  const [angle, setAngle] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
        background: colors.DARK_NAVY,
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
          backgroundImage: `linear-gradient(${colors.BORDER} 1px, transparent 1px), linear-gradient(90deg, ${colors.BORDER} 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          opacity: 0.3,
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
              background: colors.GOLD,
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
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          maxWidth: 1200,
          padding: "0 24px",
          position: "relative",
          zIndex: 2,
          gap: 60,
          alignItems: "center",
        }}
      >
        <div style={{ textAlign: "left" }}>
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
              animation: "fadeInUp 0.6s ease",
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: colors.TEAL,
                boxShadow: `0 0 8px ${colors.TEAL}`,
              }}
            />
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                color: colors.TEAL,
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
              fontSize: "clamp(44px, 6vw, 72px)",
              fontWeight: 700,
              color: colors.LIGHT,
              lineHeight: 1.05,
              margin: "0 0 16px",
              textShadow: "0 0 80px rgba(201,168,76,0.2)",
              animation: "fadeInUp 0.8s ease",
            }}
          >
            Trade the World's
            <br />
            <span style={{ color: colors.GOLD, fontStyle: "italic" }}>
              Finest Markets
            </span>
          </h1>

          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 17,
              color: colors.MUTED,
              lineHeight: 1.7,
              maxWidth: 480,
              margin: "0 0 40px",
              fontWeight: 300,
              animation: "fadeInUp 1s ease",
            }}
          >
            Institutional-grade execution. Razor-thin spreads. Over 2,000
            instruments across forex, crypto, stocks, gold and commodities.
          </p>

          <div
            style={{
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
              animation: "fadeInUp 1.2s ease",
            }}
          >
            <button
              onClick={onStart}
              style={{
                background: `linear-gradient(135deg, ${colors.GOLD} 0%, #A07728 100%)`,
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
              onClick={onStart}
              style={{
                background: "rgba(11,206,175,0.06)",
                border: `1px solid rgba(11,206,175,0.3)`,
                color: colors.TEAL,
                padding: "16px 36px",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15,
                fontWeight: 500,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = colors.TEAL;
                e.target.style.background = "rgba(11,206,175,0.12)";
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = "rgba(11,206,175,0.3)";
                e.target.style.background = "rgba(11,206,175,0.06)";
              }}
            >
              View Live Demo
            </button>
          </div>

          <div
            style={{
              display: "flex",
              gap: 32,
              marginTop: 48,
              flexWrap: "wrap",
              animation: "fadeInUp 1.4s ease",
            }}
          >
            {[
              ["FCA Regulated", "◆"],
              ["Zero Commission", "★"],
              ["24/7 Support", "●"],
            ].map(([l, ic]) => (
              <div
                key={l}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  color: colors.MUTED,
                }}
              >
                <span style={{ fontSize: 14, color: colors.GOLD }}>{ic}</span>{" "}
                {l}
              </div>
            ))}
          </div>
        </div>

        {/* Right side: Trading chart illustration + floating cards */}
        <div style={{ position: "relative", animation: "fadeInUp 1s ease" }}>
          <div
            style={{
              position: "relative",
              zIndex: 2,
              borderRadius: 16,
              overflow: "hidden",
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(11,206,175,0.08)",
            }}
          >
            <TradingChartSVG />
          </div>
          {/* Floating gold price card */}
          <div
            style={{
              position: "absolute",
              top: -20,
              right: -20,
              background: `linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))`,
              border: "1px solid rgba(201,168,76,0.3)",
              borderRadius: 12,
              padding: "12px 18px",
              zIndex: 3,
              animation: "float 4s ease-in-out infinite",
              backdropFilter: "blur(8px)",
            }}
          >
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 10,
                color: colors.MUTED,
                fontWeight: 600,
                letterSpacing: 1,
              }}
            >
              GOLD / XAU
            </div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 24,
                fontWeight: 700,
                color: colors.GOLD,
              }}
            >
              $2,384.50
            </div>
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11,
                color: colors.GREEN,
                fontWeight: 600,
              }}
            >
              +1.24%
            </div>
          </div>
          {/* Floating BTC card */}
          <div
            style={{
              position: "absolute",
              bottom: 30,
              left: -30,
              background: `linear-gradient(135deg, rgba(11,206,175,0.12), rgba(11,206,175,0.04))`,
              border: "1px solid rgba(11,206,175,0.25)",
              borderRadius: 12,
              padding: "12px 18px",
              zIndex: 3,
              animation: "float 5s ease-in-out infinite 1s",
              backdropFilter: "blur(8px)",
            }}
          >
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 10,
                color: colors.MUTED,
                fontWeight: 600,
                letterSpacing: 1,
              }}
            >
              BITCOIN
            </div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 22,
                fontWeight: 700,
                color: colors.TEAL,
              }}
            >
              $67,420
            </div>
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11,
                color: colors.GREEN,
                fontWeight: 600,
              }}
            >
              +2.34%
            </div>
          </div>
          {/* Glow orb behind */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 300,
              height: 300,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)",
              transform: "translate(-50%,-50%)",
              zIndex: 0,
              pointerEvents: "none",
            }}
          />
        </div>
      </div>
    </div>
  );
}

function StatsBar({ colors }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${colors.NAVY}, ${colors.NAVY2})`,
        borderTop: `1px solid ${colors.BORDER}`,
        borderBottom: `1px solid ${colors.BORDER}`,
        padding: isMobile ? "0 20px" : "0 48px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle glow line at top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "20%",
          right: "20%",
          height: 1,
          background: `linear-gradient(90deg, transparent, ${colors.GOLD}40, transparent)`,
        }}
      />
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
          gap: isMobile ? "1px" : 0,
        }}
      >
        {stats.map((s, i) => (
          <div
            key={i}
            style={{
              padding: isMobile ? "24px 0" : "32px 0",
              textAlign: "center",
              borderRight:
                !isMobile && i < 3 ? `1px solid ${colors.BORDER}` : "none",
              borderBottom:
                isMobile && i < 2 ? `1px solid ${colors.BORDER}` : "none",
            }}
          >
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: isMobile ? 28 : 40,
                fontWeight: 700,
                color: colors.GOLD,
                lineHeight: 1,
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: isMobile ? 12 : 13,
                color: colors.LIGHT,
                fontWeight: 600,
                marginTop: 6,
              }}
            >
              {s.label}
            </div>
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11,
                color: colors.MUTED,
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

function MarketsSection({ colors, showToast, isLoggedIn, onOpenSignup }) {
  const [active, setActive] = useState(-1);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [tradeModal, setTradeModal] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleTrade = (sym, dir) => {
    if (!isLoggedIn) {
      onOpenSignup();
      return;
    }
    setTradeModal({ sym, dir, price: mockPrice(sym) });
  };

  const handleTradeConfirm = (order) => {
    const fmt =
      order.price >= 100
        ? order.price.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : order.price.toFixed(5);
    showToast(
      `${order.symbol} ${order.direction} ${order.lot} lot placed at ${fmt}`,
      "success",
    );
  };

  return (
    <section
      id="markets"
      style={{
        background: colors.DARK_NAVY,
        padding: isMobile ? "64px 20px" : "96px 48px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 64, textAlign: "center" }}>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              letterSpacing: 3,
              color: colors.GOLD,
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            Instruments
          </span>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: isMobile ? 36 : 48,
              fontWeight: 700,
              color: colors.LIGHT,
              margin: "12px 0 16px",
            }}
          >
            Markets We Offer
          </h2>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: colors.MUTED,
              fontSize: 16,
              maxWidth: 520,
              margin: "0 auto",
            }}
          >
            Access over 2,000 tradeable instruments across six major asset
            classes from a single account.
          </p>
        </div>

        {/* Gold Spotlight Banner */}
        <div
          style={{
            marginBottom: 40,
            background: `linear-gradient(135deg, rgba(201,168,76,0.12) 0%, rgba(139,105,20,0.08) 50%, rgba(201,168,76,0.04) 100%)`,
            border: "1px solid rgba(201,168,76,0.35)",
            borderRadius: 16,
            padding: isMobile ? "24px 20px" : "28px 36px",
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr auto 1fr",
            gap: 32,
            alignItems: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 1,
              background:
                "linear-gradient(90deg, transparent, rgba(201,168,76,0.6), transparent)",
            }}
          />
          <div>
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11,
                letterSpacing: 3,
                color: colors.GOLD,
                fontWeight: 600,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Featured Commodity
            </div>
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 32,
                fontWeight: 700,
                color: colors.LIGHT,
                margin: "0 0 6px",
              }}
            >
              Trade{" "}
              <span style={{ color: colors.GOLD, fontStyle: "italic" }}>
                Gold
              </span>{" "}
              — XAU/USD
            </h3>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                color: colors.MUTED,
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              Hedge against inflation and trade the world's most precious metal
              with spreads from 0.3 points. Available 23/5.
            </p>
          </div>
          <div style={{ width: 160, height: 110, flexShrink: 0 }}>
            <GoldBarSVG />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                background: colors.NAVY2,
                borderRadius: 10,
                padding: "12px 16px",
                border: `1px solid ${colors.BORDER}`,
              }}
            >
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 10,
                  color: colors.MUTED,
                  fontWeight: 600,
                }}
              >
                CURRENT PRICE
              </div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 26,
                  fontWeight: 700,
                  color: colors.GOLD,
                }}
              >
                $2,384.50
              </div>
            </div>
            <button
              onClick={() => setSelectedMarket("Commodities")}
              style={{
                padding: "12px 24px",
                background: `linear-gradient(135deg, ${colors.GOLD}, #A07728)`,
                border: "none",
                borderRadius: 8,
                color: "#fff",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(201,168,76,0.35)",
                transition: "all 0.2s",
              }}
            >
              Trade Gold Now
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: 2,
          }}
        >
          {markets.map((m, i) => (
            <div
              key={i}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(-1)}
              onClick={() =>
                setSelectedMarket(selectedMarket === m.name ? null : m.name)
              }
              style={{
                background:
                  active === i || selectedMarket === m.name
                    ? "rgba(201,168,76,0.07)"
                    : colors.NAVY2,
                border: `1px solid ${active === i || selectedMarket === m.name ? "rgba(201,168,76,0.3)" : colors.BORDER}`,
                padding: "36px 32px",
                cursor: "pointer",
                transition: "all 0.3s ease",
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
                boxShadow:
                  active === i ? "0 8px 24px rgba(201,168,76,0.08)" : "none",
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 16 }}>{m.icon}</div>
              <h3
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 26,
                  fontWeight: 700,
                  color: colors.LIGHT,
                  margin: "0 0 8px",
                }}
              >
                {m.name}
              </h3>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  color: colors.MUTED,
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
                  color: colors.TEAL,
                  fontWeight: 600,
                  letterSpacing: 0.5,
                }}
              >
                {m.instruments} {selectedMarket === m.name ? "▼" : "→"}
              </span>
            </div>
          ))}
        </div>

        {/* Instrument Details Panel */}
        {selectedMarket && marketDetails[selectedMarket] && (
          <div
            style={{
              marginTop: 24,
              background: colors.NAVY,
              border: `1px solid ${colors.BORDER}`,
              borderRadius: 14,
              padding: "28px 32px",
            }}
          >
            <h3
              style={{
                margin: "0 0 20px",
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 24,
                fontWeight: 700,
                color: colors.LIGHT,
              }}
            >
              {selectedMarket} — Popular Instruments
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 12,
              }}
            >
              {marketDetails[selectedMarket].map((sym) => {
                const price = mockPrice(sym);
                const spread = mockSpread(sym);
                const bid = price - spread / 2;
                const ask = price + spread / 2;
                const fmtBid =
                  bid >= 100
                    ? bid.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : bid.toFixed(5);
                const fmtAsk =
                  ask >= 100
                    ? ask.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : ask.toFixed(5);
                return (
                  <div
                    key={sym}
                    style={{
                      background: colors.NAVY2,
                      border: `1px solid ${colors.BORDER}`,
                      borderRadius: 10,
                      padding: "16px",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 14,
                        fontWeight: 600,
                        color: colors.LIGHT,
                        marginBottom: 8,
                      }}
                    >
                      {sym}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 10,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 10,
                            color: colors.RED,
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: 600,
                          }}
                        >
                          SELL
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: colors.LIGHT,
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          {fmtBid}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontSize: 10,
                            color: colors.GREEN,
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: 600,
                          }}
                        >
                          BUY
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: colors.LIGHT,
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          {fmtAsk}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => handleTrade(sym, "SELL")}
                        style={{
                          flex: 1,
                          padding: "7px 0",
                          borderRadius: 6,
                          border: "none",
                          background: colors.RED,
                          color: "#fff",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        SELL
                      </button>
                      <button
                        onClick={() => handleTrade(sym, "BUY")}
                        style={{
                          flex: 1,
                          padding: "7px 0",
                          borderRadius: 6,
                          border: "none",
                          background: colors.GREEN,
                          color: "#fff",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        BUY
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {tradeModal && (
        <TradeModal
          symbol={tradeModal.sym}
          direction={tradeModal.dir}
          currentPrice={tradeModal.price}
          onClose={() => setTradeModal(null)}
          onConfirm={handleTradeConfirm}
          colors={colors}
        />
      )}
    </section>
  );
}

function FeaturesSection({ colors }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section
      id="features"
      style={{
        background: colors.NAVY,
        padding: isMobile ? "64px 20px" : "96px 48px",
        borderTop: `1px solid ${colors.BORDER}`,
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: 80,
            alignItems: "start",
          }}
        >
          <div>
            {/* Platform mockup image */}
            <div
              style={{
                marginBottom: 40,
                borderRadius: 14,
                overflow: "hidden",
                boxShadow:
                  "0 16px 48px rgba(0,0,0,0.3), 0 0 24px rgba(11,206,175,0.06)",
                border: `1px solid ${colors.BORDER}`,
              }}
            >
              <PlatformSVG />
            </div>
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11,
                letterSpacing: 3,
                color: colors.GOLD,
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              Why VertexFX
            </span>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: isMobile ? 36 : 52,
                fontWeight: 700,
                color: colors.LIGHT,
                margin: "16px 0 24px",
                lineHeight: 1.1,
              }}
            >
              Built for Serious
              <br />
              <span style={{ color: colors.GOLD, fontStyle: "italic" }}>
                Traders
              </span>
            </h2>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: colors.MUTED,
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
                    color: colors.LIGHT,
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
                      style={{
                        color: colors.TEAL,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
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
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: 16,
            }}
          >
            {features.map((f, i) => (
              <div
                key={i}
                style={{
                  background: `linear-gradient(135deg, ${colors.NAVY2}, ${colors.NAVY})`,
                  border: `1px solid ${colors.BORDER}`,
                  borderRadius: 12,
                  padding: "24px 20px",
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(201,168,76,0.5)";
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 32px rgba(201,168,76,0.1), 0 0 20px rgba(201,168,76,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.BORDER;
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ fontSize: 26, marginBottom: 12 }}>{f.icon}</div>
                <h4
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14,
                    fontWeight: 600,
                    color: colors.LIGHT,
                    margin: "0 0 8px",
                  }}
                >
                  {f.title}
                </h4>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 12,
                    color: colors.MUTED,
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

function PricingSection({ onStart, colors, showToast }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section
      id="pricing"
      style={{
        background: colors.DARK_NAVY,
        padding: isMobile ? "64px 20px" : "96px 48px",
        borderTop: `1px solid ${colors.BORDER}`,
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              letterSpacing: 3,
              color: colors.GOLD,
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            Account Types
          </span>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: isMobile ? 36 : 48,
              fontWeight: 700,
              color: colors.LIGHT,
              margin: "12px 0 16px",
            }}
          >
            Choose Your Account
          </h2>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: colors.MUTED,
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
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: 20,
          }}
        >
          {plans.map((p, i) => (
            <div
              key={i}
              style={{
                background: p.highlight
                  ? `linear-gradient(160deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))`
                  : `linear-gradient(160deg, ${colors.NAVY2}, ${colors.NAVY})`,
                border: `1px solid ${p.highlight ? "rgba(201,168,76,0.5)" : colors.BORDER}`,
                borderRadius: 16,
                padding: "36px 28px",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.3s ease",
                boxShadow: p.highlight
                  ? "0 8px 32px rgba(201,168,76,0.12)"
                  : "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = p.highlight
                  ? "0 16px 48px rgba(201,168,76,0.2)"
                  : "0 12px 36px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = p.highlight
                  ? "0 8px 32px rgba(201,168,76,0.12)"
                  : "none";
              }}
            >
              {p.highlight && (
                <div
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    background: colors.GOLD,
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
                  color: p.highlight ? colors.GOLD : colors.LIGHT,
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
                    borderBottom: `1px solid ${colors.BORDER}`,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <span style={{ fontSize: 13, color: colors.MUTED }}>{k}</span>
                  <span
                    style={{
                      fontSize: 13,
                      color: colors.LIGHT,
                      fontWeight: 600,
                    }}
                  >
                    {v}
                  </span>
                </div>
              ))}
              <button
                onClick={() => {
                  showToast(`Sign up to open a ${p.name} account`, "success");
                  onStart();
                }}
                style={{
                  marginTop: 28,
                  width: "100%",
                  padding: "12px 0",
                  borderRadius: 8,
                  background: p.highlight
                    ? `linear-gradient(135deg, ${colors.GOLD}, #A07728)`
                    : "transparent",
                  border: p.highlight ? "none" : `1px solid ${colors.BORDER}`,
                  color: p.highlight ? "#000" : colors.LIGHT,
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

function TestimonialsSection({ colors }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section
      style={{
        background: colors.NAVY,
        padding: isMobile ? "64px 20px" : "96px 48px",
        borderTop: `1px solid ${colors.BORDER}`,
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              letterSpacing: 3,
              color: colors.GOLD,
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            Client Stories
          </span>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: isMobile ? 36 : 48,
              fontWeight: 700,
              color: colors.LIGHT,
              margin: "12px 0",
            }}
          >
            What Traders Say
          </h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: 24,
          }}
        >
          {testimonials.map((t, i) => (
            <div
              key={i}
              style={{
                background: `linear-gradient(160deg, ${colors.NAVY2}, ${colors.NAVY})`,
                border: `1px solid ${colors.BORDER}`,
                borderRadius: 16,
                padding: "32px 28px",
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)";
                e.currentTarget.style.boxShadow =
                  "0 12px 36px rgba(201,168,76,0.08)";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.BORDER;
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
                {[...Array(5)].map((_, s) => (
                  <span key={s} style={{ color: colors.GOLD, fontSize: 14 }}>
                    ★
                  </span>
                ))}
              </div>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 15,
                  color: colors.LIGHT,
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
                    overflow: "hidden",
                    flexShrink: 0,
                    boxShadow: `0 0 12px rgba(201,168,76,0.2)`,
                  }}
                >
                  <TraderAvatarSVG
                    seed={i + 1}
                    bg={`linear-gradient(135deg, ${colors.GOLD}, #8B6914)`}
                  />
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 14,
                      fontWeight: 600,
                      color: colors.LIGHT,
                    }}
                  >
                    {t.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 12,
                      color: colors.MUTED,
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

function CTASection({ onStart, colors }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section
      style={{
        background: colors.DARK_NAVY,
        padding: isMobile ? "64px 20px" : "96px 48px",
        borderTop: `1px solid ${colors.BORDER}`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Globe illustration background */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: isMobile ? 300 : 500,
          height: isMobile ? 300 : 500,
          opacity: 0.15,
          pointerEvents: "none",
        }}
      >
        <GlobeSVG />
      </div>
      <div
        style={{
          position: "absolute",
          width: isMobile ? 300 : 500,
          height: isMobile ? 300 : 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%)`,
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
            fontSize: isMobile ? 36 : 56,
            fontWeight: 700,
            color: colors.LIGHT,
            margin: "0 0 20px",
            lineHeight: 1.1,
          }}
        >
          Ready to Start
          <br />
          <span style={{ color: colors.GOLD, fontStyle: "italic" }}>
            Trading?
          </span>
        </h2>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: colors.MUTED,
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
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: 16,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <button
            onClick={onStart}
            style={{
              background: `linear-gradient(135deg, ${colors.GOLD} 0%, #A07728 100%)`,
              border: "none",
              color: "#fff",
              padding: isMobile ? "14px 32px" : "18px 52px",
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
            onClick={onStart}
            style={{
              background: "transparent",
              border: `1px solid ${colors.BORDER}`,
              color: colors.LIGHT,
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
            color: colors.MUTED,
            marginTop: 24,
          }}
        >
          CFDs carry risk. 74% of retail accounts lose money. Trade responsibly.
        </p>
      </div>
    </section>
  );
}

function Footer({ colors, showToast }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const sectionLinks = {
    Forex: "markets",
    Crypto: "markets",
    Stocks: "markets",
    Commodities: "markets",
    Indices: "markets",
  };

  return (
    <footer
      style={{
        background: colors.TICKER_BG,
        borderTop: `1px solid ${colors.BORDER}`,
        padding: isMobile ? "40px 20px 24px" : "60px 48px 32px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr 1fr 1fr 1fr",
            gap: 32,
            marginBottom: 48,
            paddingBottom: 48,
            borderBottom: `1px solid ${colors.BORDER}`,
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
                  background: `linear-gradient(135deg, ${colors.GOLD}, #8B6914)`,
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
                  color: colors.LIGHT,
                }}
              >
                VERTEX<span style={{ color: colors.GOLD }}>FX</span>
              </span>
            </div>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: colors.MUTED,
                fontSize: 13,
                lineHeight: 1.6,
                marginBottom: 20,
              }}
            >
              Institutional-grade trading infrastructure for retail traders.
              Trade forex, crypto, stocks, and more.
            </p>
          </div>

          {[
            {
              title: "Markets",
              links: ["Forex", "Crypto", "Stocks", "Commodities", "Indices"],
            },
            {
              title: "Platforms",
              links: ["WebTrader", "MT4", "MT5", "Mobile App"],
            },
            {
              title: "Company",
              links: ["About Us", "Careers", "Contact", "Press"],
            },
            {
              title: "Legal",
              links: [
                "Privacy Policy",
                "Terms of Service",
                "Risk Disclosure",
                "Compliance",
              ],
            },
          ].map((section, i) => (
            <div key={i}>
              <h4
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  color: colors.LIGHT,
                  marginBottom: 20,
                }}
              >
                {section.title}
              </h4>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {section.links.map((link, j) => (
                  <li key={j}>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        const target = sectionLinks[link];
                        if (target) {
                          scrollTo(target);
                        } else {
                          showToast(`${link} — Coming soon`, "success");
                        }
                      }}
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 13,
                        color: colors.MUTED,
                        textDecoration: "none",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.color = colors.LIGHT)
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.color = colors.MUTED)
                      }
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              color: colors.MUTED,
              margin: 0,
            }}
          >
            © 2024 VertexFX. All rights reserved.
          </p>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              color: colors.MUTED,
              margin: 0,
              textAlign: "right",
            }}
          >
            CFDs carry risk. 74% of retail accounts lose money.
          </p>
        </div>
      </div>
    </footer>
  );
}

function ToastContainer({ toasts, colors }) {
  if (!toasts.length) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        maxWidth: 380,
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            background: colors.NAVY,
            border: `1px solid ${colors.BORDER}`,
            borderLeft: `4px solid ${t.type === "error" ? colors.RED : colors.GREEN}`,
            borderRadius: 10,
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: colors.LIGHT,
            animation: "slideIn 0.3s ease",
          }}
        >
          <span>{t.type === "error" ? "!" : "✓"}</span>
          <span style={{ flex: 1 }}>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

function TradeModal({
  symbol,
  direction,
  currentPrice,
  onClose,
  onConfirm,
  colors,
}) {
  const [lot, setLot] = useState(0.01);
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const isBuy = direction === "BUY";
  const margin = (lot * currentPrice * 0.005).toFixed(2);
  const fmt =
    currentPrice >= 100
      ? currentPrice.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : currentPrice.toFixed(5);

  const handleConfirm = () => {
    onConfirm({
      symbol,
      direction,
      lot,
      price: currentPrice,
      stopLoss: stopLoss || null,
      takeProfit: takeProfit || null,
    });
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 60,
      }}
    >
      <div
        style={{
          background: colors.NAVY,
          borderRadius: 16,
          padding: 36,
          maxWidth: 440,
          width: "90%",
          border: `1px solid ${colors.BORDER}`,
          boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h2
              style={{
                margin: 0,
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 26,
                fontWeight: 700,
                color: colors.LIGHT,
              }}
            >
              {symbol}
            </h2>
            <span
              style={{
                padding: "4px 12px",
                borderRadius: 100,
                background: isBuy
                  ? "rgba(34,197,94,0.15)"
                  : "rgba(239,68,68,0.15)",
                color: isBuy ? colors.GREEN : colors.RED,
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {direction}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: `1px solid ${colors.BORDER}`,
              color: colors.MUTED,
              fontSize: 18,
              cursor: "pointer",
              padding: 6,
              borderRadius: 8,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            background: colors.NAVY2,
            borderRadius: 12,
            padding: "16px 20px",
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              color: colors.MUTED,
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Current Price
          </span>
          <span
            style={{
              color: colors.LIGHT,
              fontSize: 22,
              fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {fmt}
          </span>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 8,
              color: colors.LIGHT,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Lot Size
          </label>
          <input
            type="number"
            value={lot}
            min={0.01}
            max={100}
            step={0.01}
            onChange={(e) =>
              setLot(
                Math.max(
                  0.01,
                  Math.min(100, parseFloat(e.target.value) || 0.01),
                ),
              )
            }
            style={{
              width: "100%",
              padding: "12px 16px",
              border: `1px solid ${colors.BORDER}`,
              borderRadius: 10,
              fontSize: 14,
              fontFamily: "'DM Sans', sans-serif",
              boxSizing: "border-box",
              background: colors.NAVY2,
              color: colors.LIGHT,
              outline: "none",
            }}
          />
        </div>

        <div
          style={{
            background: colors.NAVY2,
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              color: colors.MUTED,
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Margin Required
          </span>
          <span
            style={{
              color: colors.GOLD,
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            ${margin}
          </span>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 6,
                color: colors.MUTED,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Stop Loss (optional)
            </label>
            <input
              type="number"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              placeholder="0.00"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: `1px solid ${colors.BORDER}`,
                borderRadius: 10,
                fontSize: 13,
                fontFamily: "'DM Sans', sans-serif",
                boxSizing: "border-box",
                background: colors.NAVY2,
                color: colors.LIGHT,
                outline: "none",
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 6,
                color: colors.MUTED,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Take Profit (optional)
            </label>
            <input
              type="number"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              placeholder="0.00"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: `1px solid ${colors.BORDER}`,
                borderRadius: 10,
                fontSize: 13,
                fontFamily: "'DM Sans', sans-serif",
                boxSizing: "border-box",
                background: colors.NAVY2,
                color: colors.LIGHT,
                outline: "none",
              }}
            />
          </div>
        </div>

        <button
          onClick={handleConfirm}
          style={{
            width: "100%",
            padding: "14px 0",
            borderRadius: 10,
            border: "none",
            background: isBuy
              ? `linear-gradient(135deg, ${colors.GREEN}, #16A34A)`
              : `linear-gradient(135deg, ${colors.RED}, #DC2626)`,
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            cursor: "pointer",
            boxShadow: isBuy
              ? "0 4px 20px rgba(34,197,94,0.3)"
              : "0 4px 20px rgba(239,68,68,0.3)",
          }}
        >
          Place {direction} Order
        </button>
      </div>
    </div>
  );
}

function LoggedInNav({
  colors,
  setTheme,
  theme,
  userProfile,
  onLogout,
  activePage,
  onNavigate,
}) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const firstName = userProfile?.firstName || "Trader";

  return (
    <nav
      style={{
        position: "fixed",
        top: 40,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: scrolled ? colors.NAVY : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? `1px solid ${colors.BORDER}` : "none",
        transition: "all 0.3s ease",
        padding: "0 48px",
        height: 72,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          cursor: "pointer",
        }}
        onClick={() => onNavigate("Dashboard")}
      >
        <div
          style={{
            width: 36,
            height: 36,
            background: `linear-gradient(135deg, ${colors.GOLD}, #8B6914)`,
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
            color: colors.LIGHT,
            letterSpacing: 1,
          }}
        >
          VERTEX<span style={{ color: colors.GOLD }}>FX</span>
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
        {["Dashboard", "Markets", "Portfolio", "History", "Wallet"].map((n) => {
          const isActive = activePage === n;
          return (
            <a
              key={n}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate(n);
              }}
              style={{
                color: isActive ? colors.LIGHT : colors.MUTED,
                textDecoration: "none",
                transition: "color 0.2s",
                fontWeight: isActive ? 600 : 500,
                borderBottom: isActive
                  ? `2px solid ${colors.GOLD}`
                  : "2px solid transparent",
                paddingBottom: 4,
              }}
              onMouseEnter={(e) => (e.target.style.color = colors.LIGHT)}
              onMouseLeave={(e) =>
                (e.target.style.color = isActive ? colors.LIGHT : colors.MUTED)
              }
            >
              {n}
            </a>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          style={{
            background: "transparent",
            border: `1px solid ${colors.BORDER}`,
            color: colors.LIGHT,
            padding: "9px 16px",
            borderRadius: 6,
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            borderRadius: 8,
            background: colors.NAVY2,
            border: `1px solid ${colors.BORDER}`,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${colors.GOLD}, #8B6914)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
              color: "#fff",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {firstName.charAt(0).toUpperCase()}
            {(userProfile?.lastName || "").charAt(0).toUpperCase()}
          </div>
          <span
            style={{
              color: colors.LIGHT,
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
            }}
          >
            {firstName}
          </span>
        </div>
        <NotificationsBell colors={colors} />
        <button
          onClick={onLogout}
          style={{
            background: "transparent",
            border: `1px solid rgba(239,68,68,0.4)`,
            color: colors.RED,
            padding: "9px 18px",
            borderRadius: 6,
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 500,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.1)";
            e.currentTarget.style.borderColor = colors.RED;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)";
          }}
        >
          Log Out
        </button>
      </div>
    </nav>
  );
}

function DashboardSidebar({
  colors,
  activePage,
  onNavigate,
  sidebarOpen,
  setSidebarOpen,
  walletBalance,
}) {
  const items = [
    { id: "Dashboard", icon: "■", label: "Dashboard" },
    { id: "Trading", icon: "▶", label: "Live Trading" },
    { id: "Markets", icon: "▲", label: "Markets" },
    { id: "Portfolio", icon: "◆", label: "Portfolio" },
    { id: "Wallet", icon: "●", label: "Wallet" },
    { id: "Deposit", icon: "↓", label: "Deposit" },
    { id: "Withdraw", icon: "↑", label: "Withdraw" },
    { id: "KYC", icon: "✓", label: "Verify Identity" },
    { id: "History", icon: "≡", label: "Trade History" },
    { id: "Notifications", icon: "○", label: "Notifications" },
  ];
  return (
    <>
      {/* Toggle Button - always visible */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: "fixed",
          top: 124,
          left: sidebarOpen ? 232 : 8,
          zIndex: 999,
          background: colors.NAVY,
          border: `1px solid ${colors.BORDER}`,
          borderRadius: 8,
          width: 36,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: colors.LIGHT,
          fontSize: 16,
          transition: "left 0.3s ease",
        }}
      >
        {sidebarOpen ? "◀" : "▶"}
      </button>
      {/* Sidebar */}
      <div
        style={{
          position: "fixed",
          top: 112,
          left: sidebarOpen ? 0 : -250,
          width: 240,
          height: "calc(100vh - 112px)",
          background: `linear-gradient(180deg, ${colors.NAVY} 0%, ${colors.NAVY2} 100%)`,
          borderRight: `1px solid ${colors.BORDER}`,
          zIndex: 998,
          transition: "left 0.3s ease",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            padding: "24px 20px",
            borderBottom: `1px solid ${colors.BORDER}`,
          }}
        >
          <div
            style={{
              background: `linear-gradient(135deg, rgba(201,168,76,0.15), rgba(11,206,175,0.08))`,
              borderRadius: 14,
              padding: 16,
              position: "relative",
              overflow: "hidden",
              border: "1px solid rgba(201,168,76,0.15)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 1,
                background:
                  "linear-gradient(90deg, transparent, rgba(201,168,76,0.5), transparent)",
              }}
            />
            <p
              style={{
                margin: 0,
                color: colors.MUTED,
                fontSize: 11,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Wallet Balance
            </p>
            <p
              style={{
                margin: "6px 0 0",
                color: colors.GOLD,
                fontSize: 28,
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 700,
                textShadow: "0 0 20px rgba(201,168,76,0.3)",
              }}
            >
              ${walletBalance.toFixed(2)}
            </p>
          </div>
        </div>
        <div style={{ flex: 1, padding: "16px 12px" }}>
          {items.map((item) => {
            const isActive = activePage === item.id;
            const itemColor =
              item.id === "Trading"
                ? "#0BCEAF"
                : item.id === "Wallet" || item.id === "Deposit"
                  ? colors.GOLD
                  : item.id === "KYC"
                    ? colors.GREEN
                    : colors.GOLD;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 14px",
                  marginBottom: 4,
                  borderRadius: 10,
                  cursor: "pointer",
                  background: isActive ? `${itemColor}12` : "transparent",
                  border: isActive
                    ? `1px solid ${itemColor}30`
                    : "1px solid transparent",
                  transition: "all 0.2s ease",
                  fontFamily: "'DM Sans', sans-serif",
                  boxShadow: isActive ? `0 4px 12px ${itemColor}10` : "none",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = `${itemColor}06`;
                    e.currentTarget.style.borderColor = `${itemColor}15`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderColor = "transparent";
                  }
                }}
              >
                <span
                  style={{
                    fontSize: 16,
                    color: isActive ? itemColor : colors.MUTED,
                  }}
                >
                  {item.icon}
                </span>
                <span
                  style={{
                    color: isActive ? itemColor : colors.MUTED,
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 500,
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
        <div
          style={{
            padding: "16px 20px",
            borderTop: `1px solid ${colors.BORDER}`,
          }}
        >
          <div
            style={{
              background: `linear-gradient(160deg, ${colors.NAVY2}, ${colors.NAVY})`,
              borderRadius: 12,
              padding: 14,
              border: `1px solid ${colors.BORDER}`,
            }}
          >
            <p
              style={{
                margin: 0,
                color: colors.MUTED,
                fontSize: 11,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
              }}
            >
              Account Type
            </p>
            <p
              style={{
                margin: "4px 0 0",
                color: colors.LIGHT,
                fontSize: 14,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
              }}
            >
              Standard
            </p>
            <div
              style={{
                marginTop: 8,
                height: 4,
                borderRadius: 2,
                background: `${colors.BORDER}80`,
              }}
            >
              <div
                style={{
                  width: "35%",
                  height: "100%",
                  borderRadius: 2,
                  background: `linear-gradient(90deg, ${colors.GOLD}, #8B6914)`,
                  boxShadow: `0 0 8px ${colors.GOLD}30`,
                }}
              />
            </div>
            <p
              style={{
                margin: "6px 0 0",
                color: colors.MUTED,
                fontSize: 10,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Upgrade to Pro at $10k
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function NotificationsPageInline({ colors }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    usersApi
      .getNotifications(1)
      .then((data) => {
        setNotifications(data.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);
  const typeIcons = {
    trade_opened: "▲",
    trade_closed: "▽",
    deposit_received: "↓",
    withdrawal_approved: "↑",
    kyc_approved: "✓",
    kyc_rejected: "✗",
    margin_call: "!",
    default: "○",
  };
  if (loading) return <p style={{ color: colors.MUTED }}>Loading...</p>;
  if (notifications.length === 0)
    return (
      <div
        style={{
          background: colors.NAVY,
          border: `1px solid ${colors.BORDER}`,
          borderRadius: 14,
          padding: 48,
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontSize: 48,
            display: "block",
            marginBottom: 12,
            color: colors.MUTED,
          }}
        >
          ○
        </span>
        <p
          style={{
            color: colors.MUTED,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15,
            margin: 0,
          }}
        >
          No notifications yet. Activity from trades, deposits, and KYC will
          appear here.
        </p>
      </div>
    );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {notifications.map((n) => (
        <div
          key={n.id}
          style={{
            background: n.isRead ? colors.NAVY : colors.NAVY2,
            border: `1px solid ${colors.BORDER}`,
            borderRadius: 12,
            padding: "16px 20px",
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 22 }}>
              {typeIcons[n.type] || typeIcons.default}
            </span>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  margin: 0,
                  color: colors.LIGHT,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: n.isRead ? 500 : 700,
                }}
              >
                {n.title}
              </p>
              <p
                style={{
                  margin: "4px 0 0",
                  color: colors.MUTED,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                }}
              >
                {n.body}
              </p>
              <p
                style={{
                  margin: "6px 0 0",
                  color: colors.MUTED,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 11,
                }}
              >
                {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
              </p>
            </div>
            {!n.isRead && (
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: colors.GOLD,
                  flexShrink: 0,
                  marginTop: 6,
                }}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function UserDashboard({ colors, activePage, onNavigate, showToast }) {
  const { userProfile } = useAuth();
  const [showWelcome, setShowWelcome] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // Socket for live prices
  const {
    connected: socketConnected,
    prices: livePrices,
    subscribeAll,
  } = useSocket();
  // Real backend data state
  const [walletData, setWalletData] = useState(null);
  const [realPositions, setRealPositions] = useState([]);
  const [realOrders, setRealOrders] = useState([]);
  const [apiTransactions, setApiTransactions] = useState([]);
  // Deposit state
  const [depositAmount, setDepositAmount] = useState("");
  const [depositMethod, setDepositMethod] = useState("card");
  const [cardType, setCardType] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [selectedCrypto, setSelectedCrypto] = useState("");
  // Withdraw state
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("bank");
  const [selectedBank, setSelectedBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [withdrawCryptoWallet, setWithdrawCryptoWallet] = useState("");
  const [withdrawCryptoAddress, setWithdrawCryptoAddress] = useState("");
  const [formMessage, setFormMessage] = useState(null);
  // Mock transactions
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      type: "deposit",
      method: "Card",
      amount: 500,
      status: "completed",
      date: "2026-06-07",
      desc: "Visa ending 4821",
    },
    {
      id: 2,
      type: "deposit",
      method: "Crypto",
      amount: 250,
      status: "completed",
      date: "2026-06-05",
      desc: "USDT (TRC20)",
    },
    {
      id: 3,
      type: "withdraw",
      method: "Bank",
      amount: 100,
      status: "pending",
      date: "2026-06-08",
      desc: "GTBank ****6732",
    },
  ]);
  // Mock positions
  const mockPositions = [
    {
      symbol: "EUR/USD",
      direction: "BUY",
      lots: 0.5,
      entry: 1.0842,
      current: 1.0867,
      pnl: 125.0,
      status: "open",
    },
    {
      symbol: "GBP/JPY",
      direction: "SELL",
      lots: 0.3,
      entry: 193.45,
      current: 193.18,
      pnl: 81.0,
      status: "open",
    },
    {
      symbol: "XAU/USD",
      direction: "BUY",
      lots: 0.1,
      entry: 2345.6,
      current: 2338.4,
      pnl: -72.0,
      status: "open",
    },
    {
      symbol: "BTC/USD",
      direction: "BUY",
      lots: 0.02,
      entry: 67800,
      current: 68450,
      pnl: 130.0,
      status: "open",
    },
  ];
  // Mock trade history
  const mockTradeHistory = [
    {
      symbol: "USD/JPY",
      direction: "BUY",
      lots: 0.2,
      entry: 157.2,
      exit: 157.85,
      pnl: 84.5,
      date: "2026-06-06",
      status: "closed",
    },
    {
      symbol: "EUR/GBP",
      direction: "SELL",
      lots: 0.4,
      entry: 0.8542,
      exit: 0.851,
      pnl: 150.2,
      date: "2026-06-04",
      status: "closed",
    },
    {
      symbol: "AUD/USD",
      direction: "BUY",
      lots: 0.3,
      entry: 0.671,
      exit: 0.6685,
      pnl: -75.0,
      date: "2026-06-03",
      status: "closed",
    },
    {
      symbol: "NAS100",
      direction: "BUY",
      lots: 0.1,
      entry: 19450,
      exit: 19620,
      pnl: 170.0,
      date: "2026-06-01",
      status: "closed",
    },
    {
      symbol: "ETH/USD",
      direction: "SELL",
      lots: 0.05,
      entry: 3850,
      exit: 3920,
      pnl: -350.0,
      date: "2026-05-30",
      status: "closed",
    },
  ];
  // Markets mock data
  const mockMarkets = [
    {
      symbol: "EUR/USD",
      category: "Forex",
      bid: 1.084,
      ask: 1.0842,
      spread: 0.2,
      change: 0.15,
    },
    {
      symbol: "GBP/USD",
      category: "Forex",
      bid: 1.2715,
      ask: 1.2718,
      spread: 0.3,
      change: -0.22,
    },
    {
      symbol: "USD/JPY",
      category: "Forex",
      bid: 157.32,
      ask: 157.35,
      spread: 0.3,
      change: 0.41,
    },
    {
      symbol: "GBP/JPY",
      category: "Forex",
      bid: 193.45,
      ask: 193.5,
      spread: 0.5,
      change: 0.33,
    },
    {
      symbol: "AUD/USD",
      category: "Forex",
      bid: 0.671,
      ask: 0.6712,
      spread: 0.2,
      change: -0.08,
    },
    {
      symbol: "XAU/USD",
      category: "Commodities",
      bid: 2345.6,
      ask: 2346.1,
      spread: 0.5,
      change: 1.24,
    },
    {
      symbol: "XAG/USD",
      category: "Commodities",
      bid: 29.85,
      ask: 29.9,
      spread: 0.5,
      change: -0.45,
    },
    {
      symbol: "BTC/USD",
      category: "Crypto",
      bid: 68400,
      ask: 68450,
      spread: 50,
      change: 2.15,
    },
    {
      symbol: "ETH/USD",
      category: "Crypto",
      bid: 3820,
      ask: 3825,
      spread: 5,
      change: 1.8,
    },
    {
      symbol: "SOL/USD",
      category: "Crypto",
      bid: 172.5,
      ask: 173.0,
      spread: 0.5,
      change: 3.4,
    },
    {
      symbol: "NAS100",
      category: "Indices",
      bid: 19620,
      ask: 19625,
      spread: 5,
      change: 0.68,
    },
    {
      symbol: "US30",
      category: "Indices",
      bid: 39450,
      ask: 39458,
      spread: 8,
      change: 0.32,
    },
  ];
  const banksList = [
    "Guaranty Trust Bank (GTBank)",
    "First Bank of Nigeria",
    "Zenith Bank",
    "Access Bank",
    "United Bank for Africa (UBA)",
    "Stanbic IBTC",
    "Fidelity Bank",
    "Sterling Bank",
    "Wema Bank",
    "Polaris Bank",
    "Union Bank",
    "Ecobank",
    "Heritage Bank",
    "Keystone Bank",
    "FCMB",
    "Kuda Bank",
    "OPay",
    "Moniepoint",
  ];
  const cryptoList = [
    {
      id: "btc",
      name: "Bitcoin (BTC)",
      address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      icon: "₿",
    },
    {
      id: "eth",
      name: "Ethereum (ETH)",
      address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      icon: "Ξ",
    },
    {
      id: "usdt_trc",
      name: "USDT (TRC20)",
      address: "TN2Y8v5wEiMRXm9bRYu3LwBdQK8xGzKrLN",
      icon: "$",
    },
    {
      id: "usdt_erc",
      name: "USDT (ERC20)",
      address: "0x8ac76a51cc4e3f2b45b11d4327a39a46b5e89b0c",
      icon: "$",
    },
    {
      id: "bnb",
      name: "BNB (BSC)",
      address: "bnb1grpf0955h0ykzq3ar6nmum7y6gdfl6lxfn46h2",
      icon: "◆",
    },
    {
      id: "sol",
      name: "Solana (SOL)",
      address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
      icon: "◎",
    },
    {
      id: "ltc",
      name: "Litecoin (LTC)",
      address: "ltc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      icon: "Ł",
    },
    {
      id: "xrp",
      name: "XRP",
      address: "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh",
      icon: "✕",
    },
  ];
  const cryptoWallets = [
    { id: "metamask", name: "MetaMask", icon: "M" },
    { id: "trustwallet", name: "Trust Wallet", icon: "T" },
    { id: "phantom", name: "Phantom", icon: "P" },
    { id: "coinbase", name: "Coinbase Wallet", icon: "C" },
    { id: "exodus", name: "Exodus", icon: "E" },
    { id: "ledger", name: "Ledger (Hardware)", icon: "L" },
    { id: "binance", name: "Binance Wallet", icon: "B" },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const firstName = userProfile?.firstName || "Trader";
  const email = userProfile?.email || "";
  const memberSince = userProfile?.createdAt
    ? new Date(userProfile.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Recently joined";

  const PROCESSING_FEE = 0.1;

  // Fetch real data from backend on mount
  useEffect(() => {
    subscribeAll([
      "EURUSD",
      "GBPUSD",
      "USDJPY",
      "USDCHF",
      "AUDUSD",
      "NZDUSD",
      "USDCAD",
      "BTCUSD",
      "ETHUSD",
      "XRPUSD",
      "GOLD",
      "SILVER",
      "OILUSD",
      "NAS100",
      "SP500",
      "DOW30",
    ]);
  }, [subscribeAll]);
  useEffect(() => {
    walletApi
      .getWallet()
      .then((w) => {
        setWalletData(w);
        setWalletBalance(parseFloat(w.availableBalance || w.balance || 0));
      })
      .catch(() => {});
    walletApi
      .getTransactions(1)
      .then((data) => {
        setApiTransactions(data.items || data || []);
      })
      .catch(() => {});
    usersApi
      .getTradingAccounts()
      .then((accts) => {
        const acctId = accts?.[0]?.id;
        if (acctId) {
          tradingApi
            .getPositions(acctId)
            .then((pos) => setRealPositions(pos || []))
            .catch(() => {});
          tradingApi
            .getOrders(acctId, 1)
            .then((ords) => setRealOrders(ords.items || ords || []))
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  const handleDeposit = (e) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (!depositAmount || amt < 10) {
      setFormMessage({ type: "error", text: "Minimum deposit is $10.00" });
      return;
    }
    if (
      depositMethod === "card" &&
      (!cardType || !cardNumber || cardNumber.replace(/\s/g, "").length < 16)
    ) {
      setFormMessage({
        type: "error",
        text: "Please fill in valid card details",
      });
      return;
    }
    if (depositMethod === "crypto" && !selectedCrypto) {
      setFormMessage({ type: "error", text: "Please select a cryptocurrency" });
      return;
    }
    const net = amt - PROCESSING_FEE;
    setWalletBalance((prev) => prev + net);
    setTransactions((prev) => [
      {
        id: Date.now(),
        type: "deposit",
        method:
          depositMethod === "card"
            ? cardType
            : depositMethod === "bank"
              ? "Bank Transfer"
              : selectedCrypto,
        amount: amt,
        status: "completed",
        date: new Date().toISOString().split("T")[0],
        desc:
          depositMethod === "card"
            ? `${cardType} ****${cardNumber.slice(-4)}`
            : depositMethod === "bank"
              ? "Bank Transfer"
              : selectedCrypto,
      },
      ...prev,
    ]);
    // Call backend API
    walletApi
      .initiateDeposit({ amount: amt, method: depositMethod, currency: "USD" })
      .then(() => {
        walletApi
          .getWallet()
          .then((w) => {
            setWalletData(w);
            setWalletBalance(parseFloat(w.availableBalance || w.balance || 0));
          })
          .catch(() => {});
        walletApi
          .getTransactions(1)
          .then((data) => setApiTransactions(data.items || data || []))
          .catch(() => {});
      })
      .catch(() => {});
    setFormMessage({
      type: "success",
      text: `Deposit of $${net.toFixed(2)} successful! (Fee: $${PROCESSING_FEE} USDT)`,
    });
    setDepositAmount("");
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setSelectedCrypto("");
  };

  const handleWithdraw = (e) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (!withdrawAmount || amt < 5) {
      setFormMessage({ type: "error", text: "Minimum withdrawal is $5.00" });
      return;
    }
    if (amt > walletBalance) {
      setFormMessage({
        type: "error",
        text: `Insufficient balance. Available: $${walletBalance.toFixed(2)}`,
      });
      return;
    }
    if (
      withdrawMethod === "bank" &&
      (!selectedBank || !accountNumber || !accountName)
    ) {
      setFormMessage({
        type: "error",
        text: "Please fill in all bank details",
      });
      return;
    }
    if (
      withdrawMethod === "crypto" &&
      (!withdrawCryptoWallet || !withdrawCryptoAddress)
    ) {
      setFormMessage({
        type: "error",
        text: "Please select wallet and enter address",
      });
      return;
    }
    setWalletBalance((prev) => prev - amt);
    setTransactions((prev) => [
      {
        id: Date.now(),
        type: "withdraw",
        method: withdrawMethod === "bank" ? "Bank Transfer" : "Crypto",
        amount: amt,
        status: "pending",
        date: new Date().toISOString().split("T")[0],
        desc:
          withdrawMethod === "bank"
            ? `${selectedBank} ****${accountNumber.slice(-4)}`
            : `${withdrawCryptoWallet} Wallet`,
      },
      ...prev,
    ]);
    // Call backend API
    walletApi
      .requestWithdrawal({
        amount: amt,
        method: withdrawMethod,
        ...(withdrawMethod === "bank"
          ? { bankName: selectedBank, accountNumber, accountName }
          : {
              walletType: withdrawCryptoWallet,
              walletAddress: withdrawCryptoAddress,
            }),
      })
      .then(() => {
        walletApi
          .getWallet()
          .then((w) => {
            setWalletData(w);
            setWalletBalance(parseFloat(w.availableBalance || w.balance || 0));
          })
          .catch(() => {});
        walletApi
          .getTransactions(1)
          .then((data) => setApiTransactions(data.items || data || []))
          .catch(() => {});
      })
      .catch(() => {});
    setFormMessage({
      type: "success",
      text: `Withdrawal of $${amt.toFixed(2)} requested. Processing within 1-3 business days.`,
    });
    setWithdrawAmount("");
    setAccountNumber("");
    setAccountName("");
    setWithdrawCryptoAddress("");
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    background: colors.NAVY,
    border: `1px solid ${colors.BORDER}`,
    borderRadius: 10,
    color: colors.LIGHT,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  };
  const selectStyle = { ...inputStyle, appearance: "none", cursor: "pointer" };
  const labelStyle = {
    display: "block",
    color: colors.MUTED,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    marginBottom: 8,
    fontWeight: 500,
  };
  const btnPrimary = (color) => ({
    width: "100%",
    padding: "16px",
    background: `linear-gradient(135deg, ${color}, ${color}99)`,
    border: "none",
    borderRadius: 10,
    color: "#fff",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s ease",
  });
  const cardBox = {
    background: `linear-gradient(160deg, ${colors.NAVY}, ${colors.NAVY2})`,
    border: `1px solid ${colors.BORDER}`,
    borderRadius: 14,
    padding: 24,
    transition: "all 0.3s ease",
  };

  const renderPage = () => {
    switch (activePage) {
      case "Deposit":
        return (
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <button
              onClick={() => onNavigate("Wallet")}
              style={{
                background: "transparent",
                border: "none",
                color: colors.MUTED,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              ← Back to Wallet
            </button>
            <div style={{ ...cardBox, padding: 32 }}>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 32,
                  fontWeight: 700,
                  color: colors.LIGHT,
                  margin: "0 0 8px",
                }}
              >
                Deposit Funds
              </h2>
              <p
                style={{
                  color: colors.MUTED,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  margin: "0 0 32px",
                }}
              >
                Add funds to your trading account.
              </p>
              <form onSubmit={handleDeposit}>
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Amount (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="10"
                    placeholder="Enter amount"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Payment Method</label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 10,
                    }}
                  >
                    {[
                      { id: "card", label: "Credit/Debit Card", icon: "□" },
                      { id: "bank", label: "Bank Transfer", icon: "◆" },
                      { id: "crypto", label: "Crypto", icon: "₿" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setDepositMethod(m.id);
                          setFormMessage(null);
                        }}
                        style={{
                          padding: "16px 12px",
                          background:
                            depositMethod === m.id
                              ? "rgba(201,168,76,0.12)"
                              : colors.NAVY2,
                          border: `1px solid ${depositMethod === m.id ? colors.GOLD : colors.BORDER}`,
                          borderRadius: 10,
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 8,
                          transition: "all 0.2s",
                        }}
                      >
                        <span style={{ fontSize: 24 }}>{m.icon}</span>
                        <span
                          style={{
                            color:
                              depositMethod === m.id
                                ? colors.GOLD
                                : colors.MUTED,
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          {m.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                {/* Card fields */}
                {depositMethod === "card" && (
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Card Type</label>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: 10,
                        marginBottom: 14,
                      }}
                    >
                      {["Visa", "Mastercard", "Amex"].map((ct) => (
                        <button
                          key={ct}
                          type="button"
                          onClick={() => setCardType(ct)}
                          style={{
                            padding: "12px",
                            background:
                              cardType === ct
                                ? "rgba(201,168,76,0.12)"
                                : colors.NAVY2,
                            border: `1px solid ${cardType === ct ? colors.GOLD : colors.BORDER}`,
                            borderRadius: 8,
                            cursor: "pointer",
                            color: cardType === ct ? colors.GOLD : colors.MUTED,
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 13,
                            fontWeight: 600,
                            transition: "all 0.2s",
                          }}
                        >
                          {ct}
                        </button>
                      ))}
                    </div>
                    <label style={labelStyle}>Card Number</label>
                    <input
                      type="text"
                      maxLength={19}
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => {
                        const v = e.target.value
                          .replace(/\D/g, "")
                          .replace(/(.{4})/g, "$1 ")
                          .trim();
                        setCardNumber(v);
                      }}
                      style={{ ...inputStyle, marginBottom: 12 }}
                    />
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 12,
                      }}
                    >
                      <div>
                        <label style={labelStyle}>Expiry</label>
                        <input
                          type="text"
                          maxLength={5}
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>CVV</label>
                        <input
                          type="password"
                          maxLength={4}
                          placeholder="•••"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  </div>
                )}
                {/* Bank Transfer info */}
                {depositMethod === "bank" && (
                  <div
                    style={{
                      marginBottom: 20,
                      background: colors.NAVY2,
                      border: `1px solid ${colors.BORDER}`,
                      borderRadius: 12,
                      padding: 20,
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 16px",
                        color: colors.GOLD,
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      Transfer funds to this account:
                    </p>
                    {[
                      ["Bank Name", "VertexFX International Bank"],
                      ["Account Name", "VertexFX Trading Ltd"],
                      ["Account Number", "0123456789"],
                      ["SWIFT/BIC", "VRTXGB2L"],
                      ["IBAN", "GB82 VRTX 0123 4567 8901 23"],
                      [
                        "Reference",
                        `VTX-${userProfile?.id?.slice(0, 8) || "NEWUSER"}`,
                      ],
                    ].map(([lbl, val]) => (
                      <div
                        key={lbl}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "8px 0",
                          borderBottom: `1px solid ${colors.BORDER}`,
                        }}
                      >
                        <span
                          style={{
                            color: colors.MUTED,
                            fontSize: 12,
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          {lbl}
                        </span>
                        <span
                          style={{
                            color: colors.LIGHT,
                            fontSize: 12,
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: 600,
                            userSelect: "all",
                          }}
                        >
                          {val}
                        </span>
                      </div>
                    ))}
                    <p
                      style={{
                        margin: "12px 0 0",
                        color: colors.GOLD,
                        fontSize: 11,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      Include your reference number for faster processing.
                    </p>
                  </div>
                )}
                {/* Crypto selection */}
                {depositMethod === "crypto" && (
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Select Cryptocurrency</label>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 8,
                      }}
                    >
                      {cryptoList.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSelectedCrypto(c.name)}
                          style={{
                            padding: "12px",
                            background:
                              selectedCrypto === c.name
                                ? "rgba(201,168,76,0.12)"
                                : colors.NAVY2,
                            border: `1px solid ${selectedCrypto === c.name ? colors.GOLD : colors.BORDER}`,
                            borderRadius: 8,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            transition: "all 0.2s",
                          }}
                        >
                          <span style={{ fontSize: 18 }}>{c.icon}</span>
                          <span
                            style={{
                              color:
                                selectedCrypto === c.name
                                  ? colors.GOLD
                                  : colors.MUTED,
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            {c.name}
                          </span>
                        </button>
                      ))}
                    </div>
                    {selectedCrypto && (
                      <div
                        style={{
                          marginTop: 14,
                          background: colors.NAVY2,
                          border: `1px solid ${colors.BORDER}`,
                          borderRadius: 10,
                          padding: 16,
                        }}
                      >
                        <p
                          style={{
                            margin: "0 0 8px",
                            color: colors.MUTED,
                            fontSize: 11,
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: 600,
                          }}
                        >
                          Send to this address:
                        </p>
                        <p
                          style={{
                            margin: 0,
                            color: colors.TEAL,
                            fontSize: 12,
                            fontFamily: "monospace",
                            wordBreak: "break-all",
                            userSelect: "all",
                          }}
                        >
                          {
                            cryptoList.find((c) => c.name === selectedCrypto)
                              ?.address
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )}
                <div
                  style={{
                    background: colors.NAVY2,
                    border: `1px solid ${colors.BORDER}`,
                    borderRadius: 10,
                    padding: 16,
                    marginBottom: 24,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        color: colors.MUTED,
                        fontSize: 13,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      Processing Fee
                    </span>
                    <span
                      style={{
                        color: colors.LIGHT,
                        fontSize: 13,
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      {PROCESSING_FEE} USDT
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span
                      style={{
                        color: colors.MUTED,
                        fontSize: 13,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      Processing Time
                    </span>
                    <span
                      style={{
                        color: colors.GREEN,
                        fontSize: 13,
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      Instant
                    </span>
                  </div>
                </div>
                {formMessage && (
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: 8,
                      marginBottom: 16,
                      background:
                        formMessage.type === "success"
                          ? "rgba(34,197,94,0.1)"
                          : "rgba(239,68,68,0.1)",
                      border: `1px solid ${formMessage.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                      color:
                        formMessage.type === "success"
                          ? colors.GREEN
                          : colors.RED,
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 13,
                    }}
                  >
                    {formMessage.text}
                  </div>
                )}
                <button type="submit" style={btnPrimary(colors.GOLD)}>
                  Deposit Funds
                </button>
              </form>
            </div>
          </div>
        );

      case "Withdraw":
        return (
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <button
              onClick={() => onNavigate("Wallet")}
              style={{
                background: "transparent",
                border: "none",
                color: colors.MUTED,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              ← Back to Wallet
            </button>
            <div style={{ ...cardBox, padding: 32 }}>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 32,
                  fontWeight: 700,
                  color: colors.LIGHT,
                  margin: "0 0 8px",
                }}
              >
                Withdraw Funds
              </h2>
              <p
                style={{
                  color: colors.MUTED,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  margin: "0 0 8px",
                }}
              >
                Available balance:{" "}
                <span style={{ color: colors.GOLD, fontWeight: 700 }}>
                  ${walletBalance.toFixed(2)}
                </span>
              </p>
              <p
                style={{
                  color: colors.MUTED,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  margin: "0 0 32px",
                }}
              >
                Withdraw your funds securely.
              </p>
              <form onSubmit={handleWithdraw}>
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Amount (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="5"
                    placeholder="Enter amount"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Withdrawal Method</label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    {[
                      { id: "bank", label: "Bank Transfer", icon: "◆" },
                      { id: "crypto", label: "Crypto Wallet", icon: "₿" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setWithdrawMethod(m.id);
                          setFormMessage(null);
                        }}
                        style={{
                          padding: "16px 12px",
                          background:
                            withdrawMethod === m.id
                              ? "rgba(11,206,175,0.12)"
                              : colors.NAVY2,
                          border: `1px solid ${withdrawMethod === m.id ? colors.TEAL : colors.BORDER}`,
                          borderRadius: 10,
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 8,
                          transition: "all 0.2s",
                        }}
                      >
                        <span style={{ fontSize: 24 }}>{m.icon}</span>
                        <span
                          style={{
                            color:
                              withdrawMethod === m.id
                                ? colors.TEAL
                                : colors.MUTED,
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {m.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                {/* Bank withdrawal */}
                {withdrawMethod === "bank" && (
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Select Bank</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      style={{ ...selectStyle, marginBottom: 14 }}
                    >
                      <option value="">-- Choose your bank --</option>
                      {banksList.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                    <label style={labelStyle}>Account Number</label>
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="Enter account number"
                      value={accountNumber}
                      onChange={(e) =>
                        setAccountNumber(e.target.value.replace(/\D/g, ""))
                      }
                      style={{ ...inputStyle, marginBottom: 14 }}
                    />
                    <label style={labelStyle}>Account Name</label>
                    <input
                      type="text"
                      placeholder="Enter account holder name"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                )}
                {/* Crypto withdrawal */}
                {withdrawMethod === "crypto" && (
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Select Wallet</label>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 8,
                        marginBottom: 14,
                      }}
                    >
                      {cryptoWallets.map((w) => (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => setWithdrawCryptoWallet(w.name)}
                          style={{
                            padding: "12px",
                            background:
                              withdrawCryptoWallet === w.name
                                ? "rgba(11,206,175,0.12)"
                                : colors.NAVY2,
                            border: `1px solid ${withdrawCryptoWallet === w.name ? colors.TEAL : colors.BORDER}`,
                            borderRadius: 8,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            transition: "all 0.2s",
                          }}
                        >
                          <span style={{ fontSize: 18 }}>{w.icon}</span>
                          <span
                            style={{
                              color:
                                withdrawCryptoWallet === w.name
                                  ? colors.TEAL
                                  : colors.MUTED,
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            {w.name}
                          </span>
                        </button>
                      ))}
                    </div>
                    <label style={labelStyle}>Wallet Address</label>
                    <input
                      type="text"
                      placeholder="Enter your wallet address"
                      value={withdrawCryptoAddress}
                      onChange={(e) => setWithdrawCryptoAddress(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                )}
                <div
                  style={{
                    background: colors.NAVY2,
                    border: `1px solid ${colors.BORDER}`,
                    borderRadius: 10,
                    padding: 16,
                    marginBottom: 24,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        color: colors.MUTED,
                        fontSize: 13,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      Processing Fee
                    </span>
                    <span
                      style={{
                        color: colors.LIGHT,
                        fontSize: 13,
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      {PROCESSING_FEE} USDT
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span
                      style={{
                        color: colors.MUTED,
                        fontSize: 13,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      Processing Time
                    </span>
                    <span
                      style={{
                        color: colors.GOLD,
                        fontSize: 13,
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      1-3 Business Days
                    </span>
                  </div>
                </div>
                {formMessage && (
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: 8,
                      marginBottom: 16,
                      background:
                        formMessage.type === "success"
                          ? "rgba(34,197,94,0.1)"
                          : "rgba(239,68,68,0.1)",
                      border: `1px solid ${formMessage.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                      color:
                        formMessage.type === "success"
                          ? colors.GREEN
                          : colors.RED,
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 13,
                    }}
                  >
                    {formMessage.text}
                  </div>
                )}
                <button type="submit" style={btnPrimary(colors.TEAL)}>
                  Withdraw Funds
                </button>
              </form>
            </div>
          </div>
        );

      case "Wallet": {
        const wd = walletData;
        const availBal = wd
          ? parseFloat(wd.availableBalance || wd.balance || 0)
          : walletBalance;
        const totalEquity = wd ? parseFloat(wd.equity || availBal) : availBal;
        const usedMargin = wd ? parseFloat(wd.usedMargin || 0) : 0;
        const displayTxs =
          apiTransactions.length > 0
            ? apiTransactions.map((tx) => ({
                id: tx.id,
                type: tx.type === "DEPOSIT" ? "deposit" : "withdraw",
                method: tx.method || tx.paymentMethod || "Transfer",
                amount: parseFloat(tx.amount || 0),
                status: tx.status?.toLowerCase() || "pending",
                date: tx.createdAt
                  ? new Date(tx.createdAt).toLocaleDateString()
                  : "",
                desc: tx.description || tx.reference || "",
              }))
            : transactions;
        return (
          <div>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 32,
                fontWeight: 700,
                color: colors.LIGHT,
                margin: "0 0 24px",
              }}
            >
              Wallet
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 16,
                marginBottom: 32,
              }}
            >
              {[
                {
                  label: "Available Balance",
                  value: `$${availBal.toFixed(2)}`,
                  icon: "●",
                  color: colors.GOLD,
                },
                {
                  label: "In Open Positions",
                  value: `$${usedMargin.toFixed(2)}`,
                  icon: "■",
                  color: "#8B5CF6",
                },
                {
                  label: "Total Equity",
                  value: `$${totalEquity.toFixed(2)}`,
                  icon: "◆",
                  color: colors.GREEN,
                },
              ].map((card, i) => (
                <div
                  key={i}
                  style={{
                    ...cardBox,
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${card.color}40`;
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = `0 8px 24px ${card.color}10`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.BORDER;
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: "15%",
                      right: "15%",
                      height: 1,
                      background: `linear-gradient(90deg, transparent, ${card.color}35, transparent)`,
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <span
                      style={{
                        color: colors.MUTED,
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 13,
                      }}
                    >
                      {card.label}
                    </span>
                    <span style={{ fontSize: 20 }}>{card.icon}</span>
                  </div>
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 36,
                      fontWeight: 700,
                      color: colors.LIGHT,
                    }}
                  >
                    {card.value}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginBottom: 32,
              }}
            >
              <button
                onClick={() => {
                  setFormMessage(null);
                  onNavigate("Deposit");
                }}
                style={{
                  ...btnPrimary(colors.GOLD),
                  padding: "20px",
                  borderRadius: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 20 }}>↓</span> Deposit Funds
              </button>
              <button
                onClick={() => {
                  setFormMessage(null);
                  onNavigate("Withdraw");
                }}
                style={{
                  ...btnPrimary(colors.TEAL),
                  padding: "20px",
                  borderRadius: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 20 }}>↑</span> Withdraw Funds
              </button>
            </div>
            <div style={{ ...cardBox, padding: 32 }}>
              <h3
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 22,
                  fontWeight: 700,
                  color: colors.LIGHT,
                  margin: "0 0 20px",
                }}
              >
                Transaction History
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {displayTxs.map((tx) => (
                  <div
                    key={tx.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 16px",
                      background: colors.NAVY2,
                      borderRadius: 10,
                      border: `1px solid ${colors.BORDER}`,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          background:
                            tx.type === "deposit"
                              ? "rgba(34,197,94,0.12)"
                              : "rgba(239,68,68,0.12)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 18,
                        }}
                      >
                        {tx.type === "deposit" ? "↓" : "↑"}
                      </div>
                      <div>
                        <p
                          style={{
                            margin: 0,
                            color: colors.LIGHT,
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          {tx.type === "deposit" ? "Deposit" : "Withdrawal"} —{" "}
                          {tx.method}
                        </p>
                        <p
                          style={{
                            margin: "2px 0 0",
                            color: colors.MUTED,
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 11,
                          }}
                        >
                          {tx.desc} • {tx.date}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p
                        style={{
                          margin: 0,
                          color:
                            tx.type === "deposit" ? colors.GREEN : colors.RED,
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 14,
                          fontWeight: 700,
                        }}
                      >
                        {tx.type === "deposit" ? "+" : "-"}$
                        {parseFloat(tx.amount).toFixed(2)}
                      </p>
                      <span
                        style={{
                          fontSize: 10,
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 600,
                          color:
                            tx.status === "completed"
                              ? colors.GREEN
                              : colors.GOLD,
                          padding: "2px 8px",
                          borderRadius: 4,
                          background:
                            tx.status === "completed"
                              ? "rgba(34,197,94,0.1)"
                              : "rgba(201,168,76,0.1)",
                        }}
                      >
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case "Markets": {
        const SYMBOLS = [
          { symbol: "EURUSD", label: "EUR/USD", category: "Forex" },
          { symbol: "GBPUSD", label: "GBP/USD", category: "Forex" },
          { symbol: "USDJPY", label: "USD/JPY", category: "Forex" },
          { symbol: "USDCHF", label: "USD/CHF", category: "Forex" },
          { symbol: "AUDUSD", label: "AUD/USD", category: "Forex" },
          { symbol: "NZDUSD", label: "NZD/USD", category: "Forex" },
          { symbol: "USDCAD", label: "USD/CAD", category: "Forex" },
          { symbol: "BTCUSD", label: "BTC/USD", category: "Crypto" },
          { symbol: "ETHUSD", label: "ETH/USD", category: "Crypto" },
          { symbol: "XRPUSD", label: "XRP/USD", category: "Crypto" },
          { symbol: "GOLD", label: "XAU/USD", category: "Commodities" },
          { symbol: "SILVER", label: "XAG/USD", category: "Commodities" },
          { symbol: "OILUSD", label: "Crude Oil", category: "Commodities" },
          { symbol: "NAS100", label: "NAS100", category: "Indices" },
          { symbol: "SP500", label: "SP500", category: "Indices" },
          { symbol: "DOW30", label: "DOW30", category: "Indices" },
        ];
        const marketsList = SYMBOLS.map((s) => {
          const lp = livePrices[s.symbol];
          const mock = mockMarkets.find((m) => m.symbol === s.label);
          const bid = lp ? lp.bid : mock ? mock.bid : 0;
          const ask = lp ? lp.ask : mock ? mock.ask : 0;
          const spread =
            ask > 0 ? (((ask - bid) / bid) * 100).toFixed(2) : "0.00";
          const basePrice = mock ? mock.bid : bid;
          const change =
            basePrice > 0
              ? (((bid - basePrice) / basePrice) * 100).toFixed(2)
              : mock
                ? mock.change
                : 0;
          return {
            ...s,
            bid,
            ask,
            spread: parseFloat(spread),
            change: parseFloat(change),
          };
        });
        return (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 32,
                    fontWeight: 700,
                    color: colors.LIGHT,
                    margin: 0,
                  }}
                >
                  Markets
                </h2>
                <p
                  style={{
                    color: colors.MUTED,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    margin: "4px 0 0",
                  }}
                >
                  Trade forex, crypto, commodities and indices with live pricing
                </p>
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontFamily: "'DM Sans', sans-serif",
                  color: socketConnected ? colors.GREEN : colors.RED,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  borderRadius: 8,
                  background: socketConnected
                    ? "rgba(34,197,94,0.08)"
                    : "rgba(239,68,68,0.08)",
                  border: `1px solid ${socketConnected ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: socketConnected ? colors.GREEN : colors.RED,
                    display: "inline-block",
                    animation: socketConnected
                      ? "glow-pulse 2s ease infinite"
                      : "none",
                  }}
                />
                {socketConnected ? "Live Prices" : "Connecting..."}
              </span>
            </div>

            {/* Gold Featured Banner */}
            {(() => {
              const goldMarket = marketsList.find((m) => m.symbol === "GOLD");
              return (
                <div
                  style={{
                    marginBottom: 28,
                    background: `linear-gradient(135deg, rgba(201,168,76,0.1) 0%, rgba(139,105,20,0.06) 50%, rgba(201,168,76,0.04) 100%)`,
                    border: "1px solid rgba(201,168,76,0.3)",
                    borderRadius: 16,
                    padding: "24px 28px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: "10%",
                      right: "10%",
                      height: 1,
                      background:
                        "linear-gradient(90deg, transparent, rgba(201,168,76,0.5), transparent)",
                    }}
                  />
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "auto 1fr auto",
                      gap: 24,
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 80,
                        height: 60,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <GoldBarSVG />
                    </div>
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 6,
                        }}
                      >
                        <span
                          style={{
                            background: `linear-gradient(135deg, ${colors.GOLD}, #8B6914)`,
                            color: "#fff",
                            fontSize: 9,
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: 700,
                            padding: "3px 10px",
                            borderRadius: 6,
                            letterSpacing: 0.5,
                          }}
                        >
                          FEATURED COMMODITY
                        </span>
                      </div>
                      <h3
                        style={{
                          margin: "0 0 2px",
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: 22,
                          fontWeight: 700,
                          color: colors.LIGHT,
                        }}
                      >
                        Gold — XAU/USD
                      </h3>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: 20,
                            fontWeight: 700,
                            color: colors.GOLD,
                          }}
                        >
                          $
                          {goldMarket
                            ? goldMarket.bid > 100
                              ? goldMarket.bid.toFixed(2)
                              : goldMarket.bid.toFixed(4)
                            : "2,384.50"}
                        </span>
                        <span
                          style={{
                            color:
                              goldMarket && goldMarket.change >= 0
                                ? colors.GREEN
                                : colors.RED,
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {goldMarket
                            ? (goldMarket.change >= 0 ? "+" : "") +
                              goldMarket.change +
                              "%"
                            : "+1.42%"}
                        </span>
                        <SparklineSVG
                          color={colors.GOLD}
                          data={[
                            20, 25, 22, 30, 28, 35, 32, 40, 38, 45, 42, 50,
                          ]}
                          width={80}
                          height={24}
                        />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => onNavigate("Trading")}
                        style={{
                          padding: "10px 22px",
                          borderRadius: 8,
                          border: "none",
                          background: `linear-gradient(135deg, ${colors.GREEN}, #16a34a)`,
                          color: "#fff",
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: "pointer",
                          boxShadow: "0 4px 12px rgba(34,197,94,0.25)",
                        }}
                      >
                        BUY
                      </button>
                      <button
                        onClick={() => onNavigate("Trading")}
                        style={{
                          padding: "10px 22px",
                          borderRadius: 8,
                          border: "none",
                          background: `linear-gradient(135deg, ${colors.RED}, #dc2626)`,
                          color: "#fff",
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: "pointer",
                          boxShadow: "0 4px 12px rgba(239,68,68,0.25)",
                        }}
                      >
                        SELL
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {["Forex", "Crypto", "Commodities", "Indices"].map((cat) => {
              const catMarkets = marketsList.filter(
                (m) => m.category === cat && m.symbol !== "GOLD",
              );
              if (catMarkets.length === 0) return null;
              const catColor =
                cat === "Forex"
                  ? "#0BCEAF"
                  : cat === "Crypto"
                    ? "#F7931A"
                    : cat === "Commodities"
                      ? "#C9A84C"
                      : "#8B5CF6";
              return (
                <div key={cat} style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 4,
                        height: 20,
                        borderRadius: 2,
                        background: catColor,
                      }}
                    />
                    <h3
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 15,
                        fontWeight: 700,
                        color: colors.LIGHT,
                        margin: 0,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      {cat}
                    </h3>
                    <span
                      style={{
                        color: colors.MUTED,
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 11,
                      }}
                    >
                      ({catMarkets.length} instruments)
                    </span>
                  </div>
                  <div
                    style={{
                      background: `linear-gradient(160deg, ${colors.NAVY}, ${colors.NAVY2})`,
                      border: `1px solid ${colors.BORDER}`,
                      borderRadius: 14,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1.2fr",
                        padding: "10px 20px",
                        background: `${catColor}08`,
                        borderBottom: `1px solid ${colors.BORDER}`,
                      }}
                    >
                      {[
                        "Symbol",
                        "Bid",
                        "Ask",
                        "Spread",
                        "Change",
                        "Action",
                      ].map((h) => (
                        <span
                          key={h}
                          style={{
                            color: colors.MUTED,
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 10,
                            fontWeight: 600,
                            textTransform: "uppercase",
                          }}
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                    {catMarkets.map((m) => (
                      <div
                        key={m.symbol}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1.2fr",
                          padding: "12px 20px",
                          borderBottom: `1px solid ${colors.BORDER}08`,
                          transition: "all 0.2s",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = `${catColor}06`;
                          e.currentTarget.style.boxShadow = `inset 3px 0 0 ${catColor}`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 6,
                              background: `${catColor}10`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 11,
                              color: catColor,
                              fontWeight: 700,
                              fontFamily: "'DM Sans', sans-serif",
                            }}
                          >
                            {m.label.substring(0, 2)}
                          </div>
                          <span
                            style={{
                              color: colors.LIGHT,
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: 13,
                              fontWeight: 600,
                            }}
                          >
                            {m.label}
                          </span>
                        </div>
                        <span
                          style={{
                            color: colors.LIGHT,
                            fontFamily: "monospace",
                            fontSize: 12,
                          }}
                        >
                          {m.bid > 100 ? m.bid.toFixed(2) : m.bid.toFixed(4)}
                        </span>
                        <span
                          style={{
                            color: colors.LIGHT,
                            fontFamily: "monospace",
                            fontSize: 12,
                          }}
                        >
                          {m.ask > 100 ? m.ask.toFixed(2) : m.ask.toFixed(4)}
                        </span>
                        <span
                          style={{
                            color: colors.MUTED,
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 12,
                          }}
                        >
                          {m.spread}%
                        </span>
                        <span
                          style={{
                            color: m.change >= 0 ? colors.GREEN : colors.RED,
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {m.change >= 0 ? "+" : ""}
                          {m.change}%
                        </span>
                        <button
                          onClick={() => onNavigate("Trading")}
                          style={{
                            padding: "5px 14px",
                            borderRadius: 6,
                            border: `1px solid ${catColor}40`,
                            background: `${catColor}08`,
                            color: catColor,
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s",
                            whiteSpace: "nowrap",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = `${catColor}20`;
                            e.currentTarget.style.borderColor = catColor;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = `${catColor}08`;
                            e.currentTarget.style.borderColor = `${catColor}40`;
                          }}
                        >
                          Trade
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );
      }

      case "Portfolio": {
        const positions =
          realPositions.length > 0
            ? realPositions.map((p) => {
                const sym = p.instrument?.symbol || p.symbol || "";
                const lp = livePrices[sym];
                const currentPrice = lp
                  ? p.direction === "BUY"
                    ? lp.bid
                    : lp.ask
                  : parseFloat(p.currentPrice || p.entryPrice || 0);
                const entryPrice = parseFloat(p.entryPrice || 0);
                const lotSize = parseFloat(p.lotSize || p.lots || 0);
                const contractSize = p.instrument?.contractSize || 100000;
                const pnl =
                  p.direction === "BUY"
                    ? (currentPrice - entryPrice) * lotSize * contractSize
                    : (entryPrice - currentPrice) * lotSize * contractSize;
                return {
                  symbol: sym,
                  direction: p.direction,
                  lots: lotSize,
                  entry: entryPrice,
                  current: currentPrice,
                  pnl,
                };
              })
            : mockPositions;
        const totalMarginUsed =
          realPositions.length > 0
            ? realPositions.reduce(
                (sum, p) => sum + parseFloat(p.marginUsed || 0),
                0,
              )
            : 264;
        const totalPnl = positions.reduce((sum, p) => sum + (p.pnl || 0), 0);
        return (
          <div>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 32,
                fontWeight: 700,
                color: colors.LIGHT,
                margin: "0 0 8px",
              }}
            >
              Portfolio
            </h2>
            <p
              style={{
                color: colors.MUTED,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                margin: "0 0 24px",
              }}
            >
              Your open positions and active trades.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 16,
                marginBottom: 24,
              }}
            >
              {[
                {
                  label: "Open Positions",
                  value: positions.length,
                  color: colors.GOLD,
                },
                {
                  label: "Total Margin Used",
                  value: `$${totalMarginUsed.toFixed(2)}`,
                  color: "#8B5CF6",
                },
                {
                  label: "Floating P&L",
                  value: `${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(2)}`,
                  color: totalPnl >= 0 ? colors.GREEN : colors.RED,
                },
              ].map((card, i) => (
                <div
                  key={i}
                  style={{
                    ...cardBox,
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${card.color}40`;
                    e.currentTarget.style.boxShadow = `0 8px 24px ${card.color}10`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.BORDER;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: "15%",
                      right: "15%",
                      height: 1,
                      background: `linear-gradient(90deg, transparent, ${card.color}35, transparent)`,
                    }}
                  />
                  <span
                    style={{
                      color: colors.MUTED,
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 12,
                    }}
                  >
                    {card.label}
                  </span>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 36,
                      fontWeight: 700,
                      color: card.color,
                      textShadow: `0 0 12px ${card.color}15`,
                    }}
                  >
                    {card.value}
                  </p>
                </div>
              ))}
            </div>
            <div
              style={{
                background: colors.NAVY,
                border: `1px solid ${colors.BORDER}`,
                borderRadius: 14,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.5fr 1fr 0.8fr 1fr 1fr 1fr 1fr",
                  padding: "12px 20px",
                  background: colors.NAVY2,
                  borderBottom: `1px solid ${colors.BORDER}`,
                }}
              >
                {[
                  "Symbol",
                  "Direction",
                  "Lots",
                  "Entry",
                  "Current",
                  "P&L",
                  "Status",
                ].map((h) => (
                  <span
                    key={h}
                    style={{
                      color: colors.MUTED,
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "uppercase",
                    }}
                  >
                    {h}
                  </span>
                ))}
              </div>
              {positions.map((p, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.5fr 1fr 0.8fr 1fr 1fr 1fr 1fr",
                    padding: "14px 20px",
                    borderBottom: `1px solid ${colors.BORDER}`,
                  }}
                >
                  <span
                    style={{
                      color: colors.LIGHT,
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    {p.symbol}
                  </span>
                  <span
                    style={{
                      color: p.direction === "BUY" ? colors.GREEN : colors.RED,
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 12,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 4,
                      background:
                        p.direction === "BUY"
                          ? "rgba(34,197,94,0.12)"
                          : "rgba(239,68,68,0.12)",
                      width: "fit-content",
                    }}
                  >
                    {p.direction}
                  </span>
                  <span
                    style={{
                      color: colors.LIGHT,
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 13,
                    }}
                  >
                    {p.lots}
                  </span>
                  <span
                    style={{
                      color: colors.MUTED,
                      fontFamily: "monospace",
                      fontSize: 13,
                    }}
                  >
                    {typeof p.entry === "number"
                      ? p.entry > 100
                        ? p.entry.toFixed(2)
                        : p.entry.toFixed(4)
                      : p.entry}
                  </span>
                  <span
                    style={{
                      color: colors.LIGHT,
                      fontFamily: "monospace",
                      fontSize: 13,
                    }}
                  >
                    {typeof p.current === "number"
                      ? p.current > 100
                        ? p.current.toFixed(2)
                        : p.current.toFixed(4)
                      : p.current}
                  </span>
                  <span
                    style={{
                      color: (p.pnl || 0) >= 0 ? colors.GREEN : colors.RED,
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {(p.pnl || 0) >= 0 ? "+" : ""}${(p.pnl || 0).toFixed(2)}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                      color: colors.GREEN,
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: "rgba(34,197,94,0.1)",
                      width: "fit-content",
                    }}
                  >
                    Open
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case "History": {
        const closedOrders =
          realOrders.length > 0
            ? realOrders
                .filter(
                  (o) =>
                    o.status === "CLOSED" ||
                    o.status === "closed" ||
                    o.closePrice,
                )
                .map((o) => ({
                  symbol: o.instrument?.symbol || o.symbol || "",
                  direction: o.direction || o.side || "BUY",
                  lots: parseFloat(o.lotSize || o.lots || 0),
                  entry: parseFloat(o.entryPrice || 0),
                  exit: parseFloat(o.closePrice || o.exitPrice || 0),
                  pnl: parseFloat(o.pnl || 0),
                  date: o.closedAt
                    ? new Date(o.closedAt).toLocaleDateString()
                    : o.createdAt
                      ? new Date(o.createdAt).toLocaleDateString()
                      : "",
                }))
            : mockTradeHistory;
        const wins = closedOrders.filter((t) => (t.pnl || 0) > 0).length;
        const winRate =
          closedOrders.length > 0
            ? ((wins / closedOrders.length) * 100).toFixed(0)
            : 0;
        const netPnl = closedOrders.reduce((sum, t) => sum + (t.pnl || 0), 0);
        return (
          <div>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 32,
                fontWeight: 700,
                color: colors.LIGHT,
                margin: "0 0 8px",
              }}
            >
              Trade History
            </h2>
            <p
              style={{
                color: colors.MUTED,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                margin: "0 0 24px",
              }}
            >
              Your completed and closed trades.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 16,
                marginBottom: 24,
              }}
            >
              {[
                {
                  label: "Total Trades",
                  value: closedOrders.length,
                  color: colors.GOLD,
                },
                {
                  label: "Win Rate",
                  value: `${winRate}%`,
                  color: colors.GREEN,
                },
                {
                  label: "Net P&L",
                  value: `${netPnl >= 0 ? "+" : ""}$${netPnl.toFixed(2)}`,
                  color: netPnl >= 0 ? colors.GREEN : colors.RED,
                },
              ].map((card, i) => (
                <div
                  key={i}
                  style={{
                    ...cardBox,
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${card.color}40`;
                    e.currentTarget.style.boxShadow = `0 8px 24px ${card.color}10`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.BORDER;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: "15%",
                      right: "15%",
                      height: 1,
                      background: `linear-gradient(90deg, transparent, ${card.color}35, transparent)`,
                    }}
                  />
                  <span
                    style={{
                      color: colors.MUTED,
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 12,
                    }}
                  >
                    {card.label}
                  </span>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 36,
                      fontWeight: 700,
                      color: card.color,
                      textShadow: `0 0 12px ${card.color}15`,
                    }}
                  >
                    {card.value}
                  </p>
                </div>
              ))}
            </div>
            <div
              style={{
                background: colors.NAVY,
                border: `1px solid ${colors.BORDER}`,
                borderRadius: 14,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.5fr 1fr 0.7fr 1fr 1fr 1fr 1fr",
                  padding: "12px 20px",
                  background: colors.NAVY2,
                  borderBottom: `1px solid ${colors.BORDER}`,
                }}
              >
                {[
                  "Symbol",
                  "Direction",
                  "Lots",
                  "Entry",
                  "Exit",
                  "P&L",
                  "Date",
                ].map((h) => (
                  <span
                    key={h}
                    style={{
                      color: colors.MUTED,
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "uppercase",
                    }}
                  >
                    {h}
                  </span>
                ))}
              </div>
              {closedOrders.map((t, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.5fr 1fr 0.7fr 1fr 1fr 1fr 1fr",
                    padding: "14px 20px",
                    borderBottom: `1px solid ${colors.BORDER}`,
                  }}
                >
                  <span
                    style={{
                      color: colors.LIGHT,
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    {t.symbol}
                  </span>
                  <span
                    style={{
                      color: t.direction === "BUY" ? colors.GREEN : colors.RED,
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 12,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 4,
                      background:
                        t.direction === "BUY"
                          ? "rgba(34,197,94,0.12)"
                          : "rgba(239,68,68,0.12)",
                      width: "fit-content",
                    }}
                  >
                    {t.direction}
                  </span>
                  <span
                    style={{
                      color: colors.LIGHT,
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 13,
                    }}
                  >
                    {t.lots}
                  </span>
                  <span
                    style={{
                      color: colors.MUTED,
                      fontFamily: "monospace",
                      fontSize: 13,
                    }}
                  >
                    {typeof t.entry === "number"
                      ? t.entry > 100
                        ? t.entry.toFixed(2)
                        : t.entry.toFixed(4)
                      : t.entry}
                  </span>
                  <span
                    style={{
                      color: colors.MUTED,
                      fontFamily: "monospace",
                      fontSize: 13,
                    }}
                  >
                    {typeof t.exit === "number"
                      ? t.exit > 100
                        ? t.exit.toFixed(2)
                        : t.exit.toFixed(4)
                      : t.exit}
                  </span>
                  <span
                    style={{
                      color: (t.pnl || 0) >= 0 ? colors.GREEN : colors.RED,
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {(t.pnl || 0) >= 0 ? "+" : ""}${(t.pnl || 0).toFixed(2)}
                  </span>
                  <span
                    style={{
                      color: colors.MUTED,
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 12,
                    }}
                  >
                    {t.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case "Trading":
        return <TradingDashboard colors={colors} showToast={showToast} />;

      case "KYC":
        return <KycPage colors={colors} showToast={showToast} />;

      case "Notifications":
        return (
          <div>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 32,
                fontWeight: 700,
                color: colors.LIGHT,
                margin: "0 0 24px",
              }}
            >
              Notifications
            </h2>
            <NotificationsPageInline colors={colors} />
          </div>
        );

      default: // Dashboard
        const dashMarkets = [
          {
            label: "XAU/USD",
            name: "Gold",
            price: "2,384.50",
            change: "+1.42%",
            up: true,
            spark: [20, 25, 22, 30, 28, 35, 32, 40, 38, 45, 42, 50],
            color: "#C9A84C",
          },
          {
            label: "BTC/USD",
            name: "Bitcoin",
            price: "68,245.00",
            change: "+2.18%",
            up: true,
            spark: [40, 38, 45, 42, 50, 48, 55, 52, 60, 58, 65, 70],
            color: "#F7931A",
          },
          {
            label: "EUR/USD",
            name: "Euro",
            price: "1.0892",
            change: "-0.15%",
            up: false,
            spark: [50, 48, 52, 46, 44, 48, 42, 40, 44, 38, 42, 36],
            color: "#0BCEAF",
          },
          {
            label: "NAS100",
            name: "Nasdaq",
            price: "18,432.50",
            change: "+0.87%",
            up: true,
            spark: [30, 35, 32, 38, 36, 42, 40, 45, 48, 46, 52, 50],
            color: "#8B5CF6",
          },
        ];
        return (
          <>
            {/* Welcome Banner with Chart */}
            <div
              style={{
                background: `linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(11,206,175,0.05) 50%, rgba(139,92,246,0.04) 100%)`,
                border: `1px solid ${colors.BORDER}`,
                borderRadius: 20,
                padding: "32px 36px",
                marginBottom: 32,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "10%",
                  right: "10%",
                  height: 1,
                  background: `linear-gradient(90deg, transparent, ${colors.GOLD}60, transparent)`,
                }}
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1.2fr",
                  gap: 32,
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${colors.GOLD}, #8B6914)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 20,
                        fontWeight: 700,
                        color: "#fff",
                        boxShadow: "0 4px 16px rgba(201,168,76,0.3)",
                      }}
                    >
                      {firstName.charAt(0).toUpperCase()}
                      {(userProfile?.lastName || "").charAt(0).toUpperCase() ||
                        "T"}
                    </div>
                    <div>
                      <h1
                        style={{
                          margin: 0,
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: 32,
                          fontWeight: 700,
                          color: colors.LIGHT,
                        }}
                      >
                        Welcome back, {firstName}
                      </h1>
                      <p
                        style={{
                          margin: "2px 0 0",
                          color: colors.MUTED,
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 13,
                        }}
                      >
                        {email} · Member since {memberSince}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                    <span
                      style={{
                        padding: "5px 12px",
                        borderRadius: 100,
                        background: "rgba(34,197,94,0.1)",
                        border: "1px solid rgba(34,197,94,0.25)",
                        color: colors.GREEN,
                        fontSize: 11,
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      Account Active
                    </span>
                    <span
                      style={{
                        padding: "5px 12px",
                        borderRadius: 100,
                        background:
                          userProfile?.kycStatus === "approved"
                            ? "rgba(34,197,94,0.1)"
                            : "rgba(201,168,76,0.1)",
                        border: `1px solid ${userProfile?.kycStatus === "approved" ? "rgba(34,197,94,0.25)" : "rgba(201,168,76,0.25)"}`,
                        color:
                          userProfile?.kycStatus === "approved"
                            ? colors.GREEN
                            : colors.GOLD,
                        fontSize: 11,
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      {userProfile?.kycStatus === "approved"
                        ? "KYC Verified"
                        : "KYC Pending"}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={() => onNavigate("Trading")}
                      style={{
                        padding: "10px 20px",
                        borderRadius: 8,
                        border: "none",
                        background: `linear-gradient(135deg, ${colors.GOLD}, #8B6914)`,
                        color: "#fff",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(201,168,76,0.25)",
                      }}
                    >
                      Start Trading
                    </button>
                    <button
                      onClick={() => onNavigate("Deposit")}
                      style={{
                        padding: "10px 20px",
                        borderRadius: 8,
                        border: `1px solid ${colors.BORDER}`,
                        background: "transparent",
                        color: colors.LIGHT,
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Deposit Funds
                    </button>
                  </div>
                </div>
                <div
                  style={{
                    background: `linear-gradient(160deg, ${colors.NAVY}, ${colors.NAVY2})`,
                    borderRadius: 14,
                    padding: "20px 24px",
                    border: `1px solid ${colors.BORDER}`,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <span
                      style={{
                        color: colors.MUTED,
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      Portfolio Performance
                    </span>
                    <span
                      style={{
                        color: colors.GREEN,
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      +5.2% this month
                    </span>
                  </div>
                  <DashboardChartSVG colors={colors} />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 8,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <span
                        style={{
                          width: 10,
                          height: 3,
                          borderRadius: 2,
                          background: "#0BCEAF",
                          display: "inline-block",
                        }}
                      />
                      <span
                        style={{
                          color: colors.MUTED,
                          fontSize: 10,
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        Equity
                      </span>
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <span
                        style={{
                          width: 10,
                          height: 3,
                          borderRadius: 2,
                          background: "#C9A84C",
                          display: "inline-block",
                        }}
                      />
                      <span
                        style={{
                          color: colors.MUTED,
                          fontSize: 10,
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        Gold
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards with Sparklines */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 16,
                marginBottom: 32,
              }}
            >
              {[
                {
                  label: "Wallet Balance",
                  value: `$${walletBalance.toFixed(2)}`,
                  sub:
                    walletBalance > 0 ? "Funds available" : "Deposit to start",
                  page: "Wallet",
                  spark: [30, 35, 32, 40, 38, 45, 42, 50, 48, 55],
                  color: colors.GOLD,
                },
                {
                  label: "Open Positions",
                  value: `${mockPositions.length}`,
                  sub: "$264 margin used",
                  page: "Portfolio",
                  spark: [20, 25, 30, 28, 35, 32, 38, 36, 42, 40],
                  color: "#8B5CF6",
                },
                {
                  label: "Total P&L",
                  value: "+$264.00",
                  sub: `${mockTradeHistory.length} closed trades`,
                  page: "History",
                  spark: [25, 30, 28, 35, 40, 38, 45, 42, 50, 55],
                  color: colors.GREEN,
                },
                {
                  label: "Account Type",
                  value: "Standard",
                  sub: "Upgrade for lower spreads",
                  page: null,
                  spark: [40, 38, 42, 36, 40, 38, 42, 40, 44, 42],
                  color: colors.TEAL,
                },
              ].map((card, i) => (
                <div
                  key={i}
                  onClick={() => card.page && onNavigate(card.page)}
                  style={{
                    background: `linear-gradient(160deg, ${colors.NAVY}, ${colors.NAVY2})`,
                    border: `1px solid ${colors.BORDER}`,
                    borderRadius: 16,
                    padding: "22px 20px",
                    cursor: card.page ? "pointer" : "default",
                    transition: "all 0.3s ease",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    if (card.page) {
                      e.currentTarget.style.borderColor = `${card.color}60`;
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = `0 12px 32px ${card.color}15`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.BORDER;
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: "20%",
                      right: "20%",
                      height: 1,
                      background: `linear-gradient(90deg, transparent, ${card.color}30, transparent)`,
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        color: colors.MUTED,
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                    >
                      {card.label}
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 28,
                      fontWeight: 700,
                      color: colors.LIGHT,
                      marginBottom: 4,
                    }}
                  >
                    {card.value}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        color: colors.MUTED,
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 11,
                      }}
                    >
                      {card.sub}
                    </div>
                    <SparklineSVG
                      color={card.color}
                      data={card.spark}
                      width={70}
                      height={24}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Market Highlights */}
            <div style={{ marginBottom: 32 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <h2
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 24,
                    fontWeight: 700,
                    color: colors.LIGHT,
                    margin: 0,
                  }}
                >
                  Market Highlights
                </h2>
                <button
                  onClick={() => onNavigate("Markets")}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: colors.GOLD,
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  View All Markets
                </button>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 14,
                }}
              >
                {dashMarkets.map((m, i) => (
                  <div
                    key={i}
                    onClick={() => onNavigate("Trading")}
                    style={{
                      background: `linear-gradient(160deg, ${colors.NAVY}, ${colors.NAVY2})`,
                      border: `1px solid ${colors.BORDER}`,
                      borderRadius: 14,
                      padding: "18px 16px",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${m.color}50`;
                      e.currentTarget.style.transform = "translateY(-3px)";
                      e.currentTarget.style.boxShadow = `0 8px 24px ${m.color}12`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = colors.BORDER;
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {i === 0 && (
                      <div
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          background: `linear-gradient(135deg, ${colors.GOLD}, #8B6914)`,
                          color: "#fff",
                          fontSize: 9,
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 6,
                        }}
                      >
                        FEATURED
                      </div>
                    )}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: `${m.color}15`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {i === 0 ? (
                          <svg width="18" height="12" viewBox="0 0 18 12">
                            <rect
                              x="1"
                              y="2"
                              width="16"
                              height="8"
                              rx="1"
                              fill={m.color}
                            />
                            <rect
                              x="3"
                              y="4"
                              width="12"
                              height="4"
                              rx="0.5"
                              fill="#8B6914"
                              opacity="0.5"
                            />
                          </svg>
                        ) : (
                          <span style={{ fontSize: 14, color: m.color }}>
                            {m.label.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <span
                          style={{
                            color: colors.LIGHT,
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 13,
                            fontWeight: 700,
                          }}
                        >
                          {m.label}
                        </span>
                        <span
                          style={{
                            color: colors.MUTED,
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 10,
                            marginLeft: 6,
                          }}
                        >
                          {m.name}
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        fontFamily: "monospace",
                        fontSize: 18,
                        fontWeight: 700,
                        color: colors.LIGHT,
                        marginBottom: 6,
                      }}
                    >
                      ${m.price}
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
                          color: m.up ? colors.GREEN : colors.RED,
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {m.change}
                      </span>
                      <SparklineSVG
                        color={m.up ? colors.GREEN : colors.RED}
                        data={m.spark}
                        width={60}
                        height={20}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ marginBottom: 32 }}>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 24,
                  fontWeight: 700,
                  color: colors.LIGHT,
                  marginBottom: 16,
                }}
              >
                Quick Actions
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 12,
                }}
              >
                {[
                  {
                    label: "Deposit Funds",
                    icon: "↓",
                    color: colors.GOLD,
                    page: "Deposit",
                    desc: "Add funds to your wallet",
                  },
                  {
                    label: "Withdraw",
                    icon: "↑",
                    color: colors.TEAL,
                    page: "Withdraw",
                    desc: "Transfer to your bank",
                  },
                  {
                    label: "Verify Identity",
                    icon: "✓",
                    color: colors.GREEN,
                    page: "KYC",
                    desc: "Complete your KYC",
                  },
                  {
                    label: "Trade Markets",
                    icon: "▶",
                    color: "#8B5CF6",
                    page: "Trading",
                    desc: "Buy and sell instruments",
                  },
                ].map((action, i) => (
                  <button
                    key={i}
                    onClick={() => action.page && onNavigate(action.page)}
                    style={{
                      background: `linear-gradient(160deg, ${colors.NAVY}, ${colors.NAVY2})`,
                      border: `1px solid ${colors.BORDER}`,
                      borderRadius: 14,
                      padding: "20px 16px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                      transition: "all 0.3s ease",
                      position: "relative",
                      overflow: "hidden",
                      textAlign: "center",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${action.color}60`;
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = `0 12px 32px ${action.color}15`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = colors.BORDER;
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: `${action.color}12`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 20,
                        color: action.color,
                      }}
                    >
                      {action.icon}
                    </div>
                    <span
                      style={{
                        color: colors.LIGHT,
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {action.label}
                    </span>
                    <span
                      style={{
                        color: colors.MUTED,
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 10,
                      }}
                    >
                      {action.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div
              style={{
                background: `linear-gradient(160deg, ${colors.NAVY}, ${colors.NAVY2})`,
                border: `1px solid ${colors.BORDER}`,
                borderRadius: 16,
                padding: 28,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "15%",
                  right: "15%",
                  height: 1,
                  background: `linear-gradient(90deg, transparent, ${colors.GOLD}30, transparent)`,
                }}
              />
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 22,
                  fontWeight: 700,
                  color: colors.LIGHT,
                  margin: "0 0 16px",
                }}
              >
                Recent Activity
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {transactions.slice(0, 3).map((tx) => (
                  <div
                    key={tx.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 14px",
                      background: colors.NAVY2,
                      borderRadius: 10,
                      border: `1px solid ${colors.BORDER}`,
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${colors.GOLD}30`;
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(0,0,0,0.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = colors.BORDER;
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background:
                            tx.type === "deposit"
                              ? "rgba(34,197,94,0.1)"
                              : "rgba(239,68,68,0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 16,
                          color:
                            tx.type === "deposit" ? colors.GREEN : colors.RED,
                        }}
                      >
                        {tx.type === "deposit" ? "↓" : "↑"}
                      </div>
                      <div>
                        <p
                          style={{
                            margin: 0,
                            color: colors.LIGHT,
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          {tx.type === "deposit" ? "Deposit" : "Withdrawal"} —{" "}
                          {tx.method}
                        </p>
                        <p
                          style={{
                            margin: "2px 0 0",
                            color: colors.MUTED,
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 11,
                          }}
                        >
                          {tx.date}
                        </p>
                      </div>
                    </div>
                    <span
                      style={{
                        color:
                          tx.type === "deposit" ? colors.GREEN : colors.RED,
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      {tx.type === "deposit" ? "+" : "-"}${tx.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => onNavigate("Wallet")}
                style={{
                  marginTop: 16,
                  background: "transparent",
                  border: `1px solid ${colors.BORDER}`,
                  color: colors.MUTED,
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  padding: "10px",
                  borderRadius: 8,
                  width: "100%",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.GOLD;
                  e.currentTarget.style.color = colors.GOLD;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.BORDER;
                  e.currentTarget.style.color = colors.MUTED;
                }}
              >
                View All Transactions
              </button>
            </div>
          </>
        );
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.DARK_NAVY,
        paddingTop: 112,
      }}
    >
      <DashboardSidebar
        colors={colors}
        activePage={activePage}
        onNavigate={onNavigate}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        walletBalance={walletBalance}
      />
      {showWelcome && activePage === "Dashboard" && (
        <div
          style={{
            background: `linear-gradient(135deg, rgba(201,168,76,0.15) 0%, rgba(11,206,175,0.1) 100%)`,
            borderBottom: `1px solid ${colors.BORDER}`,
            padding: "20px 48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            animation: "fadeIn 0.4s ease",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 1,
              background:
                "linear-gradient(90deg, transparent, rgba(201,168,76,0.5), transparent)",
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: `linear-gradient(135deg, ${colors.GOLD}, #A07728)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                color: "#fff",
                fontWeight: 700,
                fontFamily: "serif",
              }}
            >
              V
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  color: colors.GOLD,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 15,
                  fontWeight: 600,
                }}
              >
                Welcome to VertexFX, {firstName}!
              </p>
              <p
                style={{
                  margin: "4px 0 0",
                  color: colors.MUTED,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                }}
              >
                Your trading account is ready. Explore markets and start your
                journey.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowWelcome(false)}
            style={{
              background: "transparent",
              border: "none",
              color: colors.MUTED,
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            ✕
          </button>
        </div>
      )}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "48px 48px",
          marginLeft: sidebarOpen ? 240 : 0,
          transition: "margin-left 0.3s ease",
        }}
      >
        {renderPage()}
      </div>
    </div>
  );
}

export default function BrokerWebsite() {
  const { theme, setTheme, colors } = useTheme();
  const { user, userProfile, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [prefilledEmail, setPrefilledEmail] = useState("");
  const [toasts, setToasts] = useState([]);
  const [activePage, setActivePage] = useState("Dashboard");

  const isLoggedIn = !!user;

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3500,
    );
  };

  const handleOpenLogin = (email = "") => {
    setPrefilledEmail(email);
    setShowLogin(true);
    setShowSignup(false);
  };

  const handleOpenSignup = () => {
    setShowSignup(true);
    setShowLogin(false);
  };

  const handleCloseModals = () => {
    setShowLogin(false);
    setShowSignup(false);
    setPrefilledEmail("");
  };

  const handleLogout = () => {
    logout();
    showToast("Logged out successfully", "success");
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />
      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
      <Ticker colors={colors} />
      {isLoggedIn ? (
        <>
          <LoggedInNav
            colors={colors}
            setTheme={setTheme}
            theme={theme}
            userProfile={userProfile}
            onLogout={handleLogout}
            activePage={activePage}
            onNavigate={setActivePage}
          />
          <UserDashboard
            colors={colors}
            activePage={activePage}
            onNavigate={setActivePage}
            showToast={showToast}
          />
        </>
      ) : (
        <>
          <Nav
            onTrade={handleOpenSignup}
            colors={colors}
            setTheme={setTheme}
            theme={theme}
            onOpenLogin={handleOpenLogin}
            onOpenSignup={handleOpenSignup}
          />
          <HeroPage onStart={handleOpenSignup} colors={colors} />
          <StatsBar colors={colors} />
          <MarketsSection
            colors={colors}
            showToast={showToast}
            isLoggedIn={isLoggedIn}
            onOpenSignup={handleOpenSignup}
          />
          <FeaturesSection colors={colors} />
          <div
            id="education"
            style={{
              background: colors.NAVY,
              padding: "96px 48px",
              textAlign: "center",
              borderTop: `1px solid ${colors.BORDER}`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                width: 350,
                height: 350,
                opacity: 0.08,
                pointerEvents: "none",
              }}
            >
              <GlobeSVG />
            </div>
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11,
                letterSpacing: 3,
                color: colors.GOLD,
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              Education
            </span>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 48,
                fontWeight: 700,
                color: colors.LIGHT,
                margin: "12px 0 16px",
              }}
            >
              Trading{" "}
              <span style={{ color: colors.GOLD, fontStyle: "italic" }}>
                Academy
              </span>
            </h2>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: colors.MUTED,
                fontSize: 16,
                maxWidth: 520,
                margin: "0 auto 32px",
                lineHeight: 1.7,
              }}
            >
              300+ hours of video content, live webinars, and daily market
              analysis from our senior analysts. Master forex, crypto, stocks,
              and commodities trading.
            </p>
            <div
              style={{
                display: "flex",
                gap: 16,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              {[
                ["Beginner Course", "60+ lessons"],
                ["Advanced Strategies", "120+ lessons"],
                ["Live Webinars", "Weekly sessions"],
              ].map(([title, sub]) => (
                <div
                  key={title}
                  style={{
                    background: colors.NAVY2,
                    border: `1px solid ${colors.BORDER}`,
                    borderRadius: 12,
                    padding: "20px 28px",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 24px rgba(201,168,76,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.BORDER;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 14,
                      fontWeight: 600,
                      color: colors.LIGHT,
                    }}
                  >
                    {title}
                  </div>
                  <div
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 12,
                      color: colors.TEAL,
                      marginTop: 4,
                    }}
                  >
                    {sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <PricingSection
            onStart={handleOpenSignup}
            colors={colors}
            showToast={showToast}
          />
          <TestimonialsSection colors={colors} />
          <CTASection onStart={handleOpenSignup} colors={colors} />
          <div id="company" />
          <Footer colors={colors} showToast={showToast} />
        </>
      )}

      {showLogin && (
        <Login
          onSwitchToSignup={handleOpenSignup}
          onClose={handleCloseModals}
          prefilledEmail={prefilledEmail}
        />
      )}
      {showSignup && (
        <SignUp onSwitchToLogin={handleOpenLogin} onClose={handleCloseModals} />
      )}

      <ToastContainer toasts={toasts} colors={colors} />
    </div>
  );
}
