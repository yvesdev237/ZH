import { db } from "./database";

const ADMIN_ROLE = "admin";

export const fetchAdminTableRows = async (tableName) => {
  if (!tableName) {
    return [];
  }

  try {
    const response = await fetch(
      `/api/admin-data?table=${encodeURIComponent(tableName)}`,
    );

    if (response.ok) {
      const payload = await response.json();
      if (!payload?.error) {
        return payload?.data || [];
      }
    }
  } catch (error) {
    console.warn(`Admin API fetch failed for ${tableName}`, error);
  }

  try {
    const { data, error } = await db
      .from(tableName)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn(`Admin table query failed for ${tableName}`, error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.warn(`Admin table query crashed for ${tableName}`, error);
    return [];
  }
};

export const resolveUserRole = async (authUser) => {
  if (!authUser?.id) {
    return authUser?.user_metadata?.role ?? null;
  }

  try {
    const { data, error } = await db
      .from("profiles")
      .select("role")
      .eq("id", authUser.id)
      .maybeSingle();

    if (!error && data?.role) {
      return data.role;
    }
  } catch (error) {
    console.warn("Unable to read profiles role", error);
  }

  return authUser?.user_metadata?.role ?? null;
};

export const promoteUserToAdmin = async (userId) => {
  if (!userId) {
    throw new Error("A valid user id is required");
  }

  try {
    const { error } = await db
      .from("profiles")
      .upsert({ id: userId, role: ADMIN_ROLE }, { onConflict: "id" });

    if (error) throw error;
  } catch (error) {
    console.warn("Could not store admin role in profiles", error);
    throw error;
  }

  return { role: ADMIN_ROLE };
};
