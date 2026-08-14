"use client";

import { ContenderCard } from "./ContenderCard";
import { useArena } from "./ArenaProvider";

export default function PodiumGrid() {
  const { activeEvent } = useArena();
  const last = [...(activeEvent?.messages ?? [])].reverse().find((message) => message.contenders?.length === 3);
  const contenders = last?.contenders ?? [];
  const ranked = contenders.some((c) => c.place);
  const gold = contenders.find((c) => c.place === 1);
  const silver = contenders.find((c) => c.place === 2);
  const bronze = contenders.find((c) => c.place === 3);
  const ordered = ranked && gold ? [silver, gold, bronze].filter(Boolean) : contenders;

  return (
    <div className="floor-scroll">
      {activeEvent?.messages
        .filter((message) => message.role === "user")
        .slice(-1)
        .map((message) => (
          <div key={message.id} className="user-prompt">
            <span>Event</span>
            <p>{message.content}</p>
          </div>
        ))}
      <section className={ranked ? "podium-grid ranked" : "podium-grid"}>
        {ordered.map((contender, index) =>
          contender ? (
            <ContenderCard
              key={contender.athleteId}
              contender={contender}
              elevated={ranked ? contender.place === 1 : index === 1}
              defaultCollapsed={ranked && contender.place !== 1}
            />
          ) : null,
        )}
      </section>
    </div>
  );
}
