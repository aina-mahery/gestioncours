"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { BookOpen, CreditCard, LayoutDashboard, MessageSquare, Users, ClipboardCheck } from "lucide-react";

const links = [
  { href: "/", key: "sidebar.dashboard", icon: LayoutDashboard },
  { href: "/cours", key: "sidebar.cours", icon: BookOpen },
  { href: "/membres", key: "sidebar.membres", icon: Users },
  { href: "/ecolages", key: "sidebar.ecolages", icon: CreditCard },
  { href: "/presence", key: "sidebar.presence", icon: ClipboardCheck },
  { href: "/forum", key: "sidebar.forum", icon: MessageSquare }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-20 sm:w-72 border-r border-slate-200 bg-white" aria-label={t("sidebar.navigationLabel")}>
      <div className="flex h-[4.5rem] items-center border-b border-slate-200 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600 text-white font-bold" aria-hidden="true">
            GC
          </div>
          <div className="hidden sm:block">
            <p className="text-sm text-slate-500">{t("app.nameShort")}</p>
            <h1 className="text-lg font-bold text-slate-900">{t("app.name")}</h1>
          </div>
        </div>
      </div>

      <nav className="px-3 py-4">
        <ul className="space-y-2">
          {links.map(({ href, key, icon: Icon }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors ${active ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-50"}`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span className="hidden sm:inline">{t(key)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
