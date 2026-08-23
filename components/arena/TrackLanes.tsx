"use client";

import { Children, Fragment, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function TrackLanes({
  mode,
  ranked = false,
  children,
}: {
  mode: "compare" | "podium";
  ranked?: boolean;
  children: ReactNode;
}) {
  const lanes = Children.toArray(children).filter(Boolean);
  const laneCount = lanes.length;

  if (laneCount === 0) return null;

  return (
    <section
      className={cn(
        "track-surface",
        mode === "compare" ? "track-compare" : "track-podium",
        ranked && "track-ranked",
      )}
      data-lanes={laneCount}
      style={{ "--lane-count": laneCount } as CSSProperties}
      aria-label={mode === "compare" ? "Compare track lanes" : "Podium track lanes"}
    >
      <div className="track-finish-line" aria-hidden="true">
        <span>Finish</span>
      </div>
      <div className="track-lanes">
        {lanes.map((lane, index) => (
          <Fragment key={index}>
            {index > 0 ? <div className="track-lane-divider" aria-hidden="true" /> : null}
            <div className="track-lane" data-lane={index + 1}>
              <div className="track-lane-mark">
                <span className="track-lane-number">{index + 1}</span>
              </div>
              <div className="track-lane-inner">{lane}</div>
            </div>
          </Fragment>
        ))}
      </div>
      <div className="track-start-line" aria-hidden="true">
        <span>Start</span>
      </div>
    </section>
  );
}
