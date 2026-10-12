const fs = require('fs');
let d = fs.readFileSync('src/components/admin/TaskEditor.tsx', 'utf8');

let newFunc = `handleGenerateDescription = async () => {
        const titleToUse = langTab === 'uk' ? formData.title : langTab === 'en' ? formData.titleEn : formData.titleRu;
        if (!titleToUse) {
            alert("Будь ласка, введіть назву завдання для генерації опису.")
            return
        }

        setIsGenerating(true)
        try {
            const res = await fetch("/api/admin/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: titleToUse,
                    type: "description",
                    language: langTab
                })
            })

            const data = await res.json()

            if (data.content) {
                if (langTab === 'uk') setFormData(prev => ({ ...prev, description: data.content }))
                else if (langTab === 'en') setFormData(prev => ({ ...prev, descriptionEn: data.content }))
                else setFormData(prev => ({ ...prev, descriptionRu: data.content }))
            } else {
                alert("Не вдалося згенерувати контент: " + (data.error || "Unknown error"))
            }

        } catch (error) {
            console.error("Error generating content:", error)
            alert("Помилка генерації")
        } finally {
            setIsGenerating(false)
        }
    }`;

let startIndex = d.indexOf('handleGenerateDescription = async () => {');
let endIndex = d.indexOf('}', d.indexOf('finally {')) + 1; // End of handleGenerateDescription
let oldFunc = d.substring(startIndex, endIndex + 5); 
// Just to be safe with curly braces, we know it ends with setIsGenerating(false) \n        } \n    }
endIndex = d.indexOf('    }', d.indexOf('setIsGenerating(false)')) + 5;
oldFunc = d.substring(startIndex, endIndex);

if (startIndex !== -1) {
    d = d.replace(oldFunc, newFunc);
    fs.writeFileSync('src/components/admin/TaskEditor.tsx', d);
    console.log("AI GENERATE PATCHED");
} else {
    console.log("COULD NOT FIND AI GENERATE FUNCTION");
}
