import { describe, expect, it } from "vitest";
import { appBaseUrl } from "@/lib/app-url";

describe("app-url", () => {
  it("prefers APP_URL over legacy NEXT_PUBLIC_APP_URL", () => {
    expect(
      appBaseUrl({
        APP_URL: "https://app.example.com",
        NEXT_PUBLIC_APP_URL: "https://legacy.example.com",
      }),
    ).toBe("https://app.example.com");
  });

  it("falls back to NEXT_PUBLIC_APP_URL for migration", () => {
    expect(appBaseUrl({ NEXT_PUBLIC_APP_URL: "https://legacy.example.com" })).toBe(
      "https://legacy.example.com",
    );
  });
});
