import { useState, createContext, useContext, ReactNode } from "react";

export interface SleepEntry {
  bedtimeHour: number;
  bedtimeMinute: number;
  bedtimeAmPm: "AM" | "PM";
  wakeHour: number;
  wakeMinute: number;
  wakeAmPm: "AM" | "PM";
  quality: number; // 0-4 index
  date: string; // ISO date string
}

interface SleepContextType {
  entries: SleepEntry[];
  currentEntry: Partial<SleepEntry>;
  setCurrentEntry: (entry: Partial<SleepEntry>) => void;
  saveEntry: () => void;
  updateEntry: (entry: SleepEntry) => void;
  getTodayEntry: () => SleepEntry | undefined;
  getWeekEntries: () => (SleepEntry | undefined)[];
}

const SleepContext = createContext<SleepContextType | null>(null);

export const useSleep = () => {
  const ctx = useContext(SleepContext);
  if (!ctx) throw new Error("useSleep must be used within SleepProvider");
  return ctx;
};

const getToday = () => new Date().toISOString().split("T")[0];

const getDayLabel = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toISOString().split("T")[0];
};

export function calculateSleepHours(entry: SleepEntry): number {
  let bedH = entry.bedtimeHour % 12 + (entry.bedtimeAmPm === "PM" ? 12 : 0);
  let wakeH = entry.wakeHour % 12 + (entry.wakeAmPm === "PM" ? 12 : 0);
  const bedMin = bedH * 60 + entry.bedtimeMinute;
  const wakeMin = wakeH * 60 + entry.wakeMinute;
  let diff = wakeMin - bedMin;
  if (diff <= 0) diff += 24 * 60;
  return Math.round((diff / 60) * 10) / 10;
}

export function SleepProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<SleepEntry[]>(() => {
    const stored = localStorage.getItem("sleep-entries");
    return stored ? JSON.parse(stored) : [];
  });
  const [currentEntry, setCurrentEntry] = useState<Partial<SleepEntry>>({});

  const persist = (e: SleepEntry[]) => {
    setEntries(e);
    localStorage.setItem("sleep-entries", JSON.stringify(e));
  };

  const saveEntry = () => {
    const entry: SleepEntry = {
      bedtimeHour: currentEntry.bedtimeHour ?? 10,
      bedtimeMinute: currentEntry.bedtimeMinute ?? 0,
      bedtimeAmPm: currentEntry.bedtimeAmPm ?? "PM",
      wakeHour: currentEntry.wakeHour ?? 7,
      wakeMinute: currentEntry.wakeMinute ?? 0,
      wakeAmPm: currentEntry.wakeAmPm ?? "AM",
      quality: currentEntry.quality ?? 0,
      date: getToday(),
    };
    const filtered = entries.filter((e) => e.date !== getToday());
    persist([...filtered, entry]);
    setCurrentEntry({});
  };

  const updateEntry = (entry: SleepEntry) => {
    const filtered = entries.filter((e) => e.date !== entry.date);
    persist([...filtered, entry]);
  };

  const getTodayEntry = () => entries.find((e) => e.date === getToday());

  const getWeekEntries = () => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = getDayLabel(6 - i);
      return entries.find((e) => e.date === date);
    });
  };

  return (
    <SleepContext.Provider
      value={{ entries, currentEntry, setCurrentEntry, saveEntry, updateEntry, getTodayEntry, getWeekEntries }}
    >
      {children}
    </SleepContext.Provider>
  );
}
