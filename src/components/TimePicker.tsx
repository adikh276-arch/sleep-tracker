import { useState } from "react";
import { useTranslation } from "react-i18next";

interface TimePickerProps {
  label: string;
  hour: number;
  minute: number;
  amPm: "AM" | "PM";
  onChangeHour: (h: number) => void;
  onChangeMinute: (m: number) => void;
  onChangeAmPm: (v: "AM" | "PM") => void;
}

export default function TimePicker({ label, hour, minute, amPm, onChangeHour, onChangeMinute, onChangeAmPm }: TimePickerProps) {
  const { t } = useTranslation();
  return (
    <div className="bg-card rounded-lg shadow-soft p-5 mb-4">
      <p className="font-section text-sm text-muted-foreground mb-3">{label}</p>
      <div className="flex items-center gap-3 justify-center">
        {/* Hour */}
        <div className="flex flex-col items-center">
          <button
            className="text-muted-foreground text-lg px-2 py-1 active:scale-90 transition-transform"
            onClick={() => onChangeHour(hour >= 12 ? 1 : hour + 1)}
            aria-label={t("common.increase_hour")}
          >
            ▲
          </button>
          <span className="text-3xl font-heading tabular-nums w-12 text-center">{String(hour).padStart(2, "0")}</span>
          <button
            className="text-muted-foreground text-lg px-2 py-1 active:scale-90 transition-transform"
            onClick={() => onChangeHour(hour <= 1 ? 12 : hour - 1)}
            aria-label={t("common.decrease_hour")}
          >
            ▼
          </button>
        </div>

        <span className="text-3xl font-heading">:</span>

        {/* Minute */}
        <div className="flex flex-col items-center">
          <button
            className="text-muted-foreground text-lg px-2 py-1 active:scale-90 transition-transform"
            onClick={() => onChangeMinute(minute >= 55 ? 0 : minute + 5)}
            aria-label={t("common.increase_minute")}
          >
            ▲
          </button>
          <span className="text-3xl font-heading tabular-nums w-12 text-center">{String(minute).padStart(2, "0")}</span>
          <button
            className="text-muted-foreground text-lg px-2 py-1 active:scale-90 transition-transform"
            onClick={() => onChangeMinute(minute <= 0 ? 55 : minute - 5)}
            aria-label={t("common.decrease_minute")}
          >
            ▼
          </button>
        </div>

        {/* AM/PM */}
        <div className="flex flex-col gap-1 ml-2">
          <button
            className={`px-3 py-1.5 rounded-pill text-sm font-medium transition-all duration-200 ${amPm === "AM"
              ? "bg-primary text-primary-foreground shadow-soft"
              : "bg-accent text-accent-foreground"
              }`}
            onClick={() => onChangeAmPm("AM")}
          >
            {t("common.am")}
          </button>
          <button
            className={`px-3 py-1.5 rounded-pill text-sm font-medium transition-all duration-200 ${amPm === "PM"
              ? "bg-primary text-primary-foreground shadow-soft"
              : "bg-accent text-accent-foreground"
              }`}
            onClick={() => onChangeAmPm("PM")}
          >
            {t("common.pm")}
          </button>
        </div>
      </div>
    </div>
  );
}
