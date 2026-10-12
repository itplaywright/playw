const fs = require('fs');
let d = fs.readFileSync('src/components/admin/TaskEditor.tsx', 'utf8');

let idx = d.indexOf('<textarea');
let endIdx = d.indexOf('/>', idx) + 2;

let oldTxt = d.substring(idx, endIdx);

let newTxt = `<textarea
                                    id="description-editor"
                                    required={langTab === 'uk'}
                                    rows={10}
                                    value={langTab === 'uk' ? formData.description : langTab === 'en' ? (formData.descriptionEn || '') : (formData.descriptionRu || '')}
                                    onChange={(e) => {
                                        if (langTab === 'uk') setFormData({ ...formData, description: e.target.value })
                                        if (langTab === 'en') setFormData({ ...formData, descriptionEn: e.target.value })
                                        if (langTab === 'ru') setFormData({ ...formData, descriptionRu: e.target.value })
                                    }}
                                    className="w-full px-6 py-5 bg-secondary/30 border border-border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:bg-card outline-none transition-all resize-none custom-scrollbar text-sm font-medium leading-relaxed font-mono text-foreground"
                                    placeholder={langTab === 'uk' ? '## Теорія...' : langTab === 'en' ? '## Theory...' : '## Теория...'}
                                />`;

d = d.replace(oldTxt, newTxt);
fs.writeFileSync('src/components/admin/TaskEditor.tsx', d);
console.log("TEXTAREA REPLACED!");
