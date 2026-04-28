"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import frCommon from "../locales/fr/common.json";
import enCommon from "../locales/en/common.json";

const resources = {
  fr: { translation: frCommon },
  en: { translation: enCommon }
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: "fr",
    fallbackLng: "fr",
    interpolation: { escapeValue: false }
  });
}

export default i18n;
