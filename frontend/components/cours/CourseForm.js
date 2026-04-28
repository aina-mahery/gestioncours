"use client";

import { useState } from "react";

const DAYS = [
  { label: "Lundi", value: 0 },
  { label: "Mardi", value: 1 },
  { label: "Mercredi", value: 2 },
  { label: "Jeudi", value: 3 },
  { label: "Vendredi", value: 4 },
  { label: "Samedi", value: 5 },
  { label: "Dimanche", value: 6 }
];

export default function CourseForm({ onSubmit }) {
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [duree, setDuree] = useState(3);
  const [jours, setJours] = useState([0, 2]);
  const [sessions, setSessions] = useState(12);
  const [horaire, setHoraire] = useState("14:00-17:00");
  const [capacite, setCapacite] = useState(15);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleDay(dayValue) {
    setJours((prev) => prev.includes(dayValue) ? prev.filter((item) => item !== dayValue) : [...prev, dayValue].sort((a, b) => a - b));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!jours.length) {
      setError("Veuillez sélectionner au moins un jour.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await onSubmit({ nom, description, duree: Number(duree), jours, sessions: Number(sessions), horaire, capacite: Number(capacite) });
      setNom(""); setDescription(""); setDuree(3); setJours([0, 2]); setSessions(12); setHoraire("14:00-17:00"); setCapacite(15);
    } catch (err) {
      setError(err.message || "Erreur lors de la création du cours.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" aria-label="Formulaire de création de cours">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900">Créer un cours</h3>
        <p className="mt-2 text-sm text-slate-600">Définis les informations du cours puis visualise-le immédiatement dans le calendrier.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">Nom</label>
          <input type="text" value={nom} onChange={(event) => setNom(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none" placeholder="Ex: React Avancé" required />
        </div>
        <div className="lg:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none" placeholder="Description du cours" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Durée (heures par séance)</label>
          <input type="number" min="1" max="12" value={duree} onChange={(event) => setDuree(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none" required />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Sessions (volume total)</label>
          <input type="number" min="1" value={sessions} onChange={(event) => setSessions(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none" required />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Horaire</label>
          <input type="text" value={horaire} onChange={(event) => setHoraire(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none" placeholder="Ex: 14:00-17:00" required />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Capacité</label>
          <input type="number" min="1" value={capacite} onChange={(event) => setCapacite(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none" required />
        </div>
        <div className="lg:col-span-2">
          <fieldset>
            <legend className="mb-3 block text-sm font-medium text-slate-700">Jours de la semaine</legend>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {DAYS.map((day) => (
                <label key={day.value} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <input type="checkbox" checked={jours.includes(day.value)} onChange={() => toggleDay(day.value)} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-600" />
                  {day.label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </div>
      {error ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <div className="mt-6 flex justify-end">
        <button type="submit" disabled={loading} className="rounded-2xl bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">{loading ? "Création..." : "Créer le cours"}</button>
      </div>
    </form>
  );
}
