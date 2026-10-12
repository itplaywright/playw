"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { useState } from "react";
import { Globe, ChevronDown } from "lucide-react";

export function LanguageSwitcher({ activeLocales = ['uk', 'en', 'ru'] }: { activeLocales?: string[] }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const allLanguages = [
    { code: "uk", label: "Укр" },
    { code: "en", label: "Eng" },
    { code: "ru", label: "Рус" },
  ];

  // Filter languages based on settings
  const languages = allLanguages.filter(lang => activeLocales.includes(lang.code));
  
  if (languages.length <= 1) {
      return null;
  }

  const currentLang = languages.find((l) => l.code === locale) || languages[0];

  const switchLanguage = (newLocale: string) => {
    setIsOpen(false);
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors group"
      >
        <Globe className="w-5 h-5 group-hover:text-blue-500 transition-colors" />
        <span className="text-sm font-bold">{currentLang.label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-32 rounded-xl bg-card border border-border shadow-lg py-2 z-40 animate-in fade-in zoom-in-95 duration-200">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => switchLanguage(lang.code)}
                className={`w-full text-left px-4 py-2 text-sm font-bold transition-colors ${
                  locale === lang.code
                    ? "text-blue-500 bg-blue-500/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
