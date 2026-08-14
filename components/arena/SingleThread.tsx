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
        <h2>Enter the Coliseum</h2>
        <p>
          Deploy an athlete against a prompt. Free Player is single-model BYOK. Unlock The Podium and The Coach
          with a Pro or Lifetime pass.
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
              <span>General Manager</span>
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
