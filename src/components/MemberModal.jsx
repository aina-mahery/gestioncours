import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const defaultForm = {
    name: "",
    email: "",
    role: "eleve",
    photo: ""
};

export default function MemberModal({
    isOpen,
    mode,
    initialData,
    onClose,
    onSubmit,
    loading
}) {
    const { t } = useTranslation();

    const [form, setForm] = useState(defaultForm);
    const [preview, setPreview] = useState("");

    useEffect(() => {
        if (initialData) {
            setForm({
                name: initialData.name || "",
                email: initialData.email || "",
                role: initialData.role || "eleve",
                photo: initialData.photo || ""
            });
            setPreview(initialData.photo || "");
        } else {
            setForm(defaultForm);
            setPreview("");
        }
    }, [initialData, isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePhotoChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        const objectUrl = URL.createObjectURL(file);

        setPreview(objectUrl);
        setForm((prev) => ({
            ...prev,
            photo: objectUrl
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit(form);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="member-modal-title"
        >
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <h2 id="member-modal-title" className="text-xl font-bold text-slate-900">
                            {mode === "edit" ? t("members.modalEditTitle") : t("members.modalCreateTitle")}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {t("members.modalDescription")}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
                    >
                        {t("members.close")}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-lg font-semibold text-indigo-700">
                            {preview ? (
                                <img
                                    src={preview}
                                    alt={t("members.photoPreview")}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                form.name?.slice(0, 2).toUpperCase() || "MB"
                            )}
                        </div>

                        <div className="flex-1">
                            <label
                                htmlFor="photo"
                                className="mb-1 block text-sm font-medium text-slate-700"
                            >
                                {t("members.photo")}
                            </label>
                            <input
                                id="photo"
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                            <p className="mt-1 text-xs text-slate-500">
                                {t("members.photoHint")}
                            </p>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
                            {t("members.name")}
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={form.name}
                            onChange={handleChange}
                            required
                            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                            {t("members.email")}
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="role" className="mb-1 block text-sm font-medium text-slate-700">
                            {t("members.role")}
                        </label>
                        <select
                            id="role"
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-indigo-500"
                        >
                            <option value="admin">{t("admin")}</option>
                            <option value="formateur">{t("teacher")}</option>
                            <option value="eleve">{t("student")}</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            {t("members.cancel")}
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {loading
                                ? "..."
                                : mode === "edit"
                                    ? t("members.save")
                                    : t("members.create")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}