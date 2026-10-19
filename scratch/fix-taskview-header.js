const fs = require('fs');

const file = 'src/components/task/TaskView.tsx';
let c = fs.readFileSync(file, 'utf8');

// 1. Expand header height & styling: h-10 -> h-14, py-2 px-6
c = c.replace(
    'header className="flex-shrink-0 h-10 border-b border-border bg-card/80 backdrop-blur-md flex items-center px-4 gap-6 z-50"',
    'header className="flex-shrink-0 h-14 border-b border-border bg-card/90 backdrop-blur-md flex items-center px-6 gap-6 z-50 shadow-sm"'
);

// 2. Translate Reset button: Скинути
c = c.replace(
    /className="px-3 py-1 text-\[10px\] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">\r?\n\s*Скинути\r?\n\s*<\/button>/,
    'className="px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider">\n                            {t("reset")}\n                        </button>'
);

// 3. Translate Quiz button: 🧠 Тест
c = c.replace(
    '>\r?\n\s*🧠 Тест\r?\n\s*<\/button>',
    ' className="px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all shadow-sm">\n                        🧠 {t("quiz")}\n                    </button>'
);

// 4. Translate Question button: 💬 Питання
c = c.replace(
    '>\r?\n\s*💬 Питання\r?\n\s*<\/button>',
    ' className="px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-all shadow-sm">\n                    💬 {t("question")}\n                </button>'
);

// 5. Button size improvements in header: py-1 -> py-1.5, text-[10px] -> text-xs, rounded-xl
c = c.replace(
    'className={`px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isRunning',
    'className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm ${isRunning'
);

c = c.replace(
    'className={`px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isSubmittingReview',
    'className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm ${isSubmittingReview'
);

// 6. Console initial prompt translation
c = c.replace(
    `    const [output, setOutput] = useState(
        task.type === "quiz"
            ? "Оберіть правильну відповідь для перевірки знань."
            : (isProduction
                ? "Запуск тестів виконується локально у вашому VS Code."
                : "Запустіть тест, щоб побачити результат...")
    )`,
    `    const [output, setOutput] = useState(
        task.type === "quiz"
            ? t("quizInstruction")
            : (isProduction
                ? t("localRunPrompt")
                : t("readyPrompt"))
    )`
);

// 7. Console ready fallback translation
c = c.replace(
    'activeConsoleTab === "Output" ? (output || "Консоль готова. Запустіть тест для перевірки...") : "Термінал активний (локально)..."',
    'activeConsoleTab === "Output" ? (output || t("consoleReady")) : t("terminalActive")'
);

fs.writeFileSync(file, c, 'utf8');
console.log('TaskView header made wider and fully localized');
