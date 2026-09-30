import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    // Für Komponenten-Tests brauchen wir später "jsdom".
    environment: "node",
  },
});
