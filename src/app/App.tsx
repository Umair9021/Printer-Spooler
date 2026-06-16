import { useState } from "react";
import { ThemeProvider } from "./components/theme-context";
import { Landing } from "./components/landing";
import { Dashboard } from "./components/dashboard";

export default function App() {
  const [page, setPage] = useState<"landing" | "dashboard">("landing");

  return (
    <ThemeProvider>
      <div className="min-h-screen w-full">
        {page === "landing" ? (
          <Landing onLaunch={() => setPage("dashboard")} />
        ) : (
          <Dashboard onBack={() => setPage("landing")} />
        )}
      </div>
    </ThemeProvider>
  );
}
