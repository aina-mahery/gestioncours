"use client";

import ThreadCard from "./ThreadCard";

export default function ThreadList({ threads, loading, onLike, onReply, onSignal }) {
  if (loading) return <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">Chargement des discussions...</div>;
  if (!threads.length) return <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">Aucun thread trouvé.</div>;
  return <div className="space-y-4">{threads.map((thread) => <ThreadCard key={thread.id} thread={thread} onLike={onLike} onReply={onReply} onSignal={onSignal} />)}</div>;
}
