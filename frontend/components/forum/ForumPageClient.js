"use client";

import { useEffect, useState } from "react";
import { apiFetch, apiFormData } from "../../lib/api";
import ForumFilters from "./ForumFilters";
import NewPostForm from "./NewPostForm";
import ThreadList from "./ThreadList";

export default function ForumPageClient() {
  const [scope, setScope] = useState("global");
  const [coursId, setCoursId] = useState("");
  const [courses, setCourses] = useState([]);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadCourses() {
    try {
      const data = await apiFetch("/api/cours?page=1&limit=100");
      setCourses(data.items || []);
    } catch (err) { console.error(err); }
  }

  async function loadThreads() {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      params.set("scope", scope);
      if (scope === "course" && coursId) params.set("coursId", coursId);
      const data = await apiFetch(`/api/forum?${params.toString()}`);
      setThreads(data.items || []);
    } catch (err) {
      setError(err.message || "Erreur lors du chargement du forum.");
    } finally { setLoading(false); }
  }

  useEffect(() => { loadCourses(); }, []);
  useEffect(() => { if (scope === "course" && !coursId) return; loadThreads(); }, [scope, coursId]);

  async function handleSearch(event) {
    event.preventDefault();
    if (!searchKeyword.trim()) return loadThreads();
    try {
      setLoading(true);
      const data = await apiFetch(`/api/forum/search?q=${encodeURIComponent(searchKeyword.trim())}`);
      setThreads(data.items || []);
    } catch (err) {
      setError(err.message || "Erreur lors de la recherche.");
    } finally { setLoading(false); }
  }

  async function handleCreatePost(formValues) {
    const formData = new FormData();
    formData.append("titre", formValues.titre);
    formData.append("contenu", formValues.contenu);
    if (formValues.attachment) formData.append("attachment", formValues.attachment);
    const targetCoursId = formValues.scope === "global" ? "global" : formValues.coursId;
    await apiFormData(`/api/forum/${targetCoursId}/posts`, formData, { method: "POST" });
    setMessage("Post publié avec succès.");
    await loadThreads();
  }

  async function handleLike(threadId) {
    try {
      await apiFetch(`/api/forum/${threadId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "like" }) });
      await loadThreads();
    } catch (err) { setError(err.message || "Erreur lors du like."); }
  }

  async function handleReply(threadId, contenu) {
    try {
      await apiFetch(`/api/forum/${threadId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "reply", contenu }) });
      setMessage("Réponse publiée.");
      await loadThreads();
    } catch (err) { setError(err.message || "Erreur lors de la réponse."); }
  }

  async function handleSignal(threadId) {
    try {
      await apiFetch(`/api/forum/${threadId}/signal`, { method: "POST" });
      setMessage("Signalement transmis.");
    } catch (err) { setError(err.message || "Erreur lors du signalement."); }
  }

  return (
    <section className="space-y-6" aria-labelledby="forum-title">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 id="forum-title" className="text-2xl font-bold text-slate-900">Forum</h2>
        <p className="mt-2 text-sm text-slate-600">Discussions globales, échanges par cours, réponses, likes et pièces jointes.</p>
      </div>
      <ForumFilters scope={scope} setScope={setScope} coursId={coursId} setCoursId={setCoursId} courses={courses} searchKeyword={searchKeyword} setSearchKeyword={setSearchKeyword} onSearch={handleSearch} />
      <NewPostForm scope={scope} courses={courses} defaultCoursId={coursId} onSubmit={handleCreatePost} />
      {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <ThreadList threads={threads} loading={loading} onLike={handleLike} onReply={handleReply} onSignal={handleSignal} />
    </section>
  );
}
