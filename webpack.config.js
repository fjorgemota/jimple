import path from "path";
import { fileURLToPath } from "url";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import MonacoEditorWebpackPlugin from "monaco-editor-webpack-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: {
    index: "./docs-src/scripts/main.js",
    iframe: "./docs-src/scripts/iframe.js",
  },
  output: {
    path: path.resolve(__dirname, "docs"),
    filename: "[name].js",
    clean: {
      keep: /^(api).*/, // Keep existing API docs and UMD bundle
    },
  },
  stats: {
    warningsFilter: /typescript/,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.html$/i,
        use: "html-loader",
      },
      {
        test: /\.d.ts$/i,
        use: "raw-loader",
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./docs-src/index.html",
      filename: "index.html",
      chunks: ["index"],
    }),
    new HtmlWebpackPlugin({
      template: "./docs-src/iframe.html",
      filename: "iframe.html",
      chunks: ["iframe"],
    }),
    new MiniCssExtractPlugin({
      filename: "styles.[name].css",
    }),
    new MonacoEditorWebpackPlugin(),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, "docs"),
    },
    compress: true,
    port: 3000,
    open: true,
  },
  mode: "production",
};
