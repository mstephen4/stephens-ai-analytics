export async function sendMagicLinkEmail(email: string, verifyUrl: string): Promise<{ sent: boolean; devLink?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim() || "AI Olympiad <onboarding@resend.dev>";

  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      console.warn("[auth] RESEND_API_KEY not set; magic link email not sent.");
      return { sent: false };
    }
    console.info(`[auth] Magic link for ${email}: ${verifyUrl}`);
    return { sent: false, devLink: verifyUrl };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Sign in to AI Olympiad",
      html: `<p>Click to sign in and start your Pro trial (Podium + Coach — BYOK unchanged):</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>This link expires in 15 minutes.</p>`,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text.slice(0, 200) || "Failed to send email.");
  }

  return { sent: true };
}
