#!/usr/bin/env node

// codegenegen/graphql-codegen-wrapper.ts
import {execSync} from "child_process";
import path from "path";
var currentDir = path.dirname(new URL(import.meta.url).pathname);
var codegenPath = path.join(currentDir, "../../../../.bin/graphql-codegen");
var args = process.argv.slice(2).join(" ");
var command = `${codegenPath} ${args}`;
execSync(command, { stdio: "inherit" });
