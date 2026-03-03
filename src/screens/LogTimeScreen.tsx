import { useSleep } from "@/context/SleepContext";
import TimePicker from "@/components/TimePicker";
import { useTranslation } from "react-i18next";

interface LogTimeScreenProps {
  onNext: () => void;
}

export default function LogTimeScreen({ onNext }: LogTimeScreenProps) {
  const { currentEntry, setCurrentEntry } = useSleep();
  const { t } = useTranslation();

  return (
    <div className="page-transition-enter px-5 pt-10 pb-8 max-w-md mx-auto">
      <h1 className="font-heading text-2xl mb-8 leading-tight">
        {t("screens.log.title")} {t("screens.log.subtitle")}
      </h1>

      <TimePicker
        label={t("screens.log.bedtime")}
        hour={currentEntry.bedtimeHour ?? 10}
        minute={currentEntry.bedtimeMinute ?? 0}
        amPm={currentEntry.bedtimeAmPm ?? "PM"}
        onChangeHour={(h) => setCurrentEntry({ ...currentEntry, bedtimeHour: h })}
        onChangeMinute={(m) => setCurrentEntry({ ...currentEntry, bedtimeMinute: m })}
        onChangeAmPm={(v) => setCurrentEntry({ ...currentEntry, bedtimeAmPm: v })}
      />

      <TimePicker
        label={t("screens.log.wakeup")}
        hour={currentEntry.wakeHour ?? 7}
        minute={currentEntry.wakeMinute ?? 0}
        amPm={currentEntry.wakeAmPm ?? "AM"}
        onChangeHour={(h) => setCurrentEntry({ ...currentEntry, wakeHour: h })}
        onChangeMinute={(m) => setCurrentEntry({ ...currentEntry, wakeMinute: m })}
        onChangeAmPm={(v) => setCurrentEntry({ ...currentEntry, wakeAmPm: v })}
      />

      <button
        onClick={onNext}
        className="w-full mt-6 py-4 rounded-pill bg-primary text-primary-foreground font-medium text-base shadow-soft active:scale-[0.97] transition-transform duration-200"
      >
        {t("screens.log.next")}
      </button>
    </div>
  );
}
