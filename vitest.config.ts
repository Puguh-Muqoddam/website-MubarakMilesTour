import { defineConfig } from "vitest/config";
import path from "node:path";
import fs from "node:fs";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  plugins: [
    {
      name: "wasm-module-loader",
      transform(_code, id) {
        if (id.includes(".wasm?module")) {
          const filePath = id.replace(/\?module.*$/, "");
          const buffer = fs.readFileSync(filePath);
          return {
            code: `const buffer = Buffer.from(${JSON.stringify(buffer.toString("base64"))}, "base64");
                   const module = new WebAssembly.Module(buffer);
                   export default module;`,
            map: null,
          };
        }
      },
    },
  ],
  test: {
    environment: "node",
    alias: { "server-only": path.resolve(__dirname, "test/server-only-stub.ts") },
  },
});
