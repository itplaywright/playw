const fs = require('fs');
let d = fs.readFileSync('src/app/[locale]/admin/layout.tsx', 'utf8');

const oldStructure = `<AdminSidebarItems navigation={navigation} />

                <div className="px-4 py-6 space-y-2 border-t border-border/50">
                    <div className="flex items-center px-4 py-2 text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-1">
                        <Settings className="mr-2 h-3.5 w-3.5" />
                        Settings
                    </div>
                    {settingsNav.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center px-4 py-2 text-xs font-black text-muted-foreground/70 rounded-xl hover:bg-secondary hover:text-foreground transition-all tracking-tight"
                        >
                            <ChevronRight className="mr-2 h-3 w-3 opacity-30" />
                            {item.name}
                        </Link>
                    ))}
                </div>`;

const newStructure = `<div className="flex-1 overflow-y-auto">
                    <AdminSidebarItems navigation={navigation} />

                    <div className="px-4 py-6 space-y-2 border-t border-border/50">
                        <div className="flex items-center px-4 py-2 text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-1">
                            <Settings className="mr-2 h-3.5 w-3.5" />
                            Settings
                        </div>
                        {settingsNav.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center px-4 py-2 text-xs font-black text-muted-foreground/70 rounded-xl hover:bg-secondary hover:text-foreground transition-all tracking-tight"
                            >
                                <ChevronRight className="mr-2 h-3 w-3 opacity-30" />
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>`;

d = d.replace(oldStructure, newStructure);
fs.writeFileSync('src/app/[locale]/admin/layout.tsx', d);
