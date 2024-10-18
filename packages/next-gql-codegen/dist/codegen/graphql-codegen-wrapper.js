#!/usr/bin/env node

// src/codegen/graphql-codegen-wrapper.ts
import { execSync } from "child_process";
import { platform } from "os";
import path from "path";
var currentDir = path.dirname(new URL(import.meta.url).pathname);
var codegenPath = path.join(currentDir, "../../../../.bin/graphql-codegen");
if (platform() === "win32") {
  codegenPath = codegenPath.replace(/^\\/, "");
  codegenPath = codegenPath.replace(/\\/g, "/");
}
var args = process.argv.slice(2).join(" ");
var command = `"${codegenPath}" ${args}`;
try {
  execSync(command, { stdio: "inherit" });
} catch (error) {
  console.error("Error executing command:", error);
  process.exit(1);
}
