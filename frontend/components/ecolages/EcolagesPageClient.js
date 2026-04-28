"use client";

import { useEffect, useState } from "react";
import { apiDownload, apiFetch } from "../../lib/api";
import FinanceTable from "./FinanceTable";
import RecoveryChart from "./RecoveryChart";

export default function EcolagesPageClient() {
  const [items, setItems] = useState([]);
  const [recovery, setRecovery] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());
      const data = await apiFetch(`/api/ecolage/dashboard?${params.toString()}`);
      setItems(data.items || []);
      setRecovery(data.recovery || []);
    } catch (err) {
      setError(err.message || "Erreur lors du chargement des données financières.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDashboard(); }, [statusFilter]);

  async function handleSearchSubmit(event) {
    event.preventDefault();
    await loadDashboard();
  }

  async function handlePayStripe(item) {
    try {
      setMessage("");
      setError("");
      const result = await apiFetch("/api/paiement/stripe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paiementId: item.id }) });
      if (result.mode === "stripe" && result.url) {
        window.open(result.url, "_blank", "noopener,noreferrer");
        setMessage("Session Stripe créée. Finalise le paiement dans la nouvelle fenêtre.");
      } else {
        setMessage("Paiement simulé avec succès.");
        await loadDashboard();
      }
    } catch (err) {
      setError(err.message || "Erreur lors du paiement Stripe.");
    }
  }

  async function handleDownloadPdf(item) {
    try {
      await apiDownload(`/api/ecolage/${item.id}/pdf`, `facture-${item.invoiceNumber || item.id}.pdf`);
      setMessage("Facture téléchargée.");
    } catch (err) {
      setError(err.message || "Erreur lors du téléchargement de la facture.");
    }
  }

  async function handleSendSms(item) {
    try {
      await apiFetch(`/api/ecolage/${item.id}/sms`, { method: "POST" });
      setMessage("Rappel SMS simulé avec succès.");
    } catch (err) {
      setError(err.message || "Erreur lors de l'envoi du SMS.");
    }
  }

  return (
    <section aria-labelledby="ecolages-title" className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 id="ecolages-title" className="text-2xl font-bold text-slate-900">Module Écolages</h2>
            <p className="mt-2 text-sm text-slate-600">Suivi des paiements, rappels, factures PDF et taux de recouvrement mensuel.</p>
          </div>
          <form onSubmit={handleSearchSubmit} className="grid gap-3 sm:grid-cols-3">
            <input type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher élève, email ou cours..." className="rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none" />
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none">
              <option value="">Tous statuts</option>
              <option value="paye">Payé</option>
              <option value="partiel">Partiel</option>
              <option value="impaye">Impayé</option>
            </select>
            <button type="submit" className="rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700">Rechercher</button>
          </form>
        </div>
      </div>
      {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <RecoveryChart data={recovery} />
      <FinanceTable items={items} loading={loading} onPayStripe={handlePayStripe} onDownloadPdf={handleDownloadPdf} onSendSms={handleSendSms} />
    </section>
  );
}
