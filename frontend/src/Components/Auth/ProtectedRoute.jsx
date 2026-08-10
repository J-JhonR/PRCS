import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../../context/useAuth";

const HOME_BY_ROLE = {
  admin: "/console/app",
  recruteur: "/recruteur/app",
  candidat: "/dashboard",
};

export default function ProtectedRoute({ children, role }) {
  const { user, isLoggedIn, isAuthLoading } = useAuth();
  const location = useLocation();

  if (isAuthLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-600">
        Verification de votre session...
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  if (role && user?.role !== role) {
    return <Navigate to={HOME_BY_ROLE[user?.role] || "/dashboard"} replace />;
  }

  return children;
}
