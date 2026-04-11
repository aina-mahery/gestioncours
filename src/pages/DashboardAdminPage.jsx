import { useTranslation } from "react-i18next";
import StatCard from "../components/StatCard";
import ChartPlaceholder from "../components/ChartPlaceholder";

export default function DashboardAdminPage() {
    const { t } = useTranslation();

    const stats = [
        { title: t("stats.courses"), value: 15 },
        { title: t("stats.revenue"), value: "2500€" },
        { title: t("stats.avgAttendance"), value: "88%" },
        { title: t("stats.users"), value: 200 }
    ];

    return (
        <div className="space-y-6">
            <section>
                <h1 className="text-2xl font-bold text-slate-900">{t("dashboard")}</h1>
                <p className="mt-1 text-slate-500">{t("defaultAdminView")}</p>
            </section>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((item) => (
                    <StatCard key={item.title} title={item.title} value={item.value} />
                ))}
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <ChartPlaceholder title={t("monthlyPayments")} />
                <ChartPlaceholder title={t("absenceRate")} />
            </section>
        </div>
    );
}