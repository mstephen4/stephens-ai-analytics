import { TEST_ATHLETE_BY_PROVIDER } from "@/lib/provider-guides";
import { completeOnce, keysFromHeaders } from "@/lib/providers";
import type { ProviderId } from "@/lib/types";

export const runtime = "nodejs";

const PROVIDERS: ProviderId[] = ["openai", "anthropic", "google", "deepseek", "groq", "xai", "mistral"];

export async function POST(request: Request) {
  const body = (await request.json()) as { provider?: ProviderId };
  const provider = body.provider;
  if (!provider || !PROVIDERS.includes(provider)) {
    return Response.json({ error: "Unknown provider." }, { status: 400 });
  }

  const keys = keysFromHeaders(request.headers);
  if (!keys[provider]?.trim()) {
    return Response.json({ error: `No ${provider} key in request.` }, { status: 400 });
  }

  const athleteId = TEST_ATHLETE_BY_PROVIDER[provider];
  if (!athleteId) {
    return Response.json({ error: "No test model configured for this provider." }, { status: 400 });
  }

  try {
    const reply = await completeOnce(
      athleteId,
      [{ role: "user", content: "Reply with exactly: vault ok" }],
      keys,
    );
    return Response.json({
      ok: true,
      athleteId,
      preview: reply.trim().slice(0, 80),
    });
  } catch (error) {
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : "Key test failed." },
      { status: 502 },
    );
  }
}
