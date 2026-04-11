import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import PaymentModal from "../components/PaymentModal";
import {
    getFeesRecords,
    getRecoveryChartData,
    payTuition,
    sendReminder
} from "../data/mockFees";

function getStatusClasses(status) {
    if (status === "paid") {
        return "bg-emerald-100 text-emerald-700";
    }

    if (status === "partial") {
        return "bg-amber-100 text-amber-700";
    }

    return "bg-red-100 text-red-700";
}

export default function FeesPage() {
    const { t } = useTranslation();

    const [records, setRecords] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [notice, setNotice] = useState("");
    const [endpoint, setEndpoint] = useState("/api/ecolages");
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const totals = useMemo(() => {
        return records.reduce(
            (acc, item) => {
                acc.total += item.totalAmount;
                acc.paid += item.paidAmount;
                acc.balance += item.balance;
                return acc;
            },
            { total: 0, paid: 0, balance: 0 }
        );
    }, [records]);

    const statusLabelMap = useMemo(
        () => ({
            paid: t("fees.status.paid"),
            partial: t("fees.status.partial"),
            unpaid: t("fees.status.unpaid")
        }),
        [t]
    );

    const loadFeesPage = async () => {
        setLoading(true);

        try {
            const [recordsResponse, chartResponse] = await Promise.all([
                getFeesRecords(),
                getRecoveryChartData()
            ]);

            setRecords(recordsResponse.data);
            setChartData(chartResponse.data);
            setEndpoint(recordsResponse.endpoint);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFeesPage();
    }, []);

    const openPaymentModal = (record) => {
        setSelectedRecord(record);
        setIsPaymentModalOpen(true);
    };

    const closePaymentModal = () => {
        setSelectedRecord(null);
        setIsPaymentModalOpen(false);
    };

    const handlePaymentSubmit = async (paymentData) => {
        if (!selectedRecord) return;

        setActionLoading(true);

        try {
            const response = await payTuition(selectedRecord.id, paymentData);

            setRecords((prev) =>
                prev.map((item) => (item.id === selectedRecord.id ? response.data : item))
            );

            setEndpoint(response.endpoint);
            setNotice(`${t("fees.messages.paymentSuccess")} (${response.endpoint})`);
            closePaymentModal();
        } catch (error) {
            throw error;
        } finally {
            setActionLoading(false);
        }
    };

    const handleGeneratePdf = async (record) => {
        setActionLoading(true);

        try {
            const { jsPDF } = await import("jspdf");

            const doc = new jsPDF();

            doc.setFontSize(18);
            doc.text("GestionCours Pro - Facture", 20, 20);

            doc.setFontSize(11);
            doc.text(`Élève : ${record.studentName}`, 20, 40);
            doc.text(`Cours : ${record.courseName}`, 20, 50);
            doc.text(`Montant total : ${record.totalAmount} €`, 20, 60);
            doc.text(`Payé : ${record.paidAmount} €`, 20, 70);
            doc.text(`Solde : ${record.balance} €`, 20, 80);
            doc.text(`Statut : ${statusLabelMap[record.status]}`, 20, 90);

            doc.save(`facture-${record.studentName.replace(/\s+/g, "-").toLowerCase()}.pdf`);

            setEndpoint("/api/ecolages/facture/pdf");
            setNotice(t("fees.messages.pdfGenerated"));
        } catch (error) {
            setEndpoint("/api/ecolages/facture/pdf");
            setNotice(t("fees.messages.pdfFallback"));
        } finally {
            setActionLoading(false);
        }
    };

    const handleSendReminder = async (record) => {
        setActionLoading(true);

        try {
            const response = await sendReminder(record.id);
            setEndpoint(response.endpoint);
            setNotice(`${response.data.message} (${response.endpoint})`);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{t("fees.title")}</h1>
                        <p className="mt-1 text-slate-500">{t("fees.description")}</p>
                    </div>

                    <div
                        className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-200"
                        aria-live="polite"
                    >
                        <span className="font-semibold">Mock API :</span> {endpoint}
                    </div>
                </div>

                {notice && (
                    <div
                        className="mt-4 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-700"
                        role="status"
                        aria-live="polite"
                    >
                        {notice}
                    </div>
                )}
            </section>

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                    <p className="text-sm text-slate-500">{t("fees.summary.total")}</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">{totals.total} €</p>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                    <p className="text-sm text-slate-500">{t("fees.summary.paid")}</p>
                    <p className="mt-2 text-3xl font-bold text-emerald-600">{totals.paid} €</p>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                    <p className="text-sm text-slate-500">{t("fees.summary.balance")}</p>
                    <p className="mt-2 text-3xl font-bold text-amber-600">{totals.balance} €</p>
                </div>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                        {t("fees.chart.title")}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        {t("fees.chart.description")}
                    </p>
                </div>

                {loading ? (
                    <div className="flex h-80 items-center justify-center text-slate-500">
                        {t("fees.loading")}
                    </div>
                ) : (
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} barSize={36}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis domain={[0, 100]} unit="%" />
                                <Tooltip formatter={(value) => [`${value}%`, t("fees.chart.recoveryRate")]} />
                                <Legend />
                                <Bar
                                    dataKey="rate"
                                    name={t("fees.chart.recoveryRate")}
                                    radius={[10, 10, 0, 0]}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`${entry.month}-${index}`}
                                            fill={entry.rate >= 85 ? "#10b981" : entry.rate >= 75 ? "#6366f1" : "#f59e0b"}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </section>

            <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-left text-sm text-slate-600">
                                <th className="px-4 py-3 font-semibold">{t("fees.student")}</th>
                                <th className="px-4 py-3 font-semibold">{t("fees.course")}</th>
                                <th className="px-4 py-3 font-semibold">{t("fees.totalAmount")}</th>
                                <th className="px-4 py-3 font-semibold">{t("fees.paid")}</th>
                                <th className="px-4 py-3 font-semibold">{t("fees.balance")}</th>
                                <th className="px-4 py-3 font-semibold">{t("fees.statusLabel")}</th>
                                <th className="px-4 py-3 font-semibold">{t("fees.actions")}</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-10 text-center text-slate-500">
                                        {t("fees.loading")}
                                    </td>
                                </tr>
                            ) : records.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-10 text-center text-slate-500">
                                        {t("fees.noResults")}
                                    </td>
                                </tr>
                            ) : (
                                records.map((record) => (
                                    <tr key={record.id} className="border-b border-slate-100 last:border-b-0">
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-medium text-slate-900">{record.studentName}</p>
                                                <p className="text-xs text-slate-500">{record.email}</p>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-slate-600">{record.courseName}</td>

                                        <td className="px-4 py-3 font-medium text-slate-900">
                                            {record.totalAmount} €
                                        </td>

                                        <td className="px-4 py-3 font-medium text-emerald-600">
                                            {record.paidAmount} €
                                        </td>

                                        <td className="px-4 py-3 font-medium text-amber-600">
                                            {record.balance} €
                                        </td>

                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(record.status)}`}
                                            >
                                                {statusLabelMap[record.status]}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openPaymentModal(record)}
                                                    disabled={actionLoading}
                                                    className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                                                >
                                                    {t("fees.pay")}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleGeneratePdf(record)}
                                                    disabled={actionLoading}
                                                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                                                >
                                                    PDF
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleSendReminder(record)}
                                                    disabled={actionLoading}
                                                    className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-70"
                                                >
                                                    SMS/Email
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                record={selectedRecord}
                onClose={closePaymentModal}
                onSubmit={handlePaymentSubmit}
                loading={actionLoading}
            />
        </div>
    );
}