"use client";

import { useState } from "react";

export default function TrainerPresence({ students, sessionId, qrPayload, onGenerateQr, onScan, onManualUpdate }) {
  const [scanInput, setScanInput] = useState("");

  async function handleScanSubmit(event) {
    event.preventDefault();
    if (!scanInput.trim()) return;
    await onScan(scanInput.trim());
    setScanInput("");
  }

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-bold">Vue Formateur — Scanner QR</h3>
          <p className="mt-2 text-sm text-slate-600">Prêt pour une version mobile / React Native : la zone ci-dessous peut être remplacée par un vrai scanner caméra.</p>
        </div>
        <button type="button" onClick={onGenerateQr} className="rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700">Générer QR</button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm text-slate-600">Session : <strong>{sessionId}</strong></p>
        <p className="mt-2 text-xs break-all text-slate-500">Payload QR : {qrPayload || "Aucun QR généré"}</p>
      </div>

      <form onSubmit={handleScanSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input value={scanInput} onChange={(e) => setScanInput(e.target.value)} placeholder="Colle ici le payload scanné (sessionId|token)" className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none" />
        <button type="submit" className="rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700">Valider le scan</button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-slate-50">
            <tr className="text-left text-sm text-slate-600">
              <th className="px-4 py-3 font-semibold">Nom</th>
              <th className="px-4 py-3 font-semibold">Statut</th>
              <th className="px-4 py-3 font-semibold">Heure</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-t border-slate-200 text-sm text-slate-700">
                <td className="px-4 py-3 font-medium text-slate-900">{student.nom}</td>
                <td className="px-4 py-3">
                  <select value={student.statut} onChange={(e) => onManualUpdate(student, e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none">
                    <option value="present">Présent</option>
                    <option value="retard">Retard</option>
                    <option value="absent">Absent</option>
                  </select>
                </td>
                <td className="px-4 py-3">{student.scanTime ? new Date(student.scanTime).toLocaleTimeString("fr-FR") : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
