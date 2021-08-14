import { commands, ExtensionContext, window } from "vscode";
import { loadConfig } from "./config";
import { rewriteImports } from "./rewriteImports";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext): void {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log("vscode-type-only-imports is now active");

  const convertImportsExports = commands.registerCommand("vscode-type-only-imports.convert-imports-exports", () => {
    convertImportExports("both");
  });
  const convertImports = commands.registerCommand("vscode-type-only-imports.convert-imports", () => {
    convertImportExports("imports");
  });
  const convertExports = commands.registerCommand("vscode-type-only-imports.convert-exports", () => {
    convertImportExports("exports");
  });

  context.subscriptions.push(convertImportsExports);
  context.subscriptions.push(convertImports);
  context.subscriptions.push(convertExports);
}

// this method is called when your extension is deactivated
export function deactivate(): void {
  // noop
}

function convertImportExports(convert: "imports" | "exports" | "both") {
  const editor = window.activeTextEditor;
  if (!editor) {
    return;
  }
  const config = loadConfig();
  rewriteImports(editor, config, convert);
}
