import Jimple from "../../dist/Jimple.module.js";
import libSource from "../../dist/Jimple.d.ts?raw";
import * as monaco from "monaco-editor";
import { examples } from "./examples.js";

window.Jimple = Jimple;

const libUri = "file:///Jimple.d.ts";
const urlParams = new URLSearchParams(window.location.search);
const exampleKey = !!examples[urlParams.get("example")]
  ? urlParams.get("example")
  : "quickstart";

const currentLang = ["typescript", "javascript"].includes(
  urlParams.get("language"),
)
  ? urlParams.get("language")
  : "typescript";

// compiler options
monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
  allowNonTsExtensions: true,
  moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
  target: monaco.languages.typescript.ScriptTarget.ES2020,
  module: monaco.languages.typescript.ModuleKind.ESNext,
  noLib: false,
});

// validation settings
monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
  noSemanticValidation: currentLang === "javascript",
  noSyntaxValidation: false,
});

const jimpleSource = libSource
  .replace("export default", "declare")
  .replace("export {}", "")
  .replace(/export/g, "");

monaco.languages.typescript.javascriptDefaults.addExtraLib(
  jimpleSource,
  libUri,
);
monaco.editor.createModel(jimpleSource, "typescript", monaco.Uri.parse(libUri));

const editor = monaco.editor.create(document.getElementById("editor"), {
  model: monaco.editor.createModel(
    examples[exampleKey][currentLang] ?? "",
    currentLang,
    monaco.Uri.parse(
      "file://example." + (currentLang === "typescript" ? "ts" : "js"),
    ),
  ),
  theme: "vs-dark",
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  fontSize: 14,
  automaticLayout: true,
});

window.addEventListener("message", (message) => {
  if (
    message.data?.type === "run-code" &&
    message.data?.exampleKey === exampleKey
  ) {
    runCode(editor);
  }
});

function runCode(editor) {
  runCodeInternal(editor).then(
    (outputContent) => {
      window.parent.postMessage(
        {
          type: "update-output",
          exampleKey,
          outputContent,
        },
        "*",
      );
    },
    (e) => {
      window.parent.postMessage(
        {
          type: "update-output",
          exampleKey,
          outputContent:
            "Internal error. Please, report an issue on https://github.com/fjorgemota/Jimple/ with the following error: " +
            e.message,
        },
        "*",
      );
    },
  );
}

async function runCodeInternal(editor) {
  const code = editor.getValue();

  // Capture console output
  const originalLog = console.log;
  const originalError = console.error;
  const logs = [];

  console.log = (...args) => {
    logs.push({ type: "log", args });
    originalLog(...args);
  };

  console.error = (...args) => {
    logs.push({ type: "error", args });
    originalError(...args);
  };

  try {
    let executableCode = code;

    // Remove import statements for demo
    executableCode = executableCode
      .replace(/import.*from.*['"];?/g, "")
      .replace(/export.*{.*};?/g, "");

    // Transpile TypeScript to JavaScript if needed
    if (currentLang === "typescript") {
      try {
        executableCode = await transpileTypeScript(executableCode);
      } catch (transpileError) {
        return `<div style="color: #ef4444;">TypeScript Error: ${transpileError.message}</div>`;
      }
    }

    // Execute the code
    eval(executableCode);

    // Display output
    if (logs.length === 0) {
      return '<span style="color: #64748b;">Code executed successfully (no output)</span>';
    } else {
      return logs
        .map((log) => {
          const color = log.type === "error" ? "#ef4444" : "#94a3b8";
          const content = log.args
            .map((arg) =>
              typeof arg === "object"
                ? JSON.stringify(arg, null, 2)
                : String(arg),
            )
            .join(" ");
          return `<div style="color: ${color}; margin-bottom: 0.5rem;">${content}</div>`;
        })
        .join("");
    }
  } catch (error) {
    return `<div style="color: #ef4444;">Runtime Error: ${error.message}</div>`;
  } finally {
    // Restore console
    console.log = originalLog;
    console.error = originalError;
  }
}

// Robust TypeScript transpiler using the official TypeScript compiler
async function transpileTypeScript(code) {
  const ts = await import("typescript");
  try {
    const compilerOptions = {
      target: ts.ScriptTarget.ES2018,
      module: ts.ModuleKind.None,
      removeComments: false,
      strict: false,
      skipLibCheck: true,
      skipDefaultLibCheck: true,
      allowJs: true,
      noEmitOnError: false,
      noImplicitAny: false,
      suppressImplicitAnyIndexErrors: true,
      // Additional options for better compatibility
      downlevelIteration: true,
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
    };

    const result = ts.transpile(code, compilerOptions);

    if (!result) {
      throw new Error("Failed to transpile TypeScript code");
    }

    return result;
  } catch (error) {
    // If TypeScript compilation fails, provide helpful error
    throw new Error(
      `TypeScript compilation failed: ${error.message || "Unknown error"}`,
    );
  }
}
