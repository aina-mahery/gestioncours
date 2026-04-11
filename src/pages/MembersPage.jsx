import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import MemberModal from "../components/MemberModal";
import {
    createMember,
    deleteMember,
    getMembers,
    importMembersFromCsvMock,
    updateMember
} from "../data/mockMembers";

function roleBadgeClasses(role) {
    if (role === "admin") {
        return "bg-purple-100 text-purple-700";
    }

    if (role === "formateur") {
        return "bg-blue-100 text-blue-700";
    }

    return "bg-emerald-100 text-emerald-700";
}

function statusBadgeClasses(status) {
    if (status === "actif") {
        return "bg-emerald-100 text-emerald-700";
    }

    if (status === "inactif") {
        return "bg-slate-200 text-slate-700";
    }

    return "bg-amber-100 text-amber-700";
}

function getInitials(name) {
    return String(name || "")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

export default function MembersPage() {
    const { t } = useTranslation();

    const [filters, setFilters] = useState({
        search: "jean",
        role: "eleve",
        status: ""
    });

    const [members, setMembers] = useState([]);
    const [endpoint, setEndpoint] = useState("");
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("create");
    const [selectedMember, setSelectedMember] = useState(null);

    const [notice, setNotice] = useState("");

    const roleLabelMap = useMemo(
        () => ({
            admin: t("admin"),
            formateur: t("teacher"),
            eleve: t("student")
        }),
        [t]
    );

    const statusLabelMap = useMemo(
        () => ({
            actif: t("members.active"),
            inactif: t("members.inactive"),
            en_retard: t("members.latePayment")
        }),
        [t]
    );

    const loadMembers = async (customFilters = filters) => {
        setLoading(true);

        try {
            const response = await getMembers(customFilters);
            setMembers(response.data);
            setEndpoint(response.endpoint);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMembers(filters);
    }, []);

    const handleFilterChange = (event) => {
        const { name, value } = event.target;

        setFilters((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearchSubmit = async (event) => {
        event.preventDefault();
        await loadMembers(filters);
    };

    const openCreateModal = () => {
        setModalMode("create");
        setSelectedMember(null);
        setIsModalOpen(true);
    };

    const openEditModal = (member) => {
        setModalMode("edit");
        setSelectedMember(member);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedMember(null);
    };

    const handleSaveMember = async (formData) => {
        setActionLoading(true);

        try {
            if (modalMode === "edit" && selectedMember) {
                await updateMember(selectedMember.id, formData);
                setNotice(t("members.memberUpdated"));
            } else {
                await createMember(formData);
                setNotice(t("members.memberCreated"));
            }

            closeModal();
            await loadMembers(filters);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteMember = async (member) => {
        const confirmed = window.confirm(
            `${t("members.confirmDelete")} : ${member.name} ?`
        );

        if (!confirmed) return;

        setActionLoading(true);

        try {
            await deleteMember(member.id);
            setNotice(t("members.memberDeleted"));
            await loadMembers(filters);
        } finally {
            setActionLoading(false);
        }
    };

    const handleImportCsv = async () => {
        setActionLoading(true);

        try {
            const result = await importMembersFromCsvMock();
            setNotice(
                `${result.inserted} ${t("members.membersImported")}`
            );
            await loadMembers(filters);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            {t("members.title")}
                        </h1>
                        <p className="mt-1 text-slate-500">
                            {t("members.description")}
                        </p>
                    </div>

                    <div
                        className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-200"
                        aria-live="polite"
                    >
                        <span className="font-semibold">Mock API :</span> {endpoint || "/api/membres?role=eleve&search=jean"}
                    </div>
                </div>

                <form
                    onSubmit={handleSearchSubmit}
                    className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-12"
                >
                    <div className="lg:col-span-4">
                        <label htmlFor="search" className="mb-1 block text-sm font-medium text-slate-700">
                            {t("members.search")}
                        </label>
                        <input
                            id="search"
                            name="search"
                            type="search"
                            value={filters.search}
                            onChange={handleFilterChange}
                            placeholder={t("members.searchPlaceholder")}
                            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-indigo-500"
                        />
                    </div>

                    <div className="lg:col-span-2">
                        <label htmlFor="role-filter" className="mb-1 block text-sm font-medium text-slate-700">
                            {t("members.role")}
                        </label>
                        <select
                            id="role-filter"
                            name="role"
                            value={filters.role}
                            onChange={handleFilterChange}
                            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-indigo-500"
                        >
                            <option value="">{t("members.allRoles")}</option>
                            <option value="admin">{t("admin")}</option>
                            <option value="formateur">{t("teacher")}</option>
                            <option value="eleve">{t("student")}</option>
                        </select>
                    </div>

                    <div className="lg:col-span-2">
                        <label htmlFor="status-filter" className="mb-1 block text-sm font-medium text-slate-700">
                            {t("members.status")}
                        </label>
                        <select
                            id="status-filter"
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-indigo-500"
                        >
                            <option value="">{t("members.allStatuses")}</option>
                            <option value="actif">{t("members.active")}</option>
                            <option value="inactif">{t("members.inactive")}</option>
                            <option value="en_retard">{t("members.latePayment")}</option>
                        </select>
                    </div>

                    <div className="lg:col-span-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                        <button
                            type="submit"
                            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:w-auto"
                        >
                            {t("members.applyFilters")}
                        </button>

                        <button
                            type="button"
                            onClick={handleImportCsv}
                            disabled={actionLoading}
                            className="w-full rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                        >
                            {t("members.importCsv")}
                        </button>

                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 sm:w-auto"
                        >
                            {t("members.newMember")}
                        </button>
                    </div>
                </form>

                {notice && (
                    <div
                        className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                        role="status"
                        aria-live="polite"
                    >
                        {notice}
                    </div>
                )}
            </section>

            <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-left text-sm text-slate-600">
                                <th className="px-4 py-3 font-semibold">{t("members.photo")}</th>
                                <th className="px-4 py-3 font-semibold">{t("members.name")}</th>
                                <th className="px-4 py-3 font-semibold">{t("members.email")}</th>
                                <th className="px-4 py-3 font-semibold">{t("members.role")}</th>
                                <th className="px-4 py-3 font-semibold">{t("members.status")}</th>
                                <th className="px-4 py-3 font-semibold">{t("members.coursesEnrolled")}</th>
                                <th className="px-4 py-3 font-semibold">{t("members.balance")}</th>
                                <th className="px-4 py-3 font-semibold">{t("members.actions")}</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="px-4 py-10 text-center text-slate-500">
                                        {t("members.loading")}
                                    </td>
                                </tr>
                            ) : members.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-4 py-10 text-center text-slate-500">
                                        {t("members.noResults")}
                                    </td>
                                </tr>
                            ) : (
                                members.map((member) => (
                                    <tr key={member.id} className="border-b border-slate-100 last:border-b-0">
                                        <td className="px-4 py-3">
                                            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                                                {member.photo ? (
                                                    <img
                                                        src={member.photo}
                                                        alt={member.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    getInitials(member.name)
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3">
                                            <p className="font-medium text-slate-900">{member.name}</p>
                                        </td>

                                        <td className="px-4 py-3 text-slate-600">{member.email}</td>

                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${roleBadgeClasses(member.role)}`}
                                            >
                                                {roleLabelMap[member.role]}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClasses(member.status)}`}
                                            >
                                                {statusLabelMap[member.status]}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3 text-slate-600">
                                            <div className="space-y-1">
                                                <p className="font-medium text-slate-800">
                                                    {member.courses.length} {t("members.courseUnit")}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {member.courses.length > 0
                                                        ? member.courses.join(", ")
                                                        : t("members.noCourses")}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3">
                                            <span
                                                className={`font-semibold ${member.balance > 0 ? "text-amber-600" : "text-emerald-600"
                                                    }`}
                                            >
                                                {member.balance} €
                                            </span>
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(member)}
                                                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                                >
                                                    {t("members.edit")}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteMember(member)}
                                                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100"
                                                >
                                                    {t("members.delete")}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <MemberModal
                isOpen={isModalOpen}
                mode={modalMode}
                initialData={selectedMember}
                onClose={closeModal}
                onSubmit={handleSaveMember}
                loading={actionLoading}
            />
        </div>
    );
}