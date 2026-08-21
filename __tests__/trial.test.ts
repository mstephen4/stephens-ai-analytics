import { describe, expect, it } from "vitest";
import { DEFAULT_TRIAL_DAYS, getPublicTrialDays, getTrialDays } from "@/lib/trial";

describe("trial config", () => {
  it("defaults to 3 days", () => {
    expect(DEFAULT_TRIAL_DAYS).toBe(3);
    expect(getTrialDays()).toBe(3);
    expect(getPublicTrialDays()).toBe(3);
  });
});
