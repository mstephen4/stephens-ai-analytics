"use client";

import Link from "next/link";
import { Flame, KeyRound, Menu, Trophy } from "lucide-react";
import { PRODUCT_NAME } from "@/lib/constants";
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
      <Link href="/" className="brand home-link">
        <span className="logo-orbit small" aria-hidden />
        <div>
          <h1 className="brand-title">{PRODUCT_NAME.toUpperCase()}</h1>
        </div>
      </Link>

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
          aria-selected={mode === "compare"}
          className={cn("mode-btn", mode === "compare" && "active")}
          onClick={() => setMode("compare")}
        >
          Compare
        </button>
        <button
          role="tab"
          aria-selected={mode === "podium"}
          className={cn("mode-btn podium", mode === "podium" && "active")}
          onClick={() => setMode("podium")}
        >
          <Trophy size={14} />
          Podium
          {!premium ? <span className="lock-dot" /> : null}
        </button>
      </div>

      <div className="header-actions">
        <span className="tier-chip">{displayTier(license?.tier ?? "free", premium)}</span>
        <button
          className={cn("torch-btn", coachEnabled && "lit")}
          onClick={() => setCoachEnabled(!coachEnabled)}
          aria-pressed={coachEnabled}
          title="Coach"
        >
          <Flame size={18} />
          <span>Coach</span>
          {!premium ? <span className="lock-dot" /> : null}
        </button>
        <button className="icon-btn" onClick={() => setLockerOpen(true)} aria-label="Vault">
          <KeyRound size={18} />
        </button>
      </div>
    </header>
  );
}
