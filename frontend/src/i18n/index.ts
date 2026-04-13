import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "./resources/en";
import { ru } from "./resources/ru";

export const defaultLanguage = "ru";

void i18n.use(initReactI18next).init({
  resources: {
    ru,
    en,
  },
  lng: defaultLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export { i18n };
