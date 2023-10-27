#!/usr/bin/env node
import { execSync } from 'child_process';
import path from 'path';

// Extract the directory from the file URL
const currentDir = path.dirname(new URL(import.meta.url).pathname);

const codegenPath = path.join(currentDir, '../../../../.bin/graphql-codegen');
const args = process.argv.slice(2).join(' '); // get the arguments passed to the script
const command = `${codegenPath} ${args}`;

execSync(command, { stdio: 'inherit' }); // execute the command and inherit the stdio to see logs/errors in the console
