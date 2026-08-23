import { supportConfigured } from "@/lib/support-server";

export async function GET() {
  return Response.json({
    enabled: supportConfigured(),
  });
}
