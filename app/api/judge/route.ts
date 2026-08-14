import { pickJudgeAthlete } from "@/lib/classifier";
import { getAthlete } from "@/lib/models";
import { completeOnce, keysFromHeaders } from "@/lib/providers";
import type { Place } from "@/lib/types";

export const runtime = "nodejs";

interface JudgeBody {
  prompt?: string;
  contenders?: { athleteId: string; content: string }[];
}

export async function POST(request: Request) {
  const body = (await request.json()) as JudgeBody;
  const prompt = body.prompt?.trim() ?? "";
  const contenders = (body.contenders ?? []).filter((c) => c.content.trim());
  if (!prompt || contenders.length < 2) {
    return Response.json({ error: "Need a prompt and at least two finishes." }, { status: 400 });
  }

  const keys = keysFromHeaders(request.headers);
  const judge = pickJudgeAthlete(
    keys,
    contenders.map((c) => c.athleteId),
  );
  if (!judge) {
    return Response.json({ error: "No impartial judge model available." }, { status: 400 });
  }

  const dossier = contenders
    .map((c, index) => {
      const athlete = getAthlete(c.athleteId);
      return `LANE ${index + 1} (${c.athleteId} / ${athlete?.name ?? "Unknown"}):\n${c.content.slice(0, 8000)}`;
    })
    .join("\n\n---\n\n");

  try {
    const raw = await completeOnce(
      judge.id,
      [
        {
          role: "system",
          content:
            'You are an impartial Olympic judge for AI outputs. Rank 1st, 2nd, and 3rd on accuracy, instruction-following, formatting, and completeness. Ignore brand prestige. Reply JSON only: {"ranking":[{"athleteId":"...","place":1,"reason":"one sentence"}],"citation":"one sentence why gold won"}',
        },
        {
          role: "user",
          content: `Event prompt:\n${prompt}\n\n${dossier}`,
        },
      ],
      keys,
    );
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      return Response.json({ error: "Judge returned an unreadable card." }, { status: 502 });
    }
    const parsed = JSON.parse(match[0]) as {
      ranking?: { athleteId: string; place: Place; reason?: string }[];
      citation?: string;
    };
    const ranking = (parsed.ranking ?? []).filter((row) =>
      contenders.some((c) => c.athleteId === row.athleteId),
    );
    return Response.json({
      judgeId: judge.id,
      ranking,
      citation: parsed.citation ?? ranking.find((row) => row.place === 1)?.reason ?? "",
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Judge false start." },
      { status: 502 },
    );
  }
}
