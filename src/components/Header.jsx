import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

export default function Header({ onToggleSidebar }) {
    const { t, i18n } = useTranslation();
    const { user, logout } = useAuth();

    const switchLanguage = () => {
        const nextLang = i18n.language === "fr" ? "en" : "fr";
        i18n.changeLanguage(nextLang);
        localStorage.setItem("lang", nextLang);
    };

    return (
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="flex items-center gap-3 px-4 py-3 lg:px-6">
                <button
                    type="button"
                    onClick={onToggleSidebar}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 lg:hidden"
                    aria-label={t("openMenu")}
                >
                    ☰
                </button>

                <div className="flex items-center gap-3">
                    <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold"
                        aria-label={t("logoAlt")}
                    >
                        G
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-sm text-slate-500">Centre de formation</p>
                        <h1 className="text-lg font-bold">{t("appName")}</h1>
                    </div>
                </div>

                <div className="ml-auto flex w-full max-w-xl items-center md:ml-6">
                    <label htmlFor="global-search" className="sr-only">
                        {t("search")}
                    </label>
                    <input
                        id="global-search"
                        type="search"
                        placeholder={t("search")}
                        className="hidden w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 md:block"
                    />
                </div>

                <div className="ml-auto flex items-center gap-2">
                    <button
                        type="button"
                        onClick={switchLanguage}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                        aria-label={t("switchLanguage")}
                    >
                        {i18n.language === "fr" ? "EN" : "FR"}
                    </button>

                    <div
                        className="hidden rounded-2xl border border-slate-200 px-3 py-2 sm:block"
                        aria-label={t("profile")}
                    >
                        <p className="text-sm font-medium text-slate-900">{user?.email}</p>
                        <p className="text-xs text-slate-500">{user?.role}</p>
                    </div>

                    <button
                        type="button"
                        onClick={logout}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                    >
                        {t("logout")}
                    </button>
                </div>
            </div>
        </header>
    );
}