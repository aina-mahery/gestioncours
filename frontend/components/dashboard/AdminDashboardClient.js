"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import SummaryCards from "./SummaryCards";
import AdminCharts from "./AdminCharts";

export default function AdminDashboardClient() {
  const [cards, setCards] = useState({ coursesCount: 0, totalRevenue: 0, averageAttendance: 0, activeUsers: 0 });
  const [charts, setCharts] = useState({ monthlyPayments: [], absenceRate: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const data = await apiFetch("/api/admin/dashboard");
        setCards(data.cards || {});
        setCharts(data.charts || {});
      } catch (err) {
        setError(err.message || "Erreur lors du chargement du dashboard.");
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">Chargement du dashboard...</div>;
  }

  return (
    <section className="space-y-6" aria-labelledby="dashboard-admin-title">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 id="dashboard-admin-title" className="text-2xl font-bold text-slate-900">Dashboard Admin</h2>
        <p className="mt-2 text-sm text-slate-600">Vue consolidée des cours, recettes, présence et utilisateurs actifs.</p>
      </div>
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <SummaryCards cards={cards} />
      <AdminCharts charts={charts} />
    </section>
  );
}
