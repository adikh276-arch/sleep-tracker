import { useState, createContext, useContext, ReactNode, useEffect, useCallback } from "react";
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
  date: string; // YYYY-MM-DD
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
  refetch: () => void;
}

const SleepContext = createContext<SleepContextType | null>(null);

export const useSleep = () => {
  const ctx = useContext(SleepContext);
  if (!ctx) throw new Error("useSleep must be used within SleepProvider");
  return ctx;
};

// Robust local YYYY-MM-DD
const getLocalDateString = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getToday = () => getLocalDateString();

const getDayLabel = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return getLocalDateString(d);
};

export function calculateSleepHours(entry: SleepEntry): number {
  let bedH = (entry.bedtimeHour % 12) + (entry.bedtimeAmPm === "PM" ? 12 : 0);
  let wakeH = (entry.wakeHour % 12) + (entry.wakeAmPm === "PM" ? 12 : 0);
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
      console.log("[SleepContext] Syncing user profile for:", userId);
      sql`INSERT INTO users (id) VALUES (${userId}) ON CONFLICT (id) DO NOTHING`
        .catch(err => console.error("[SleepContext] Profile sync error:", err));
    }
  }, [userId]);

  const { data: entries = [], isLoading, error: fetchError, refetch } = useQuery({
    queryKey: ["sleep_entries", userId],
    queryFn: async () => {
      if (!userId) return [];
      console.log("[SleepContext] Fetching entries for userId:", userId);

      const result = await sql`
        SELECT 
          bedtime_hour, bedtime_minute, bedtime_am_pm,
          wake_hour, wake_minute, wake_am_pm,
          quality, date::TEXT as date_str
        FROM sleep_entries 
        WHERE user_id = ${userId} 
        ORDER BY date DESC
      `;

      console.log(`[SleepContext] Retrieved ${result.length} entries from database`);

      const mapped = result.map(row => ({
        bedtimeHour: row.bedtime_hour,
        bedtimeMinute: row.bedtime_minute,
        bedtimeAmPm: row.bedtime_am_pm as "AM" | "PM",
        wakeHour: row.wake_hour,
        wakeMinute: row.wake_minute,
        wakeAmPm: row.wake_am_pm as "AM" | "PM",
        quality: row.quality,
        date: row.date_str,
      }));

      if (mapped.length > 0) {
        console.log("[SleepContext] First mapped entry:", mapped[0]);
      }
      return mapped;
    },
    enabled: !!userId,
    staleTime: 1000 * 30, // 30 seconds
  });

  if (fetchError) {
    console.error("[SleepContext] useQuery fetch error:", fetchError);
  }

  const saveMutation = useMutation({
    mutationFn: async (entry: SleepEntry) => {
      console.log("[SleepContext] Mutating entry for date:", entry.date);
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
      console.log("[SleepContext] Save successful, invalidating cache...");
      queryClient.invalidateQueries({ queryKey: ["sleep_entries", userId] });
    },
    onError: (err) => {
      console.error("[SleepContext] Save mutation error:", err);
    }
  });

  const saveEntry = useCallback(() => {
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
  }, [userId, currentEntry, saveMutation]);

  const updateEntry = useCallback((entry: SleepEntry) => {
    if (!userId) return;
    saveMutation.mutate(entry);
  }, [userId, saveMutation]);

  const getTodayEntry = useCallback(() => {
    const today = getToday();
    const found = entries.find((e) => e.date === today);
    console.log(`[SleepContext] getTodayEntry checking for ${today}:`, found ? "Found" : "Not Found");
    return found;
  }, [entries]);

  const getWeekEntries = useCallback(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = getDayLabel(6 - i);
      const found = entries.find((e) => e.date === date);
      return found;
    });
  }, [entries]);

  return (
    <SleepContext.Provider
      value={{
        entries,
        currentEntry,
        setCurrentEntry,
        saveEntry,
        updateEntry,
        getTodayEntry,
        getWeekEntries,
        isLoading,
        refetch
      }}
    >
      {children}
    </SleepContext.Provider>
  );
}
