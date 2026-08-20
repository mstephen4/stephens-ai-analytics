"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Flag, Medal, RotateCcw } from "lucide-react";
import { formatDuration, formatUsd } from "@/lib/cost";
import { getAthlete, providerLabel } from "@/lib/models";
import type { ContenderResult } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useArena } from "./ArenaProvider";

export function ContenderCard({
  contender,
  assistantMessageId,
  elevated = false,
  defaultCollapsed = false,
}: {
  contender: ContenderResult;
  assistantMessageId?: string;
  elevated?: boolean;
  defaultCollapsed?: boolean;
}) {
  const { retryLane, sending } = useArena();
  const athlete = getAthlete(contender.athleteId);
  const [collapsed, setCollapsed] = useState(defaultCollapsed && contender.content.length > 900);
  const flagged = contender.status === "false_start" || contender.status === "dq";
  const medal =
    contender.place === 1 ? "gold" : contender.place === 2 ? "silver" : contender.place === 3 ? "bronze" : null;

  return (
    <article
      className={cn(
        "contender-card",
        elevated && "elevated",
        medal && `medal-${medal}`,
        contender.status === "streaming" && "streaming",
        flagged && "flagged",
      )}
    >
      <header className="card-header">
        <div>
          <p className="card-kicker">{athlete ? providerLabel(athlete.provider) : "Athlete"}</p>
          <h3 className="card-title">{athlete?.name ?? contender.athleteId}</h3>
        </div>
        {medal ? (
          <span className={cn("medal-badge", medal)}>
            <Medal size={14} />
            {medal === "gold" ? "1st" : medal === "silver" ? "2nd" : "3rd"}
          </span>
        ) : null}
        {flagged ? (
          <span className="dq-badge">
            <Flag size={12} />
            {contender.status === "dq" ? "DQ" : "FALSE START"}
          </span>
        ) : null}
      </header>

      {contender.stats ? (
        <dl className="scoreboard">
          <div>
            <dt>Time</dt>
            <dd>{formatDuration(contender.stats.generationMs)}</dd>
          </div>
          <div>
            <dt>Tok/s</dt>
            <dd>{contender.stats.tokensPerSec}</dd>
          </div>
          <div>
            <dt>Cost</dt>
            <dd>{formatUsd(contender.stats.costUsd)}</dd>
          </div>
        </dl>
      ) : (
        <p className="scoreboard-pending">
          {contender.status === "streaming" ? "Live split in progress…" : "Awaiting split"}
        </p>
      )}

      {elevated && contender.citation ? (
        <blockquote className="citation">
          <span>Judge’s citation</span>
          {contender.citation}
        </blockquote>
      ) : null}

      <div className={cn("card-body", collapsed && "collapsed")}>
        {flagged ? (
          <>
            <p className="flag-copy">{contender.error}</p>
            {assistantMessageId ? (
              <button
                type="button"
                className="ghost-btn lane-retry-btn"
                disabled={sending}
                onClick={() => void retryLane(assistantMessageId, contender.athleteId)}
              >
                <RotateCcw size={14} />
                Retry this lane
              </button>
            ) : null}
          </>
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{contender.content || " "}</ReactMarkdown>
        )}
      </div>

      {contender.content.length > 900 ? (
        <button className="collapse-btn" onClick={() => setCollapsed((value) => !value)}>
          {collapsed ? "Expand lane" : "Collapse lane"}
        </button>
      ) : null}
    </article>
  );
}
