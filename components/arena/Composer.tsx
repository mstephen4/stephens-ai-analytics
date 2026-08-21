"use client";

import { useEffect, useState } from "react";
import { Flame, Send } from "lucide-react";
import { COMPARE_PODIUM_MAX_LANES, EMPTY_LANE_ID, FREE_COMPARE_LANES, PRO_PODIUM_MAX_LANES } from "@/lib/constants";
import { visiblePodiumLanes } from "@/lib/gating";
import { activeLaneIds, ATHLETES, athletesForKeys, getAthlete } from "@/lib/models";
import { cn } from "@/lib/utils";
import { useArena } from "./ArenaProvider";

export function Composer() {
  const {
    keys,
    mode,
    premiumStatus,
    selectedAthleteId,
    setSelectedAthleteId,
    applyCoachRecommendation,
    compareAthleteIds,
    setCompareAthlete,
    podiumAthleteIds,
    setPodiumAthlete,
    podiumLaneCount,
    setPodiumLaneCount,
    coachEnabled,
    recommendation,
    requestCoach,
    sendPrompt,
    sending,
  } = useArena();
  const [prompt, setPrompt] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.sessionStorage.getItem("olympiad.pendingPrompt") ?? "";
  });
  const available = athletesForKeys(keys);
  const catalog = available.length > 0 ? available : ATHLETES;

  useEffect(() => {
    requestCoach(prompt);
  }, [prompt, requestCoach]);

  useEffect(() => {
    const pending = window.sessionStorage.getItem("olympiad.pendingPrompt");
    if (!pending) return;
    window.sessionStorage.removeItem("olympiad.pendingPrompt");
    void sendPrompt(pending).then((ok) => {
      if (ok) setPrompt("");
    });
  }, [sendPrompt]);

  const access = { tier: premiumStatus.tier, pro: premiumStatus.premium };
  const podiumLaneLimit = visiblePodiumLanes(access, podiumLaneCount);

  const laneIds =
    mode === "compare"
      ? compareAthleteIds
      : podiumAthleteIds.slice(0, podiumLaneLimit);
  const activeLanes = activeLaneIds(laneIds);
  const canDeploy = mode === "single" || activeLanes.length > 0;

  return (
    <div className="composer">
      {coachEnabled && !recommendation ? (
        <div className="coach-active-bar" role="status">
          <Flame size={14} aria-hidden />
          <span>Coach is lit — keep typing for a model recommendation</span>
        </div>
      ) : null}
      {coachEnabled && recommendation ? (
        <div className="coach-panel coach-panel-highlight">
          <div className="coach-panel-icon" aria-hidden>
            <Flame size={20} />
          </div>
          <div className="coach-panel-body">
            <p className="coach-kicker">Coach recommends</p>
            <p className="coach-pick">{getAthlete(recommendation.athleteId)?.name}</p>
            <p className="coach-why">{recommendation.justification}</p>
          </div>
          <button
            type="button"
            className="gold-btn coach-use-btn"
            onClick={() => applyCoachRecommendation(recommendation.athleteId)}
          >
            Use model
          </button>
        </div>
      ) : null}

      <div className="composer-card">
        {mode === "single" ? (
          <label className="athlete-select">
            <span>Model</span>
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
            {laneIds.map((id, index) => (
              <label key={index} className="athlete-select">
                <span>Lane {index + 1}</span>
                <select
                  value={id}
                  onChange={(e) => {
                    if (mode === "compare") setCompareAthlete(index as 0 | 1, e.target.value);
                    else setPodiumAthlete(index, e.target.value);
                  }}
                >
                  <option value={EMPTY_LANE_ID}>— Empty —</option>
                  {catalog.map((athlete) => (
                    <option key={athlete.id} value={athlete.id}>
                      {athlete.shortName}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            {mode === "podium" && access.pro ? (
              <div className="lane-controls">
                <button
                  type="button"
                  className="ghost-btn"
                  disabled={podiumLaneCount >= PRO_PODIUM_MAX_LANES}
                  onClick={() => setPodiumLaneCount(podiumLaneCount + 1)}
                >
                  + Lane ({podiumLaneCount}/{PRO_PODIUM_MAX_LANES})
                </button>
              </div>
            ) : mode === "podium" && access.tier === "compare" ? (
              <p className="hint">Compare plan — {COMPARE_PODIUM_MAX_LANES} Podium lanes. Upgrade to Pro for 6.</p>
            ) : null}
          </div>
        )}

        <textarea
          value={prompt}
          rows={3}
          placeholder="Light the torch — ask anything"
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
            {!canDeploy
              ? "Pick at least one lane to deploy."
              : mode === "compare"
                ? `${FREE_COMPARE_LANES} models side-by-side (ChatHub-style). Empty lanes are skipped.`
                : coachEnabled
                  ? "Torch is lit — routing for cost and quality."
                  : "⌘ / Ctrl + Enter to send"}
          </p>
          <button
            className="gold-btn"
            disabled={sending || !prompt.trim() || !canDeploy}
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
