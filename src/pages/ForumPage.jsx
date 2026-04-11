import { useEffect, useMemo, useState } from "react";
import {
    Heart,
    MessageCircle,
    Paperclip,
    Search,
    Send,
    FileText
} from "lucide-react";
import {
    createForumPost,
    getForumPosts,
    toggleForumLike
} from "../data/mockAttendanceForum";

function truncateText(text, maxLength = 140) {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
}

export default function ForumPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [notice, setNotice] = useState("");
    const [endpoint, setEndpoint] = useState("/api/forum/posts");

    const [activeTab, setActiveTab] = useState("react");
    const [searchTerm, setSearchTerm] = useState("");

    const [form, setForm] = useState({
        title: "",
        content: "",
        attachment: null
    });

    const [error, setError] = useState("");

    const filteredPosts = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();

        return posts.filter((post) => {
            const matchesTab = post.scope === activeTab;

            const searchableText = `${post.title} ${post.content}`.toLowerCase();
            const matchesSearch = term ? searchableText.includes(term) : true;

            return matchesTab && matchesSearch;
        });
    }, [posts, activeTab, searchTerm]);

    const loadForum = async () => {
        setLoading(true);

        try {
            const response = await getForumPosts();
            setPosts(response.data);
            setEndpoint(response.endpoint);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadForum();
    }, []);

    const handleLike = async (postId) => {
        setActionLoading(true);

        try {
            const response = await toggleForumLike(postId);

            setPosts((prev) =>
                prev.map((post) => (post.id === postId ? response.data : post))
            );

            setEndpoint(response.endpoint);
        } catch (error) {
            setNotice(error.message || "Erreur lors du like.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            setForm((prev) => ({
                ...prev,
                attachment: null
            }));
            return;
        }

        const sizeMb = Number((file.size / (1024 * 1024)).toFixed(2));

        setForm((prev) => ({
            ...prev,
            attachment: {
                name: file.name,
                sizeMb,
                type: file.type
            }
        }));
    };

    const handleSubmitPost = async (event) => {
        event.preventDefault();
        setError("");
        setActionLoading(true);

        try {
            const response = await createForumPost({
                scope: activeTab,
                title: form.title,
                content: form.content,
                attachment: form.attachment
            });

            setPosts((prev) => [response.data, ...prev]);
            setEndpoint(response.endpoint);
            setNotice(`Post créé avec succès (${response.endpoint})`);

            setForm({
                title: "",
                content: "",
                attachment: null
            });

            const fileInput = document.getElementById("forum-attachment");
            if (fileInput) {
                fileInput.value = "";
            }
        } catch (error) {
            setError(error.message || "Impossible de créer le post.");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Forum de Discussion</h1>
                        <p className="mt-1 text-slate-500">
                            Partagez des questions, ressources PDF et échanges autour des cours.
                        </p>
                    </div>

                    <div
                        className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-200"
                        aria-live="polite"
                    >
                        <span className="font-semibold">Mock API :</span> {endpoint}
                    </div>
                </div>

                {notice && (
                    <div
                        className="mt-4 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-700"
                        role="status"
                        aria-live="polite"
                    >
                        {notice}
                    </div>
                )}
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => setActiveTab("react")}
                        className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${activeTab === "react"
                            ? "bg-indigo-600 text-white"
                            : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                    >
                        Cours React
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("global")}
                        className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${activeTab === "global"
                            ? "bg-indigo-600 text-white"
                            : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                    >
                        Global
                    </button>
                </div>
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[360px,1fr]">
                <div className="space-y-6">
                    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                        <label
                            htmlFor="forum-search"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            Recherche par mots-clés
                        </label>

                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                id="forum-search"
                                type="search"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Ex : useEffect, Tailwind, maintenance..."
                                className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 outline-none transition focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-slate-900">Nouveau post</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Publiez dans l’espace actuel :{" "}
                                <span className="font-medium text-slate-700">
                                    {activeTab === "react" ? "Cours React" : "Global"}
                                </span>
                            </p>
                        </div>

                        <form onSubmit={handleSubmitPost} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="post-title"
                                    className="mb-1 block text-sm font-medium text-slate-700"
                                >
                                    Titre
                                </label>
                                <input
                                    id="post-title"
                                    name="title"
                                    type="text"
                                    value={form.title}
                                    onChange={handleInputChange}
                                    placeholder="Ex : Question sur les hooks"
                                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="post-content"
                                    className="mb-1 block text-sm font-medium text-slate-700"
                                >
                                    Contenu
                                </label>
                                <textarea
                                    id="post-content"
                                    name="content"
                                    rows="5"
                                    value={form.content}
                                    onChange={handleInputChange}
                                    placeholder="Écrivez votre message ici..."
                                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="forum-attachment"
                                    className="mb-1 block text-sm font-medium text-slate-700"
                                >
                                    Pièce jointe simulée (PDF &lt; 5 Mo)
                                </label>

                                <input
                                    id="forum-attachment"
                                    type="file"
                                    accept="application/pdf"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
                                />

                                {form.attachment && (
                                    <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200">
                                        <Paperclip className="h-4 w-4 text-slate-500" />
                                        <span>
                                            {form.attachment.name} — {form.attachment.sizeMb} Mo
                                        </span>
                                    </div>
                                )}
                            </div>

                            {error && (
                                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={actionLoading}
                                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                <Send className="h-4 w-4" />
                                Soumettre
                            </button>
                        </form>
                    </div>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">
                                {activeTab === "react" ? "Posts du Cours React" : "Posts Globaux"}
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                {filteredPosts.length} résultat(s) affiché(s)
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="py-12 text-center text-slate-500">Chargement du forum...</div>
                    ) : filteredPosts.length === 0 ? (
                        <div className="py-12 text-center text-slate-500">
                            Aucun post trouvé pour cette recherche.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredPosts.map((post) => (
                                <article
                                    key={post.id}
                                    className="rounded-2xl border border-slate-200 p-4 transition hover:shadow-sm"
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-lg font-semibold text-slate-900">
                                                {post.title}
                                            </h3>

                                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                                {truncateText(post.content, 170)}
                                            </p>

                                            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                                <span>{post.author}</span>
                                                <span>•</span>
                                                <span>{post.createdAt}</span>
                                            </div>

                                            {post.attachment &&
                                                post.attachment.type === "application/pdf" &&
                                                post.attachment.sizeMb < 5 && (
                                                    <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200">
                                                        <FileText className="h-4 w-4 text-red-500" />
                                                        <span>
                                                            {post.attachment.name} ({post.attachment.sizeMb} Mo)
                                                        </span>
                                                    </div>
                                                )}
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleLike(post.id)}
                                                disabled={actionLoading}
                                                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${post.likedByUser
                                                    ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                                                    : "bg-slate-50 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                                                    }`}
                                            >
                                                <Heart
                                                    className={`h-4 w-4 ${post.likedByUser ? "fill-current" : ""
                                                        }`}
                                                />
                                                {post.likesCount}
                                            </button>

                                            <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200">
                                                <MessageCircle className="h-4 w-4" />
                                                {post.repliesCount}
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
