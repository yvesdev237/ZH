import { useContext } from "react";
import { UserContext } from "./UserContext";

export const useAuth = () => {
  return useContext(UserContext);
};
