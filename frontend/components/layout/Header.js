"use client";

import { useTranslation } from "react-i18next";
import i18n from "../../lib/i18n";
import { Search, Globe, UserCircle2 } from "lucide-react";

export default function Header() {
  const { t } = useTranslation();
  const changeLanguage = (event) => i18n.changeLanguage(event.target.value);

  return (
    <header className="fixed left-20 right-0 top-0 z-30 h-[4.5rem] border-b border-slate-200 bg-white/95 backdrop-blur sm:left-72" role="banner">
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6">
        <div className="relative w-full max-w-md">
          <label htmlFor="search" className="sr-only">{t("header.search")}</label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input id="search" type="search" placeholder={t("header.searchPlaceholder")} className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-600 focus:bg-white focus:outline-none" />
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 sm:flex">
            <Globe className="h-4 w-4 text-slate-500" aria-hidden="true" />
            <label htmlFor="language" className="sr-only">{t("header.language")}</label>
            <select id="language" onChange={changeLanguage} defaultValue={i18n.language} className="bg-transparent text-sm text-slate-700 focus:outline-none" aria-label={t("header.language")}>
              <option value="fr">FR</option>
              <option value="en">EN</option>
            </select>
          </div>
          <button type="button" className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50" aria-label={t("header.profile")}>
            <UserCircle2 className="h-5 w-5" aria-hidden="true" />
            <span className="hidden sm:inline">{t("header.profile")}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
