import { useSleep } from "@/context/SleepContext";

const qualities = [
  { emoji: "😴", label: "Slept deeply and peacefully" },
  { emoji: "🙂", label: "Slept okay, woke up a few times" },
  { emoji: "😐", label: "Light sleep, not fully rested" },
  { emoji: "😣", label: "Restless night" },
  { emoji: "😫", label: "Hardly slept at all" },
];

interface SleepQualityScreenProps {
  onSave: () => void;
}

export default function SleepQualityScreen({ onSave }: SleepQualityScreenProps) {
  const { currentEntry, setCurrentEntry, saveEntry } = useSleep();
  const selected = currentEntry.quality ?? -1;

  const handleSave = () => {
    saveEntry();
    onSave();
  };

  return (
    <div className="page-transition-enter px-5 pt-10 pb-8 max-w-md mx-auto">
      <h1 className="font-heading text-2xl mb-8">How Did You Sleep?</h1>

      <div className="flex flex-col gap-3 mb-8">
        {qualities.map((q, i) => (
          <button
            key={i}
            onClick={() => setCurrentEntry({ ...currentEntry, quality: i })}
            className={`flex items-center gap-3 p-4 rounded-lg text-left transition-all duration-200 active:scale-[0.98] ${
              selected === i
                ? "bg-accent border-2 border-primary shadow-soft"
                : "bg-card border-2 border-transparent shadow-soft"
            }`}
          >
            <span className="text-2xl">{q.emoji}</span>
            <span className="text-base font-body">{q.label}</span>
          </button>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={selected === -1}
        className="w-full py-4 rounded-pill bg-primary text-primary-foreground font-medium text-base shadow-soft active:scale-[0.97] transition-transform duration-200 disabled:opacity-40"
      >
        Save Entry
      </button>
    </div>
  );
}
