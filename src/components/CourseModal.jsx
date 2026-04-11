import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { weekDays } from "../data/mockCourses";

const defaultForm = {
    name: "",
    description: "",
    durationHours: 40,
    selectedDays: ["monday", "wednesday"],
    sessionsPerWeek: 2,
    startHour: 14,
    endHour: 17,
    capacity: 15
};

function hourOptions() {
    return Array.from({ length: 24 }, (_, index) => ({
        value: index,
        label: `${String(index).padStart(2, "0")}:00`
    }));
}

export default function CourseModal({
    isOpen,
    onClose,
    onSubmit,
    loading
}) {
    const { t } = useTranslation();
    const [form, setForm] = useState(defaultForm);
    const [error, setError] = useState("");

    const startOptions = useMemo(() => hourOptions(), []);
    const endOptions = useMemo(
        () =>
            Array.from({ length: 24 }, (_, index) => ({
                value: index + 1,
                label: `${String(index + 1).padStart(2, "0")}:00`
            })),
        []
    );

    useEffect(() => {
        if (isOpen) {
            setForm(defaultForm);
            setError("");
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]:
                name === "durationHours" ||
                    name === "sessionsPerWeek" ||
                    name === "startHour" ||
                    name === "endHour" ||
                    name === "capacity"
                    ? Number(value)
                    : value
        }));
    };

    const handleDayToggle = (dayKey) => {
        setForm((prev) => {
            const isSelected = prev.selectedDays.includes(dayKey);

            if (isSelected) {
                return {
                    ...prev,
                    selectedDays: prev.selectedDays.filter((item) => item !== dayKey)
                };
            }

            return {
                ...prev,
                selectedDays: [...prev.selectedDays, dayKey]
            };
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (form.selectedDays.length === 0) {
            setError(t("courses.validationSelectDay"));
            return;
        }

        if (form.endHour <= form.startHour) {
            setError(t("courses.validationEndAfterStart"));
            return;
        }

        try {
            await onSubmit(form);
        } catch (err) {
            setError(err.message || t("courses.genericError"));
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="course-modal-title"
        >
            <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <h2 id="course-modal-title" className="text-xl font-bold text-slate-900">
                            {t("courses.newCourse")}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {t("courses.modalDescription")}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
                    >
                        {t("courses.close")}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
                                {t("courses.fields.name")}
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Développement Web React"
                                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-indigo-500"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label
                                htmlFor="description"
                                className="mb-1 block text-sm font-medium text-slate-700"
                            >
                                {t("courses.fields.description")}
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows="4"
                                value={form.description}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-indigo-500"
                                placeholder={t("courses.fields.descriptionPlaceholder")}
                                required
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="durationHours"
                                className="mb-1 block text-sm font-medium text-slate-700"
                            >
                                {t("courses.fields.duration")}
                            </label>
                            <input
                                id="durationHours"
                                name="durationHours"
                                type="number"
                                min="1"
                                value={form.durationHours}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-indigo-500"
                                required
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="sessionsPerWeek"
                                className="mb-1 block text-sm font-medium text-slate-700"
                            >
                                {t("courses.fields.sessionsPerWeek")}
                            </label>
                            <input
                                id="sessionsPerWeek"
                                name="sessionsPerWeek"
                                type="number"
                                min="1"
                                max="7"
                                value={form.sessionsPerWeek}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-indigo-500"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <fieldset>
                                <legend className="mb-2 text-sm font-medium text-slate-700">
                                    {t("courses.fields.days")}
                                </legend>

                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                                    {weekDays.map((day) => {
                                        const checked = form.selectedDays.includes(day.key);

                                        return (
                                            <label
                                                key={day.key}
                                                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${checked
                                                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                                        : "border-slate-300 bg-white text-slate-700"
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => handleDayToggle(day.key)}
                                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span>{t(day.labelKey)}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </fieldset>
                        </div>

                        <div>
                            <label
                                htmlFor="startHour"
                                className="mb-1 block text-sm font-medium text-slate-700"
                            >
                                {t("courses.fields.startHour")}
                            </label>
                            <select
                                id="startHour"
                                name="startHour"
                                value={form.startHour}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-indigo-500"
                            >
                                {startOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="endHour"
                                className="mb-1 block text-sm font-medium text-slate-700"
                            >
                                {t("courses.fields.endHour")}
                            </label>
                            <select
                                id="endHour"
                                name="endHour"
                                value={form.endHour}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-indigo-500"
                            >
                                {endOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="capacity"
                                className="mb-1 block text-sm font-medium text-slate-700"
                            >
                                {t("courses.fields.capacity")}
                            </label>
                            <input
                                id="capacity"
                                name="capacity"
                                type="number"
                                min="1"
                                value={form.capacity}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-indigo-500"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div
                            className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
                            role="alert"
                        >
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            {t("courses.cancel")}
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {loading ? "..." : t("courses.create")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
