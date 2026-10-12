const fs = require('fs');
let d = fs.readFileSync('src/components/admin/TaskEditor.tsx', 'utf8');

const anchor = `                                <textarea
                                    id="description-editor"
                                    required
                                    rows={10}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-6 py-6 bg-transparent border-none focus:ring-0 outline-none resize-none text-foreground text-sm font-medium leading-relaxed font-mono selection:bg-blue-500/30"
                                    placeholder="Write description in Markdown..."
                                />`;

const replacement = anchor + `
                                <div className="p-4 border-t border-white/5 space-y-4 bg-black/20">
                                    <label className="block text-[10px] font-black uppercase text-muted-foreground mb-1 ml-1">Опис (EN)</label>
                                    <textarea
                                        rows={4}
                                        value={formData.descriptionEn}
                                        onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                                        className="w-full bg-[#0d1117] border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-blue-500 transition-colors shadow-inner font-mono"
                                        placeholder="Description in English..."
                                    />
                                    <label className="block text-[10px] font-black uppercase text-muted-foreground mb-1 ml-1">Опис (RU)</label>
                                    <textarea
                                        rows={4}
                                        value={formData.descriptionRu}
                                        onChange={(e) => setFormData({ ...formData, descriptionRu: e.target.value })}
                                        className="w-full bg-[#0d1117] border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-blue-500 transition-colors shadow-inner font-mono"
                                        placeholder="Название на русском..."
                                    />
                                </div>
`;

d = d.replace(anchor, replacement);
fs.writeFileSync('src/components/admin/TaskEditor.tsx', d);
