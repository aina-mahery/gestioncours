"use client";

import { useEffect, useState } from "react";

export default function EditMemberModal({ member, onClose, onSave }) {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("eleve");
  const [statut, setStatut] = useState("actif");
  const [solde, setSolde] = useState(0);
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!member) return;
    setNom(member.nom || "");
    setEmail(member.email || "");
    setRole(member.role || "eleve");
    setStatut(member.statut || "actif");
    setSolde(member.solde ?? 0);
    setPhotoFile(null);
    setError("");
  }, [member]);

  if (!member) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setLoading(true);
      setError("");
      await onSave({ id: member.id, nom, email, role, statut, solde, photoFile });
    } catch (err) {
      setError(err.message || "Erreur lors de la sauvegarde.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-slate-900">Éditer le membre</h3>
          <p className="mt-2 text-sm text-slate-600">Modifie les informations principales, la photo et le solde.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Nom</label>
              <input type="text" value={nom} onChange={(event) => setNom(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Rôle</label>
              <select value={role} onChange={(event) => setRole(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none">
                <option value="admin">Admin</option>
                <option value="formateur">Formateur</option>
                <option value="eleve">Élève</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Statut</label>
              <select value={statut} onChange={(event) => setStatut(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none">
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Solde</label>
              <input type="number" step="0.01" value={solde} onChange={(event) => setSolde(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Photo</label>
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setPhotoFile(event.target.files?.[0] || null)} className="block w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm" />
            </div>
          </div>
          {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Annuler</button>
            <button type="submit" disabled={loading} className="rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">{loading ? "Enregistrement..." : "Enregistrer"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
