"use client";

import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useArena } from "./ArenaProvider";

export function EventRail() {
  const { events, activeEvent, newEvent, selectEvent, removeEvent, railOpen } = useArena();

  return (
    <aside className={cn("event-rail", railOpen && "open")}>
      <button className="new-event" onClick={newEvent}>
        <Plus size={16} />
        New Event
      </button>
      <p className="rail-label">Meet History</p>
      <ul className="event-list">
        {events.map((event) => (
          <li key={event.id}>
            <button
              className={cn("event-item", activeEvent?.id === event.id && "active")}
              onClick={() => selectEvent(event.id)}
            >
              <span className="event-title">{event.title}</span>
              <span className="event-meta">
                {event.mode === "podium" ? "Podium" : event.mode === "compare" ? "Compare" : "Single"} ·{" "}
                {new Date(event.updatedAt).toLocaleDateString()}
              </span>
            </button>
            <button
              className="event-delete"
              aria-label={`Delete ${event.title}`}
              onClick={() => void removeEvent(event.id)}
            >
              <Trash2 size={14} />
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
