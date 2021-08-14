import * as path from "path";
import { Project } from "ts-morph";

/**
 * Create a ts-morph project.
 */
export function createProject(workspaceDir: string, tsconfigPath: string): Project {
  return new Project({
    tsConfigFilePath: path.resolve(workspaceDir, tsconfigPath),
  });
}
