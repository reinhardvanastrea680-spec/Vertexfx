import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const Login = ({ onSwitchToSignup, onClose, prefilledEmail = "" }) => {
  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const { login } = useAuth();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      onClose();
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
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
        background: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      <div
        style={{
          background: "#0D1526",
          borderRadius: 16,
          padding: isMobile ? "30px 20px" : 40,
          maxWidth: 440,
          width: "90%",
          border: "1px solid #1A2540",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
        }}
      >
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
                fontSize: 28,
                fontWeight: 700,
                margin: 0,
                fontFamily: "'Cormorant Garamond', serif",
                color: "#F0F4FF",
              }}
            >
              Log In
            </h2>
            <p
              style={{
                marginTop: 8,
                marginBottom: 0,
                color: "#8895B3",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
              }}
            >
              Welcome back! Please enter your details
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid #1A2540",
              color: "#8895B3",
              fontSize: 20,
              cursor: "pointer",
              padding: 8,
              borderRadius: 8,
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = "#C9A84C";
              e.target.style.color = "#C9A84C";
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = "#1A2540";
              e.target.style.color = "#8895B3";
            }}
          >
            ✕
          </button>
        </div>
        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#EF4444",
              padding: "14px 18px",
              borderRadius: 12,
              marginBottom: 24,
              fontSize: 14,
              fontFamily: "'DM Sans', sans-serif",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>!</span>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 10,
                color: "#F0F4FF",
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: "0.5px",
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 18px",
                border: "1px solid #1A2540",
                borderRadius: 12,
                fontSize: 14,
                fontFamily: "'DM Sans', sans-serif",
                boxSizing: "border-box",
                background: "#111D35",
                color: "#F0F4FF",
                outline: "none",
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#C9A84C";
                e.target.style.boxShadow = "0 0 0 3px rgba(201, 168, 76, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#1A2540";
                e.target.style.boxShadow = "none";
              }}
              placeholder="your@email.com"
              required
            />
          </div>
          <div style={{ marginBottom: 32 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 10,
                color: "#F0F4FF",
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: "0.5px",
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 50px 14px 18px",
                  border: "1px solid #1A2540",
                  borderRadius: 12,
                  fontSize: 14,
                  fontFamily: "'DM Sans', sans-serif",
                  boxSizing: "border-box",
                  background: "#111D35",
                  color: "#F0F4FF",
                  outline: "none",
                  transition: "all 0.2s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#C9A84C";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(201, 168, 76, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#1A2540";
                  e.target.style.boxShadow = "none";
                }}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "#8895B3",
                  cursor: "pointer",
                  fontSize: 16,
                  padding: 8,
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = "#C9A84C";
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "#8895B3";
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #C9A84C 0%, #A07728 100%)",
              color: "#0A0F1E",
              border: "none",
              padding: "16px 0",
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "0.5px",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 20px rgba(201, 168, 76, 0.3)",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow =
                  "0 8px 30px rgba(201, 168, 76, 0.45)";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 20px rgba(201, 168, 76, 0.3)";
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div
          style={{
            marginTop: 32,
            textAlign: "center",
            paddingTop: 24,
            borderTop: "1px solid #1A2540",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#8895B3",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
            }}
          >
            Don't have an account?{" "}
            <button
              onClick={onSwitchToSignup}
              style={{
                background: "transparent",
                border: "none",
                color: "#0BCEAF",
                fontSize: 14,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                padding: 0,
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.color = "#C9A84C";
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "#0BCEAF";
              }}
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
