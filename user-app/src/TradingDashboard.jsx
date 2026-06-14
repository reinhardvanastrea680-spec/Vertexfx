import { useState, useEffect } from "react";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";
import { tradingApi, marketApi, usersApi } from "./api";

const SYMBOLS = [
  {
    symbol: "EURUSD",
    label: "EUR/USD",
    category: "Forex",
    contractSize: 100000,
  },
  {
    symbol: "GBPUSD",
    label: "GBP/USD",
    category: "Forex",
    contractSize: 100000,
  },
  {
    symbol: "USDJPY",
    label: "USD/JPY",
    category: "Forex",
    contractSize: 100000,
  },
  {
    symbol: "USDCHF",
    label: "USD/CHF",
    category: "Forex",
    contractSize: 100000,
  },
  {
    symbol: "AUDUSD",
    label: "AUD/USD",
    category: "Forex",
    contractSize: 100000,
  },
  {
    symbol: "NZDUSD",
    label: "NZD/USD",
    category: "Forex",
    contractSize: 100000,
  },
  {
    symbol: "USDCAD",
    label: "USD/CAD",
    category: "Forex",
    contractSize: 100000,
  },
  { symbol: "BTCUSD", label: "BTC/USD", category: "Crypto", contractSize: 1 },
  { symbol: "ETHUSD", label: "ETH/USD", category: "Crypto", contractSize: 1 },
  { symbol: "XRPUSD", label: "XRP/USD", category: "Crypto", contractSize: 1 },
  {
    symbol: "GOLD",
    label: "XAU/USD",
    category: "Commodities",
    contractSize: 100,
  },
  {
    symbol: "SILVER",
    label: "XAG/USD",
    category: "Commodities",
    contractSize: 5000,
  },
  {
    symbol: "OILUSD",
    label: "Crude Oil",
    category: "Commodities",
    contractSize: 1000,
  },
  { symbol: "NAS100", label: "NAS100", category: "Indices", contractSize: 1 },
  { symbol: "SP500", label: "SP500", category: "Indices", contractSize: 1 },
  { symbol: "DOW30", label: "DOW30", category: "Indices", contractSize: 1 },
];

