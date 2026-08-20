import { ATHLETES, getAthlete } from "./models";
import type {
  Athlete,
  CoachRecommendation,
  Complexity,
  Intent,
  ProviderKeys,
} from "./types";

const CODE_RE =
  /\b(function|const |let |var |class |def |import |from |package |fn |pub |async |await |typescript|javascript|python|golang|rust|sql|stack trace|compile error|bug|refactor|regex)\b|[{};<>]=|```/i;
const MATH_RE =
  /\b(prove|theorem|integral|derivative|equation|probability|optimize|algebra|calculus|matrix|lemma)\b|[∑∫√∞±≤≥]|\$\$/i;
const CREATIVE_RE =
  /\b(story|poem|screenplay|lyrics|novel|character|world.?build|write a (short )?(story|poem|scene))\b/i;
const TRANSLATE_RE =
  /\b(translate|traduce|übersetze|traduire)\b.+\b(to|into|en|al)\b/i;
const SUMMARIZE_RE =
  /\b(summarize|tldr|synopsis|eli5|key points|abstract)\b/i;
const ANALYSIS_RE =
  /\b(analyze|compare|evaluate|critique|strategy|architecture|trade-?offs?|research|whitepaper)\b/i;

export interface HeuristicResult {
  intent: Intent;
  complexity: Complexity;
  reasons: string[];
}

export function heuristicClassify(prompt: string): HeuristicResult {
  const text = prompt.trim();
  const reasons: string[] = [];
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  let intent: Intent = "simple_qa";

  if (CODE_RE.test(text)) {
    intent = "code";
    reasons.push("code or engineering signals");
  } else if (MATH_RE.test(text)) {
    intent = "math";
    reasons.push("mathematical or formal reasoning");
  } else if (CREATIVE_RE.test(text)) {
    intent = "creative";
    reasons.push("creative writing request");
  } else if (TRANSLATE_RE.test(text)) {
    intent = "translation";
    reasons.push("translation request");
  } else if (SUMMARIZE_RE.test(text)) {
    intent = "summarize";
    reasons.push("summarization request");
  } else if (ANALYSIS_RE.test(text) || wordCount > 180) {
    intent = "analysis";
    reasons.push(wordCount > 180 ? "long-form prompt" : "analytical language");
  } else {
    reasons.push("short factual or conversational prompt");
  }

  let complexity: Complexity = "low";
  if (intent === "code" || intent === "math" || intent === "analysis") {
    complexity = wordCount > 80 || /\b(hard|complex|production|prove)\b/i.test(text)
      ? "high"
      : "mid";
  } else if (intent === "creative" && wordCount > 40) {
    complexity = "mid";
  } else if (wordCount > 120) {
    complexity = "mid";
  }

  if (complexity === "high") reasons.push("high complexity");
  return { intent, complexity, reasons };
}

const INTENT_PREFERENCES: Record<Intent, string[]> = {
  simple_qa: [
    "google:gemini-2.0-flash",
    "openai:gpt-4o-mini",
    "google:gemini-2.5-flash",
    "anthropic:claude-haiku-3.5",
  ],
  summarize: [
    "google:gemini-2.0-flash",
    "openai:gpt-4o-mini",
    "anthropic:claude-haiku-3.5",
    "google:gemini-2.5-flash",
  ],
  translation: [
    "google:gemini-2.5-flash",
    "openai:gpt-4o-mini",
    "anthropic:claude-haiku-3.5",
  ],
  creative: [
    "anthropic:claude-sonnet-4",
    "openai:gpt-4o",
    "google:gemini-3.1-pro-preview",
    "anthropic:claude-opus-4",
  ],
  code: [
    "anthropic:claude-sonnet-4",
    "openai:gpt-4.1",
    "openai:gpt-4o",
    "google:gemini-3.1-pro-preview",
    "anthropic:claude-opus-4",
  ],
  math: [
    "openai:o4-mini",
    "google:gemini-3.1-pro-preview",
    "anthropic:claude-opus-4",
    "openai:gpt-4.1",
  ],
  analysis: [
    "google:gemini-3.1-pro-preview",
    "anthropic:claude-sonnet-4",
    "openai:gpt-4.1",
    "anthropic:claude-opus-4",
  ],
};

const HIGH_COMPLEXITY_UPGRADE: Partial<Record<Intent, string[]>> = {
  code: ["anthropic:claude-opus-4", "openai:gpt-4.1"],
  math: ["anthropic:claude-opus-4", "openai:o4-mini"],
  analysis: ["anthropic:claude-opus-4", "google:gemini-3.1-pro-preview"],
};

export function cheapestAvailable(
  ids: string[],
  available: Athlete[],
): Athlete | undefined {
  const availableIds = new Set(available.map((athlete) => athlete.id));
  const ranked = ids
    .map((id) => getAthlete(id))
    .filter((athlete): athlete is Athlete => Boolean(athlete && availableIds.has(athlete.id)));
  if (ranked.length === 0) {
    return [...available].sort(
      (a, b) => a.inputCostPer1M + a.outputCostPer1M - (b.inputCostPer1M + b.outputCostPer1M),
    )[0];
  }
  return ranked[0];
}

export function recommendAthlete(
  prompt: string,
  keys: ProviderKeys,
  source: CoachRecommendation["source"] = "heuristic",
): CoachRecommendation | null {
  const available = ATHLETES.filter((athlete) => Boolean(keys[athlete.provider]?.trim()));
  if (available.length === 0) return null;

  const classified = heuristicClassify(prompt);
  const preferred =
    classified.complexity === "high" && HIGH_COMPLEXITY_UPGRADE[classified.intent]
      ? [
          ...(HIGH_COMPLEXITY_UPGRADE[classified.intent] ?? []),
          ...INTENT_PREFERENCES[classified.intent],
        ]
      : INTENT_PREFERENCES[classified.intent];

  const pick = cheapestAvailable(preferred, available);
  if (!pick) return null;

  const justification = justificationFor(pick, classified);
  return {
    athleteId: pick.id,
    justification,
    intent: classified.intent,
    complexity: classified.complexity,
    source,
  };
}

function justificationFor(athlete: Athlete, classified: HeuristicResult): string {
  const intentLabel: Record<Intent, string> = {
    simple_qa: "a straightforward question",
    code: "an engineering event",
    math: "a reasoning / math event",
    creative: "a creative writing event",
    analysis: "a deep-analysis event",
    translation: "a translation event",
    summarize: "a summarization event",
  };
  return `${athlete.shortName} is the most cost-effective athlete for ${intentLabel[classified.intent]} at ${classified.complexity} complexity.`;
}

export function pickClassifierAthlete(keys: ProviderKeys): Athlete | undefined {
  const available = ATHLETES.filter(
    (athlete) => athlete.classifierEligible && Boolean(keys[athlete.provider]?.trim()),
  );
  return cheapestAvailable(
    [
      "google:gemini-2.0-flash",
      "openai:gpt-4o-mini",
      "google:gemini-2.5-flash",
      "anthropic:claude-haiku-3.5",
    ],
    available,
  );
}

export function pickJudgeAthlete(keys: ProviderKeys, contestantIds: string[]): Athlete | undefined {
  const blocked = new Set(contestantIds);
  const available = ATHLETES.filter(
    (athlete) =>
      athlete.judgeEligible &&
      Boolean(keys[athlete.provider]?.trim()) &&
      !blocked.has(athlete.id),
  );
  return (
    cheapestAvailable(
      [
        "google:gemini-2.0-flash",
        "openai:gpt-4o-mini",
        "anthropic:claude-haiku-3.5",
        "google:gemini-2.5-flash",
      ],
      available,
    ) ??
    ATHLETES.find(
      (athlete) => athlete.judgeEligible && Boolean(keys[athlete.provider]?.trim()),
    )
  );
}

export function parseClassifierJson(raw: string): Partial<CoachRecommendation> | null {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]) as {
      athleteId?: string;
      justification?: string;
      intent?: Intent;
      complexity?: Complexity;
    };
    if (!parsed.athleteId || !getAthlete(parsed.athleteId)) return null;
    return parsed;
  } catch {
    return null;
  }
}
