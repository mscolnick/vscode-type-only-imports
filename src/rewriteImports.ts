import {
  ExportDeclaration,
  ExportSpecifier,
  ExportSpecifierStructure,
  ImportDeclaration,
  ImportSpecifier,
  ImportSpecifierStructure,
  Node,
  SourceFile
} from "ts-morph";
import * as vscode from "vscode";
import { ExtensionConfig } from "./config";
import { createProject } from "./createProject";

export async function rewriteImports(editor: vscode.TextEditor, config: ExtensionConfig, convert: "imports" | "exports" | "both"): Promise<void> {
  const workspaceDir = getWorkspaceDir();
  if (!workspaceDir) {
    return;
  }

  const project = createProject(workspaceDir, config.tsconfig);

  const sourceFile = project.getSourceFile(editor.document.fileName);
  if (!sourceFile) {
    vscode.window.showErrorMessage(
      `${editor.document.fileName} is not part of your TypeScript project. You typescript project is being read from ${config.tsconfig}.`,
    );
    return;
  }

  if (convert === "both") {
    convertImports(sourceFile);
    convertExports(sourceFile);
  } else if (convert === "imports") {
    convertImports(sourceFile);
  } else if (convert === "exports") {
    convertExports(sourceFile);
  }

  await sourceFile.save();
}

function convertDeclarations(
  declarations: ExportDeclaration[],
  insertDeclaration: (index: number, previous: ExportDeclaration, typeOnlySpecifiers: ExportSpecifierStructure[]) => void,
): void;
function convertDeclarations(
  declarations: ImportDeclaration[],
  insertDeclaration: (index: number, previous: ImportDeclaration, typeOnlySpecifiers: ImportSpecifierStructure[]) => void,
): void;
function convertDeclarations(
  declarations: ImportDeclaration[] | ExportDeclaration[],
  insertDeclaration: (index: number, previous: any, typeOnlyImports: any[]) => void,
): void {
  if (declarations.length === 0) {
    return;
  }

  // get non Type-only imports declarations
  let index = 0;
  for (const declaration of declarations) {
    index++;
    // skip over already converted imports
    if (declaration.isTypeOnly()) {
      continue;
    }

    // get name imports
    const namedImports = Node.isImportDeclaration(declaration) ? declaration.getNamedImports() : declaration.getNamedExports();
    // filter to type-only ones
    const typeOnlyNamedImports = isTypeOnlyForArray(namedImports);
    if (typeOnlyNamedImports.length > 0) {
      // get structures before removing
      const typeOnlyNamedImportStructures = typeOnlyNamedImports.map((im) => im.getStructure());
      // remove them
      typeOnlyNamedImports.forEach((im) => im.remove());
      // add new type-only import declaration
      insertDeclaration(index, declaration, typeOnlyNamedImportStructures);
      // move the index
      index++;
      // if we remove all from the original import, lets remove it altogether
      if (isEmpty(declaration)) {
        declaration.remove();
        index--;
      } else {
        console.log(declaration.getStructure());
      }
    }
  }
}

function convertExports(sourceFile: SourceFile) {
  return convertDeclarations(sourceFile.getExportDeclarations(), (index, previousDeclaration, namedExports) => {
    sourceFile.insertExportDeclaration(index, {
      moduleSpecifier: previousDeclaration.getStructure().moduleSpecifier,
      namedExports,
      isTypeOnly: true,
    });
  });
}

function convertImports(sourceFile: SourceFile) {
  return convertDeclarations(sourceFile.getImportDeclarations(), (index, previousDeclaration, namedImports) => {
    sourceFile.insertImportDeclaration(index, {
      moduleSpecifier: previousDeclaration.getStructure().moduleSpecifier,
      namedImports,
      isTypeOnly: true,
    });
  });
}

/**
 * Checks whether the import selector is a typescript type (won't emit any javascript).
 * This would be a TypeAlias or Interface.
 *
 * In future, this can be smarter and handle Classes or Enums that are only used for the type.
 */
function isTypeOnly(node: ImportSpecifier | ExportSpecifier): boolean {
  const definitionNode = node.getNameNode().getDefinitionNodes()[0];
  if (!definitionNode) {
    return false;
  }
  return Node.isInterfaceDeclaration(definitionNode) || Node.isTypeAliasDeclaration(definitionNode);
}

function isTypeOnlyForArray(nodes: ImportSpecifier[] | ExportSpecifier[]): ImportSpecifier[] | ExportSpecifier[] {
  return (nodes as any).filter(isTypeOnly);
}

function isEmpty(declaration: ImportDeclaration | ExportDeclaration): boolean {
  if (Node.isImportDeclaration(declaration)) {
    return declaration.getNamedImports().length === 0 && declaration.getNamespaceImport() === undefined && declaration.getDefaultImport() === undefined;
  }

  return declaration.getNamedExports().length === 0 && declaration.getNamespaceExport() === undefined;
}

/**
 * Naive, will just get the first workspace directory
 */
function getWorkspaceDir() {
  return vscode.workspace.workspaceFolders?.[0].uri.path;
}
