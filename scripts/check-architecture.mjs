/* global console, process */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('src');
const sourceFiles = [];
const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.includes('.test.')) sourceFiles.push(full);
  }
};
walk(root);

const graph = new Map(sourceFiles.map((file) => [file, []]));
const importPattern = /from\s+['"](\.[^'"]+)['"]/g;
for (const file of sourceFiles) {
  // Type-only imports disappear at runtime and do not create executable cycles.
  const source = fs.readFileSync(file, 'utf8').replace(/^import type .*?;$/gm, '');
  for (const match of source.matchAll(importPattern)) {
    const base = path.resolve(path.dirname(file), match[1]);
    const target = [base + '.ts', base + '.tsx', path.join(base, 'index.ts')].find(fs.existsSync);
    if (target && graph.has(target)) graph.get(file).push(target);
  }
}

const layer = (file) => path.relative(root, file).split(path.sep)[0];
const forbidden = {
  engine: new Set(['application', 'components', 'hooks']),
  application: new Set(['components', 'hooks']),
  constants: new Set(['application', 'components', 'hooks']),
};
const errors = [];
for (const [from, targets] of graph) {
  for (const to of targets) {
    if (forbidden[layer(from)]?.has(layer(to))) {
      errors.push(`역방향 의존: ${path.relative(root, from)} -> ${path.relative(root, to)}`);
    }
  }
}

const visiting = new Set();
const visited = new Set();
const visit = (file, stack = []) => {
  if (visiting.has(file)) {
    const start = stack.indexOf(file);
    errors.push(
      `순환 의존: ${[...stack.slice(start), file].map((item) => path.relative(root, item)).join(' -> ')}`,
    );
    return;
  }
  if (visited.has(file)) return;
  visiting.add(file);
  for (const target of graph.get(file)) visit(target, [...stack, file]);
  visiting.delete(file);
  visited.add(file);
};
for (const file of sourceFiles) visit(file);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`architecture ok · ${sourceFiles.length} modules · no forbidden or cyclic dependencies`);
