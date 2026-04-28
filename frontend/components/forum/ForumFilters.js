"use client";

export default function ForumFilters({ scope, setScope, coursId, setCoursId, courses, searchKeyword, setSearchKeyword, onSearch }) {
  return (
    <form onSubmit={onSearch} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm" aria-label="Filtres forum">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Espace</label>
          <select value={scope} onChange={(event) => setScope(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none">
            <option value="global">Global</option>
            <option value="course">Par cours</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Cours</label>
          <select value={coursId} onChange={(event) => setCoursId(event.target.value)} disabled={scope !== "course"} className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none disabled:bg-slate-100">
            <option value="">Sélectionner</option>
            {courses.map((course) => <option key={course.id} value={course.id}>{course.nom}</option>)}
          </select>
        </div>
        <div className="xl:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">Recherche par mots-clés</label>
          <div className="flex gap-2">
            <input type="text" value={searchKeyword} onChange={(event) => setSearchKeyword(event.target.value)} placeholder="Ex: React, planning, paiement..." className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none" />
            <button type="submit" className="rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700">Rechercher</button>
          </div>
        </div>
      </div>
    </form>
  );
}
