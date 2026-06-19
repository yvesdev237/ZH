import { TailSpin } from "react-loader-spinner";
import { useAuth } from "../context/UseAuth";
import { Outlet , Navigate} from "react-router-dom";

export const SecureRoute = () => {
    const {user , loading } = useAuth();

    if(loading) return <div className="text-center w-full h-full flex items-center justify-center"> <TailSpin/> </div>
    if(!user && !user?.user_metadata?.role) {
        return <Navigate to="/" replace={true} />
    }

    return <Outlet />;
}