const fs = require('fs');
let d = fs.readFileSync('src/components/admin/TaskEditor.tsx', 'utf8');

// Update formData initialization
d = d.replace('title: initialData?.title || "",', 'title: initialData?.title || "",\n        titleEn: initialData?.titleEn || "",\n        titleRu: initialData?.titleRu || "",');
d = d.replace('description: initialData?.description || "",', 'description: initialData?.description || "",\n        descriptionEn: initialData?.descriptionEn || "",\n        descriptionRu: initialData?.descriptionRu || "",');

// Add translation inputs for title
const titleInputStr = `<label className="block text-[10px] font-black uppercase text-muted-foreground mb-2 ml-1">Назва завдання (Укр)</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-[#0d1117] border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
                                    placeholder="Введіть назву..."
                                />`;

const titleTranslationsStr = `${titleInputStr}
                                <div className="grid grid-cols-2 gap-6 mt-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-muted-foreground mb-2 ml-1">Назва (EN)</label>
                                        <input
                                            type="text"
                                            value={formData.titleEn}
                                            onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                                            className="w-full bg-[#0d1117] border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
                                            placeholder="Title in English..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-muted-foreground mb-2 ml-1">Назва (RU)</label>
                                        <input
                                            type="text"
                                            value={formData.titleRu}
                                            onChange={(e) => setFormData({ ...formData, titleRu: e.target.value })}
                                            className="w-full bg-[#0d1117] border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
                                            placeholder="Название на русском..."
                                        />
                                    </div>
                                </div>`;

d = d.replace(titleInputStr, titleTranslationsStr);

// The description part is trickier since it has a markdown editor and preview. 
// For descriptionEn and descriptionRu, we can just use normal textareas or render the same editor structure.
// I will search for the description markdown structure and append standard textareas below it for EN and RU.
// Let's first read exactly how the markdown area looks.
fs.writeFileSync('src/components/admin/TaskEditor.tsx', d);
