import { readSession } from "@/lib/auth/session";
import { getUserById } from "@/lib/auth/users";
import { resolvePremiumForUser } from "@/lib/premium-server";

export const runtime = "nodejs";

export async function GET() {
  try {
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

    let userEmail = session.email;
    try {
      const user = getUserById(session.userId);
      if (user?.email) userEmail = user.email;
    } catch (error) {
      console.error("[api/me] user lookup failed", error);
    }

    const status = await resolvePremiumForUser(session.userId, {
      email: userEmail,
      trialEndsAt: session.trialEndsAt ?? null,
    });

    return Response.json({
      signedIn: true,
      email: userEmail,
      premium: status.premium,
      subscribed: status.subscribed,
      source: status.source,
      tier: status.tier,
      trialEndsAt: status.trialEndsAt,
    });
  } catch (error) {
    console.error("[api/me]", error);
    return Response.json(
      {
        signedIn: false,
        email: null,
        premium: false,
        subscribed: false,
        source: null,
        tier: "free",
        trialEndsAt: null,
        error: "Could not load account status.",
      },
      { status: 500 },
    );
  }
}
