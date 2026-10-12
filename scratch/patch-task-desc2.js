const fs = require('fs');
let d = fs.readFileSync('src/components/admin/TaskEditor.tsx', 'utf8');

const anchor = `                            )}
                        </div>
                    </div>`;

const replacement = `                            )}
                        </div>
                        <div className="p-6 border-t border-border space-y-4 bg-secondary/10">
                            <label className="block text-[10px] font-black uppercase text-muted-foreground mb-1 ml-1">Опис (EN)</label>
                            <textarea
                                rows={4}
                                value={formData.descriptionEn}
                                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                                className="w-full bg-[#0d1117] border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-blue-500 transition-colors shadow-inner font-mono resize-none"
                                placeholder="Description in English..."
                            />
                            <label className="block text-[10px] font-black uppercase text-muted-foreground mb-1 ml-1">Опис (RU)</label>
                            <textarea
                                rows={4}
                                value={formData.descriptionRu}
                                onChange={(e) => setFormData({ ...formData, descriptionRu: e.target.value })}
                                className="w-full bg-[#0d1117] border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-blue-500 transition-colors shadow-inner font-mono resize-none"
                                placeholder="Название на русском..."
                            />
                        </div>
                    </div>`;

d = d.replace(anchor, replacement);
fs.writeFileSync('src/components/admin/TaskEditor.tsx', d);
