import { useTranslation } from "react-i18next";

export default function ChartPlaceholder({ title }) {
    const { t } = useTranslation();

    return (
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>

            <div className="mt-4 flex h-72 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500">
                <span>{t("chartPlaceholder")}</span>
            </div>
        </section>
    );
}