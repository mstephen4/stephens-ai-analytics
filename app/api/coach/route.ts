import {
  parseClassifierJson,
  pickClassifierAthlete,
  recommendAthlete,
} from "@/lib/classifier";
import { ATHLETES } from "@/lib/models";
import { completeOnce, keysFromHeaders } from "@/lib/providers";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as { prompt?: string };
  const prompt = body.prompt?.trim() ?? "";
  if (!prompt) {
    return Response.json({ error: "Prompt required." }, { status: 400 });
  }

  const keys = keysFromHeaders(request.headers);
  const heuristic = recommendAthlete(prompt, keys, "heuristic");
  if (!heuristic) {
    return Response.json({
      recommendation: null,
      error: "Add a provider key before asking The Coach.",
    });
  }

  const classifier = pickClassifierAthlete(keys);
  if (!classifier) {
    return Response.json({ recommendation: heuristic });
  }

  try {
    const catalog = ATHLETES.filter((athlete) => Boolean(keys[athlete.provider])).map(
      (athlete) => `${athlete.id} (${athlete.name}, ${athlete.role})`,
    );
    const raw = await completeOnce(
      classifier.id,
      [
        {
          role: "system",
          content:
            "You are The Coach, a cost-aware LLM router. Reply with JSON only: {\"athleteId\":\"provider:model\",\"justification\":\"one sentence\",\"intent\":\"simple_qa|code|math|creative|analysis|translation|summarize\",\"complexity\":\"low|mid|high\"}. Choose the cheapest athlete that can still win the event.",
        },
        {
          role: "user",
          content: `Available athletes:\n${catalog.join("\n")}\n\nPrompt:\n${prompt}`,
        },
      ],
      keys,
    );
    const parsed = parseClassifierJson(raw);
    if (!parsed?.athleteId) {
      return Response.json({ recommendation: heuristic });
    }
    return Response.json({
      recommendation: {
        ...heuristic,
        ...parsed,
        source: "classifier",
      },
    });
  } catch {
    return Response.json({ recommendation: heuristic });
  }
}