export default function TradingDashboard({ colors, showToast }) {
  const { connected, prices, subscribeAll } = useSocket();
  const { userProfile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("Forex");
  const [selectedSymbol, setSelectedSymbol] = useState("EURUSD");
  const [direction, setDirection] = useState("buy");
  const [lotSize, setLotSize] = useState("0.01");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [positions, setPositions] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Subscribe to all price feeds on mount
  useEffect(() => {
    subscribeAll(SYMBOLS.map((s) => s.symbol));
  }, [subscribeAll]);

  // Load trading accounts and positions
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const accts = await usersApi.getTradingAccounts();
      if (accts && accts.length > 0) {
        setAccounts(accts);
        setSelectedAccount(accts[0]);
        const pos = await tradingApi.getPositions(accts[0].id);
        setPositions(Array.isArray(pos) ? pos : []);
      } else {
        // Fallback mock account when backend has no trading account yet
        const mockAcct = {
          id: "demo",
          accountNumber: "DEMO-0001",
          balance: "10000.00",
          equity: "10000.00",
          margin: "0",
          leverage: 100,
          accountType: "demo",
          status: "active",
        };
        setAccounts([mockAcct]);
        setSelectedAccount(mockAcct);
      }
    } catch (err) {
      console.error("Failed to load trading data:", err);
      // Fallback mock account so trading UI still works
      const mockAcct = {
        id: "demo",
        accountNumber: "DEMO-0001",
        balance: "10000.00",
        equity: "10000.00",
        margin: "0",
        leverage: 100,
        accountType: "demo",
        status: "active",
      };
      setAccounts([mockAcct]);
      setSelectedAccount(mockAcct);
    } finally {
      setLoading(false);
    }
  }

  async function executeTrade() {
    if (!selectedAccount) {
      showToast("No trading account found. Please contact support.", "error");
      return;
    }
    const price = prices[selectedSymbol];
    if (!price) {
      showToast("Price not available. Please try again.", "error");
      return;
    }
    setIsExecuting(true);
    try {
      await tradingApi.placeOrder({
        accountId: selectedAccount.id,
        symbol: selectedSymbol,
        direction,
        volume: parseFloat(lotSize),
        orderType: "market",
        stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
        takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
      });
      showToast(
        `${direction.toUpperCase()} ${lotSize} lots ${selectedSymbol} executed!`,
        "success",
      );
      setStopLoss("");
      setTakeProfit("");
      await loadData();
    } catch (err) {
      if (selectedAccount.id === "demo") {
        // Demo mode: simulate trade locally
        const entryPrice = direction === "buy" ? price.ask : price.bid;
        const mockPosition = {
          id: `demo_${Date.now()}`,
          symbol: selectedSymbol,
          direction,
          volume: lotSize,
          openPrice: entryPrice,
          lotSize,
          stopLoss: stopLoss || undefined,
          takeProfit: takeProfit || undefined,
          createdAt: new Date().toISOString(),
        };
        setPositions((prev) => [mockPosition, ...prev]);
        showToast(
          `[DEMO] ${direction.toUpperCase()} ${lotSize} lots ${selectedSymbol} at ${entryPrice > 100 ? entryPrice.toFixed(2) : entryPrice.toFixed(5)}`,
          "success",
        );
        setStopLoss("");
        setTakeProfit("");
      } else {
        showToast(err.message || "Trade execution failed", "error");
      }
    } finally {
      setIsExecuting(false);
    }
  }

  async function closePosition(posId) {
    try {
      if (String(posId).startsWith("demo_")) {
        // Demo mode: remove position locally with P&L
        const pos = positions.find((p) => p.id === posId);
        const pnl = pos ? calcPnl(pos) : 0;
        setPositions((prev) => prev.filter((p) => p.id !== posId));
        showToast(
          `[DEMO] Position closed. P&L: ${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)}`,
          pnl >= 0 ? "success" : "error",
        );
        return;
      }
      const result = await tradingApi.closePosition(posId);
      showToast(
        `Position closed. P&L: $${result.pnl?.toFixed(2) || "0.00"}`,
        result.pnl >= 0 ? "success" : "error",
      );
      await loadData();
    } catch (err) {
      showToast(err.message || "Failed to close position", "error");
    }
  }

  const filteredSymbols = SYMBOLS.filter(
    (s) => s.category === selectedCategory,
  );
  const currentPrice = prices[selectedSymbol];
  const currentInfo = SYMBOLS.find((s) => s.symbol === selectedSymbol);

  // Real-time P&L calculation for open positions
  function calcPnl(pos) {
    const p = prices[pos.symbol];
    if (!p) return parseFloat(pos.floatingPnl || 0);
    const info = SYMBOLS.find((s) => s.symbol === pos.symbol);
    const cs = info?.contractSize || 100000;
    const cp = pos.direction === "buy" ? p.bid : p.ask;
    if (pos.direction === "buy")
      return (cp - parseFloat(pos.openPrice)) * parseFloat(pos.volume) * cs;
    return (parseFloat(pos.openPrice) - cp) * parseFloat(pos.volume) * cs;
  }

  // Financial metrics
  const totalPnl = positions.reduce((sum, p) => sum + calcPnl(p), 0);
  const usedMargin = parseFloat(selectedAccount?.margin || 0);
  const balance = parseFloat(selectedAccount?.balance || 0);
  const equity = balance + totalPnl;
  const freeMargin = equity - usedMargin;
  const marginLevel = usedMargin > 0 ? (equity / usedMargin) * 100 : 0;

  const categories = ["Forex", "Crypto", "Commodities", "Indices"];
  const cardBox = {
    background: `linear-gradient(160deg, ${colors.NAVY}, ${colors.NAVY2})`,
    border: `1px solid ${colors.BORDER}`,
    borderRadius: 14,
    padding: 20,
  };
  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    background: colors.NAVY,
    border: `1px solid ${colors.BORDER}`,
    borderRadius: 8,
    color: colors.LIGHT,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
  };
  const labelStyle = {
    display: "block",
    color: colors.MUTED,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 12,
    marginBottom: 6,
    fontWeight: 500,
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <p
          style={{
            color: colors.MUTED,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15,
          }}
        >
          Loading trading dashboard...
        </p>
      </div>
    );
  }

  // Generate sparkline points from recent prices for selected symbol
  const sparkPoints = (() => {
    const pts = [];
    const base = currentPrice ? currentPrice.bid : 100;
    for (let i = 0; i < 20; i++) {
      pts.push(
        base *
          (1 + Math.sin(i * 0.5) * 0.003 + (Math.random() * 0.002 - 0.001)),
      );
    }
    return pts;
  })();

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
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
            Live Trading
          </h2>
          <p
            style={{
              color: colors.MUTED,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              margin: "4px 0 0",
            }}
          >
            Execute trades across forex, crypto, commodities and indices
          </p>
        </div>
        <span
          style={{
            fontSize: 12,
            fontFamily: "'DM Sans', sans-serif",
            color: connected ? colors.GREEN : colors.RED,
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            borderRadius: 8,
            background: connected
              ? "rgba(34,197,94,0.08)"
              : "rgba(239,68,68,0.08)",
            border: `1px solid ${connected ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: connected ? colors.GREEN : colors.RED,
              display: "inline-block",
            }}
          />
          {connected ? "Live Prices" : "Reconnecting..."}
        </span>
      </div>

      {/* Financial Metrics Bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(5, 1fr)",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {[
          {
            label: "Balance",
            value: `$${balance.toFixed(2)}`,
            color: colors.LIGHT,
            accent: colors.GOLD,
          },
          {
            label: "Equity",
            value: `$${equity.toFixed(2)}`,
            color: equity >= balance ? colors.GREEN : colors.RED,
            accent: equity >= balance ? colors.GREEN : colors.RED,
          },
          {
            label: "Free Margin",
            value: `$${freeMargin.toFixed(2)}`,
            color: freeMargin > 0 ? colors.GREEN : colors.RED,
            accent: colors.TEAL,
          },
          {
            label: "Used Margin",
            value: `$${usedMargin.toFixed(2)}`,
            color: colors.GOLD,
            accent: colors.GOLD,
          },
          {
            label: "Margin Level",
            value: `${marginLevel.toFixed(1)}%`,
            color:
              marginLevel > 200
                ? colors.GREEN
                : marginLevel > 100
                  ? colors.GOLD
                  : colors.RED,
            accent:
              marginLevel > 200
                ? colors.GREEN
                : marginLevel > 100
                  ? colors.GOLD
                  : colors.RED,
          },
        ].map((m, i) => (
          <div
            key={i}
            style={{
              ...cardBox,
              padding: "14px 16px",
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
                background: `linear-gradient(90deg, transparent, ${m.accent}40, transparent)`,
              }}
            />
            <p
              style={{
                margin: 0,
                color: colors.MUTED,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              {m.label}
            </p>
            <p
              style={{
                margin: "4px 0 0",
                color: m.color,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 20,
                fontWeight: 700,
                textShadow: `0 0 12px ${m.accent}15`,
              }}
            >
              {m.value}
            </p>
          </div>
        ))}
      </div>

      {/* Margin Warning */}
      {marginLevel > 0 && marginLevel < 50 && (
        <div
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.4)",
            borderRadius: 10,
            padding: "12px 20px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 20, color: colors.RED }}>!</span>
          <p
            style={{
              margin: 0,
              color: colors.RED,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {marginLevel < 20
              ? "STOP OUT: Positions may be auto-closed. Deposit more funds or close positions."
              : "Margin Call: Your equity is below 50% of used margin. Add funds or close positions."}
          </p>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr",
          gap: 20,
          marginBottom: 24,
        }}
      >
        {/* Left: Symbol List */}
        <div style={{ ...cardBox, position: "relative", overflow: "hidden" }}>
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
          <div
            style={{
              display: "flex",
              gap: 6,
              marginBottom: 14,
              flexWrap: "wrap",
            }}
          >
            {categories.map((c) => {
              const catColor =
                c === "Forex"
                  ? "#0BCEAF"
                  : c === "Crypto"
                    ? "#F7931A"
                    : c === "Commodities"
                      ? "#C9A84C"
                      : "#8B5CF6";
              const isActive = selectedCategory === c;
              return (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: `1px solid ${isActive ? catColor : colors.BORDER}`,
                    background: isActive ? `${catColor}15` : "transparent",
                    color: isActive ? catColor : colors.MUTED,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {c}
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {filteredSymbols.map((s) => {
              const p = prices[s.symbol];
              const isSelected = selectedSymbol === s.symbol;
              const isGold = s.symbol === "GOLD";
              return (
                <button
                  key={s.symbol}
                  onClick={() => setSelectedSymbol(s.symbol)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    borderRadius: 10,
                    cursor: "pointer",
                    background: isSelected
                      ? `${isGold ? "rgba(201,168,76" : "rgba(11,206,175"},0.08)`
                      : "transparent",
                    border: isSelected
                      ? `1px solid ${isGold ? "rgba(201,168,76,0.35)" : "rgba(11,206,175,0.25)"}`
                      : "1px solid transparent",
                    transition: "all 0.2s",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = `${colors.NAVY2}`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    {isGold && (
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: colors.GOLD,
                          boxShadow: `0 0 6px ${colors.GOLD}60`,
                        }}
                      />
                    )}
                    <span
                      style={{
                        color: isSelected
                          ? isGold
                            ? colors.GOLD
                            : colors.TEAL
                          : colors.LIGHT,
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {s.label}
                    </span>
                    {isGold && (
                      <span
                        style={{
                          fontSize: 8,
                          background: `linear-gradient(135deg, ${colors.GOLD}, #8B6914)`,
                          color: "#fff",
                          padding: "1px 5px",
                          borderRadius: 4,
                          fontWeight: 700,
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        HOT
                      </span>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {p ? (
                      <>
                        <span
                          style={{
                            color: colors.LIGHT,
                            fontFamily: "monospace",
                            fontSize: 12,
                          }}
                        >
                          {p.bid > 100 ? p.bid.toFixed(2) : p.bid.toFixed(5)}
                        </span>
                        <span
                          style={{
                            color: colors.MUTED,
                            fontFamily: "monospace",
                            fontSize: 10,
                            marginLeft: 6,
                          }}
                        >
                          / {p.ask > 100 ? p.ask.toFixed(2) : p.ask.toFixed(5)}
                        </span>
                      </>
                    ) : (
                      <span style={{ color: colors.MUTED, fontSize: 11 }}>
                        --
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Trade Execution Panel */}
        <div>
          {/* Price Chart Visualization */}
          {currentPrice && (
            <div
              style={{
                ...cardBox,
                marginBottom: 16,
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
                  background: `linear-gradient(90deg, transparent, ${selectedSymbol === "GOLD" ? colors.GOLD : colors.TEAL}40, transparent)`,
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <h3
                    style={{
                      margin: 0,
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 22,
                      fontWeight: 700,
                      color: colors.LIGHT,
                    }}
                  >
                    {currentInfo?.label}
                  </h3>
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: 6,
                      background: `${selectedCategory === "Forex" ? "#0BCEAF" : selectedCategory === "Crypto" ? "#F7931A" : selectedCategory === "Commodities" ? "#C9A84C" : "#8B5CF6"}15`,
                      color:
                        selectedCategory === "Forex"
                          ? "#0BCEAF"
                          : selectedCategory === "Crypto"
                            ? "#F7931A"
                            : selectedCategory === "Commodities"
                              ? "#C9A84C"
                              : "#8B5CF6",
                    }}
                  >
                    {selectedCategory}
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: "monospace",
                      fontSize: 26,
                      fontWeight: 700,
                      color: colors.GREEN,
                      textShadow: `0 0 16px rgba(34,197,94,0.15)`,
                    }}
                  >
                    {currentPrice.bid > 100
                      ? currentPrice.bid.toFixed(2)
                      : currentPrice.bid.toFixed(5)}
                  </p>
                  <p
                    style={{
                      margin: "1px 0 0",
                      fontFamily: "monospace",
                      fontSize: 11,
                      color: colors.MUTED,
                    }}
                  >
                    Spread:{" "}
                    {(
                      ((currentPrice.ask - currentPrice.bid) /
                        currentPrice.bid) *
                      10000
                    ).toFixed(1)}{" "}
                    pips
                  </p>
                </div>
              </div>
              {/* Sparkline Chart */}
              <svg
                viewBox="0 0 400 80"
                style={{ width: "100%", height: 60 }}
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id="tradeChartFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={
                        selectedSymbol === "GOLD" ? "#C9A84C" : "#0BCEAF"
                      }
                      stopOpacity="0.2"
                    />
                    <stop
                      offset="100%"
                      stopColor={
                        selectedSymbol === "GOLD" ? "#C9A84C" : "#0BCEAF"
                      }
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>
                {(() => {
                  const w = 400,
                    h = 80;
                  const max = Math.max(...sparkPoints);
                  const min = Math.min(...sparkPoints);
                  const range = max - min || 1;
                  const step = w / (sparkPoints.length - 1);
                  const pts = sparkPoints
                    .map(
                      (v, i) =>
                        `${i * step},${h - ((v - min) / range) * (h - 8) - 4}`,
                    )
                    .join(" ");
                  const fill = `0,${h} ${pts} ${w},${h}`;
                  return (
                    <>
                      <polygon points={fill} fill="url(#tradeChartFill)" />
                      <polyline
                        points={pts}
                        fill="none"
                        stroke={
                          selectedSymbol === "GOLD" ? "#C9A84C" : "#0BCEAF"
                        }
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </>
                  );
                })()}
              </svg>
            </div>
          )}

          <div
            style={{
              ...cardBox,
              marginBottom: 16,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "20%",
                right: "20%",
                height: 1,
                background: `linear-gradient(90deg, transparent, ${direction === "buy" ? colors.GREEN : colors.RED}30, transparent)`,
              }}
            />

            <form
              onSubmit={(e) => {
                e.preventDefault();
                executeTrade();
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <div>
                  <label style={labelStyle}>Direction</label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setDirection("buy")}
                      style={{
                        padding: "14px",
                        borderRadius: 10,
                        border: `1px solid ${direction === "buy" ? colors.GREEN : colors.BORDER}`,
                        background:
                          direction === "buy"
                            ? "rgba(34,197,94,0.12)"
                            : colors.NAVY2,
                        color:
                          direction === "buy" ? colors.GREEN : colors.MUTED,
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow:
                          direction === "buy"
                            ? "0 4px 12px rgba(34,197,94,0.15)"
                            : "none",
                        transition: "all 0.2s",
                      }}
                    >
                      BUY
                    </button>
                    <button
                      type="button"
                      onClick={() => setDirection("sell")}
                      style={{
                        padding: "14px",
                        borderRadius: 10,
                        border: `1px solid ${direction === "sell" ? colors.RED : colors.BORDER}`,
                        background:
                          direction === "sell"
                            ? "rgba(239,68,68,0.12)"
                            : colors.NAVY2,
                        color: direction === "sell" ? colors.RED : colors.MUTED,
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow:
                          direction === "sell"
                            ? "0 4px 12px rgba(239,68,68,0.15)"
                            : "none",
                        transition: "all 0.2s",
                      }}
                    >
                      SELL
                    </button>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Lot Size</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="100"
                    value={lotSize}
                    onChange={(e) => setLotSize(e.target.value)}
                    style={inputStyle}
                  />
                  {currentPrice && currentInfo && (
                    <p
                      style={{
                        margin: "4px 0 0",
                        color: colors.MUTED,
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 11,
                      }}
                    >
                      Margin: $
                      {(
                        (parseFloat(lotSize) *
                          currentInfo.contractSize *
                          (direction === "buy"
                            ? currentPrice.ask
                            : currentPrice.bid)) /
                        parseFloat(selectedAccount?.leverage || 100)
                      ).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <div>
                  <label style={labelStyle}>Stop Loss (optional)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Price"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Take Profit (optional)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Price"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isExecuting || !currentPrice}
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: 12,
                  border: "none",
                  background: isExecuting
                    ? colors.MUTED
                    : direction === "buy"
                      ? `linear-gradient(135deg, ${colors.GREEN}, #16a34a)`
                      : `linear-gradient(135deg, ${colors.RED}, #dc2626)`,
                  color: "#fff",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: isExecuting ? "not-allowed" : "pointer",
                  boxShadow: isExecuting
                    ? "none"
                    : direction === "buy"
                      ? "0 6px 20px rgba(34,197,94,0.3)"
                      : "0 6px 20px rgba(239,68,68,0.3)",
                  transition: "all 0.2s",
                }}
              >
                {isExecuting
                  ? "Executing..."
                  : `Execute ${direction.toUpperCase()} ${currentInfo?.label}`}
              </button>
            </form>
          </div>

          {/* Open Positions */}
          <div style={{ ...cardBox, position: "relative", overflow: "hidden" }}>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "20%",
                right: "20%",
                height: 1,
                background: `linear-gradient(90deg, transparent, ${colors.GOLD}30, transparent)`,
              }}
            />
            <h3
              style={{
                margin: "0 0 14px",
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 20,
                fontWeight: 700,
                color: colors.LIGHT,
              }}
            >
              Open Positions ({positions.length})
            </h3>
            {positions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 48 48"
                  style={{ marginBottom: 12, opacity: 0.4 }}
                >
                  <rect
                    x="4"
                    y="14"
                    width="40"
                    height="24"
                    rx="4"
                    stroke={colors.MUTED}
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <path
                    d="M14 26L20 22L26 28L34 20"
                    stroke={colors.MUTED}
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
                <p
                  style={{
                    color: colors.MUTED,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    margin: 0,
                  }}
                >
                  No open positions. Execute a trade above to get started.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {positions.map((pos) => {
                  const pnl = calcPnl(pos);
                  const p = prices[pos.symbol];
                  const isGoldPos = pos.symbol === "GOLD";
                  return (
                    <div
                      key={pos.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 14px",
                        background: colors.NAVY2,
                        borderRadius: 12,
                        border: `1px solid ${colors.BORDER}`,
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor =
                          pnl >= 0
                            ? "rgba(34,197,94,0.3)"
                            : "rgba(239,68,68,0.3)";
                        e.currentTarget.style.boxShadow = `0 4px 12px ${pnl >= 0 ? "rgba(34,197,94" : "rgba(239,68,68"},0.08)`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = colors.BORDER;
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 4,
                          }}
                        >
                          {isGoldPos && (
                            <div
                              style={{
                                width: 5,
                                height: 5,
                                borderRadius: "50%",
                                background: colors.GOLD,
                                boxShadow: `0 0 4px ${colors.GOLD}80`,
                              }}
                            />
                          )}
                          <span
                            style={{
                              color: colors.LIGHT,
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: 14,
                              fontWeight: 600,
                            }}
                          >
                            {pos.symbol}
                          </span>
                          <span
                            style={{
                              color:
                                pos.direction === "buy"
                                  ? colors.GREEN
                                  : colors.RED,
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: 11,
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: 4,
                              background:
                                pos.direction === "buy"
                                  ? "rgba(34,197,94,0.12)"
                                  : "rgba(239,68,68,0.12)",
                            }}
                          >
                            {pos.direction.toUpperCase()}
                          </span>
                          <span
                            style={{
                              color: colors.MUTED,
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: 12,
                            }}
                          >
                            {pos.volume} lots
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: 16,
                            fontFamily: "monospace",
                            fontSize: 11,
                            color: colors.MUTED,
                          }}
                        >
                          <span>
                            Entry:{" "}
                            {parseFloat(pos.openPrice).toFixed(
                              pos.openPrice > 100 ? 2 : 5,
                            )}
                          </span>
                          <span>
                            Current:{" "}
                            {p
                              ? pos.direction === "buy"
                                ? p.bid.toFixed(p.bid > 100 ? 2 : 5)
                                : p.ask.toFixed(p.ask > 100 ? 2 : 5)
                              : "--"}
                          </span>
                          {pos.stopLoss && <span>SL: {pos.stopLoss}</span>}
                          {pos.takeProfit && <span>TP: {pos.takeProfit}</span>}
                        </div>
                      </div>
                      <div
                        style={{
                          textAlign: "right",
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <span
                          style={{
                            color: pnl >= 0 ? colors.GREEN : colors.RED,
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 15,
                            fontWeight: 700,
                          }}
                        >
                          {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                        </span>
                        <button
                          onClick={() => closePosition(pos.id)}
                          style={{
                            padding: "8px 16px",
                            borderRadius: 6,
                            border: `1px solid ${colors.RED}`,
                            background: "transparent",
                            color: colors.RED,
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
