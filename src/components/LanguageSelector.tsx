import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "pt", name: "Portuguese" },
    { code: "de", name: "German" },
    { code: "ar", name: "Arabic" },
    { code: "hi", name: "Hindi" },
    { code: "bn", name: "Bengali" },
    { code: "zh-CN", name: "Mandarin Chinese" },
    { code: "ja", name: "Japanese" },
    { code: "id", name: "Indonesian" },
    { code: "tr", name: "Turkish" },
    { code: "vi", name: "Vietnamese" },
    { code: "ko", name: "Korean" },
    { code: "ru", name: "Russian" },
    { code: "it", name: "Italian" },
    { code: "pl", name: "Polish" },
    { code: "th", name: "Thai" },
    { code: "tl", name: "Filipino" },
];

export default function LanguageSelector() {
    const { i18n } = useTranslation();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const langParam = params.get("lang")?.toLowerCase();
        if (langParam) {
            const match = languages.find((l) => l.code.toLowerCase() === langParam);
            if (match) {
                i18n.changeLanguage(match.code);
            }
        }
    }, [i18n]);

    const handleLanguageChange = (val: string) => {
        i18n.changeLanguage(val);
        // Update URL without reloading to keep manual selection
        const url = new URL(window.location.href);
        url.searchParams.set("lang", val);
        window.history.pushState({}, "", url);
    };

    return (
        <div className="fixed top-4 right-4 z-50">
            <Select
                value={i18n.language || "en"}
                onValueChange={handleLanguageChange}
            >
                <SelectTrigger className="w-[140px] bg-background/80 backdrop-blur-md border-border shadow-soft">
                    <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                    {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
