"use client";

import { lazy, Suspense } from "react";
import { ArenaProvider, useArena } from "./ArenaProvider";
import { Composer } from "./Composer";
import { EventRail } from "./EventRail";
import { HeaderBar } from "./HeaderBar";
import { LockerRoom } from "./LockerRoom";
import { PaywallModal } from "./PaywallModal";
import { TrialModal } from "./TrialModal";
import { PwaRegister } from "./PwaRegister";
import { SingleThread } from "./SingleThread";

const PodiumGrid = lazy(() => import("./PodiumGrid"));

export function ArenaApp() {
  return (
    <ArenaProvider>
      <PwaRegister />
      <ArenaShell />
    </ArenaProvider>
  );
}

function ArenaShell() {
  const { ready, railOpen, setRailOpen } = useArena();
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="torch-mark" aria-hidden />
        <p className="font-display text-xl tracking-[0.3em] text-torch">LIGHTING THE TORCH</p>
      </div>
    );
  }

  return (
    <div className="arena-shell">
      <div className="stadium-lights" aria-hidden />
      <HeaderBar />
      <div className="arena-body">
        <EventRail />
        {railOpen ? (
          <button className="rail-backdrop" aria-label="Close event list" onClick={() => setRailOpen(false)} />
        ) : null}
        <main className="arena-floor">
          <FloorSwitch />
          <Composer />
        </main>
      </div>
      <LockerRoom />
      <PaywallModal />
      <TrialModal />
    </div>
  );
}

function FloorSwitch() {
  const { mode, activeEvent } = useArena();
  const last = activeEvent?.messages.at(-1);
  const contenderCount = last?.contenders?.length ?? 0;
  const showGrid =
    contenderCount >= 1 &&
    (mode === "compare" || mode === "podium" || contenderCount >= 2);

  if (showGrid) {
    return (
      <Suspense fallback={<PodiumSkeleton />}>
        <PodiumGrid />
      </Suspense>
    );
  }
  return <SingleThread />;
}

function PodiumSkeleton() {
  return (
    <div className="podium-grid podium-pending">
      {["Silver", "Gold", "Bronze"].map((lane) => (
        <div key={lane} className="contender-card contender-pending">
          <div className="card-kicker">{lane} lane</div>
          <div className="pulse-bar" />
          <div className="pulse-bar short" />
        </div>
      ))}
    </div>
  );
}
