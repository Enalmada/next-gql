import fs from 'fs';
import path from 'path';

const clientDirectiveRegex = /^\s*["']use client["'];/m;

function findFilesWithDirective(directory: string) {
  let results: string[] = [];

  const items = fs.readdirSync(directory);

  items.forEach((item) => {
    const itemPath = path.join(directory, item);
    const stat = fs.statSync(itemPath);

    if (stat && stat.isDirectory()) {
      results = results.concat(findFilesWithDirective(itemPath));
    } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
      const content = fs.readFileSync(itemPath, 'utf-8');
      if (clientDirectiveRegex.test(content)) {
        results.push(itemPath);
      }
    }
  });

  return results;
}

function prependDirectiveToBuiltFiles(srcDirectory: string, buildDirectory: string) {
  const files = findFilesWithDirective(srcDirectory);

  files.forEach((file) => {
    const relativePath = path.relative(srcDirectory, file);
    const distPath = path.join(buildDirectory, relativePath).replace(/\.tsx?$/, '.js');

    if (fs.existsSync(distPath)) {
      const content = fs.readFileSync(distPath, 'utf-8');
      const updatedContent = `'use client';\n\n${content}`;
      fs.writeFileSync(distPath, updatedContent);
      // eslint-disable-next-line no-console
      console.log(`Prepended 'use client' directive to ${distPath}`);
    }
  });
}

export { prependDirectiveToBuiltFiles };
