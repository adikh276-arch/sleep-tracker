import { useSleep, calculateSleepHours } from "@/context/SleepContext";

const qualityLabels = ["Deeply & Peacefully", "Okay", "Light Sleep", "Restless", "Hardly Slept"];

interface TodaySummaryScreenProps {
  onEdit: () => void;
  onWeek: () => void;
}

export default function TodaySummaryScreen({ onEdit, onWeek }: TodaySummaryScreenProps) {
  const { getTodayEntry } = useSleep();
  const entry = getTodayEntry();

  if (!entry) {
    return (
      <div className="page-transition-enter px-5 pt-10 pb-8 max-w-md mx-auto text-center">
        <h1 className="font-heading text-2xl mb-4">Today's Sleep</h1>
        <p className="text-muted-foreground mb-6">No entry logged yet.</p>
        <button
          onClick={onEdit}
          className="py-3 px-8 rounded-pill bg-primary text-primary-foreground font-medium text-base shadow-soft active:scale-[0.97] transition-transform duration-200"
        >
          Log Sleep
        </button>
      </div>
    );
  }

  const hours = calculateSleepHours(entry);
  const formatTime = (h: number, m: number, ap: string) =>
    `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ap}`;

  return (
    <div className="page-transition-enter px-5 pt-10 pb-8 max-w-md mx-auto">
      <h1 className="font-heading text-2xl mb-6">Today's Sleep</h1>

      <div className="bg-card rounded-lg shadow-card p-6 mb-6">
        <div className="grid grid-cols-2 gap-y-5">
          <div>
            <p className="text-sm text-muted-foreground font-section">Total Sleep</p>
            <p className="text-2xl font-heading">{hours}h</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-section">Quality</p>
            <p className="text-base font-heading">{qualityLabels[entry.quality]}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-section">Bedtime</p>
            <p className="text-base font-heading">
              {formatTime(entry.bedtimeHour, entry.bedtimeMinute, entry.bedtimeAmPm)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-section">Wake-up</p>
            <p className="text-base font-heading">
              {formatTime(entry.wakeHour, entry.wakeMinute, entry.wakeAmPm)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onEdit}
          className="flex-1 py-3 rounded-pill border-2 border-primary text-accent-foreground font-medium text-base active:scale-[0.97] transition-transform duration-200"
        >
          Edit Entry
        </button>
        <button
          onClick={onWeek}
          className="flex-1 py-3 rounded-pill bg-primary text-primary-foreground font-medium text-base shadow-soft active:scale-[0.97] transition-transform duration-200"
        >
          This Week
        </button>
      </div>
    </div>
  );
}
