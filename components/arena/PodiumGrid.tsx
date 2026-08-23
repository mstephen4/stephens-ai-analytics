"use client";

import { RotateCcw } from "lucide-react";
import { ContenderCard } from "./ContenderCard";
import { TrackLanes } from "./TrackLanes";
import { useArena } from "./ArenaProvider";

export default function PodiumGrid() {
  const { activeEvent, mode, retryAllFailedLanes, sending } = useArena();
  const trackMode = mode === "compare" ? "compare" : "podium";
  const last = [...(activeEvent?.messages ?? [])]
    .reverse()
    .find((message) => (message.contenders?.length ?? 0) >= 1);
  const contenders = last?.contenders ?? [];
  const failedCount = contenders.filter((c) => c.status === "false_start" || c.status === "dq").length;
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
            <span>Prompt</span>
            <p>{message.content}</p>
          </div>
        ))}
      {failedCount > 0 && last?.id ? (
        <div className="podium-retry-bar">
          <p>
            {failedCount} lane{failedCount === 1 ? "" : "s"} failed — successful lanes are kept.
          </p>
          <button
            type="button"
            className="ghost-btn"
            disabled={sending}
            onClick={() => void retryAllFailedLanes(last.id)}
          >
            <RotateCcw size={14} />
            Retry failed lanes
          </button>
        </div>
      ) : null}
      <TrackLanes mode={trackMode} ranked={ranked}>
        {ordered.map((contender, index) =>
          contender ? (
            <ContenderCard
              key={contender.athleteId}
              assistantMessageId={last?.id}
              contender={contender}
              elevated={ranked ? contender.place === 1 : index === 1 && ordered.length === 3}
              defaultCollapsed={ranked && contender.place !== 1}
            />
          ) : null,
        )}
      </TrackLanes>
    </div>
  );
}
