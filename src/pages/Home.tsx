import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleTest = () => {
    navigate("/test");
  };

  const handlePractice = () => {
    console.log("Practice clicked");
    // TODO: Implement practice functionality
  };

  // Styles
  const container: React.CSSProperties = {
    minHeight: "calc(100vh - 70px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  };

  const title: React.CSSProperties = {
    fontSize: 48,
    fontWeight: 700,
    marginBottom: 60,
    color: "#2563eb",
  };

  const buttonContainer: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    width: "100%",
    maxWidth: 400,
  };

  const primaryButton: React.CSSProperties = {
    padding: "16px 32px",
    borderRadius: 8,
    border: "none",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontSize: 18,
    fontWeight: 600,
    transition: "background 0.2s",
  };

  return (
    <div style={container}>
      <h1 style={title}>{t("app.title")}</h1>

      <div style={buttonContainer}>
        <button
          style={primaryButton}
          onClick={handleTest}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#1d4ed8")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#2563eb")}
        >
          {t("app.test")}
        </button>

        <button
          style={primaryButton}
          onClick={handlePractice}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#1d4ed8")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#2563eb")}
        >
          {t("app.practice")}
        </button>
      </div>
    </div>
  );
}

