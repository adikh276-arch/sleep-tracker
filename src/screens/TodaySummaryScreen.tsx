import { useSleep, calculateSleepHours } from "@/context/SleepContext";
import { useTranslation } from "react-i18next";

interface TodaySummaryScreenProps {
  onEdit: () => void;
  onWeek: () => void;
}

export default function TodaySummaryScreen({ onEdit, onWeek }: TodaySummaryScreenProps) {
  const { getTodayEntry, isLoading } = useSleep();
  const { t } = useTranslation();
  const entry = getTodayEntry();

  if (isLoading) {
    return (
      <div className="px-5 pt-10 text-center font-heading">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        {t("screens.summary.title")}...
      </div>
    );
  }

  const qualityLabels = [
    t("screens.summary.quality_labels.deep"),
    t("screens.summary.quality_labels.okay"),
    t("screens.summary.quality_labels.light"),
    t("screens.summary.quality_labels.restless"),
    t("screens.summary.quality_labels.hardly"),
  ];

  if (!entry) {
    return (
      <div className="page-transition-enter px-5 pt-10 pb-8 max-w-md mx-auto text-center">
        <h1 className="font-heading text-2xl mb-4">{t("screens.summary.title")}</h1>
        <p className="text-muted-foreground mb-6">{t("screens.summary.no_entry")}</p>
        <button
          onClick={onEdit}
          className="py-3 px-8 rounded-pill bg-primary text-primary-foreground font-medium text-base shadow-soft active:scale-[0.97] transition-transform duration-200"
        >
          {t("screens.summary.log_button")}
        </button>
      </div>
    );
  }

  const hours = calculateSleepHours(entry);
  const formatTime = (h: number, m: number, ap: string) =>
    `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ap}`;

  return (
    <div className="page-transition-enter px-5 pt-10 pb-8 max-w-md mx-auto">
      <h1 className="font-heading text-2xl mb-6">{t("screens.summary.title")}</h1>

      <div className="bg-card rounded-lg shadow-card p-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground font-section leading-tight">{t("screens.summary.total_sleep")}</p>
            <p className="text-xl font-heading">{t("common.hours_format", { hours })}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground font-section leading-tight">{t("screens.summary.quality")}</p>
            <p className="text-base font-heading leading-tight">{qualityLabels[entry.quality]}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground font-section leading-tight">{t("screens.summary.bedtime")}</p>
            <p className="text-base font-heading">
              {formatTime(entry.bedtimeHour, entry.bedtimeMinute, entry.bedtimeAmPm)}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground font-section leading-tight">{t("screens.summary.wakeup")}</p>
            <p className="text-base font-heading">
              {formatTime(entry.wakeHour, entry.wakeMinute, entry.wakeAmPm)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <button
            onClick={onEdit}
            className="flex-1 py-3 rounded-pill border-2 border-primary text-accent-foreground font-medium text-base active:scale-[0.97] transition-transform duration-200"
          >
            {t("screens.summary.edit")}
          </button>
          <button
            onClick={onWeek}
            className="flex-1 py-3 rounded-pill bg-primary text-primary-foreground font-medium text-base shadow-soft active:scale-[0.97] transition-transform duration-200"
          >
            {t("screens.summary.this_week")}
          </button>
        </div>
        <button
          onClick={onEdit}
          className="w-full py-3 rounded-pill border-2 border-border text-foreground font-medium text-base active:scale-[0.97] transition-transform duration-200"
        >
          {t("screens.summary.add_another")}
        </button>
      </div>
    </div>
  );
}
