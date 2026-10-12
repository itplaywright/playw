const fs = require('fs');
let content = fs.readFileSync('src/components/admin/TaskEditor.tsx', 'utf8');

// 1. Add isGeneratingCode state
if (!content.includes('isGeneratingCode')) {
    content = content.replace(
        'const [isGenerating, setIsGenerating] = useState(false)',
        'const [isGenerating, setIsGenerating] = useState(false)\n    const [isGeneratingCode, setIsGeneratingCode] = useState(false)'
    );
}

// 2. Add handleGenerateCode function
const handleCodeFn = `
    const handleGenerateCode = async () => {
        const titleToUse = langTab === 'uk' ? formData.title : langTab === 'en' ? formData.titleEn : formData.titleRu;
        if (!titleToUse) {
            alert("Будь ласка, введіть назву завдання для генерації коду.")
            return
        }

        setIsGeneratingCode(true)
        try {
            const descToUse = langTab === 'uk' ? formData.description : langTab === 'en' ? formData.descriptionEn : formData.descriptionRu;
            const res = await fetch("/api/admin/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: titleToUse,
                    description: descToUse,
                    type: "code",
                    language: langTab
                })
            })

            const data = await res.json()

            if (data.content) {
                let cleanCode = data.content.trim()
                if (cleanCode.startsWith("\`\`\`")) {
                    cleanCode = cleanCode.replace(/^\`\`\`[a-zA-Z]*\\n?/, "").replace(/\\n?\`\`\`$/, "").trim()
                }
                setFormData(prev => ({ ...prev, initialCode: cleanCode }))
            } else {
                alert("Не вдалося згенерувати код: " + (data.error || "Unknown error"))
            }

        } catch (error) {
            console.error("Error generating code:", error)
            alert("Помилка генерації коду")
        } finally {
            setIsGeneratingCode(false)
        }
    }
`;

if (!content.includes('handleGenerateCode')) {
    const target = 'const handleGenerateDescription = async () => {';
    content = content.replace(target, handleCodeFn + '\n    ' + target);
}

// 3. Add AI Gemini button next to Початковий код header
const oldCodeHeader = `<div className="flex items-center space-x-2 text-purple-500 mb-2">
                            <Code className="h-5 w-5" />
                            <h3 className="font-black uppercase tracking-widest text-[10px]">Початковий код</h3>
                        </div>`;

const newCodeHeader = `<div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2 text-purple-500">
                                <Code className="h-5 w-5" />
                                <h3 className="font-black uppercase tracking-widest text-[10px]">Початковий код</h3>
                            </div>
                            <button
                                type="button"
                                onClick={handleGenerateCode}
                                disabled={isGeneratingCode}
                                className="flex items-center px-2.5 py-1.5 bg-purple-500/10 text-purple-600 rounded-xl text-[10px] font-black hover:bg-purple-500/20 transition-all shadow-sm shadow-purple-500/5 disabled:opacity-50"
                                title="Згенерувати початковий код за допомогою AI"
                            >
                                {isGeneratingCode ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
                                AI Gemini
                            </button>
                        </div>`;

// Replace ignoring line ending differences
const normContent = content.replace(/\r\n/g, '\n');
const normOld = oldCodeHeader.replace(/\r\n/g, '\n');
const normNew = newCodeHeader.replace(/\r\n/g, '\n');

if (normContent.includes(normOld)) {
    content = normContent.replace(normOld, normNew);
    console.log("Successfully replaced Code Header!");
} else {
    console.log("Could not find Code Header, searching fallback...");
    const idx = content.indexOf('Початковий код');
    console.log("Found 'Початковий код' at index:", idx);
}

fs.writeFileSync('src/components/admin/TaskEditor.tsx', content, 'utf8');
console.log("Finished patching TaskEditor!");
