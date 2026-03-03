import { useSleep, calculateSleepHours } from "@/context/SleepContext";
import { useTranslation } from "react-i18next";

interface WeekViewScreenProps {
  onBack: () => void;
  onAdd: () => void;
}

export default function WeekViewScreen({ onBack, onAdd }: WeekViewScreenProps) {
  const { getWeekEntries, isLoading } = useSleep();
  const { t } = useTranslation();
  const week = getWeekEntries();

  if (isLoading) {
    return (
      <div className="px-5 pt-10 text-center font-heading">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        {t("screens.week.title")}...
      </div>
    );
  }

  const hours = week.map((e) => (e ? calculateSleepHours(e) : 0));
  const maxH = Math.max(...hours, 10);
  const validHours = hours.filter((h) => h > 0);
  const avg = validHours.length ? Math.round((validHours.reduce((a, b) => a + b, 0) / validHours.length) * 10) / 10 : 0;

  // Get day labels starting from correct day
  const getDayLabelsForWeek = () => {
    const today = new Date().getDay(); // 0=Sun
    const labels: string[] = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayIdx = d.getDay();
      const dayKey = dayNames[dayIdx];
      labels.push(t(`screens.week.days.${dayKey}`));
    }
    return labels;
  };

  const labels = getDayLabelsForWeek();

  return (
    <div className="page-transition-enter px-5 pt-10 pb-8 max-w-md mx-auto">
      <h1 className="font-heading text-2xl mb-6">{t("screens.week.title")}</h1>

      <div className="bg-card rounded-lg shadow-card p-6 mb-6">
        <div className="flex items-end justify-between gap-2" style={{ height: 180 }}>
          {hours.map((h, i) => (
            <div key={i} className="flex flex-col items-center flex-1 gap-1">
              <span className="text-xs text-muted-foreground font-body tabular-nums">
                {h > 0 ? t("common.hours_format", { hours: h }) : ""}
              </span>
              <div
                className="w-full rounded-t-lg bg-secondary transition-all duration-500"
                style={{
                  height: `${h > 0 ? (h / maxH) * 130 : 4}px`,
                  minHeight: 4,
                  opacity: h > 0 ? 1 : 0.3,
                }}
              />
              <span className="text-xs text-muted-foreground font-section">{labels[i]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-soft p-5 mb-6 text-center">
        <p className="text-sm text-muted-foreground font-section">{t("screens.week.average")}</p>
        <p className="text-3xl font-heading mt-1">{t("common.hours_format", { hours: avg })}</p>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={onAdd}
          className="w-full py-4 rounded-pill bg-primary text-primary-foreground font-medium text-base shadow-soft active:scale-[0.97] transition-transform duration-200"
        >
          {t("screens.week.add_another")}
        </button>
        <button
          onClick={onBack}
          className="w-full py-4 rounded-pill border-2 border-border text-foreground font-medium text-base active:scale-[0.97] transition-transform duration-200"
        >
          {t("screens.week.back")}
        </button>
      </div>
    </div>
  );
}
