import * as vscode from "vscode";

export interface ExtensionConfig {
  tsconfig: string;
}

export function loadConfig(): ExtensionConfig {
  const config = vscode.workspace.getConfiguration();
  const tsconfig = config.get<string>("vscode-type-only-imports.tsconfig");

  return {
    tsconfig: tsconfig ?? "./tsconfig.json",
  };
}
