import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    BookOpen,
    Users,
    Wallet,
    ClipboardCheck,
    MessageSquare,
    X
} from "lucide-react";

const navItems = [
    {
        to: "/",
        label: "Dashboard",
        icon: LayoutDashboard
    },
    {
        to: "/courses",
        label: "Cours",
        icon: BookOpen
    },
    {
        to: "/members",
        label: "Membres",
        icon: Users
    },
    {
        to: "/fees",
        label: "Écolages",
        icon: Wallet
    },
    {
        to: "/attendance",
        label: "Présence",
        icon: ClipboardCheck
    },
    {
        to: "/forum",
        label: "Forum",
        icon: MessageSquare
    }
];

export default function Sidebar({ isOpen, onClose }) {
    return (
        <>
            {isOpen && (
                <button
                    type="button"
                    className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
                    onClick={onClose}
                    aria-label="Fermer la navigation"
                />
            )}

            <aside
                className={`fixed left-0 top-0 z-40 h-full w-72 border-r border-slate-200 bg-white p-4 shadow-lg transition-transform duration-300 lg:static lg:translate-x-0 lg:shadow-none ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="mb-6 flex items-center justify-between lg:hidden">
                    <div>
                        <p className="text-sm text-slate-500">Navigation</p>
                        <h2 className="text-lg font-bold text-slate-900">GestionCours Pro</h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-slate-200 p-2 hover:bg-slate-50"
                        aria-label="Fermer le menu"
                    >
                        <X className="h-5 w-5 text-slate-700" />
                    </button>
                </div>

                <nav className="space-y-2" aria-label="Navigation principale">
                    {navItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.to === "/"}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${isActive
                                        ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100"
                                        : "text-slate-700 hover:bg-slate-50"
                                    }`
                                }
                            >
                                <Icon className="h-5 w-5" />
                                <span>{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}