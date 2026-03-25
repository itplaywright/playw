const fs = require('fs');
const path = require('path');

const adminDir = path.join('src', 'app', 'admin');

function walk(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(fullPath));
        } else if (fullPath.endsWith('page.tsx')) {
            results.push(fullPath);
        }
    });
    return results;
}

const pages = walk(adminDir);
console.log(`Found ${pages.length} pages`);

pages.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes('export const dynamic')) {
        const dynamicLine = 'export const dynamic = "force-dynamic"\n';
        if (content.trim().startsWith('"use client"') || content.trim().startsWith("'use client'")) {
            // Insert after "use client"
            content = content.replace(/^(["']use client["'];?\r?\n)/, `$1\n${dynamicLine}`);
        } else if (content.startsWith('import')) {
            // Insert at top or after first block of comments/imports
            content = dynamicLine + content;
        } else {
            content = dynamicLine + content;
        }
        fs.writeFileSync(file, content);
        console.log(`Fixed: ${file}`);
    } else {
        // If it was already fixed but in wrong place (above use client)
        if (content.includes('export const dynamic') && (content.includes('"use client"') || content.includes("'use client'"))) {
             const lines = content.split('\n');
             if (lines[0].includes('export const dynamic') && (lines[1].includes('use client') || lines[2].includes('use client'))) {
                 // Move dynamic down
                 const dynamicStr = lines[0];
                 lines.shift();
                 // Find where use client is and insert after it
                 let useClientIdx = lines.findIndex(l => l.includes('use client'));
                 lines.splice(useClientIdx + 1, 0, '\n' + dynamicStr);
                 fs.writeFileSync(file, lines.join('\n'));
                 console.log(`Re-ordered: ${file}`);
             }
        }
        console.log(`Already has dynamic: ${file}`);
    }
});
