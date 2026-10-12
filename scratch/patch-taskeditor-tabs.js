const fs = require('fs');
let d = fs.readFileSync('src/components/admin/TaskEditor.tsx', 'utf8');

// 1. Add fields to formData
d = d.replace('title: initialData?.title || "",', 'title: initialData?.title || "",\n        titleEn: initialData?.titleEn || "",\n        titleRu: initialData?.titleRu || "",');
d = d.replace('description: initialData?.description || "",', 'description: initialData?.description || "",\n        descriptionEn: initialData?.descriptionEn || "",\n        descriptionRu: initialData?.descriptionRu || "",');

// 2. Add langTab state
d = d.replace('const [isPreview, setIsPreview] = useState(false)', 'const [isPreview, setIsPreview] = useState(false)\n    const [langTab, setLangTab] = useState<"uk"|"en"|"ru">("uk")');

// 3. Add langTab UI and swap title input
const titleHtml = `<div className="flex items-center justify-between mb-2">
                                    <label className="block text-[10px] font-black uppercase text-muted-foreground ml-1">Назва завдання (без номеру)</label>
                                    <div className="flex bg-secondary/50 rounded-xl p-1">
                                        {(["uk", "en", "ru"] as const).map(lang => (
                                            <button
                                                key={lang}
                                                type="button"
                                                onClick={() => setLangTab(lang)}
                                                className={\`px-3 py-1 text-[9px] font-black uppercase rounded-lg transition-all \${langTab === lang ? "bg-card text-blue-600 shadow-sm" : "text-muted-foreground hover:text-foreground"}\`}
                                            >
                                                {lang}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <input
                                    required={langTab === 'uk'}
                                    type="text"
                                    value={langTab === 'uk' ? formData.title : langTab === 'en' ? formData.titleEn : formData.titleRu}
                                    onChange={(e) => {
                                        if (langTab === 'uk') setFormData({ ...formData, title: e.target.value })
                                        if (langTab === 'en') setFormData({ ...formData, titleEn: e.target.value })
                                        if (langTab === 'ru') setFormData({ ...formData, titleRu: e.target.value })
                                    }}
                                    className="w-full px-4 py-3 bg-secondary/30 border border-border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-card outline-none transition-all font-black text-foreground text-sm"
                                    placeholder={langTab === 'uk' ? "Вступ: Перший запуск" : langTab === 'en' ? "Intro: First run" : "Введение: Первый запуск"}
                                />`;

d = d.replace(`<label className="block text-[10px] font-black uppercase text-muted-foreground mb-2 ml-1">Назва завдання (без номеру)</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-card outline-none transition-all font-black text-foreground text-sm"
                                    placeholder="Вступ: Перший запуск"
                                />`, titleHtml);

// 4. Modify description textarea to handle languages
const descTextareaOld = `<textarea
                                    id="description-editor"
                                    required
                                    rows={10}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-6 py-5 bg-secondary/30 border border-border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:bg-card outline-none transition-all font-medium resize-none font-mono text-sm text-foreground custom-scrollbar"
                                    placeholder="Використовуйте Markdown для форматування..."
                                />`;
const descTextareaNew = `<textarea
                                    id="description-editor"
                                    required={langTab === 'uk'}
                                    rows={10}
                                    value={langTab === 'uk' ? formData.description : langTab === 'en' ? formData.descriptionEn : formData.descriptionRu}
                                    onChange={(e) => {
                                        if (langTab === 'uk') setFormData({ ...formData, description: e.target.value })
                                        if (langTab === 'en') setFormData({ ...formData, descriptionEn: e.target.value })
                                        if (langTab === 'ru') setFormData({ ...formData, descriptionRu: e.target.value })
                                    }}
                                    className="w-full px-6 py-5 bg-secondary/30 border border-border rounded-3xl focus:ring-2 focus:ring-blue-500 focus:bg-card outline-none transition-all font-medium resize-none font-mono text-sm text-foreground custom-scrollbar"
                                    placeholder={langTab === 'uk' ? "Використовуйте Markdown для форматування..." : "Use Markdown..."}
                                />`;

d = d.replace(descTextareaOld, descTextareaNew);

// 5. Modify description preview to handle languages
const previewOld = `{formData.description || "*Немає опису... Спробуйте AI Generate!*"}`;
const previewNew = `{langTab === 'uk' ? (formData.description || "*Немає опису... Спробуйте AI Generate!*") : langTab === 'en' ? (formData.descriptionEn || "*No description...*") : (formData.descriptionRu || "*Нет описания...*")}`;

d = d.replace(previewOld, previewNew);

fs.writeFileSync('src/components/admin/TaskEditor.tsx', d);
