"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../lib/api";
import CourseForm from "./CourseForm";
import WeeklyCalendar from "./WeeklyCalendar";
import CoursesFooter from "./CoursesFooter";

function getMonday(date) {
  const current = new Date(date);
  const day = current.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  current.setDate(current.getDate() + diff);
  current.setHours(0, 0, 0, 0);
  return current;
}

function formatISODate(date) {
  return date.toISOString().split("T")[0];
}

export default function CoursesPageClient() {
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [refreshKey, setRefreshKey] = useState(0);

  const weekLabel = useMemo(() => {
    const start = new Date(weekStart);
    const end = new Date(weekStart);
    end.setDate(start.getDate() + 6);
    return `${start.toLocaleDateString("fr-FR")} - ${end.toLocaleDateString("fr-FR")}`;
  }, [weekStart]);

  async function loadCours() {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      params.set("date", formatISODate(weekStart));
      params.set("page", "1");
      params.set("limit", "100");
      const data = await apiFetch(`/api/cours?${params.toString()}`);
      setCours(data.items || []);
    } catch (err) {
      setError(err.message || "Erreur lors du chargement des cours.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCours(); }, [weekStart, refreshKey]);

  async function handleCreateCourse(payload) {
    await apiFetch("/api/cours", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setMessage("Cours créé avec succès.");
    setRefreshKey((prev) => prev + 1);
  }

  async function handleMoveSession({ coursId, sessionId, dayOfWeek, startHour, endHour }) {
    const previous = structuredClone(cours);
    setCours((prev) => prev.map((course) => course.id !== coursId ? course : ({ ...course, planning: (course.planning || []).map((entry) => entry.sessionId === sessionId ? { ...entry, dayOfWeek, startHour, endHour } : entry) })));
    try {
      await apiFetch(`/api/cours/${coursId}/planning`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId, dayOfWeek, startHour, endHour }) });
      setMessage("Planning mis à jour en temps réel.");
    } catch (err) {
      setCours(previous);
      setError(err.message || "Erreur lors du déplacement du bloc.");
    }
  }

  async function handleDeleteCourse(coursId) {
    const confirmed = window.confirm("Voulez-vous vraiment supprimer ce cours ?");
    if (!confirmed) return;
    try {
      await apiFetch(`/api/cours/${coursId}`, { method: "DELETE" });
      setMessage("Cours supprimé avec succès.");
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      setError(err.message || "Erreur lors de la suppression du cours.");
    }
  }

  return (
    <section className="space-y-6" aria-labelledby="cours-title">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 id="cours-title" className="text-2xl font-bold text-slate-900">Gestion des Cours</h2>
            <p className="mt-2 text-sm text-slate-600">Création des cours, visualisation sur calendrier hebdomadaire et déplacement des sessions par drag-and-drop.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setWeekStart((prev) => { const d = new Date(prev); d.setDate(d.getDate() - 7); return d; })} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Semaine précédente</button>
            <button type="button" onClick={() => setWeekStart(getMonday(new Date()))} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Cette semaine</button>
            <button type="button" onClick={() => setWeekStart((prev) => { const d = new Date(prev); d.setDate(d.getDate() + 7); return d; })} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Semaine suivante</button>
          </div>
        </div>
        <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">Semaine affichée : {weekLabel}</div>
      </div>
      <CourseForm onSubmit={handleCreateCourse} />
      {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <WeeklyCalendar cours={cours} weekStart={weekStart} loading={loading} onMoveSession={handleMoveSession} onDeleteCourse={handleDeleteCourse} />
      <CoursesFooter />
    </section>
  );
}
