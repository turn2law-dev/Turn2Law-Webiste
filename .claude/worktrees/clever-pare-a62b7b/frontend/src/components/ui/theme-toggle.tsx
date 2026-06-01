"use client";

import { useTheme } from "@/lib/theme-context";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-10 w-10" /> // Placeholder to prevent layout shift
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className={cn(
        "relative h-10 w-10 p-0 rounded-full transition-all duration-300",
        "text-foreground hover:bg-muted",
        "flex items-center justify-center overflow-hidden",
      )}
      aria-label="Toggle theme"
    >
      {/* Sun icon for light mode (visible in dark mode) */}
      <Sun
        className={cn(
          "h-5 w-5 absolute transition-all duration-500 ease-in-out",
          theme === "dark"
            ? "rotate-0 scale-100 opacity-100 text-[#FFC107]"
            : "rotate-90 scale-0 opacity-0 text-[#FFC107]",
        )}
        style={{ transition: 'transform 0.5s ease-in-out, opacity 0.5s ease-in-out, color 0s' }}
      />
      {/* Moon icon for dark mode (visible in light mode) */}
      <Moon
        className={cn(
          "h-5 w-5 absolute transition-all duration-500 ease-in-out",
          theme === "light"
            ? "rotate-0 scale-100 opacity-100 text-black dark:text-white"
            : "-rotate-90 scale-0 opacity-0 text-black dark:text-white",
        )}
        style={{ transition: 'transform 0.5s ease-in-out, opacity 0.5s ease-in-out, color 0s' }}
      />
    </Button>
  );
}
