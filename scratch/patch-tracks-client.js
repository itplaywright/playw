const fs = require('fs');
let d = fs.readFileSync('src/components/admin/TracksClient.tsx', 'utf8');

d = d.replace('title: string', 'title: string\n    titleEn?: string | null\n    titleRu?: string | null');
d = d.replace('description: string | null', 'description: string | null\n    descriptionEn?: string | null\n    descriptionRu?: string | null');

d = d.replace(`        title: "",
        description: "",
        order: 0,
        isActive: true`, `        title: "", titleEn: "", titleRu: "",
        description: "", descriptionEn: "", descriptionRu: "",
        order: 0,
        isActive: true`);

d = d.replace(`                title: track.title,
                description: track.description || "",`, `                title: track.title, titleEn: track.titleEn || "", titleRu: track.titleRu || "",
                description: track.description || "", descriptionEn: track.descriptionEn || "", descriptionRu: track.descriptionRu || "",`);

d = d.replace(`                title: "",
                description: "",
                order: tracks.length,`, `                title: "", titleEn: "", titleRu: "",
                description: "", descriptionEn: "", descriptionRu: "",
                order: tracks.length,`);

d = d.replace(`                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[13px] font-bold text-slate-300 mb-1">
                                        Назва рівня
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-[#0d1117] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>`, `                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[13px] font-bold text-slate-300 mb-1">
                                        Назва рівня (Укр)
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-[#0d1117] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[13px] font-bold text-slate-300 mb-1">
                                            Назва (EN)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.titleEn}
                                            onChange={e => setFormData({ ...formData, titleEn: e.target.value })}
                                            className="w-full bg-[#0d1117] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[13px] font-bold text-slate-300 mb-1">
                                            Назва (RU)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.titleRu}
                                            onChange={e => setFormData({ ...formData, titleRu: e.target.value })}
                                            className="w-full bg-[#0d1117] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                </div>`);

d = d.replace(`                                <div>
                                    <label className="block text-[13px] font-bold text-slate-300 mb-1">
                                        Опис рівня
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-[#0d1117] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                                    />
                                </div>`, `                                <div>
                                    <label className="block text-[13px] font-bold text-slate-300 mb-1">
                                        Опис рівня (Укр)
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-[#0d1117] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[13px] font-bold text-slate-300 mb-1">
                                            Опис (EN)
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={formData.descriptionEn}
                                            onChange={e => setFormData({ ...formData, descriptionEn: e.target.value })}
                                            className="w-full bg-[#0d1117] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[13px] font-bold text-slate-300 mb-1">
                                            Опис (RU)
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={formData.descriptionRu}
                                            onChange={e => setFormData({ ...formData, descriptionRu: e.target.value })}
                                            className="w-full bg-[#0d1117] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                                        />
                                    </div>
                                </div>`);


fs.writeFileSync('src/components/admin/TracksClient.tsx', d);
