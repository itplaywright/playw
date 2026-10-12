const fs = require('fs');
let d = fs.readFileSync('src/components/admin/TaskEditor.tsx', 'utf8');

const oldTextarea = `<textarea
                                    id="description-editor"
                                    required
                                    rows={10}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-6 py-6 bg-secondary/30 border border-border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:bg-card outline-none transition-all resize-none custom-scrollbar text-sm font-medium leading-relaxed font-mono text-foreground"
                                    placeholder="## Теорія..."
                                />`;

const newTextarea = `<textarea
                                    id="description-editor"
                                    required={langTab === 'uk'}
                                    rows={10}
                                    value={langTab === 'uk' ? formData.description : langTab === 'en' ? formData.descriptionEn : formData.descriptionRu}
                                    onChange={(e) => {
                                        if (langTab === 'uk') setFormData({ ...formData, description: e.target.value })
                                        if (langTab === 'en') setFormData({ ...formData, descriptionEn: e.target.value })
                                        if (langTab === 'ru') setFormData({ ...formData, descriptionRu: e.target.value })
                                    }}
                                    className="w-full px-6 py-6 bg-secondary/30 border border-border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:bg-card outline-none transition-all resize-none custom-scrollbar text-sm font-medium leading-relaxed font-mono text-foreground"
                                    placeholder={langTab === 'uk' ? "## Теорія..." : langTab === 'en' ? "## Theory..." : "## Теория..."}
                                />`;

if (d.includes('id="description-editor"')) {
    d = d.replace(oldTextarea, newTextarea);
    fs.writeFileSync('src/components/admin/TaskEditor.tsx', d);
    console.log("SUCCESS TEXTAREA");
} else {
    console.log("FAILED TEXTAREA");
}
