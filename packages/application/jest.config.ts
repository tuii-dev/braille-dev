import { pathsToModuleNameMapper } from "ts-jest";
// In the following statement, replace `./tsconfig` with the path to your `tsconfig` file
// which contains the path mapping (ie the `compilerOptions.paths` option):
import { compilerOptions } from "./tsconfig.json";
import type { JestConfigWithTsJest } from "ts-jest";

const jestConfig: JestConfigWithTsJest = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  rootDir: "src",
  roots: ["<rootDir>"],
  transformIgnorePatterns: ["node_modules/(?!(nanoid))"],
  moduleFileExtensions: ["js", "json", "ts"],
  moduleNameMapper: {
    "^@/lib/(.*)$": "<rootDir>/lib/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/setupTests.ts"],
};

export default jestConfig;
