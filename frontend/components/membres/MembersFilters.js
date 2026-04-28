"use client";

export default function MembersFilters({ search, setSearch, role, setRole, statut, setStatut, onSubmit, onRefresh }) {
  return (
    <form onSubmit={onSubmit} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm" aria-label="Filtres des membres">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="xl:col-span-2">
          <label htmlFor="search-members" className="mb-2 block text-sm font-medium text-slate-700">Recherche (Nom / Email)</label>
          <input id="search-members" type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Ex: Jean ou jean@ecole.fr" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-600 focus:outline-none" />
        </div>
        <div>
          <label htmlFor="role-filter" className="mb-2 block text-sm font-medium text-slate-700">Rôle</label>
          <select id="role-filter" value={role} onChange={(event) => setRole(event.target.value)} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-brand-600 focus:outline-none">
            <option value="">Tous</option>
            <option value="admin">Admin</option>
            <option value="formateur">Formateur</option>
            <option value="eleve">Élève</option>
          </select>
        </div>
        <div>
          <label htmlFor="status-filter" className="mb-2 block text-sm font-medium text-slate-700">Statut</label>
          <select id="status-filter" value={statut} onChange={(event) => setStatut(event.target.value)} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-brand-600 focus:outline-none">
            <option value="">Tous</option>
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button type="submit" className="w-full rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700">Rechercher</button>
          <button type="button" onClick={onRefresh} className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Actualiser</button>
        </div>
      </div>
    </form>
  );
}
