import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { cartographer } from "@replit/vite-plugin-cartographer";
import { mockupPreviewPlugin } from "./mockupPreviewPlugin";

function parsePort(rawPort: string | undefined, fallbackPort: number): number {
  const value = rawPort?.trim() || String(fallbackPort);
  const port = Number(value);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }
  return port;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, "");
  const port = parsePort(env.PORT, 5174);
  const basePath = env.BASE_PATH?.trim() || "/";

  return {
    base: basePath,
    plugins: [
      mockupPreviewPlugin(),
      react(),
      tailwindcss(),
      runtimeErrorOverlay(),
      ...(mode !== "production" && env.REPL_ID !== undefined
        ? [
          cartographer({
            root: path.resolve(import.meta.dirname, ".."),
          }),
        ]
        : []),
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
      },
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist"),
      emptyOutDir: true,
    },
    server: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
    preview: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
    },
  };
});
