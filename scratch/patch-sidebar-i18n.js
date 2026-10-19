const fs = require('fs');

const file = 'src/components/layout/Sidebar.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace('import Link from "next/link"', 'import Link from "next/link"\nimport { useTranslations } from "next-intl"');
c = c.replace(/overallPct\r?\n}: SidebarProps\) {/, 'overallPct\n}: SidebarProps) {\n    const t = useTranslations("Sidebar")');
c = c.replace('Поточний доступ', '{t("currentAccess")}');
c = c.replace('>Доступ</span>', '>{t("access")}</span>');
c = c.replace('>Демо-режим</span>', '>{t("demoMode")}</span>');
c = c.replace('>Прогрес курсу</span>', '>{t("courseProgress")}</span>');
c = c.replace('>Рівні курсу</p>', '>{t("courseLevels")}</p>');
c = c.replace('>Крок 0. Налаштування</span>', '>{t("setup")}</span>');
c = c.replace('>Проєкти (Jira)</span>', '>{t("projects")}</span>');
c = c.replace('{done}/{total} Done', '{done}/{total} {t("done")}');
c = c.replace('>Мій кабінет</span>', '>{t("cabinet")}</span>');

fs.writeFileSync(file, c, 'utf8');
console.log('Sidebar.tsx updated with translations successfully');
