import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const tableName = req.query.table;
  if (!tableName) {
    res.status(400).json({ error: "Missing table name" });
    return;
  }

  const supurl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey =
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supurl || !serviceRoleKey) {
    res
      .status(500)
      .json({ error: "Missing Supabase service-role configuration" });
    return;
  }

  const adminClient = createClient(supurl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await adminClient
    .from(tableName)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ data });
}
