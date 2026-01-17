import React from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./components/LanguageSwitcher";

export default function App() {
  const { t } = useTranslation();
  const handleLogin = () => {
    console.log("Login clicked");
    // TODO: Implement login functionality
  };

  const handleTest = () => {
    console.log("Test clicked");
    // TODO: Implement test functionality
  };

  const handlePractice = () => {
    console.log("Practice clicked");
    // TODO: Implement practice functionality
  };

  // Styles
  const container: React.CSSProperties = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    position: "relative",
  };

  const loginButton: React.CSSProperties = {
    position: "absolute",
    top: 20,
    right: 20,
    padding: "10px 20px",
    borderRadius: 6,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontSize: 16,
    fontWeight: 500,
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
      <LanguageSwitcher />

      <button style={loginButton} onClick={handleLogin}>
        {t("app.login")}
      </button>

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
