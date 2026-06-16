import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    const savedAuth = localStorage.getItem(
        "home-dashboard-auth"
    );

    const hasToken = savedAuth
        ? !!JSON.parse(savedAuth)?.token
        : false;

    if (!isAuthenticated && !hasToken) {
        return (
            <Navigate
                to="/login"
                state={{ from: location }}
                replace
            />
        );
    }

    return children;
}

export default ProtectedRoute;