import { useSleep } from "@/context/SleepContext";
import { useTranslation } from "react-i18next";

interface SleepQualityScreenProps {
  onSave: () => void;
}

export default function SleepQualityScreen({ onSave }: SleepQualityScreenProps) {
  const { currentEntry, setCurrentEntry, saveEntry } = useSleep();
  const { t } = useTranslation();
  const selected = currentEntry.quality ?? -1;

  const qualities = [
    { emoji: "😴", label: t("screens.quality.qualities.deep") },
    { emoji: "🙂", label: t("screens.quality.qualities.okay") },
    { emoji: "😐", label: t("screens.quality.qualities.light") },
    { emoji: "😣", label: t("screens.quality.qualities.restless") },
    { emoji: "😫", label: t("screens.quality.qualities.hardly") },
  ];

  const handleSave = () => {
    saveEntry();
    onSave();
  };

  return (
    <div className="page-transition-enter px-5 pt-10 pb-8 max-w-md mx-auto">
      <h1 className="font-heading text-2xl mb-8">{t("screens.quality.title")}</h1>

      <div className="flex flex-col gap-3 mb-8">
        {qualities.map((q, i) => (
          <button
            key={i}
            onClick={() => setCurrentEntry({ ...currentEntry, quality: i })}
            className={`flex items-center gap-3 p-4 rounded-lg text-left transition-all duration-200 active:scale-[0.98] ${selected === i
              ? "bg-accent border-2 border-primary shadow-soft"
              : "bg-card border-2 border-transparent shadow-soft"
              }`}
          >
            <span className="text-2xl flex-shrink-0">{q.emoji}</span>
            <span className="text-base font-body leading-tight">{q.label}</span>
          </button>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={selected === -1}
        className="w-full py-4 rounded-pill bg-primary text-primary-foreground font-medium text-base shadow-soft active:scale-[0.97] transition-transform duration-200 disabled:opacity-40"
      >
        {t("screens.quality.save")}
      </button>
    </div>
  );
}
