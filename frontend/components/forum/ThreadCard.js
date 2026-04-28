"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

export default function ThreadCard({ thread, onLike, onReply, onSignal }) {
  const [replyText, setReplyText] = useState("");
  const [showReply, setShowReply] = useState(false);
  const [replies, setReplies] = useState([]);
  const [showReplies, setShowReplies] = useState(false);

  useEffect(() => {
    if (!showReplies) return;
    apiFetch(`/api/forum/${thread.id}/replies`).then((data) => setReplies(data.items || [])).catch(console.error);
  }, [showReplies, thread.id]);

  async function handleReplySubmit(event) {
    event.preventDefault();
    if (!replyText.trim()) return;
    await onReply(thread.id, replyText.trim());
    setReplyText("");
    setShowReply(false);
    setShowReplies(true);
  }

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-bold text-slate-900">{thread.titre}</h3>
            {thread.coursNom ? <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">{thread.coursNom}</span> : <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">Global</span>}
          </div>
          <p className="text-sm text-slate-500">Par {thread.author?.nom || thread.authorName} • {new Date(thread.createdAt).toLocaleString("fr-FR")}</p>
          <p className="text-sm leading-6 text-slate-700">{thread.contenu}</p>
          {thread.attachments?.length ? (
            <div className="flex flex-wrap gap-2 pt-2">
              {thread.attachments.map((attachment) => (
                <a key={attachment.id} href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${attachment.url}`} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100">{attachment.originalName}</a>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">👍 {thread.likes}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">💬 {thread.repliesCount}</span>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={() => onLike(thread.id)} className="rounded-2xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">Like</button>
        <button type="button" onClick={() => setShowReply((prev) => !prev)} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Répondre</button>
        <button type="button" onClick={() => setShowReplies((prev) => !prev)} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Voir réponses</button>
        <button type="button" onClick={() => onSignal(thread.id)} className="rounded-2xl border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50">Signaler</button>
      </div>
      {showReply ? (
        <form onSubmit={handleReplySubmit} className="mt-4 space-y-3">
          <textarea value={replyText} onChange={(event) => setReplyText(event.target.value)} rows={3} placeholder="Écris ta réponse..." className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none" />
          <div className="flex justify-end"><button type="submit" className="rounded-2xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">Envoyer</button></div>
        </form>
      ) : null}
      {showReplies ? (
        <div className="mt-4 space-y-3 rounded-2xl bg-slate-50 p-4">
          {replies.length ? replies.map((reply) => (
            <div key={reply.id} className="rounded-2xl border border-slate-200 bg-white p-3">
              <p className="text-xs text-slate-500">{reply.author.nom} • {new Date(reply.createdAt).toLocaleString("fr-FR")}</p>
              <p className="mt-2 text-sm text-slate-700">{reply.contenu}</p>
            </div>
          )) : <p className="text-sm text-slate-500">Aucune réponse pour le moment.</p>}
        </div>
      ) : null}
    </article>
  );
}
