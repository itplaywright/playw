const fs = require('fs');
let d = fs.readFileSync('src/components/admin/TaskEditor.tsx', 'utf8');

d = d.replace(`            if (data.content) {
                setFormData(prev => ({ ...prev, description: data.content }))
            }`, `            if (data.content) {
                if (langTab === 'uk') setFormData(prev => ({ ...prev, description: data.content }))
                else if (langTab === 'en') setFormData(prev => ({ ...prev, descriptionEn: data.content }))
                else setFormData(prev => ({ ...prev, descriptionRu: data.content }))
            }`);

d = d.replace(`                body: JSON.stringify({
                    prompt: formData.title,
                    type: "description"
                })`, `                body: JSON.stringify({
                    prompt: langTab === 'uk' ? formData.title : langTab === 'en' ? formData.titleEn : formData.titleRu,
                    type: "description",
                    language: langTab
                })`);

fs.writeFileSync('src/components/admin/TaskEditor.tsx', d);
