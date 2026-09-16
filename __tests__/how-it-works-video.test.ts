import { describe, expect, it } from "vitest";
import { resolveHowItWorksVideo } from "@/lib/how-it-works-video";

describe("resolveHowItWorksVideo", () => {
  it("parses YouTube watch URLs", () => {
    expect(resolveHowItWorksVideo("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toEqual({
      kind: "iframe",
      src: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      title: "How AI Olympiad works",
    });
  });

  it("parses direct mp4 URLs", () => {
    expect(resolveHowItWorksVideo("https://cdn.example.com/demo.mp4")).toEqual({
      kind: "video",
      src: "https://cdn.example.com/demo.mp4",
    });
  });

  it("returns null for empty input", () => {
    expect(resolveHowItWorksVideo(undefined)).toBeNull();
    expect(resolveHowItWorksVideo("   ")).toBeNull();
  });
});
