import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: resolve(__dirname, "dist"),
    lib: {
      entry: resolve(__dirname, "src/index.js"),
      name: "Linear-Timecode",
      fileName: "linear-timecode",
    },
    test: {
    /* for example, use global to avoid globals imports (describe, test, expect): */
    // globals: true,
    },
  },
});