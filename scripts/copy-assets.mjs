import * as fs from 'fs';
import * as path from 'path';

function copyDir(src, dest) {
    if (!fs.existsSync(src)) return;
    fs.mkdirSync(dest, { recursive: true });
    let entries = fs.readdirSync(src, { withFileTypes: true });

    for (let entry of entries) {
        let srcPath = path.join(src, entry.name);
        let destPath = path.join(dest, entry.name);

        entry.isDirectory() ?
            copyDir(srcPath, destPath) :
            fs.copyFileSync(srcPath, destPath);
    }
}

// Copy public folder
copyDir('apps/web/public', 'apps/web/.next/standalone/apps/web/public');
// Copy static folder
copyDir('apps/web/.next/static', 'apps/web/.next/standalone/apps/web/.next/static');

// Create a root-level server.js that loads the actual server
const rootServerPath = 'apps/web/.next/standalone/server.js';
const rootServerContent = `
const path = require('path');
process.chdir(path.join(__dirname, 'apps', 'web'));
require('./apps/web/server.js');
`;
fs.writeFileSync(rootServerPath, rootServerContent.trim());

console.log('✅ Assets copied to standalone folder');
console.log('✅ Root server.js created');
