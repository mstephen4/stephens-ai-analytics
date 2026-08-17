"use client";

import { ContenderCard } from "./ContenderCard";
import { useArena } from "./ArenaProvider";

export function SingleThread() {
  const { activeEvent, setLockerOpen, vaultUnlocked } = useArena();
  const messages = activeEvent?.messages ?? [];

  if (messages.length === 0) {
    return (
      <div className="empty-floor">
        <div className="torch-mark large" />
        <h2>Enter the stadium</h2>
        <p>
          Compare two models for free, or unlock the Podium and Coach with an Olympiad Pro or Lifetime pass.
          Your keys stay in this browser.
        </p>
        {!vaultUnlocked ? (
          <button className="gold-btn" onClick={() => setLockerOpen(true, "vault")}>
            Open the vault
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="floor-scroll">
      {messages.map((message) => {
        if (message.role === "user") {
          return (
            <div key={message.id} className="user-prompt">
              <span>You</span>
              <p>{message.content}</p>
            </div>
          );
        }
        const contender = message.contenders?.[0];
        if (!contender) return null;
        return <ContenderCard key={message.id} contender={contender} />;
      })}
    </div>
  );
}
