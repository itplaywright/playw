const fs = require('fs');

const file = 'src/components/task/TaskView.tsx';
let c = fs.readFileSync(file, 'utf8');

// 1. Add import
c = c.replace('import Link from "next/link"', 'import Link from "next/link"\nimport { useTranslations } from "next-intl"');

// 2. Add useTranslations inside component
c = c.replace('export default function TaskView({ task, isProduction, nextTask, submission, hasAiReview }: TaskViewProps) {', 
`export default function TaskView({ task, isProduction, nextTask, submission, hasAiReview }: TaskViewProps) {
    const t = useTranslations("TaskView")`);

// 3. Back link text: <span className="hidden sm:inline">Назад</span>
c = c.replace('<span className="hidden sm:inline">Назад</span>', '<span className="hidden sm:inline">{t("back")}</span>');

// 4. Reset button: Скинути & confirm dialog
c = c.replace('if (confirm("Скинути код до початкового стану?")) {', 'if (confirm(t("resetConfirm"))) {');
c = c.replace('>Скинути</button>', '>{t("reset")}</button>');

// 5. Run test button
c = c.replace('{isRunning ? "Checking..." : (isProduction ? "Copy Code" : "Run Test")}', '{isRunning ? t("checking") : (isProduction ? t("copyCode") : t("runTest"))}');

// 6. Quiz & Question buttons
c = c.replace('>🧠 Тест</button>', '>🧠 {t("quiz")}</button>');
c = c.replace('>💬 Питання</button>', '>💬 {t("question")}</button>');

// 7. Review buttons
c = c.replace('>🔍 Швидка перевірка</button>', '>🔍 {t("quickCheck")}</button>');
c = c.replace('{isSubmittingReview ? "Відправляємо..." : "👨‍🏫 Відправити ментору"}', '{isSubmittingReview ? t("sending") : `👨‍🏫 ${t("sendToMentor")}`}');

// 8. Theory header: Теорія та завдання
c = c.replace(/Теорія та завдання/, '{t("theoryAndTask")}');
c = c.replace(/LEVEL \{task\.id\}/, '{t("level")} {task.id}');

// 9. Mentor Feedback banner
c = c.replace('Фідбек Ментора', '{t("mentorFeedback")}');
c = c.replace('Детальніше', '{t("details")}');
c = c.replace(/Статус: \{submission\.status === 'reviewed' \? 'ПРИЙНЯТО' : submission\.status === 'rejected' \? 'ПОТРЕБУЄ ВИПРАВЛЕНЬ' : 'В ОЧІКУВАННІ'\}/,
  '{t("status")}: {submission.status === "reviewed" ? t("statusPassed") : submission.status === "rejected" ? t("statusFixes") : t("statusPending")}');

// 10. Console tabs
c = c.replace('{["Output", "Terminal", "Mentor"].map((tab) => (',
  '{[{ id: "Output", label: t("outputTab") }, { id: "Terminal", label: t("terminalTab") }, { id: "Mentor", label: t("mentorTab") }].map(({ id: tab, label }) => (');
c = c.replace('{tab}\r?\n', '{label}\n');

fs.writeFileSync(file, c, 'utf8');
console.log('TaskView.tsx updated with translations successfully');
