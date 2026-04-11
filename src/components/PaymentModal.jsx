import { useEffect, useMemo, useState } from "react";
import { calculateTuition } from "../data/mockFees";

const CASH_DENOMINATIONS = [20000, 10000, 5000, 2000, 1000, 500, 200, 100];

function getInitialCashBreakdown() {
    return CASH_DENOMINATIONS.reduce((acc, value) => {
        acc[value] = "";
        return acc;
    }, {});
}

export default function PaymentModal({
    isOpen,
    record,
    onClose,
    onSubmit,
    loading
}) {
    const [form, setForm] = useState({
        method: "cash",
        amount: "",
        isLoyal: false,
        phoneNumber: "",
        transactionReference: "",
        cashBreakdown: getInitialCashBreakdown()
    });

    const [quote, setQuote] = useState({
        baseAmount: 500,
        discountRate: 0,
        discountAmount: 0,
        finalTotal: 500
    });

    const [quoteEndpoint, setQuoteEndpoint] = useState("/api/ecolage/calcul");
    const [quoteLoading, setQuoteLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isOpen || !record) {
            return;
        }

        setForm({
            method: "cash",
            amount: record.balance > 0 ? String(record.balance) : "0",
            isLoyal: Boolean(record.isLoyal),
            phoneNumber: record.phone || "",
            transactionReference: "",
            cashBreakdown: getInitialCashBreakdown()
        });

        setError("");
    }, [isOpen, record]);

    useEffect(() => {
        if (!isOpen) return;

        let mounted = true;

        async function runCalculation() {
            setQuoteLoading(true);

            try {
                const response = await calculateTuition({ isLoyal: form.isLoyal });

                if (mounted) {
                    setQuote(response.data);
                    setQuoteEndpoint(response.endpoint);
                }
            } finally {
                if (mounted) {
                    setQuoteLoading(false);
                }
            }
        }

        runCalculation();

        return () => {
            mounted = false;
        };
    }, [form.isLoyal, isOpen]);

    const computedBalance = useMemo(() => {
        if (!record) return 0;

        const paidAmount = Math.min(record.paidAmount, quote.finalTotal);
        return Math.max(quote.finalTotal - paidAmount, 0);
    }, [quote.finalTotal, record]);

    const computedCashTotal = useMemo(() => {
        return CASH_DENOMINATIONS.reduce((sum, denomination) => {
            const quantity = Number(form.cashBreakdown[denomination] || 0);
            return sum + denomination * quantity;
        }, 0);
    }, [form.cashBreakdown]);

    useEffect(() => {
        if (form.method === "cash") {
            setForm((prev) => ({
                ...prev,
                amount: String(computedCashTotal)
            }));
        }
    }, [computedCashTotal, form.method]);

    if (!isOpen || !record) {
        return null;
    }

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleCashChange = (denomination, value) => {
        const sanitized = value.replace(/[^\d]/g, "");

        setForm((prev) => ({
            ...prev,
            cashBreakdown: {
                ...prev.cashBreakdown,
                [denomination]: sanitized
            }
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        const amountNumber = Number(form.amount);

        if (amountNumber <= 0) {
            setError("Veuillez saisir un montant strictement positif.");
            return;
        }

        if (amountNumber > computedBalance) {
            setError("Le montant dépasse le solde restant.");
            return;
        }

        if (form.method === "mobileMoney") {
            if (!form.phoneNumber.trim()) {
                setError("Le numéro de téléphone Mobile Money est requis.");
                return;
            }

            if (!form.transactionReference.trim()) {
                setError("La référence de transaction est requise.");
                return;
            }
        }

        if (form.method === "cash") {
            if (computedCashTotal <= 0) {
                setError("Veuillez renseigner le billetage.");
                return;
            }
        }

        try {
            await onSubmit({
                ...form,
                amount: amountNumber
            });
        } catch (err) {
            setError(err.message || "Une erreur est survenue.");
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-modal-title"
        >
            <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <h2 id="payment-modal-title" className="text-xl font-bold text-slate-900">
                            Encaisser un paiement
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {record.studentName} — {record.courseName}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
                    >
                        Fermer
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        {/* Résumé financier */}
                        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                            <h3 className="text-sm font-semibold text-slate-900">
                                Résumé financier
                            </h3>

                            <div className="mt-4 space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Montant de base</span>
                                    <span className="font-medium text-slate-900">{quote.baseAmount} €</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Réduction fidélité</span>
                                    <span className="font-medium text-emerald-700">
                                        -{quote.discountAmount} €
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Déjà payé</span>
                                    <span className="font-medium text-slate-900">
                                        {Math.min(record.paidAmount, quote.finalTotal)} €
                                    </span>
                                </div>

                                <div className="border-t border-slate-200 pt-3">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-slate-900">Montant total</span>
                                        <span className="font-bold text-slate-900">{quote.finalTotal} €</span>
                                    </div>

                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="font-semibold text-slate-900">Solde</span>
                                        <span className="font-bold text-amber-600">{computedBalance} €</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 rounded-xl bg-white px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-200">
                                <span className="font-semibold">Mock API :</span> {quoteEndpoint}
                                {quoteLoading ? " — calcul en cours..." : ""}
                            </div>
                        </div>

                        {/* Méthode de paiement */}
                        <div className="space-y-4">
                            <div>
                                <p className="mb-2 text-sm font-medium text-slate-700">
                                    Méthode de paiement
                                </p>

                                <div className="grid grid-cols-2 gap-3">
                                    <label
                                        className={`cursor-pointer rounded-2xl border px-4 py-3 text-sm font-medium transition ${form.method === "cash"
                                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                            : "border-slate-300 bg-white text-slate-700"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="method"
                                            value="cash"
                                            checked={form.method === "cash"}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        Cash
                                    </label>

                                    <label
                                        className={`cursor-pointer rounded-2xl border px-4 py-3 text-sm font-medium transition ${form.method === "mobileMoney"
                                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                            : "border-slate-300 bg-white text-slate-700"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="method"
                                            value="mobileMoney"
                                            checked={form.method === "mobileMoney"}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        Mobile Money
                                    </label>
                                </div>
                            </div>

                            {/* Mobile Money */}
                            {form.method === "mobileMoney" && (
                                <div className="rounded-2xl border border-slate-200 p-4 space-y-4">
                                    <div>
                                        <label
                                            htmlFor="phoneNumber"
                                            className="mb-1 block text-sm font-medium text-slate-700"
                                        >
                                            Numéro de téléphone
                                        </label>
                                        <input
                                            id="phoneNumber"
                                            name="phoneNumber"
                                            type="tel"
                                            value={form.phoneNumber}
                                            onChange={handleChange}
                                            placeholder="+261 34 00 000 00"
                                            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="transactionReference"
                                            className="mb-1 block text-sm font-medium text-slate-700"
                                        >
                                            Référence transaction
                                        </label>
                                        <input
                                            id="transactionReference"
                                            name="transactionReference"
                                            type="text"
                                            value={form.transactionReference}
                                            onChange={handleChange}
                                            placeholder="MM-TRX-2026-0001"
                                            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="amount"
                                            className="mb-1 block text-sm font-medium text-slate-700"
                                        >
                                            Montant à payer
                                        </label>
                                        <input
                                            id="amount"
                                            name="amount"
                                            type="number"
                                            min="0"
                                            max={computedBalance}
                                            step="1"
                                            value={form.amount}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Cash */}
                            {form.method === "cash" && (
                                <div className="rounded-2xl border border-slate-200 p-4">
                                    <div className="mb-4">
                                        <h3 className="text-sm font-semibold text-slate-900">Billetage</h3>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Saisissez le nombre de billets / pièces par coupure.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                        {CASH_DENOMINATIONS.map((denomination) => (
                                            <div key={denomination}>
                                                <label className="mb-1 block text-xs font-medium text-slate-600">
                                                    {denomination}
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={form.cashBreakdown[denomination]}
                                                    onChange={(event) =>
                                                        handleCashChange(denomination, event.target.value)
                                                    }
                                                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500"
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-600">Montant calculé</span>
                                            <span className="text-lg font-bold text-slate-900">
                                                {computedCashTotal} €
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Fidélité */}
                            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                                <input
                                    type="checkbox"
                                    name="isLoyal"
                                    checked={form.isLoyal}
                                    onChange={handleChange}
                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Élève fidèle</p>
                                    <p className="text-xs text-slate-500">
                                        Applique automatiquement une réduction de 10%.
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Annuler
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {loading ? "..." : "Confirmer le paiement"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}