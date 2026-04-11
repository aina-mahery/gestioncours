import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
    const { t, i18n } = useTranslation();
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "admin@gestioncours.pro",
        password: "password123",
        role: "admin"
    });

    const [error, setError] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleLanguageSwitch = () => {
        const nextLang = i18n.language === "fr" ? "en" : "fr";
        i18n.changeLanguage(nextLang);
        localStorage.setItem("lang", nextLang);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        try {
            await login(form);
            navigate("/", { replace: true });
        } catch (err) {
            setError("Impossible de se connecter.");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200 sm:p-8">
                <div className="mb-6 flex items-start justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold text-indigo-600">Frontend Base</p>
                        <h1 className="mt-1 text-2xl font-bold text-slate-900">
                            {t("loginTitle")}
                        </h1>
                        <p className="mt-2 text-sm text-slate-500">{t("demoCredentials")}</p>
                    </div>

                    <button
                        type="button"
                        onClick={handleLanguageSwitch}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                        aria-label={t("switchLanguage")}
                    >
                        {i18n.language === "fr" ? "EN" : "FR"}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div>
                        <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                            {t("email")}
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-indigo-500"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
                            {t("password")}
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            value={form.password}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-indigo-500"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="role" className="mb-1 block text-sm font-medium text-slate-700">
                            {t("roleSimulation")}
                        </label>
                        <select
                            id="role"
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-indigo-500"
                        >
                            <option value="admin">{t("admin")}</option>
                            <option value="teacher">{t("teacher")}</option>
                            <option value="student">{t("student")}</option>
                        </select>
                    </div>

                    {error && (
                        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {loading ? "..." : t("signIn")}
                    </button>
                </form>
            </div>
        </div>
    );
}