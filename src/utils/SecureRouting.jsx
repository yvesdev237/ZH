import { TailSpin } from "react-loader-spinner";
import { useAuth } from "../context/UseAuth";
import { Outlet, Navigate } from "react-router-dom";

export const SecureRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center text-center">
        <TailSpin />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace={true} />;
  }
  if (user && user?.user_metadata?.role === "admin") {
    return <Navigate to="/admin" replace={true} />;
  }

  return <Outlet />;
};

export const AdminRoute = () => {
  const { user, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center text-center">
        <TailSpin />
      </div>
    );
  }

  if (!user || (role !== "admin" && user?.user_metadata?.role !== "admin")) {
    return <Navigate to="/dashboard/home" replace={true} />;
  }

  return <Outlet />;
};
