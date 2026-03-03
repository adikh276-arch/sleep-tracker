import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SleepProvider } from "@/context/SleepContext";
import LogTimeScreen from "@/screens/LogTimeScreen";
import SleepQualityScreen from "@/screens/SleepQualityScreen";
import TodaySummaryScreen from "@/screens/TodaySummaryScreen";
import WeekViewScreen from "@/screens/WeekViewScreen";

type Screen = "log" | "quality" | "summary" | "week";

function SleepApp() {
  const { t } = useTranslation();
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
      className={`min-h-screen bg-background transition-opacity duration-300 ${transitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
        }`}
      style={{ transition: "opacity 0.35s ease, transform 0.35s ease" }}
    >
      {visible === "log" && <LogTimeScreen onNext={() => navigateTo("quality")} />}
      {visible === "quality" && <SleepQualityScreen onSave={() => navigateTo("summary")} />}
      {visible === "summary" && (
        <TodaySummaryScreen onEdit={() => navigateTo("log")} onWeek={() => navigateTo("week")} />
      )}
      {visible === "week" && <WeekViewScreen onBack={() => navigateTo("summary")} onAdd={() => navigateTo("log")} />}
    </div>
  );
}

const Index = () => (
  <SleepProvider>
    <SleepApp />
  </SleepProvider>
);

export default Index;
