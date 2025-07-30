import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import MonacoEditorWebpackPlugin   from "monaco-editor-webpack-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: './docs-src/scripts/main.js',
  output: {
    path: path.resolve(__dirname, 'docs'),
    filename: 'main.js',
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
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.html$/i,
        use: 'html-loader',
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './docs-src/index.html',
      filename: 'index.html',
    }),
    new MiniCssExtractPlugin({
      filename: 'styles.css',
    }),
      new MonacoEditorWebpackPlugin(),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'docs'),
    },
    compress: true,
    port: 3000,
    open: true,
  },
  mode: 'production',
};
