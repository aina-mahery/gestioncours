"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch, apiFormData } from "../../lib/api";
import MembersFilters from "./MembersFilters";
import MembersTable from "./MembersTable";
import ImportCsvModal from "./ImportCsvModal";
import EditMemberModal from "./EditMemberModal";

export default function MembersPageClient() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [statut, setStatut] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const filteredMembers = useMemo(() => !statut ? members : members.filter((member) => member.statut === statut), [members, statut]);

  async function loadMembers() {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (role) params.set("role", role);
      if (statut) params.set("statut", statut);
      const data = await apiFetch(`/api/membres?${params.toString()}`);
      setMembers(data.items || []);
    } catch (err) {
      setError(err.message || "Erreur lors du chargement des membres.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadMembers(); }, [role, statut]);

  async function handleSearchSubmit(event) {
    event.preventDefault();
    await loadMembers();
  }

  async function handleImportCsv(file) {
    const formData = new FormData();
    formData.append("file", file);
    const result = await apiFormData("/api/membres/import-csv", formData, { method: "POST" });
    setSuccessMessage(`Import terminé : ${result.importedCount} ajouté(s), ${result.skippedCount} ignoré(s).`);
    await loadMembers();
    return result;
  }

  async function handleSaveMember(formValues) {
    const formData = new FormData();
    if (formValues.nom) formData.append("nom", formValues.nom);
    if (formValues.email) formData.append("email", formValues.email);
    if (formValues.role) formData.append("role", formValues.role);
    if (formValues.statut) formData.append("statut", formValues.statut);
    if (formValues.solde !== undefined && formValues.solde !== null) formData.append("solde", String(formValues.solde));
    if (formValues.photoFile) formData.append("photo", formValues.photoFile);
    await apiFormData(`/api/membres/${formValues.id}`, formData, { method: "PATCH" });
    setSuccessMessage("Membre mis à jour avec succès.");
    setEditingMember(null);
    await loadMembers();
  }

  async function handleDeleteMember(memberId) {
    const confirmed = window.confirm("Voulez-vous vraiment supprimer ce membre ?");
    if (!confirmed) return;
    try {
      await apiFetch(`/api/membres/${memberId}`, { method: "DELETE" });
      setSuccessMessage("Membre supprimé avec succès.");
      await loadMembers();
    } catch (err) {
      setError(err.message || "Erreur lors de la suppression.");
    }
  }

  return (
    <section aria-labelledby="members-title" className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 id="members-title" className="text-2xl font-bold text-slate-900">Gestion des Membres</h2>
            <p className="mt-2 text-sm text-slate-600">Rechercher, filtrer, modifier et importer des membres.</p>
          </div>
          <button type="button" onClick={() => setImportOpen(true)} className="inline-flex items-center justify-center rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700">Importer un CSV</button>
        </div>
      </div>
      <MembersFilters search={search} setSearch={setSearch} role={role} setRole={setRole} statut={statut} setStatut={setStatut} onSubmit={handleSearchSubmit} onRefresh={loadMembers} />
      {successMessage ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700" role="status">{successMessage}</div> : null}
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</div> : null}
      <MembersTable members={filteredMembers} loading={loading} onEdit={setEditingMember} onDelete={handleDeleteMember} />
      <ImportCsvModal open={importOpen} onClose={() => setImportOpen(false)} onImport={handleImportCsv} />
      <EditMemberModal member={editingMember} onClose={() => setEditingMember(null)} onSave={handleSaveMember} />
    </section>
  );
}
