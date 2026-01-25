import { Navigate } from "react-router-dom";
import type { JSX } from "react/jsx-dev-runtime";
import useAuth from "./hooks/useAuth";

type ProtectedRouteProps = {
  children: JSX.Element;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuth, loading } = useAuth();

  if (loading) return <div>Checking auth...</div>;

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
    