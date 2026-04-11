import { useEffect, useMemo, useState } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import {
    getAttendanceRecords,
    patchAttendanceStatus
} from "../data/mockAttendanceForum";

function getStatusLabel(status) {
    if (status === "present") return "Présent";
    if (status === "late") return "Retard";
    return "Absent";
}

function getStatusScore(status) {
    if (status === "present") return 100;
    if (status === "late") return 70;
    return 0;
}

function getStatusBadgeClasses(status) {
    if (status === "present") return "bg-emerald-100 text-emerald-700";
    if (status === "late") return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
}

function getCurrentHourMinute() {
    return new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit"
    });
}

export default function AttendancePage() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [notice, setNotice] = useState("");
    const [endpoint, setEndpoint] = useState("/api/presences?course=react");

    const [isScanning, setIsScanning] = useState(false);
    const [scanTargetId, setScanTargetId] = useState(null);

    const attendanceRate = useMemo(() => {
        if (students.length === 0) return 0;

        const presentLike = students.filter(
            (student) => student.status === "present" || student.status === "late"
        ).length;

        return Math.round((presentLike / students.length) * 100);
    }, [students]);

    const chartData = useMemo(() => {
        return students.map((student) => ({
            name: student.name.split(" ")[0],
            score: getStatusScore(student.status)
        }));
    }, [students]);

    const loadAttendance = async () => {
        setLoading(true);

        try {
            const response = await getAttendanceRecords();
            setStudents(response.data);
            setEndpoint(response.endpoint);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAttendance();
    }, []);

    useEffect(() => {
        if (!isScanning || !scanTargetId) {
            return;
        }

        const timer = setTimeout(async () => {
            setActionLoading(true);

            try {
                const response = await patchAttendanceStatus(scanTargetId, {
                    status: "present",
                    arrivalTime: getCurrentHourMinute(),
                    source: "qr"
                });

                setStudents((prev) =>
                    prev.map((student) =>
                        student.id === scanTargetId ? response.data : student
                    )
                );

                setEndpoint(response.endpoint);
                setNotice(
                    `Scan réussi : ${response.data.name} marqué présent (${response.endpoint})`
                );
            } catch (error) {
                setNotice(error.message || "Erreur lors du scan simulé.");
            } finally {
                setActionLoading(false);
                setIsScanning(false);
                setScanTargetId(null);
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [isScanning, scanTargetId]);

    const handleStartScan = () => {
        const nextStudent =
            students.find((student) => student.status === "absent") ||
            students.find((student) => student.status === "late") ||
            students[0];

        if (!nextStudent) {
            setNotice("Aucun élève disponible pour le scan.");
            return;
        }

        setNotice("");
        setScanTargetId(nextStudent.id);
        setIsScanning(true);
    };

    const handleStatusChange = async (student, nextStatus) => {
        setActionLoading(true);

        try {
            const response = await patchAttendanceStatus(student.id, {
                status: nextStatus,
                arrivalTime:
                    nextStatus === "absent"
                        ? ""
                        : student.arrivalTime || getCurrentHourMinute(),
                source: "manual"
            });

            setStudents((prev) =>
                prev.map((item) => (item.id === student.id ? response.data : item))
            );

            setEndpoint(response.endpoint);
            setNotice(
                `Présence mise à jour pour ${response.data.name} (${response.endpoint})`
            );
        } catch (error) {
            setNotice(error.message || "Erreur lors de la mise à jour.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleArrivalTimeChange = async (student, nextArrivalTime) => {
        setActionLoading(true);

        try {
            const response = await patchAttendanceStatus(student.id, {
                status: student.status,
                arrivalTime: nextArrivalTime,
                source: "manual-time"
            });

            setStudents((prev) =>
                prev.map((item) => (item.id === student.id ? response.data : item))
            );

            setEndpoint(response.endpoint);
        } catch (error) {
            setNotice(error.message || "Erreur lors de la mise à jour de l'heure.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleExportPdf = async () => {
        try {
            const { jsPDF } = await import("jspdf");
            const doc = new jsPDF();

            doc.setFontSize(18);
            doc.text("GestionCours Pro - Présences", 20, 20);

            doc.setFontSize(11);
            doc.text(`Taux de présence : ${attendanceRate}%`, 20, 32);

            let y = 45;
            students.forEach((student) => {
                doc.text(
                    `${student.name} | ${getStatusLabel(student.status)} | ${student.arrivalTime || "--:--"}`,
                    20,
                    y
                );
                y += 8;
            });

            doc.save("presences-gestioncours-pro.pdf");
            setEndpoint("/api/presences/export/pdf");
            setNotice("Export PDF réussi (simulation frontend).");
        } catch (error) {
            setEndpoint("/api/presences/export/pdf");
            setNotice("jsPDF indisponible : export PDF simulé avec succès.");
        }
    };

    const handleExportExcel = async () => {
        try {
            const XLSX = await import("xlsx");

            const rows = students.map((student) => ({
                Nom: student.name,
                Statut: getStatusLabel(student.status),
                "Heure d'arrivée": student.arrivalTime || ""
            }));

            const worksheet = XLSX.utils.json_to_sheet(rows);
            const workbook = XLSX.utils.book_new();

            XLSX.utils.book_append_sheet(workbook, worksheet, "Présences");
            XLSX.writeFile(workbook, "presences-gestioncours-pro.xlsx");

            setEndpoint("/api/presences/export/excel");
            setNotice("Export Excel réussi (simulation frontend).");
        } catch (error) {
            setEndpoint("/api/presences/export/excel");
            setNotice("xlsx indisponible : export Excel simulé avec succès.");
        }
    };

    return (
        <div className="space-y-6">
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Gestion de la Présence</h1>
                        <p className="mt-1 text-slate-500">
                            Scan QR simulé, pointage manuel et export des présences.
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

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[300px,1fr]">
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                    <p className="text-sm text-slate-500">Taux de présence</p>
                    <p className="mt-2 text-4xl font-bold text-slate-900">{attendanceRate}%</p>

                    <div className="mt-6">
                        <button
                            type="button"
                            onClick={handleStartScan}
                            disabled={isScanning || loading || actionLoading}
                            className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isScanning ? "Scan en cours..." : "Scanner QR Code"}
                        </button>

                        <div className="mt-4 overflow-hidden rounded-3xl border border-slate-800 bg-black">
                            <div className="relative flex h-72 items-center justify-center">
                                {isScanning ? (
                                    <>
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent" />
                                        <div className="absolute left-8 right-8 top-1/2 h-0.5 -translate-y-1/2 bg-emerald-400 shadow-[0_0_12px_#34d399]" />
                                        <div className="rounded-xl border border-white/30 px-4 py-2 text-sm text-white">
                                            Caméra simulée active...
                                        </div>
                                    </>
                                ) : (
                                    <div className="rounded-xl border border-white/20 px-4 py-2 text-sm text-white/80">
                                        Caméra QR simulée
                                    </div>
                                )}
                            </div>
                        </div>

                        <p className="mt-3 text-xs text-slate-500">
                            Le scan marque automatiquement le prochain élève non présent après 2 secondes.
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Répartition par élève
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Mini graphique basé sur le statut actuel de chaque élève.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex h-72 items-center justify-center text-slate-500">
                            Chargement des présences...
                        </div>
                    ) : (
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} barSize={22}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip formatter={(value) => [`${value}%`, "Présence"]} />
                                    <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell
                                                key={`${entry.name}-${index}`}
                                                fill={
                                                    entry.score === 100
                                                        ? "#10b981"
                                                        : entry.score >= 70
                                                            ? "#f59e0b"
                                                            : "#ef4444"
                                                }
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </section>

            <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Présence manuelle</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Modifiez le statut ou l’heure d’arrivée individuellement.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={handleExportExcel}
                            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Export Excel
                        </button>

                        <button
                            type="button"
                            onClick={handleExportPdf}
                            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Export PDF
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-left text-sm text-slate-600">
                                <th className="px-4 py-3 font-semibold">Nom</th>
                                <th className="px-4 py-3 font-semibold">Statut</th>
                                <th className="px-4 py-3 font-semibold">Heure d'arrivée</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="3" className="px-4 py-10 text-center text-slate-500">
                                        Chargement...
                                    </td>
                                </tr>
                            ) : (
                                students.map((student) => (
                                    <tr key={student.id} className="border-b border-slate-100 last:border-b-0">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                                                    {student.name
                                                        .split(" ")
                                                        .map((part) => part[0])
                                                        .slice(0, 2)
                                                        .join("")
                                                        .toUpperCase()}
                                                </div>

                                                <div>
                                                    <p className="font-medium text-slate-900">{student.name}</p>
                                                    <span
                                                        className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClasses(
                                                            student.status
                                                        )}`}
                                                    >
                                                        {getStatusLabel(student.status)}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-4">
                                                {["present", "absent", "late"].map((status) => (
                                                    <label
                                                        key={status}
                                                        className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700"
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={`status-${student.id}`}
                                                            checked={student.status === status}
                                                            onChange={() => handleStatusChange(student, status)}
                                                            className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                        />
                                                        {getStatusLabel(status)}
                                                    </label>
                                                ))}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3">
                                            <input
                                                type="time"
                                                value={student.arrivalTime}
                                                disabled={student.status === "absent"}
                                                onChange={(event) =>
                                                    handleArrivalTimeChange(student, event.target.value)
                                                }
                                                className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-100"
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}