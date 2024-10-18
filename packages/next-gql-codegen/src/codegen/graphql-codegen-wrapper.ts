#!/usr/bin/env node
import { execSync } from 'child_process';
import { platform } from 'os';
import path from 'path';

// Extract the directory from the file URL
const currentDir = path.dirname(new URL(import.meta.url).pathname);

// Resolve the correct path for the `graphql-codegen` executable
let codegenPath = path.join(currentDir, '../../../../.bin/graphql-codegen');

// On Windows, fix the path format
if (platform() === 'win32') {
  codegenPath = codegenPath.replace(/^\\/, ''); // Remove leading backslash if present
  codegenPath = codegenPath.replace(/\\/g, '/'); // Convert backslashes to forward slashes
}

const args = process.argv.slice(2).join(' '); // get the arguments passed to the script
const command = `"${codegenPath}" ${args}`;

try {
  execSync(command, { stdio: 'inherit' }); // execute the command and inherit the stdio to see logs/errors in the console
} catch (error) {
  console.error('Error executing command:', error);
  process.exit(1);
}
