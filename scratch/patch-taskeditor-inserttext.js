const fs = require('fs');
let d = fs.readFileSync('src/components/admin/TaskEditor.tsx', 'utf8');

d = d.replace('const text = formData.description', "const text = langTab === 'uk' ? formData.description : langTab === 'en' ? formData.descriptionEn : formData.descriptionRu;");

d = d.replace('setFormData({ ...formData, description: newText })', "if (langTab === 'uk') setFormData({ ...formData, description: newText }); else if (langTab === 'en') setFormData({ ...formData, descriptionEn: newText }); else setFormData({ ...formData, descriptionRu: newText });");

fs.writeFileSync('src/components/admin/TaskEditor.tsx', d);
