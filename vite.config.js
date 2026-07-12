import { createClient } from "@supabase/supabase-js";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],
    server: {
      middlewareMode: false,
      proxy: {},
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/admin-data")) {
          next();
          return;
        }

        const url = new URL(req.url, "http://localhost");
        const tableName = url.searchParams.get("table");

        if (!tableName) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: "Missing table name" }));
          return;
        }

        const supurl =
          env.VITE_SUPABASE_URL ||
          env.SUPABASE_URL ||
          process.env.VITE_SUPABASE_URL;
        const serviceRoleKey =
          env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
          env.SUPABASE_SERVICE_ROLE_KEY ||
          process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

        if (!supurl || !serviceRoleKey) {
          res.statusCode = 500;
          res.end(
            JSON.stringify({
              error: "Missing Supabase service-role configuration",
            }),
          );
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
          res.statusCode = 500;
          res.end(JSON.stringify({ error: error.message }));
          return;
        }

        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ data }));
      });
    },
  };
});
