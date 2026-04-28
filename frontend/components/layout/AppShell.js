"use client";

import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <a href="#main-content" className="skip-link">Aller au contenu principal</a>
      <Sidebar />
      <Header />
      <main id="main-content" className="ml-20 min-h-screen px-4 pb-8 pt-[5.5rem] sm:ml-72 sm:px-6">
        {children}
      </main>
    </div>
  );
}
