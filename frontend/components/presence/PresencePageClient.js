"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { apiDownload, apiFetch } from "../../lib/api";
import TrainerPresence from "./TrainerPresence";
import AdminPresenceDashboard from "./AdminPresenceDashboard";

export default function PresencePageClient() {
  const [sessionId, setSessionId] = useState("1-s1");
  const [coursId, setCoursId] = useState("1");
  const [students, setStudents] = useState([]);
  const [qrPayload, setQrPayload] = useState("");
  const [reports, setReports] = useState({ tauxMoyen: 0, details: [] });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadRoster() {
    try {
      const data = await apiFetch(`/api/presence/session/${sessionId}/roster`);
      setStudents(data.items || []);
    } catch (err) {
      setError(err.message || "Erreur lors du chargement de la session.");
    }
  }

  async function loadReports() {
    try {
      const data = await apiFetch(`/api/presence/rapports?coursId=${coursId}`);
      setReports(data);
    } catch (err) {
      setError(err.message || "Erreur lors du chargement des rapports.");
    }
  }

  useEffect(() => {
    loadRoster();
    loadReports();
  }, [sessionId, coursId]);

  async function handleGenerateQr() {
    try {
      const data = await apiFetch(`/api/presence/generate-qr/${sessionId}`, { method: "POST" });
      setQrPayload(data.payload);
      setMessage("QR généré avec succès.");
    } catch (err) {
      setError(err.message || "Erreur lors de la génération du QR.");
    }
  }

  async function handleScan(payload) {
    try {
      const [payloadSessionId, token] = payload.split("|");
      if (!payloadSessionId || !token) {
        setError("Format QR invalide.");
        return;
      }
      if (payloadSessionId !== sessionId) {
        setError("Ce QR ne correspond pas à la session sélectionnée.");
        return;
      }
      const firstStudent = students[0];
      if (!firstStudent) return;
      await apiFetch(`/api/presence/${firstStudent.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ qrToken: token, statut: "present" }) });
      setMessage("Présence validée via scan.");
      await loadRoster();
      await loadReports();
    } catch (err) {
      setError(err.message || "Erreur lors du scan.");
    }
  }

  async function handleManualUpdate(student, statut) {
    try {
      await apiFetch(`/api/presence/${student.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ statut }) });
      setMessage("Présence mise à jour manuellement.");
      await loadRoster();
      await loadReports();
    } catch (err) {
      setError(err.message || "Erreur lors de la mise à jour manuelle.");
    }
  }

  function exportCSV() {
    const rows = ["Nom,Taux"]; 
    reports.details.forEach((d) => rows.push(`${d.nom},${d.taux}`));
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "presence.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function exportPDFClient() {
    const doc = new jsPDF();
    doc.text("Rapport de présence", 10, 10);
    doc.text(`Taux moyen : ${reports.tauxMoyen}%`, 10, 20);
    reports.details.forEach((d, i) => doc.text(`${d.nom} : ${d.taux}%`, 10, 30 + i * 10));
    doc.save("presence.pdf");
  }

  return (
    <section className="space-y-6" aria-labelledby="presence-title">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 id="presence-title" className="text-2xl font-bold text-slate-900">Module Présence</h2>
            <p className="mt-2 text-sm text-slate-600">Scanner QR, gestion manuelle et statistiques administratives.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={sessionId} onChange={(e) => setSessionId(e.target.value)} placeholder="Session ID" className="rounded-2xl border border-slate-300 px-4 py-2.5 text-sm" />
            <input value={coursId} onChange={(e) => setCoursId(e.target.value)} placeholder="Cours ID" className="rounded-2xl border border-slate-300 px-4 py-2.5 text-sm" />
          </div>
        </div>
      </div>
      {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <TrainerPresence students={students} sessionId={sessionId} qrPayload={qrPayload} onGenerateQr={handleGenerateQr} onScan={handleScan} onManualUpdate={handleManualUpdate} />
      <AdminPresenceDashboard data={reports.details || []} taux={reports.tauxMoyen || 0} />
      <div className="no-print rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={exportCSV} className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Exporter CSV (client)</button>
          <button type="button" onClick={exportPDFClient} className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Exporter PDF (client)</button>
          <button type="button" onClick={() => apiDownload(`/api/presence/rapports/csv?coursId=${coursId}`, "presence-backend.csv")} className="rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700">CSV backend</button>
          <button type="button" onClick={() => apiDownload(`/api/presence/rapports/pdf?coursId=${coursId}`, "presence-backend.pdf")} className="rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700">PDF backend</button>
        </div>
      </div>
    </section>
  );
}
