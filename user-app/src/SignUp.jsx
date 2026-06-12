import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { countries } from "./countries";

const SignUp = ({ onSwitchToLogin, onClose }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nationality, setNationality] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const { register } = useAuth();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const country = countries.find((c) => c.name === selectedCountry);
    const fullPhone = country
      ? `${country.dialCode}${phoneNumber}`
      : phoneNumber;

    try {
      await register(
        firstName,
        lastName,
        email,
        password,
        dateOfBirth,
        nationality,
        address,
        city,
        state,
        selectedCountry,
        fullPhone,
        postalCode,
        referralCode,
      );
      setSuccess(true);
      setTimeout(() => {
        onSwitchToLogin(email);
      }, 1500);
    } catch (err) {
      if (
        err.responseData &&
        err.responseData.errors &&
        err.responseData.errors.length > 0
      ) {
        setError(err.responseData.errors[0].message);
      } else {
        setError(err.message || "Sign up failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCountryChange = (e) => {
    const countryName = e.target.value;
    setSelectedCountry(countryName);
    setPhoneNumber("");
  };

  const selectedCountryData = countries.find((c) => c.name === selectedCountry);

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
          maxHeight: "90vh",
          overflowY: "auto",
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
              Create Account
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
              Join VertexFX and start trading today
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

        {success && (
          <div
            style={{
              background: "rgba(11, 206, 175, 0.1)",
              border: "1px solid rgba(11, 206, 175, 0.3)",
              color: "#0BCEAF",
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
            <span>✓</span>
            Account created successfully! Redirecting to login...
          </div>
        )}

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
          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 20,
              flexDirection: isMobile ? "column" : "row",
            }}
          >
            <div style={{ flex: 1 }}>
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
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
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
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(201, 168, 76, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#1A2540";
                  e.target.style.boxShadow = "none";
                }}
                placeholder="John"
                required
              />
            </div>
            <div style={{ flex: 1 }}>
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
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
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
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(201, 168, 76, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#1A2540";
                  e.target.style.boxShadow = "none";
                }}
                placeholder="Doe"
                required
              />
            </div>
          </div>

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

          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 20,
              flexDirection: isMobile ? "column" : "row",
            }}
          >
            <div style={{ flex: 1 }}>
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
                Date of Birth
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
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
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(201, 168, 76, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#1A2540";
                  e.target.style.boxShadow = "none";
                }}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
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
                Nationality
              </label>
              <select
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
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
                  cursor: "pointer",
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
                required
              >
                <option value="">Select nationality</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
              Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
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
              placeholder="123 Main Street"
              required
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 20,
              flexDirection: isMobile ? "column" : "row",
            }}
          >
            <div style={{ flex: 1 }}>
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
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
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
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(201, 168, 76, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#1A2540";
                  e.target.style.boxShadow = "none";
                }}
                placeholder="New York"
                required
              />
            </div>
            <div style={{ flex: 1 }}>
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
                State/Province
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
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
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(201, 168, 76, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#1A2540";
                  e.target.style.boxShadow = "none";
                }}
                placeholder="NY"
                required
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 20,
              flexDirection: isMobile ? "column" : "row",
            }}
          >
            <div style={{ flex: 1 }}>
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
                Country
              </label>
              <select
                value={selectedCountry}
                onChange={handleCountryChange}
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
                  cursor: "pointer",
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
                required
              >
                <option value="">Select your country</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
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
                Phone Number
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: "0 0 auto" }}>
                  <div
                    style={{
                      padding: "14px 18px",
                      border: "1px solid #1A2540",
                      borderRadius: 12,
                      fontSize: 14,
                      fontFamily: "'DM Sans', sans-serif",
                      background: "#111D35",
                      color: "#8895B3",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: 70,
                    }}
                  >
                    {selectedCountryData?.dialCode || "+00"}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
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
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(201, 168, 76, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#1A2540";
                      e.target.style.boxShadow = "none";
                    }}
                    placeholder="123456789"
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 20,
              flexDirection: isMobile ? "column" : "row",
            }}
          >
            <div style={{ flex: 1 }}>
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
                Postal Code (Optional)
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
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
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(201, 168, 76, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#1A2540";
                  e.target.style.boxShadow = "none";
                }}
                placeholder="10001"
              />
            </div>
            <div style={{ flex: 1 }}>
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
                Referral Code (Optional)
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
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
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(201, 168, 76, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#1A2540";
                  e.target.style.boxShadow = "none";
                }}
                placeholder="ABC123"
              />
            </div>
          </div>

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
            <p
              style={{
                color: "#8895B3",
                fontSize: 12,
                marginTop: 8,
                marginBottom: 0,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Password must be at least 8 characters, include 1 uppercase letter
              and 1 number
            </p>
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
              Confirm Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #C9A84C 0%, #A07728 100%)",
              color: "#0A0F1E",
              border: "none",
              padding: "16px 0",
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 700,
              cursor: loading || success ? "not-allowed" : "pointer",
              opacity: loading || success ? 0.7 : 1,
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "0.5px",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 20px rgba(201, 168, 76, 0.3)",
            }}
            onMouseEnter={(e) => {
              if (!loading && !success) {
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
            {loading
              ? "Creating Account..."
              : success
                ? "Account Created!"
                : "Create Account"}
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
            Already have an account?{" "}
            <button
              onClick={() => onSwitchToLogin(email)}
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
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
