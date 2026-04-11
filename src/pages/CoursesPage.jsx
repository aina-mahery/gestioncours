import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import CourseModal from "../components/CourseModal";
import { useAuth } from "../context/AuthContext";
import {
    createCourse,
    getWeeklyCourses,
    patchCoursePlanning,
    weekDays
} from "../data/mockCourses";

const HOUR_HEIGHT = 64;

function formatHour(hour) {
    return `${String(hour).padStart(2, "0")}:00`;
}

function getDuration(course) {
    return course.endHour - course.startHour;
}

export default function CoursesPage() {
    const { t } = useTranslation();
    const { user } = useAuth();

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [notice, setNotice] = useState("");
    const [activeEndpoint, setActiveEndpoint] = useState("/api/cours?view=week");

    const [draggedCourseId, setDraggedCourseId] = useState(null);
    const [hoveredSlot, setHoveredSlot] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const canManageCourses = useMemo(() => {
        return ["admin", "teacher", "formateur"].includes(user?.role);
    }, [user]);

    const hours = useMemo(() => Array.from({ length: 24 }, (_, index) => index), []);

    const loadCourses = async () => {
        setLoading(true);

        try {
            const response = await getWeeklyCourses();
            setCourses(response.data);
            setActiveEndpoint(response.endpoint);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCourses();
    }, []);

    const handleDragStart = (course, event) => {
        setDraggedCourseId(course.id);

        if (event.dataTransfer) {
            event.dataTransfer.setData("text/plain", String(course.id));
            event.dataTransfer.effectAllowed = "move";
        }
    };

    const handleDragEnd = () => {
        setDraggedCourseId(null);
        setHoveredSlot(null);
    };

    const handleDragOverSlot = (dayKey, hour, event) => {
        event.preventDefault();
        setHoveredSlot(`${dayKey}-${hour}`);

        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = "move";
        }
    };

    const handleDropOnSlot = async (dayKey, hour, event) => {
        event.preventDefault();

        const transferId = event.dataTransfer?.getData("text/plain");
        const courseId = Number(transferId || draggedCourseId);

        if (!courseId) {
            setHoveredSlot(null);
            return;
        }

        const draggedCourse = courses.find((course) => course.id === courseId);

        if (!draggedCourse) {
            setHoveredSlot(null);
            return;
        }

        const duration = getDuration(draggedCourse);
        const nextEndHour = hour + duration;

        if (nextEndHour > 24) {
            setNotice(t("courses.invalidDrop"));
            setHoveredSlot(null);
            setDraggedCourseId(null);
            return;
        }

        setActionLoading(true);

        try {
            const response = await patchCoursePlanning(courseId, {
                day: dayKey,
                startHour: hour,
                endHour: nextEndHour
            });

            setCourses((prev) =>
                prev.map((course) =>
                    course.id === courseId ? response.data : course
                )
            );

            setActiveEndpoint(response.endpoint);
            setNotice(
                `${t("courses.planningUpdated")} (${response.endpoint})`
            );
        } catch (error) {
            setNotice(error.message || t("courses.genericError"));
        } finally {
            setActionLoading(false);
            setHoveredSlot(null);
            setDraggedCourseId(null);
        }
    };

    const handleCreateCourse = async (formData) => {
        setActionLoading(true);

        try {
            const response = await createCourse(formData);

            setNotice(
                `${response.inserted} ${t("courses.courseBlocksCreated")} (${response.endpoint})`
            );
            setActiveEndpoint(response.endpoint);
            setIsModalOpen(false);
            await loadCourses();
        } finally {
            setActionLoading(false);
        }
    };

    const handleExportPdf = () => {
        setActiveEndpoint("/api/cours/export/pdf");
        setNotice(t("courses.exportPdfMock"));
    };

    if (!canManageCourses) {
        return (
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h1 className="text-2xl font-bold text-slate-900">
                    {t("courses.title")}
                </h1>
                <p className="mt-2 text-slate-500">
                    {t("courses.accessDenied")}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            {t("courses.title")}
                        </h1>
                        <p className="mt-1 text-slate-500">
                            {t("courses.description")}
                        </p>
                    </div>

                    <div
                        className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-200"
                        aria-live="polite"
                    >
                        <span className="font-semibold">Mock API :</span> {activeEndpoint}
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

            <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                {loading ? (
                    <div className="px-6 py-16 text-center text-slate-500">
                        {t("courses.loading")}
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <div className="min-w-[1200px] p-4">
                                <div className="grid grid-cols-[80px_repeat(7,minmax(150px,1fr))]">
                                    <div className="sticky left-0 z-10 bg-white" />

                                    {weekDays.map((day) => (
                                        <div
                                            key={day.key}
                                            className="sticky top-0 z-10 border-b border-l border-slate-200 bg-slate-50 px-3 py-3 text-center text-sm font-semibold text-slate-700"
                                        >
                                            {t(day.labelKey)}
                                        </div>
                                    ))}

                                    <div className="sticky left-0 z-10 bg-white">
                                        {hours.map((hour) => (
                                            <div
                                                key={hour}
                                                className="flex h-16 items-start justify-end border-t border-slate-200 pr-3 pt-1 text-xs text-slate-500"
                                            >
                                                {formatHour(hour)}
                                            </div>
                                        ))}
                                    </div>

                                    {weekDays.map((day) => (
                                        <div
                                            key={day.key}
                                            className="relative border-l border-slate-200"
                                            style={{ height: `${24 * HOUR_HEIGHT}px` }}
                                        >
                                            {hours.map((hour) => {
                                                const slotKey = `${day.key}-${hour}`;
                                                const isHovered = hoveredSlot === slotKey;

                                                return (
                                                    <div
                                                        key={slotKey}
                                                        onDragOver={(event) => handleDragOverSlot(day.key, hour, event)}
                                                        onDrop={(event) => handleDropOnSlot(day.key, hour, event)}
                                                        onDragLeave={() => {
                                                            if (hoveredSlot === slotKey) {
                                                                setHoveredSlot(null);
                                                            }
                                                        }}
                                                        className={`h-16 border-t border-slate-200 transition ${isHovered ? "bg-indigo-50" : "bg-white"
                                                            }`}
                                                    />
                                                );
                                            })}

                                            {courses
                                                .filter((course) => course.day === day.key)
                                                .map((course) => {
                                                    const top = course.startHour * HOUR_HEIGHT + 2;
                                                    const height = getDuration(course) * HOUR_HEIGHT - 4;
                                                    const isDragging = draggedCourseId === course.id;

                                                    return (
                                                        <button
                                                            key={course.id}
                                                            type="button"
                                                            draggable
                                                            onDragStart={(event) => handleDragStart(course, event)}
                                                            onDragEnd={handleDragEnd}
                                                            className={`absolute left-2 right-2 overflow-hidden rounded-2xl px-3 py-2 text-left text-white shadow-lg transition ${course.color
                                                                } ${isDragging ? "opacity-60 ring-4 ring-indigo-200" : ""}`}
                                                            style={{
                                                                top: `${top}px`,
                                                                height: `${height}px`
                                                            }}
                                                            aria-label={`${course.name} ${formatHour(course.startHour)}-${formatHour(course.endHour)}`}
                                                            title={t("courses.dragHint")}
                                                        >
                                                            <div className="flex h-full flex-col justify-between">
                                                                <div>
                                                                    <p className="text-sm font-bold leading-tight">
                                                                        {course.name}
                                                                    </p>
                                                                    <p className="mt-1 text-xs text-white/90">
                                                                        {formatHour(course.startHour)} - {formatHour(course.endHour)}
                                                                    </p>
                                                                </div>

                                                                <div className="space-y-1 text-xs text-white/90">
                                                                    <p>{course.room}</p>
                                                                    <p>
                                                                        {course.enrolled}/{course.capacity}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(true)}
                                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                            >
                                {t("courses.newCourse")}
                            </button>

                            <button
                                type="button"
                                onClick={handleExportPdf}
                                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                {t("courses.exportPdf")}
                            </button>
                        </div>
                    </>
                )}
            </section>

            <CourseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateCourse}
                loading={actionLoading}
            />
        </div>
    );
}