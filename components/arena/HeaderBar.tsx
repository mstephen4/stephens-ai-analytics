"use client";

import { Flame, KeyRound, Menu, Trophy } from "lucide-react";
import { displayTier } from "@/lib/gating";
import { cn } from "@/lib/utils";
import { useArena } from "./ArenaProvider";

export function HeaderBar() {
  const {
    premium,
    license,
    coachEnabled,
    setCoachEnabled,
    mode,
    setMode,
    setLockerOpen,
    setRailOpen,
  } = useArena();

  return (
    <header className="arena-header">
      <button className="icon-btn mobile-only" onClick={() => setRailOpen(true)} aria-label="Open events">
        <Menu size={18} />
      </button>
      <div className="brand">
        <span className="laurel" aria-hidden>
          ⟨
        </span>
        <div>
          <p className="brand-kicker">AI DECATHLON</p>
          <h1 className="brand-title">THE ARENA</h1>
        </div>
        <span className="laurel" aria-hidden>
          ⟩
        </span>
      </div>

      <div className="mode-toggle" role="tablist" aria-label="Event mode">
        <button
          role="tab"
          aria-selected={mode === "single"}
          className={cn("mode-btn", mode === "single" && "active")}
          onClick={() => setMode("single")}
        >
          Single
        </button>
        <button
          role="tab"
          aria-selected={mode === "podium"}
          className={cn("mode-btn podium", mode === "podium" && "active")}
          onClick={() => setMode("podium")}
        >
          <Trophy size={14} />
          The Podium
          {!premium ? <span className="lock-dot" /> : null}
        </button>
      </div>

      <div className="header-actions">
        <span className="tier-chip">{displayTier(license?.tier ?? "free", premium)}</span>
        <button
          className={cn("torch-btn", coachEnabled && "lit")}
          onClick={() => setCoachEnabled(!coachEnabled)}
          aria-pressed={coachEnabled}
          title="The Coach"
        >
          <Flame size={18} />
          <span>Coach</span>
        </button>
        <button className="icon-btn" onClick={() => setLockerOpen(true)} aria-label="Locker room">
          <KeyRound size={18} />
        </button>
      </div>
    </header>
  );
}
