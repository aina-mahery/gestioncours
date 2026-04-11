import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import LoginPage from "./pages/LoginPage";
import DashboardAdminPage from "./pages/DashboardAdminPage";
import MembersPage from "./pages/MembersPage";
import CoursesPage from "./pages/CoursesPage";
import FeesPage from "./pages/FeesPage";
import AttendancePage from "./pages/AttendancePage";
import ForumPage from "./pages/ForumPage";

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                    <Route path="/" element={<DashboardAdminPage />} />
                    <Route path="/courses" element={<CoursesPage />} />
                    <Route path="/members" element={<MembersPage />} />
                    <Route path="/fees" element={<FeesPage />} />
                    <Route path="/attendance" element={<AttendancePage />} />
                    <Route path="/forum" element={<ForumPage />} />
                </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}