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

console.log('✅ Assets copied to standalone folder');
