import { useState, createContext, useContext, ReactNode, useEffect } from "react";
import { useAuth } from "./AuthContext";
import sql from "@/lib/db";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
  isLoading: boolean;
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
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const [currentEntry, setCurrentEntry] = useState<Partial<SleepEntry>>({});

  // Ensure user exists in DB
  useEffect(() => {
    if (userId) {
      sql`INSERT INTO users (id) VALUES (${userId}) ON CONFLICT (id) DO NOTHING`.catch(err => console.error("Profile sync error:", err));
    }
  }, [userId]);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["sleep_entries", userId],
    queryFn: async () => {
      if (!userId) return [];
      const result = await sql`
        SELECT * FROM sleep_entries 
        WHERE user_id = ${userId} 
        ORDER BY date DESC
      `;
      return result.map(row => ({
        bedtimeHour: row.bedtime_hour,
        bedtimeMinute: row.bedtime_minute,
        bedtimeAmPm: row.bedtime_am_pm as "AM" | "PM",
        wakeHour: row.wake_hour,
        wakeMinute: row.wake_minute,
        wakeAmPm: row.wake_am_pm as "AM" | "PM",
        quality: row.quality,
        date: new Date(row.date).toISOString().split('T')[0],
      }));
    },
    enabled: !!userId,
  });

  const saveMutation = useMutation({
    mutationFn: async (entry: SleepEntry) => {
      return sql`
        INSERT INTO sleep_entries (
          user_id, bedtime_hour, bedtime_minute, bedtime_am_pm, 
          wake_hour, wake_minute, wake_am_pm, quality, date
        ) VALUES (
          ${userId}, ${entry.bedtimeHour}, ${entry.bedtimeMinute}, ${entry.bedtimeAmPm},
          ${entry.wakeHour}, ${entry.wakeMinute}, ${entry.wakeAmPm}, ${entry.quality}, ${entry.date}
        ) ON CONFLICT (user_id, date) DO UPDATE SET
          bedtime_hour = EXCLUDED.bedtime_hour,
          bedtime_minute = EXCLUDED.bedtime_minute,
          bedtime_am_pm = EXCLUDED.bedtime_am_pm,
          wake_hour = EXCLUDED.wake_hour,
          wake_minute = EXCLUDED.wake_minute,
          wake_am_pm = EXCLUDED.wake_am_pm,
          quality = EXCLUDED.quality
      `;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sleep_entries", userId] });
    },
  });

  const saveEntry = () => {
    if (!userId) return;
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
    saveMutation.mutate(entry);
    setCurrentEntry({});
  };

  const updateEntry = (entry: SleepEntry) => {
    if (!userId) return;
    saveMutation.mutate(entry);
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
      value={{ entries, currentEntry, setCurrentEntry, saveEntry, updateEntry, getTodayEntry, getWeekEntries, isLoading }}
    >
      {children}
    </SleepContext.Provider>
  );
}
