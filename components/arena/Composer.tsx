"use client";

import { useEffect, useState } from "react";
import { Flame, Send } from "lucide-react";
import { ATHLETES, athletesForKeys, getAthlete } from "@/lib/models";
import { cn } from "@/lib/utils";
import { useArena } from "./ArenaProvider";

export function Composer() {
  const {
    keys,
    mode,
    selectedAthleteId,
    setSelectedAthleteId,
    podiumAthleteIds,
    setPodiumAthlete,
    coachEnabled,
    recommendation,
    requestCoach,
    sendPrompt,
    sending,
  } = useArena();
  const [prompt, setPrompt] = useState("");
  const available = athletesForKeys(keys);
  const catalog = available.length > 0 ? available : ATHLETES;

  useEffect(() => {
    requestCoach(prompt);
  }, [prompt, requestCoach]);

  return (
    <div className="composer">
      {coachEnabled && recommendation ? (
        <div className="coach-panel">
          <Flame size={16} className="text-torch" />
          <div>
            <p className="coach-kicker">Coach recommends</p>
            <p className="coach-pick">{getAthlete(recommendation.athleteId)?.name}</p>
            <p className="coach-why">{recommendation.justification}</p>
          </div>
          <button
            className="ghost-btn"
            onClick={() => {
              setSelectedAthleteId(recommendation.athleteId);
            }}
          >
            Use athlete
          </button>
        </div>
      ) : null}

      <div className="composer-card">
        {mode === "single" ? (
          <label className="athlete-select">
            <span>Athlete</span>
            <select value={selectedAthleteId} onChange={(e) => setSelectedAthleteId(e.target.value)}>
              {catalog.map((athlete) => (
                <option key={athlete.id} value={athlete.id}>
                  {athlete.name}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <div className="podium-picks">
            {podiumAthleteIds.map((id, index) => (
              <label key={index} className="athlete-select">
                <span>Lane {index + 1}</span>
                <select
                  value={id}
                  onChange={(e) => setPodiumAthlete(index as 0 | 1 | 2, e.target.value)}
                >
                  {catalog.map((athlete) => (
                    <option key={athlete.id} value={athlete.id}>
                      {athlete.shortName}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        )}

        <textarea
          value={prompt}
          rows={3}
          placeholder="Call the event — a prompt for the athletes…"
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              void sendPrompt(prompt).then((ok) => {
                if (ok) setPrompt("");
              });
            }
          }}
        />
        <div className="composer-footer">
          <p className={cn("hint", coachEnabled && "gold")}>
            {coachEnabled ? "Torch is lit — routing for cost and quality." : "⌘ / Ctrl + Enter to send"}
          </p>
          <button
            className="gold-btn"
            disabled={sending || !prompt.trim()}
            onClick={() => {
              void sendPrompt(prompt).then((ok) => {
                if (ok) setPrompt("");
              });
            }}
          >
            <Send size={16} />
            {sending ? "Live" : "Deploy"}
          </button>
        </div>
      </div>
    </div>
  );
}
