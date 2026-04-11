import { createContext, useContext, useEffect, useState } from "react";
import { mockLogin } from "../data/mockAuth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [auth, setAuth] = useState(() => {
        const saved = localStorage.getItem("gestioncours_auth");
        return saved ? JSON.parse(saved) : { token: null, user: null };
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        localStorage.setItem("gestioncours_auth", JSON.stringify(auth));
    }, [auth]);

    const login = async (credentials) => {
        setLoading(true);
        try {
            const result = await mockLogin(credentials);
            setAuth(result);
            return result;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setAuth({ token: null, user: null });
        localStorage.removeItem("gestioncours_auth");
    };

    return (
        <AuthContext.Provider
            value={{
                auth,
                user: auth.user,
                token: auth.token,
                isAuthenticated: Boolean(auth.token),
                loading,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}