import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslations from "./locales/en.json";
import heTranslations from "./locales/he.json";

const resources = {
  en: enTranslations,
  he: heTranslations,
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem("language") || "he",
    fallbackLng: "he",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

