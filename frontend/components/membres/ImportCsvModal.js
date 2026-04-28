"use client";

import { useState } from "react";

export default function ImportCsvModal({ open, onClose, onImport }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file) {
      setError("Veuillez sélectionner un fichier CSV.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      setResultMessage("");
      const result = await onImport(file);
      setResultMessage(`Import réussi : ${result.importedCount} membre(s) ajouté(s), ${result.skippedCount} ignoré(s).`);
    } catch (err) {
      setError(err.message || "Erreur lors de l'import CSV.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-slate-900">Importer des membres via CSV</h3>
          <p className="mt-2 text-sm text-slate-600">Format attendu : <strong>nom,email,role,statut</strong></p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="csv-file" className="mb-2 block text-sm font-medium text-slate-700">Fichier CSV</label>
            <input id="csv-file" type="file" accept=".csv,text/csv" onChange={(event) => setFile(event.target.files?.[0] || null)} className="block w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm text-slate-700" />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold">Exemple :</p>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs">{`nom,email,role,statut\nJean Dupont,jean@ecole.fr,eleve,actif\nMarie Rabe,marie@ecole.fr,formateur,actif`}</pre>
          </div>
          {resultMessage ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{resultMessage}</div> : null}
          {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Fermer</button>
            <button type="submit" disabled={loading} className="rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">{loading ? "Import en cours..." : "Lancer l'import"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
