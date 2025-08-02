import { defineConfig } from "vite";
import monacoEditorPlugin from "vite-plugin-monaco-editor";
import { createHtmlPlugin } from "vite-plugin-html";

export default defineConfig({
  root: "docs-src", // ponto de entrada dos arquivos fonte
  build: {
    outDir: "../docs", // saída para a pasta `docs` como no Webpack
    emptyOutDir: false, // equivalente ao `clean: { keep: ... }`
  },
  plugins: [
    createHtmlPlugin({
      minify: true,
      pages: [
        {
          entry: "scripts/main.js",
          filename: "index.html",
          template: "index.html",
        },
        {
          entry: "scripts/iframe.js",
          filename: "iframe.html",
          template: "iframe.html",
        },
      ],
    }),
    monacoEditorPlugin.default({
      languageWorkers: ["editorWorkerService", "typescript"],
    }),
  ],
  server: {
    port: 3000,
  },
});
