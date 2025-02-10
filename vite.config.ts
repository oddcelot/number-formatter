/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig, loadEnv } from "vite";
import solidPlugin from "vite-plugin-solid";
import devtools from "solid-devtools/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      /*
      Uncomment the following line to enable solid-devtools.
      For more info see https://github.com/thetarnav/solid-devtools/tree/main/packages/extension#readme
      */
      devtools(),
      solidPlugin(),
    ],
    server: {
      port: 3000,
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["node_modules/@testing-library/jest-dom/vitest"],
      // if you have few tests, try commenting this
      // out to improve performance:
      isolate: false,
    },
    build: {
      target: "esnext",
    },
    resolve: {
      conditions: ["development", "browser"],
    },
    base: env.BASE_PATH,
  };
});
