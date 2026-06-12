import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { usersApi } from "./api";

export default function KycPage({ colors, showToast }) {
  const { userProfile, fetchProfile } = useAuth();
  const [kycStatus, setKycStatus] = useState(
    userProfile?.kycStatus || "not_submitted",
  );
  const [documents, setDocuments] = useState([]);
  const [idType, setIdType] = useState("national_id");
  const [documentNumber, setDocumentNumber] = useState("");
  const [countryOfIssue, setCountryOfIssue] = useState("");
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKyc();
  }, []);

  // Update kycStatus if userProfile changes
  useEffect(() => {
    if (userProfile?.kycStatus) {
      setKycStatus(userProfile.kycStatus);
    }
  }, [userProfile]);

  async function loadKyc() {
    try {
      const docs = await usersApi.getKycDocuments();
      setDocuments(Array.isArray(docs) ? docs : []);
      if (docs?.length > 0) {
        const latest = docs[0];
        setKycStatus(latest.status);
      }
    } catch (err) {
      console.error("Failed to load KYC:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!frontFile || !selfieFile) {
      showToast("Please upload ID front and selfie", "error");
      return;
    }
    if (!documentNumber || !countryOfIssue) {
      showToast("Please fill in document number and country", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      // For now, use base64 data URIs as placeholder (in production, upload to Cloudinary/S3)
      const frontData = await fileToBase64(frontFile);
      const selfieData = await fileToBase64(selfieFile);
      const backData = backFile ? await fileToBase64(backFile) : undefined;

      await usersApi.submitKyc({
        documentType: idType,
        documentNumber,
        countryOfIssue,
        frontImageUrl: frontData,
        backImageUrl: backData,
        selfieImageUrl: selfieData,
      });
      setKycStatus("pending");
      showToast("KYC documents submitted for review!", "success");
      await loadKyc();
      // Refresh user profile to update kycStatus
      const token = localStorage.getItem("accessToken");
      if (token) await fetchProfile(token);
    } catch (err) {
      showToast(err.message || "KYC submission failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

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
  const cardBox = {
    background: colors.NAVY,
    border: `1px solid ${colors.BORDER}`,
    borderRadius: 14,
    padding: 24,
  };
  const fileInputStyle = {
    padding: "12px",
    background: colors.NAVY2,
    border: `1px solid ${colors.BORDER}`,
    borderRadius: 8,
    color: colors.LIGHT,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    cursor: "pointer",
    width: "100%",
    boxSizing: "border-box",
  };

  const statusConfig = {
    not_submitted: {
      label: "Not Submitted",
      color: colors.MUTED,
      bg: "rgba(128,128,128,0.12)",
      icon: "○",
    },
    none: {
      label: "Not Submitted",
      color: colors.MUTED,
      bg: "rgba(128,128,128,0.12)",
      icon: "○",
    },
    pending: {
      label: "Under Review",
      color: colors.GOLD,
      bg: "rgba(201,168,76,0.12)",
      icon: "●",
    },
    approved: {
      label: "Verified",
      color: colors.GREEN,
      bg: "rgba(34,197,94,0.12)",
      icon: "✓",
    },
    rejected: {
      label: "Rejected",
      color: colors.RED,
      bg: "rgba(239,68,68,0.12)",
      icon: "✗",
    },
  };
  const sc = statusConfig[kycStatus] || statusConfig.not_submitted;

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <p style={{ color: colors.MUTED }}>Loading...</p>
      </div>
    );

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
        Identity Verification (KYC)
      </h2>
      <p
        style={{
          color: colors.MUTED,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          margin: "0 0 24px",
        }}
      >
        KYC is required before you can deposit or trade. Submit your documents
        for verification.
      </p>

      {/* Status Banner */}
      <div
        style={{
          ...cardBox,
          background: sc.bg,
          borderColor: sc.color + "44",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <span style={{ fontSize: 36 }}>{sc.icon}</span>
        <div>
          <p
            style={{
              margin: 0,
              color: sc.color,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            KYC Status: {sc.label}
          </p>
          <p
            style={{
              margin: "4px 0 0",
              color: colors.MUTED,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
            }}
          >
            {kycStatus === "none" &&
              "Submit your documents below to begin verification."}
            {kycStatus === "pending" &&
              "Your documents are being reviewed. This typically takes 1-24 hours."}
            {kycStatus === "approved" &&
              "Your identity is verified. You can deposit and trade freely."}
            {kycStatus === "rejected" &&
              "Your submission was rejected. Please resubmit with clearer documents."}
          </p>
        </div>
      </div>

      {/* Submission Form (show if not_submitted or rejected) */}
      {(kycStatus === "not_submitted" ||
        kycStatus === "none" ||
        kycStatus === "rejected") && (
        <div style={{ ...cardBox, padding: 32, marginBottom: 24 }}>
          <h3
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 24,
              fontWeight: 700,
              color: colors.LIGHT,
              margin: "0 0 20px",
            }}
          >
            Submit Documents
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>ID Type</label>
              <select
                value={idType}
                onChange={(e) => setIdType(e.target.value)}
                style={selectStyle}
              >
                <option value="national_id">National ID (NIN)</option>
                <option value="passport">International Passport</option>
                <option value="drivers_license">Driver's License</option>
              </select>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
                marginBottom: 20,
              }}
            >
              <div>
                <label style={labelStyle}>Document Number</label>
                <input
                  type="text"
                  placeholder="Enter document number"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Country of Issue</label>
                <input
                  type="text"
                  placeholder="e.g. Nigeria"
                  value={countryOfIssue}
                  onChange={(e) => setCountryOfIssue(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
                marginBottom: 20,
              }}
            >
              <div>
                <label style={labelStyle}>ID Front (required)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFrontFile(e.target.files[0])}
                  style={fileInputStyle}
                />
                {frontFile && (
                  <p
                    style={{
                      margin: "4px 0 0",
                      color: colors.GREEN,
                      fontSize: 11,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    ✓ {frontFile.name}
                  </p>
                )}
              </div>
              <div>
                <label style={labelStyle}>ID Back (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBackFile(e.target.files[0])}
                  style={fileInputStyle}
                />
                {backFile && (
                  <p
                    style={{
                      margin: "4px 0 0",
                      color: colors.GREEN,
                      fontSize: 11,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    ✓ {backFile.name}
                  </p>
                )}
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Selfie with ID (required)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelfieFile(e.target.files[0])}
                style={fileInputStyle}
              />
              {selfieFile && (
                <p
                  style={{
                    margin: "4px 0 0",
                    color: colors.GREEN,
                    fontSize: 11,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  ✓ {selfieFile.name}
                </p>
              )}
              <p
                style={{
                  margin: "6px 0 0",
                  color: colors.MUTED,
                  fontSize: 11,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Take a clear photo of yourself holding your ID document next to
                your face.
              </p>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Proof of Address (optional)</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setProofFile(e.target.files[0])}
                style={fileInputStyle}
              />
              {proofFile && (
                <p
                  style={{
                    margin: "4px 0 0",
                    color: colors.GREEN,
                    fontSize: 11,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  ✓ {proofFile.name}
                </p>
              )}
              <p
                style={{
                  margin: "6px 0 0",
                  color: colors.MUTED,
                  fontSize: 11,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Utility bill or bank statement dated within 3 months.
              </p>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: 10,
                border: "none",
                background: isSubmitting
                  ? colors.MUTED
                  : `linear-gradient(135deg, ${colors.GOLD}, #8B6914)`,
                color: "#fff",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15,
                fontWeight: 700,
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {isSubmitting ? "Submitting..." : "Submit KYC Documents"}
            </button>
          </form>
        </div>
      )}

      {/* Document History */}
      {documents.length > 0 && (
        <div style={cardBox}>
          <h3
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 22,
              fontWeight: 700,
              color: colors.LIGHT,
              margin: "0 0 16px",
            }}
          >
            Submission History
          </h3>
          {documents.map((doc, i) => {
            const docSc = statusConfig[doc.status] || statusConfig.none;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  background: colors.NAVY2,
                  borderRadius: 10,
                  border: `1px solid ${colors.BORDER}`,
                  marginBottom: 8,
                }}
              >
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
                    {doc.documentType?.replace("_", " ")}{" "}
                    {doc.documentNumber ? `(${doc.documentNumber})` : ""}
                  </p>
                  <p
                    style={{
                      margin: "2px 0 0",
                      color: colors.MUTED,
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 11,
                    }}
                  >
                    Submitted:{" "}
                    {new Date(
                      doc.createdAt || doc.submittedAt,
                    ).toLocaleDateString()}
                  </p>
                </div>
                <span
                  style={{
                    color: docSc.color,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "4px 10px",
                    borderRadius: 6,
                    background: docSc.bg,
                  }}
                >
                  {docSc.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
