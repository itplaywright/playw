const fs = require('fs');
let d = fs.readFileSync('src/components/admin/TaskEditor.tsx', 'utf8');
console.log('langTab:', d.includes('langTab'));
console.log('titleEn:', d.includes('titleEn'));
console.log('setLangTab:', d.includes('setLangTab'));
