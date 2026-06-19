#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const packageRoot = path.join(__dirname, '..');
const projectRoot = process.cwd();

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyDir(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) {
    console.warn(`⚠️  Source not found: ${srcDir}`);
    return 0;
  }

  fs.mkdirSync(destDir, { recursive: true });
  let count = 0;

  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) {
      continue;
    }

    const src = path.join(srcDir, entry.name);
    const dest = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      count += copyDir(src, dest);
    } else {
      copyFile(src, dest);
      count += 1;
    }
  }

  return count;
}

const tasks = [
  { label: 'Cursor index', src: 'cursor/cursorrules.template', dest: '.cursorrules' },
  { label: 'Cursor rules', src: 'cursor/rules', dest: '.cursor/rules', dir: true },
  { label: 'Copilot index', src: 'copilot/copilot-instructions.md', dest: '.github/copilot-instructions.md' },
  { label: 'Copilot instructions', src: 'copilot/instructions', dest: '.github/instructions', dir: true },
  { label: 'Claude Code index', src: 'claude/CLAUDE.md.template', dest: '.claude/CLAUDE.md' },
  { label: 'Claude Code rules', src: 'claude/rules', dest: '.claude/rules', dir: true },
];

let synced = 0;

for (const task of tasks) {
  const src = path.join(packageRoot, task.src);
  const dest = path.join(projectRoot, task.dest);

  if (task.dir) {
    const count = copyDir(src, dest);
    synced += count;
    console.log(`✅ ${task.label} → ${task.dest}/ (${count} file(s))`);
  } else if (fs.existsSync(src)) {
    copyFile(src, dest);
    synced += 1;
    console.log(`✅ ${task.label} → ${task.dest}`);
  } else {
    console.warn(`⚠️  ${task.label}: source not found at ${task.src}`);
  }
}

console.log(`\n✅ Global AI rules synced (${synced} file(s) total).`);
console.log('   Project-specific rules: add files under .cursor/rules/ with unique names.');
