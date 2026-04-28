"use client";

import { useEffect, useState } from "react";

export default function NewPostForm({ scope, courses, defaultCoursId, onSubmit }) {
  const [postScope, setPostScope] = useState(scope);
  const [coursId, setCoursId] = useState(defaultCoursId || "");
  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { setPostScope(scope); }, [scope]);
  useEffect(() => { setCoursId(defaultCoursId || ""); }, [defaultCoursId]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!titre || !contenu) { setError("Le titre et le contenu sont obligatoires."); return; }
    if (postScope === "course" && !coursId) { setError("Veuillez sélectionner un cours."); return; }
    try {
      setLoading(true);
      setError("");
      await onSubmit({ scope: postScope, coursId, titre, contenu, attachment });
      setTitre(""); setContenu(""); setAttachment(null);
    } catch (err) {
      setError(err.message || "Erreur lors de la publication.");
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" aria-label="Nouveau post">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-slate-900">Nouveau post</h3>
        <p className="mt-2 text-sm text-slate-600">Tu peux publier dans l’espace global ou dans un cours spécifique.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Type de discussion</label>
          <select value={postScope} onChange={(event) => setPostScope(event.target.value)} className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none">
            <option value="global">Global</option>
            <option value="course">Par cours</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Cours</label>
          <select value={coursId} onChange={(event) => setCoursId(event.target.value)} disabled={postScope !== "course"} className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none disabled:bg-slate-100">
            <option value="">Sélectionner</option>
            {courses.map((course) => <option key={course.id} value={course.id}>{course.nom}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">Titre</label>
          <input type="text" value={titre} onChange={(event) => setTitre(event.target.value)} placeholder="Ex: Ressources React de cette semaine" className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none" />
        </div>
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">Contenu</label>
          <textarea value={contenu} onChange={(event) => setContenu(event.target.value)} rows={5} placeholder="Écris ton message..." className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none" />
        </div>
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">Pièce jointe (image ou PDF, max 5 Mo)</label>
          <input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={(event) => setAttachment(event.target.files?.[0] || null)} className="block w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm" />
        </div>
      </div>
      {error ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <div className="mt-6 flex justify-end">
        <button type="submit" disabled={loading} className="rounded-2xl bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">{loading ? "Publication..." : "Publier"}</button>
      </div>
    </form>
  );
}
