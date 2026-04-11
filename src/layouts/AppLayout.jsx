import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

export default function AppLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-100">
            <Header onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />

            <div className="flex">
                <Sidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />

                <main className="min-w-0 flex-1 p-4 lg:p-6" id="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}