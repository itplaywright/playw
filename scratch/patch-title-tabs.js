const fs = require('fs');
let d = fs.readFileSync('src/components/admin/TaskEditor.tsx', 'utf8');

const oldHtml = `                                <label className="block text-[10px] font-black uppercase text-muted-foreground mb-2 ml-1">Назва завдання (без номеру)</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-card outline-none transition-all font-black text-foreground text-sm"
                                    placeholder="Вступ: Перший запуск"
                                />`;

const newHtml = `                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-[10px] font-black uppercase text-muted-foreground ml-1">Назва завдання (без номеру)</label>
                                    <div className="flex bg-secondary/50 rounded-xl p-1">
                                        {(['uk', 'en', 'ru'] as const).map(lang => (
                                            <button
                                                key={lang}
                                                type="button"
                                                onClick={() => setLangTab(lang)}
                                                className={\`px-3 py-1 text-[9px] font-black uppercase rounded-lg transition-all \${langTab === lang ? 'bg-card text-blue-600 shadow-sm' : 'text-muted-foreground hover:text-foreground'}\`}
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
                                    className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-card outline-none transition-all font-black text-foreground text-sm"
                                    placeholder={langTab === 'uk' ? 'Вступ: Перший запуск' : langTab === 'en' ? 'Intro: First run' : 'Введение: Первый запуск'}
                                />`;

d = d.replace(oldHtml, newHtml);

fs.writeFileSync('src/components/admin/TaskEditor.tsx', d);
