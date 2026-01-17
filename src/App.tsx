import React from "react";

export default function App() {
  const handleLogin = () => {
    console.log("Login clicked");
    // TODO: Implement login functionality
  };

  const handleTakeTest = () => {
    console.log("Take Test clicked");
    // TODO: Implement test functionality
  };

  const handleChooseProgress = () => {
    console.log("Choose Progress clicked");
    // TODO: Implement progress selection functionality
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
      <button style={loginButton} onClick={handleLogin}>
        Login
      </button>

      <h1 style={title}>Math Place</h1>

      <div style={buttonContainer}>
        <button
          style={primaryButton}
          onClick={handleTakeTest}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#1d4ed8")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#2563eb")}
        >
          Take Test
        </button>

        <button
          style={primaryButton}
          onClick={handleChooseProgress}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#1d4ed8")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#2563eb")}
        >
          Choose Progress
        </button>
      </div>
    </div>
  );
}
