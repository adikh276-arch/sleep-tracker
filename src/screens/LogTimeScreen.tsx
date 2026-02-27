import { useSleep } from "@/context/SleepContext";
import TimePicker from "@/components/TimePicker";

interface LogTimeScreenProps {
  onNext: () => void;
}

export default function LogTimeScreen({ onNext }: LogTimeScreenProps) {
  const { currentEntry, setCurrentEntry } = useSleep();

  return (
    <div className="page-transition-enter px-5 pt-10 pb-8 max-w-md mx-auto">
      <h1 className="font-heading text-2xl mb-1">Log Last Night's</h1>
      <h1 className="font-heading text-2xl mb-8">Sleep</h1>

      <TimePicker
        label="Bedtime"
        hour={currentEntry.bedtimeHour ?? 10}
        minute={currentEntry.bedtimeMinute ?? 0}
        amPm={currentEntry.bedtimeAmPm ?? "PM"}
        onChangeHour={(h) => setCurrentEntry({ ...currentEntry, bedtimeHour: h })}
        onChangeMinute={(m) => setCurrentEntry({ ...currentEntry, bedtimeMinute: m })}
        onChangeAmPm={(v) => setCurrentEntry({ ...currentEntry, bedtimeAmPm: v })}
      />

      <TimePicker
        label="Wake-up Time"
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
        Next
      </button>
    </div>
  );
}
