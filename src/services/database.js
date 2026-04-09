
import { createClient  } from "@supabase/supabase-js/dist/index.cjs";

const supurl = import.meta.env.VITE_SUPABASE_URL;
const supkey = import.meta.env.VITE_SUPABASE_KEY;

export const db = createClient(supurl , supkey)