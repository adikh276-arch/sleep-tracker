import { useState, useEffect } from "react";
import { SleepProvider } from "@/context/SleepContext";
import LogTimeScreen from "@/screens/LogTimeScreen";
import SleepQualityScreen from "@/screens/SleepQualityScreen";
import TodaySummaryScreen from "@/screens/TodaySummaryScreen";
import WeekViewScreen from "@/screens/WeekViewScreen";

type Screen = "log" | "quality" | "summary" | "week";

function SleepApp() {
  const [screen, setScreen] = useState<Screen>("summary");
  const [transitioning, setTransitioning] = useState(false);
  const [visible, setVisible] = useState<Screen>("summary");

  const navigateTo = (next: Screen) => {
    if (next === visible) return;
    setTransitioning(true);
    // Short exit delay, then switch
    setTimeout(() => {
      setVisible(next);
      setScreen(next);
      setTransitioning(false);
    }, 350);
  };

  return (
    <div
      className={`min-h-screen bg-background transition-opacity duration-300 ${
        transitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
      }`}
      style={{ transition: "opacity 0.35s ease, transform 0.35s ease" }}
    >
      {visible === "log" && <LogTimeScreen onNext={() => navigateTo("quality")} />}
      {visible === "quality" && <SleepQualityScreen onSave={() => navigateTo("summary")} />}
      {visible === "summary" && (
        <TodaySummaryScreen onEdit={() => navigateTo("log")} onWeek={() => navigateTo("week")} />
      )}
      {visible === "week" && <WeekViewScreen onBack={() => navigateTo("summary")} onAdd={() => navigateTo("log")} />}

      {/* Bottom nav dots */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center gap-2">
        {(["log", "quality", "summary", "week"] as Screen[]).map((s) => (
          <button
            key={s}
            onClick={() => navigateTo(s)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              visible === s ? "bg-primary w-6" : "bg-border"
            }`}
            aria-label={`Go to ${s}`}
          />
        ))}
      </div>
    </div>
  );
}

const Index = () => (
  <SleepProvider>
    <SleepApp />
  </SleepProvider>
);

export default Index;
