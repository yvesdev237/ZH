import { createClient } from "@supabase/supabase-js";

const supurl = import.meta.env.VITE_SUPABASE_URL;
const supkey = import.meta.env.VITE_SUPABASE_KEY;

export const db = createClient(supurl, supkey);
