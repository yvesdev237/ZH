import { useEffect, useState } from "react";
import { db } from "../services/database";
import { UserContext } from "./UserContext";

export const ContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role , setRole] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data, error } = await db.auth.getSession();
        if (error) throw error;
        if (data.session?.user) {
          setUser(data.session.user ?? null);
          setRole(data.session.user?.user_metadata.role ?? null);
          console.log("User role on get session:", data.session.user?.user_metadata.role);
          console.log("User session found:", data.session.user);
        } else {
          setUser(null);
          console.log("No user session found");
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      }finally{
        setLoading(false);
        console.log("Finished fetching session, loading set to false" , loading);
      }
    };
    getSession();

    const { data: authListener } = db.auth.onAuthStateChange(
      (event, session) => {
        try {
          const newSession = session?.user;
          setUser(newSession ?? null);
          setRole(newSession?.user_metadata.role ?? null);
          console.log("Auth state changed:", newSession);
          console.log("User role on authchange session:", newSession?.user_metadata.role);
        } catch (error) {
          console.error("Error in auth state change:", error);
        }
      },
    );
    return () => {
      authListener.subscription.unsubscribe();
    };
  } , [loading]);
  return (
    <UserContext.Provider value={{ user, loading , role }}>
      {children}
    </UserContext.Provider>
  );
};
