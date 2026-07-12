import { useEffect, useState } from "react";
import { db } from "../services/database";
import { UserContext } from "./UserContext";

export const ContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [isRecoverySession, setIsRecoverySession] = useState(false);
  const favoriteKey = "zilo_favorites";
  const [favorites, setFavorites] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(favoriteKey) || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(favoriteKey, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleStorage = (event) => {
      if (event.key !== favoriteKey) return;
      try {
        setFavorites(JSON.parse(event.newValue || "[]"));
      } catch {
        setFavorites([]);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const toggleFavorite = (listingId) => {
    if (!listingId) return;
    setFavorites((current) =>
      current.includes(listingId)
        ? current.filter((id) => id !== listingId)
        : [...current, listingId],
    );
  };

  const isFavorite = (listingId) => favorites.includes(listingId);

  const refreshSession = async () => {
    try {
      const { data, error } = await db.auth.getSession();
      if (error) throw error;
      if (data.session?.user) {
        setUser(data.session.user ?? null);
        setRole(data.session.user?.user_metadata.role ?? null);
        setIsRecoverySession(false);
      } else {
        setUser(null);
        setRole(null);
        setIsRecoverySession(false);
      }
    } catch (error) {
      console.error("Error refreshing session:", error);
    }
  };

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data, error } = await db.auth.getSession();
        if (error) throw error;
        if (data.session?.user) {
          setUser(data.session.user ?? null);
          setRole(data.session.user?.user_metadata.role ?? null);
          setIsRecoverySession(false);
          console.log(
            "User role on get session:",
            data.session.user?.user_metadata.role,
          );
          console.log("User session found:", data.session.user);
        } else {
          setUser(null);
          setIsRecoverySession(false);
          console.log("No user session found");
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false);
        console.log("Finished fetching session, loading set to false");
      }
    };
    getSession();

    const { data: authListener } = db.auth.onAuthStateChange(
      (event, session) => {
        try {
          const newSession = session?.user;
          const isPasswordRecovery = event === "PASSWORD_RECOVERY";

          setUser(newSession ?? null);
          setRole(newSession?.user_metadata.role ?? null);
          setIsRecoverySession(isPasswordRecovery && Boolean(session));

          console.log("Auth state changed:", event, newSession);
          console.log(
            "User role on authchange session:",
            newSession?.user_metadata.role,
          );
        } catch (error) {
          console.error("Error in auth state change:", error);
        }
      },
    );
    return () => {
      authListener?.subscription?.unsubscribe?.();
    };
  }, []);
  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        role,
        refreshSession,
        favorites,
        toggleFavorite,
        isFavorite,
        isRecoverySession,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
