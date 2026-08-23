import { readSession } from "@/lib/auth/session";
import { getUserById } from "@/lib/auth/users";
import { resolvePremiumForUser } from "@/lib/premium-server";

export const runtime = "nodejs";

export async function GET() {
  const session = await readSession();
  if (!session) {
    return Response.json({
      signedIn: false,
      email: null,
      premium: false,
      subscribed: false,
      source: null,
      tier: "free",
      trialEndsAt: null,
    });
  }

  const user = getUserById(session.userId);
  const status = await resolvePremiumForUser(session.userId);

  return Response.json({
    signedIn: true,
    email: user?.email ?? session.email,
    premium: status.premium,
    subscribed: status.subscribed,
    source: status.source,
    tier: status.tier,
    trialEndsAt: status.trialEndsAt,
  });
}
