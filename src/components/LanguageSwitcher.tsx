import React from "react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "he" : "en";
    i18n.changeLanguage(newLang);
    localStorage.setItem("language", newLang);
    document.documentElement.dir = newLang === "he" ? "rtl" : "ltr";
  };

  React.useEffect(() => {
    document.documentElement.dir = i18n.language === "he" ? "rtl" : "ltr";
  }, [i18n.language]);

  const buttonStyle: React.CSSProperties = {
    position: "absolute",
    top: 20,
    left: 20,
    padding: "10px 20px",
    borderRadius: 6,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontSize: 16,
    fontWeight: 500,
  };

  return (
    <button onClick={toggleLanguage} style={buttonStyle}>
      {i18n.language === "en" ? "עברית" : "English"}
    </button>
  );
};

export default LanguageSwitcher;

