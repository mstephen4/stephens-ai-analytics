import { describe, expect, it } from "vitest";
import { decryptJson, encryptJson } from "@/lib/crypto";

describe("AES-GCM vault", () => {
  it("round-trips API keys with a master password", async () => {
    const keys = { openai: "sk-live", anthropic: "", google: "aistudio" };
    const blob = await encryptJson(keys, "coliseum-master");
    await expect(decryptJson(blob, "coliseum-master")).resolves.toEqual(keys);
  });

  it("fails closed on the wrong password", async () => {
    const blob = await encryptJson({ secret: "gold" }, "right");
    await expect(decryptJson(blob, "wrong")).rejects.toThrow();
  });
});
