"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { streamChat } from "@/lib/client-stream";
import { recommendAthlete } from "@/lib/classifier";
import { featureLocked, isPremiumActive } from "@/lib/gating";
import { DEFAULT_PODIUM_LANES, PRO_PODIUM_MAX_LANES } from "@/lib/constants";
import {
  activeLaneIds,
  DEFAULT_COMPARE,
  DEFAULT_PODIUM,
  DEFAULT_SINGLE,
  emptyKeys,
  hasAnyKey,
  laneIndexForCoachPick,
  reconcilePodiumLanes,
} from "@/lib/models";
import {
  resolvePremiumFromAccount,
  type AccountInfo,
  type PremiumStatus,
} from "@/lib/premium";
import {
  deleteEvent,
  getOrCreateInstanceName,
  listEvents,
  loadLicense,
  loadSettings,
  loadVaultState,
  putEvent,
  saveEncryptedKeys,
  saveLicense,
  savePlainKeys,
  saveSettings,
  unlockVault,
} from "@/lib/storage";
import type {
  ArenaEvent,
  ArenaMessage,
  CoachRecommendation,
  ContenderResult,
  LicenseRecord,
  ProviderKeys,
} from "@/lib/types";
import { keyHeaders, titleFromPrompt, uid } from "@/lib/utils";

const LANE_STAGGER_MS = 450;

function userPromptBeforeAssistant(messages: ArenaMessage[], assistantIndex: number): string | null {
  for (let i = assistantIndex - 1; i >= 0; i -= 1) {
    if (messages[i].role === "user") return messages[i].content;
  }
  return null;
}

function chatHistoryBefore(messages: ArenaMessage[], beforeIndex: number) {
  return messages
    .slice(0, beforeIndex)
    .filter((message) => message.role === "user" || (message.role === "assistant" && message.content))
    .map((message) => ({
      role: message.role as "user" | "assistant" | "system",
      content:
        message.role === "assistant" && message.contenders
          ? message.contenders.find((c) => c.place === 1)?.content || message.content
          : message.content,
    }));
}

type Paywall = "coach" | "podium" | null;
type LockerTab = "vault" | "pass" | "account" | "about";

interface ArenaContextValue {
  ready: boolean;
  events: ArenaEvent[];
  activeEvent: ArenaEvent | null;
  keys: ProviderKeys;
  vaultEncrypted: boolean;
  vaultUnlocked: boolean;
  license: LicenseRecord | null;
  account: AccountInfo | null;
  premiumStatus: PremiumStatus;
  premium: boolean;
  coachEnabled: boolean;
  mode: "single" | "compare" | "podium";
  selectedAthleteId: string;
  compareAthleteIds: [string, string];
  podiumAthleteIds: string[];
  podiumLaneCount: number;
  recommendation: CoachRecommendation | null;
  paywall: Paywall;
  lockerOpen: boolean;
  lockerTab: LockerTab;
  railOpen: boolean;
  sending: boolean;
  licenseMessage: string | null;
  authMessage: string | null;
  trialModalOpen: boolean;
  setSelectedAthleteId: (id: string) => void;
  setCompareAthlete: (index: 0 | 1, id: string) => void;
  setPodiumAthlete: (index: number, id: string) => void;
  setPodiumLaneCount: (count: number) => void;
  setCoachEnabled: (on: boolean) => void;
  setMode: (mode: "single" | "compare" | "podium") => void;
  setPaywall: (paywall: Paywall) => void;
  setLockerOpen: (open: boolean, tab?: LockerTab) => void;
  setRailOpen: (open: boolean) => void;
  setTrialModalOpen: (open: boolean) => void;
  newEvent: () => void;
  selectEvent: (id: string) => void;
  removeEvent: (id: string) => Promise<void>;
  requestCoach: (prompt: string) => void;
  applyCoachRecommendation: (athleteId: string) => void;
  sendPrompt: (prompt: string) => Promise<boolean>;
  retryLane: (assistantMessageId: string, athleteId: string) => Promise<boolean>;
  retryAllFailedLanes: (assistantMessageId: string) => Promise<boolean>;
  closeLane: (assistantMessageId: string, athleteId: string) => Promise<boolean>;
  saveKeys: (keys: ProviderKeys, password?: string) => Promise<void>;
  unlock: (password: string) => Promise<void>;
  lock: () => void;
  activate: (licenseKey: string) => Promise<void>;
  clearLicense: () => void;
  requestSignIn: (email: string) => Promise<{ message?: string; devLink?: string }>;
  signOut: () => Promise<void>;
  linkLicenseToAccount: (licenseKey: string) => Promise<void>;
  refreshAccount: () => Promise<void>;
}

const ArenaContext = createContext<ArenaContextValue | null>(null);

function createEvent(mode: "single" | "compare" | "podium"): ArenaEvent {
  const now = Date.now();
  return {
    id: uid(),
    title: "New Event",
    createdAt: now,
    updatedAt: now,
    mode,
    messages: [],
  };
}

export function ArenaProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [events, setEvents] = useState<ArenaEvent[]>([]);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [keys, setKeys] = useState<ProviderKeys>(emptyKeys());
  const [vaultEncrypted, setVaultEncrypted] = useState(false);
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [license, setLicense] = useState<LicenseRecord | null>(null);
  const [coachEnabled, setCoachEnabledState] = useState(false);
  const [mode, setModeState] = useState<"single" | "compare" | "podium">("compare");
  const [selectedAthleteId, setSelectedAthleteId] = useState(DEFAULT_SINGLE);
  const [compareAthleteIds, setCompareAthleteIds] = useState<[string, string]>(DEFAULT_COMPARE);
  const [podiumAthleteIds, setPodiumAthleteIds] = useState<string[]>(DEFAULT_PODIUM);
  const [podiumLaneCount, setPodiumLaneCount] = useState(DEFAULT_PODIUM_LANES);
  const [recommendation, setRecommendation] = useState<CoachRecommendation | null>(null);
  const [paywall, setPaywall] = useState<Paywall>(null);
  const [lockerOpen, setLockerOpenState] = useState(false);
  const [lockerTab, setLockerTab] = useState<LockerTab>("vault");
  const [railOpen, setRailOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [licenseMessage, setLicenseMessage] = useState<string | null>(null);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [trialModalOpen, setTrialModalOpen] = useState(false);
  const eventsRef = useRef(events);
  const keysRef = useRef(keys);
  const activeIdRef = useRef(activeEventId);
  const persistTimer = useRef<number | null>(null);
  const coachTimer = useRef<number | null>(null);

  useEffect(() => {
    eventsRef.current = events;
    keysRef.current = keys;
    activeIdRef.current = activeEventId;
  }, [events, keys, activeEventId]);

  const premiumStatus = useMemo(
    () => resolvePremiumFromAccount(account, license),
    [account, license],
  );
  const premium = premiumStatus.premium;
  const activeEvent = events.find((event) => event.id === activeEventId) ?? events[0] ?? null;

  const refreshAccount = useCallback(async () => {
    try {
      const response = await fetch("/api/me", { cache: "no-store" });
      const json = (await response.json()) as AccountInfo;
      setAccount(json);
    } catch {
      // keep cached account state
    }
  }, []);

  const commitEvents = useCallback((next: ArenaEvent[], persistId?: string) => {
    eventsRef.current = next;
    setEvents(next);
    if (!persistId) return;
    const target = next.find((event) => event.id === persistId);
    if (!target) return;
    if (persistTimer.current) window.clearTimeout(persistTimer.current);
    persistTimer.current = window.setTimeout(() => {
      void putEvent(target);
    }, 250);
  }, []);

  const patchEvent = useCallback(
    (id: string, updater: (event: ArenaEvent) => ArenaEvent, persist = true) => {
      const current = eventsRef.current.find((event) => event.id === id);
      if (!current) return;
      const nextEvent = updater({ ...current, updatedAt: Date.now() });
      const nextList = [nextEvent, ...eventsRef.current.filter((event) => event.id !== id)].sort(
        (a, b) => b.updatedAt - a.updatedAt,
      );
      commitEvents(nextList, persist ? id : undefined);
    },
    [commitEvents],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const vault = loadVaultState();
      const storedLicense = loadLicense();
      const settings = loadSettings();
      const storedEvents = await listEvents();
      let accountInfo: AccountInfo | null = null;
      try {
        const response = await fetch("/api/me", { cache: "no-store" });
        accountInfo = (await response.json()) as AccountInfo;
      } catch {
        accountInfo = null;
      }
      if (cancelled) return;

      if (accountInfo) setAccount(accountInfo);

      let loadedKeys = emptyKeys();
      if (vault?.encrypted) {
        setVaultEncrypted(true);
        setVaultUnlocked(false);
        setLockerOpenState(true);
        setLockerTab("vault");
      } else if (vault && !vault.encrypted) {
        loadedKeys = vault.keys;
        setKeys(vault.keys);
        setVaultUnlocked(true);
      }

      setLicense(storedLicense);
      if (settings.selectedAthleteId) setSelectedAthleteId(settings.selectedAthleteId);
      if (settings.compareAthleteIds) setCompareAthleteIds(settings.compareAthleteIds);
      const initialPodium = settings.podiumAthleteIds?.length
        ? [...settings.podiumAthleteIds, ...DEFAULT_PODIUM].slice(0, PRO_PODIUM_MAX_LANES)
        : DEFAULT_PODIUM;
      setPodiumAthleteIds(reconcilePodiumLanes(initialPodium, loadedKeys, PRO_PODIUM_MAX_LANES));
      const premiumNow = resolvePremiumFromAccount(accountInfo, storedLicense).premium;
      setCoachEnabledState(Boolean(settings.coachEnabled && premiumNow));
      const savedMode = settings.mode ?? "compare";
      if (savedMode === "podium" && !premiumNow) setModeState("compare");
      else setModeState(savedMode);

      const params = new URLSearchParams(window.location.search);
      const q = params.get("q");
      const launchMode = params.get("mode");
      if (launchMode === "podium" && premiumNow) setModeState("podium");
      else if (launchMode === "compare") setModeState("compare");
      else if (launchMode === "single") setModeState("single");
      if (params.get("coach") === "1" && premiumNow) setCoachEnabledState(true);
      if (q) window.sessionStorage.setItem("olympiad.pendingPrompt", q);

      const auth = params.get("auth");
      if (auth === "signed-in") {
        setAuthMessage("Signed in — Pro trial active. BYOK vault unchanged.");
        window.history.replaceState({}, "", window.location.pathname);
      } else if (auth === "expired") {
        setAuthMessage("Sign-in link expired. Request a new one from Account.");
        window.history.replaceState({}, "", window.location.pathname);
      } else if (auth === "missing") {
        setAuthMessage("Invalid sign-in link.");
        window.history.replaceState({}, "", window.location.pathname);
      }

      if (params.get("trial") === "1") {
        setTrialModalOpen(true);
        params.delete("trial");
        const remaining = params.toString();
        window.history.replaceState(
          {},
          "",
          `${window.location.pathname}${remaining ? `?${remaining}` : ""}`,
        );
      }

      if (storedEvents.length > 0) {
        setEvents(storedEvents);
        setActiveEventId(storedEvents[0].id);
      } else {
        const fresh = createEvent("single");
        setEvents([fresh]);
        setActiveEventId(fresh.id);
        await putEvent(fresh);
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || premium || account?.signedIn) return;
    if (sessionStorage.getItem("olympiad.trialDismissed")) return;
    const timer = window.setTimeout(() => setTrialModalOpen(true), 1200);
    return () => window.clearTimeout(timer);
  }, [ready, premium, account?.signedIn]);

  useEffect(() => {
    if (!ready) return;
    saveSettings({
      selectedAthleteId,
      compareAthleteIds,
      podiumAthleteIds,
      coachEnabled,
      mode,
    });
  }, [ready, selectedAthleteId, compareAthleteIds, podiumAthleteIds, coachEnabled, mode]);

  const revalidateLicense = useCallback(async (record: LicenseRecord) => {
    try {
      const response = await fetch("/api/license/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licenseKey: record.licenseKey,
          instanceId: record.instanceId,
          instanceName: record.instanceName,
        }),
      });
      const json = (await response.json()) as {
        ok: boolean;
        expired?: boolean;
        error?: string;
        record?: LicenseRecord;
      };
      if (json.ok && json.record) {
        setLicense(json.record);
        saveLicense(json.record);
        setLicenseMessage(null);
        return;
      }
      const degraded: LicenseRecord = json.record ?? {
        ...record,
        status: json.expired ? "expired" : "disabled",
        lastValidatedAt: Date.now(),
      };
      setLicense(degraded);
      saveLicense(degraded);
      const stillPremium = resolvePremiumFromAccount(account, degraded).premium;
      if (!stillPremium) {
        setCoachEnabledState(false);
        setModeState("compare");
      }
      if (!isPremiumActive(degraded)) {
        setLicenseMessage(json.error || "Pass expired — back to Free Player. History is intact.");
      } else {
        setLicenseMessage(null);
      }
    } catch {
      setLicenseMessage("Could not re-validate the pass right now. Premium stays cached until the next check.");
    }
  }, [account]);

  useEffect(() => {
    if (!ready) return undefined;
    const boot = window.setTimeout(() => {
      const latest = loadLicense();
      if (latest?.licenseKey) void revalidateLicense(latest);
    }, 0);
    const timer = window.setInterval(() => {
      const latest = loadLicense();
      if (latest?.licenseKey) void revalidateLicense(latest);
    }, 30 * 60 * 1000);
    return () => {
      window.clearTimeout(boot);
      window.clearInterval(timer);
    };
  }, [ready, revalidateLicense]);

  const setCoachEnabled = useCallback(
    (on: boolean) => {
      if (on && featureLocked("coach", premium)) {
        setPaywall("coach");
        return;
      }
      setCoachEnabledState(on);
    },
    [premium],
  );

  const setMode = useCallback(
    (next: "single" | "compare" | "podium") => {
      if (next === "podium" && featureLocked("podium", premium)) {
        setPaywall("podium");
        return;
      }
      setModeState(next);
    },
    [premium],
  );

  const setLockerOpen = useCallback((open: boolean, tab?: LockerTab) => {
    setLockerOpenState(open);
    if (tab) setLockerTab(tab);
  }, []);

  const newEvent = useCallback(() => {
    const fresh = createEvent(mode);
    setEvents((current) => [fresh, ...current]);
    setActiveEventId(fresh.id);
    setRecommendation(null);
    void putEvent(fresh);
    setRailOpen(false);
  }, [mode]);

  const selectEvent = useCallback((id: string) => {
    setActiveEventId(id);
    setRailOpen(false);
  }, []);

  const removeEvent = useCallback(
    async (id: string) => {
      await deleteEvent(id);
      setEvents((current) => {
        const next = current.filter((event) => event.id !== id);
        if (next.length === 0) {
          const fresh = createEvent(mode);
          void putEvent(fresh);
          setActiveEventId(fresh.id);
          return [fresh];
        }
        if (activeEventId === id) setActiveEventId(next[0].id);
        return next;
      });
    },
    [activeEventId, mode],
  );

  const requestCoach = useCallback(
    (prompt: string) => {
      if (!coachEnabled || !premium) {
        setRecommendation(null);
        return;
      }
      if (coachTimer.current) window.clearTimeout(coachTimer.current);
      if (prompt.trim().length < 12) {
        setRecommendation(null);
        return;
      }
      coachTimer.current = window.setTimeout(async () => {
        const local = recommendAthlete(prompt, keysRef.current, "heuristic");
        if (local) setRecommendation(local);
        try {
          const response = await fetch("/api/coach", {
            method: "POST",
            headers: keyHeaders(keysRef.current),
            body: JSON.stringify({ prompt }),
          });
          const json = (await response.json()) as { recommendation?: CoachRecommendation | null };
          if (json.recommendation) setRecommendation(json.recommendation);
        } catch {
          // keep heuristic
        }
      }, 450);
    },
    [coachEnabled, premium],
  );

  const applyCoachRecommendation = useCallback(
    (athleteId: string) => {
      if (mode === "single") {
        setSelectedAthleteId(athleteId);
        return;
      }
      const visibleLanes =
        mode === "compare"
          ? [...compareAthleteIds]
          : podiumAthleteIds.slice(0, premium ? podiumLaneCount : DEFAULT_PODIUM_LANES);
      const index = laneIndexForCoachPick(visibleLanes, athleteId);
      if (mode === "compare") {
        setCompareAthleteIds((current) => {
          const next = [...current] as [string, string];
          next[index as 0 | 1] = athleteId;
          return next;
        });
      } else {
        setPodiumAthleteIds((current) => {
          const next = [...current];
          next[index] = athleteId;
          return next.slice(0, PRO_PODIUM_MAX_LANES);
        });
      }
    },
    [compareAthleteIds, mode, podiumAthleteIds, podiumLaneCount, premium],
  );

  const sendPrompt = useCallback(
    async (prompt: string) => {
      const trimmed = prompt.trim();
      if (!trimmed || sending) return false;
      if (!hasAnyKey(keysRef.current)) {
        setLockerOpen(true, "vault");
        return false;
      }
      if (mode === "podium" && featureLocked("podium", premium)) {
        setPaywall("podium");
        return false;
      }

      const lanes = activeLaneIds(
        mode === "compare"
          ? compareAthleteIds
          : mode === "podium"
            ? podiumAthleteIds.slice(0, premium ? podiumLaneCount : DEFAULT_PODIUM_LANES)
            : [],
      );
      if ((mode === "compare" || mode === "podium") && lanes.length === 0) {
        return false;
      }

      setSending(true);
      try {
      const eventId = activeIdRef.current ?? activeEvent?.id;
      if (!eventId) {
        return false;
      }

      const userMessage: ArenaMessage = {
        id: uid(),
        role: "user",
        content: trimmed,
        createdAt: Date.now(),
      };

      const history = chatHistoryBefore(activeEvent?.messages ?? [], activeEvent?.messages.length ?? 0);

      const appendDelta = (assistantId: string, athleteId: string, text: string) => {
        patchEvent(
          eventId,
          (event) => ({
            ...event,
            messages: event.messages.map((message) =>
              message.id === assistantId
                ? {
                    ...message,
                    content: message.athleteId === athleteId ? message.content + text : message.content,
                    contenders: message.contenders?.map((c) =>
                      c.athleteId === athleteId ? { ...c, content: c.content + text } : c,
                    ),
                  }
                : message,
            ),
          }),
          false,
        );
      };

      const finishLane = (
        assistantId: string,
        athleteId: string,
        result: Awaited<ReturnType<typeof streamChat>>,
      ) => {
        patchEvent(eventId, (event) => ({
          ...event,
          messages: event.messages.map((message) =>
            message.id === assistantId
              ? {
                  ...message,
                  contenders: message.contenders?.map((c) =>
                    c.athleteId === athleteId
                      ? {
                          ...c,
                          status: result.error ? (result.error.code === "DQ" ? "dq" : "false_start") : "done",
                          error: result.error?.message,
                          stats: result.stats,
                        }
                      : c,
                  ),
                }
              : message,
          ),
        }));
      };

      if (mode === "single") {
        const athleteId = selectedAthleteId;
        const assistant: ArenaMessage = {
          id: uid(),
          role: "assistant",
          content: "",
          athleteId,
          contenders: [{ athleteId, content: "", status: "streaming" }],
          createdAt: Date.now(),
        };
        patchEvent(eventId, (event) => ({
          ...event,
          title: event.messages.length === 0 ? titleFromPrompt(trimmed) : event.title,
          mode: "single",
          messages: [...event.messages, userMessage, assistant],
        }));

        const result = await streamChat({
          athleteId,
          keys: keysRef.current,
          messages: [...history, { role: "user", content: trimmed }],
          onDelta: (text) => appendDelta(assistant.id, athleteId, text),
        });
        finishLane(assistant.id, athleteId, result);
      } else if (mode === "compare" || mode === "podium") {
        const assistant: ArenaMessage = {
          id: uid(),
          role: "assistant",
          content: "",
          contenders: lanes.map((athleteId) => ({
            athleteId,
            content: "",
            status: "streaming" as const,
          })),
          createdAt: Date.now(),
        };
        patchEvent(eventId, (event) => ({
          ...event,
          title: event.messages.length === 0 ? titleFromPrompt(trimmed) : event.title,
          mode,
          messages: [...event.messages, userMessage, assistant],
        }));

        const collected: ContenderResult[] = lanes.map((athleteId) => ({
          athleteId,
          content: "",
          status: "streaming",
        }));

        await Promise.all(
          lanes.map(async (athleteId, index) => {
            if (index > 0) await new Promise((resolve) => setTimeout(resolve, LANE_STAGGER_MS * index));
            const result = await streamChat({
              athleteId,
              keys: keysRef.current,
              messages: [...history, { role: "user", content: trimmed }],
              onDelta: (text) => {
                collected[index] = {
                  ...collected[index],
                  content: collected[index].content + text,
                };
                appendDelta(assistant.id, athleteId, text);
              },
            });
            collected[index] = {
              ...collected[index],
              status: result.error ? (result.error.code === "DQ" ? "dq" : "false_start") : "done",
              error: result.error?.message,
              stats: result.stats,
            };
            finishLane(assistant.id, athleteId, result);
          }),
        );

        const successful = collected.filter((c) => c.status === "done" && c.content.trim());
        if (mode === "podium" && successful.length >= 2) {
          try {
            const response = await fetch("/api/judge", {
              method: "POST",
              headers: keyHeaders(keysRef.current),
              body: JSON.stringify({
                prompt: trimmed,
                contenders: successful.map((c) => ({ athleteId: c.athleteId, content: c.content })),
              }),
            });
            const json = (await response.json()) as {
              ranking?: { athleteId: string; place: 1 | 2 | 3; reason?: string }[];
              citation?: string;
            };
            if (json.ranking?.length) {
              patchEvent(eventId, (event) => ({
                ...event,
                messages: event.messages.map((message) =>
                  message.id === assistant.id
                    ? {
                        ...message,
                        contenders: applyRanking(message.contenders ?? [], json.ranking ?? [], json.citation),
                      }
                    : message,
                ),
              }));
            }
          } catch {
            // leave unranked
          }
        }
      }

      const finalEvent = eventsRef.current.find((event) => event.id === eventId);
      if (finalEvent) await putEvent(finalEvent);
      return true;
      } finally {
        setSending(false);
      }
    },
    [activeEvent, compareAthleteIds, mode, patchEvent, podiumAthleteIds, podiumLaneCount, premium, selectedAthleteId, sending, setLockerOpen],
  );

  const runJudgeForMessage = useCallback(
    async (eventId: string, assistantMessageId: string, prompt: string) => {
      const event = eventsRef.current.find((entry) => entry.id === eventId);
      const assistant = event?.messages.find((message) => message.id === assistantMessageId);
      const successful =
        assistant?.contenders?.filter((c) => c.status === "done" && c.content.trim()) ?? [];
      if (successful.length < 2) return;

      try {
        const response = await fetch("/api/judge", {
          method: "POST",
          headers: keyHeaders(keysRef.current),
          body: JSON.stringify({
            prompt,
            contenders: successful.map((c) => ({ athleteId: c.athleteId, content: c.content })),
          }),
        });
        const json = (await response.json()) as {
          ranking?: { athleteId: string; place: 1 | 2 | 3; reason?: string }[];
          citation?: string;
        };
        if (json.ranking?.length) {
          patchEvent(eventId, (current) => ({
            ...current,
            messages: current.messages.map((message) =>
              message.id === assistantMessageId
                ? {
                    ...message,
                    contenders: applyRanking(message.contenders ?? [], json.ranking ?? [], json.citation),
                  }
                : message,
            ),
          }));
        }
      } catch {
        // leave unranked
      }
    },
    [patchEvent],
  );

  const retryLane = useCallback(
    async (assistantMessageId: string, athleteId: string) => {
      if (sending) return false;
      if (!hasAnyKey(keysRef.current)) {
        setLockerOpen(true, "vault");
        return false;
      }

      const eventId = activeIdRef.current;
      if (!eventId) return false;
      const event = eventsRef.current.find((entry) => entry.id === eventId);
      if (!event) return false;

      const assistantIndex = event.messages.findIndex((message) => message.id === assistantMessageId);
      if (assistantIndex < 0) return false;
      const assistant = event.messages[assistantIndex];
      if (!assistant.contenders?.some((c) => c.athleteId === athleteId)) return false;

      const prompt = userPromptBeforeAssistant(event.messages, assistantIndex);
      if (!prompt) return false;

      const history = chatHistoryBefore(event.messages, assistantIndex);

      setSending(true);
      try {
        patchEvent(eventId, (current) => ({
          ...current,
          messages: current.messages.map((message) =>
            message.id === assistantMessageId
              ? {
                  ...message,
                  contenders: message.contenders?.map((c) =>
                    c.athleteId === athleteId
                      ? {
                          ...c,
                          content: "",
                          status: "streaming" as const,
                          error: undefined,
                          stats: undefined,
                          place: undefined,
                          citation: undefined,
                        }
                      : c,
                  ),
                }
              : message,
          ),
        }));

        let output = "";
        const result = await streamChat({
          athleteId,
          keys: keysRef.current,
          messages: [...history, { role: "user", content: prompt }],
          onDelta: (text) => {
            output += text;
            patchEvent(
              eventId,
              (current) => ({
                ...current,
                messages: current.messages.map((message) =>
                  message.id === assistantMessageId
                    ? {
                        ...message,
                        contenders: message.contenders?.map((c) =>
                          c.athleteId === athleteId ? { ...c, content: c.content + text } : c,
                        ),
                      }
                    : message,
                ),
              }),
              false,
            );
          },
        });

        patchEvent(eventId, (current) => ({
          ...current,
          messages: current.messages.map((message) =>
            message.id === assistantMessageId
              ? {
                  ...message,
                  contenders: message.contenders?.map((c) =>
                    c.athleteId === athleteId
                      ? {
                          ...c,
                          content: output,
                          status: result.error ? (result.error.code === "DQ" ? "dq" : "false_start") : "done",
                          error: result.error?.message,
                          stats: result.stats,
                        }
                      : c,
                  ),
                }
              : message,
          ),
        }));

        if (event.mode === "podium") {
          await runJudgeForMessage(eventId, assistantMessageId, prompt);
        }

        const finalEvent = eventsRef.current.find((entry) => entry.id === eventId);
        if (finalEvent) await putEvent(finalEvent);
        return !result.error;
      } finally {
        setSending(false);
      }
    },
    [patchEvent, runJudgeForMessage, sending, setLockerOpen],
  );

  const retryAllFailedLanes = useCallback(
    async (assistantMessageId: string) => {
      const event = eventsRef.current.find((entry) => entry.id === activeIdRef.current);
      const assistant = event?.messages.find((message) => message.id === assistantMessageId);
      const failed =
        assistant?.contenders?.filter((c) => c.status === "false_start" || c.status === "dq") ?? [];
      if (failed.length === 0) return true;

      for (const [index, contender] of failed.entries()) {
        if (index > 0) await new Promise((resolve) => setTimeout(resolve, LANE_STAGGER_MS * index));
        await retryLane(assistantMessageId, contender.athleteId);
      }
      return true;
    },
    [retryLane],
  );

  const closeLane = useCallback(
    async (assistantMessageId: string, athleteId: string) => {
      const eventId = activeIdRef.current;
      if (!eventId) return false;
      const event = eventsRef.current.find((entry) => entry.id === eventId);
      if (!event) return false;

      const assistantIndex = event.messages.findIndex((message) => message.id === assistantMessageId);
      if (assistantIndex < 0) return false;
      const assistant = event.messages[assistantIndex];
      if (!assistant.contenders?.some((c) => c.athleteId === athleteId)) return false;

      const prompt = userPromptBeforeAssistant(event.messages, assistantIndex);

      patchEvent(eventId, (current) => ({
        ...current,
        messages: current.messages.map((message) =>
          message.id === assistantMessageId
            ? {
                ...message,
                contenders: message.contenders
                  ?.filter((c) => c.athleteId !== athleteId)
                  .map((c) => ({ ...c, place: undefined, citation: undefined })),
              }
            : message,
        ),
      }));

      if (event.mode === "podium" && prompt) {
        await runJudgeForMessage(eventId, assistantMessageId, prompt);
      }

      const finalEvent = eventsRef.current.find((entry) => entry.id === eventId);
      if (finalEvent) await putEvent(finalEvent);
      return true;
    },
    [patchEvent, runJudgeForMessage],
  );

  const saveKeys = useCallback(async (next: ProviderKeys, password?: string) => {
    setKeys(next);
    setPodiumAthleteIds((current) => reconcilePodiumLanes(current, next, PRO_PODIUM_MAX_LANES));
    if (password) {
      await saveEncryptedKeys(next, password);
      setVaultEncrypted(true);
      setVaultUnlocked(true);
    } else {
      savePlainKeys(next);
      setVaultEncrypted(false);
      setVaultUnlocked(true);
    }
  }, []);

  const unlock = useCallback(async (password: string) => {
    const next = await unlockVault(password);
    setKeys(next);
    setPodiumAthleteIds((current) => reconcilePodiumLanes(current, next, PRO_PODIUM_MAX_LANES));
    setVaultUnlocked(true);
  }, []);

  const lock = useCallback(() => {
    setKeys(emptyKeys());
    setVaultUnlocked(false);
  }, []);

  const requestSignIn = useCallback(async (email: string) => {
    const response = await fetch("/api/auth/request-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const json = (await response.json()) as {
      ok: boolean;
      error?: string;
      message?: string;
      devLink?: string;
    };
    if (!json.ok) throw new Error(json.error || "Could not send sign-in link.");
    return { message: json.message, devLink: json.devLink };
  }, []);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    setAccount({ signedIn: false, email: null, premium: false, source: null, tier: "free", trialEndsAt: null });
    setAuthMessage(null);
    setTrialModalOpen(false);
    const stillPremium = resolvePremiumFromAccount(
      { signedIn: false, email: null, premium: false, source: null, tier: "free", trialEndsAt: null },
      license,
    ).premium;
    if (!stillPremium) {
      setCoachEnabledState(false);
      setModeState("compare");
    }
  }, [license]);

  const linkLicenseToAccount = useCallback(async (licenseKey: string) => {
    const instanceName = getOrCreateInstanceName();
    const response = await fetch("/api/me", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ licenseKey, instanceName }),
    });
    const json = (await response.json()) as {
      ok: boolean;
      error?: string;
      record?: LicenseRecord;
    };
    if (!json.ok || !json.record) {
      throw new Error(json.error || "Could not link license.");
    }
    setLicense(json.record);
    saveLicense(json.record);
    setLicenseMessage(null);
    setPaywall(null);
    await refreshAccount();
  }, [refreshAccount]);

  const activate = useCallback(async (licenseKey: string) => {
    const instanceName = getOrCreateInstanceName();
    const response = await fetch("/api/license/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ licenseKey, instanceName }),
    });
    const json = (await response.json()) as { ok: boolean; error?: string; record?: LicenseRecord };
    if (!json.ok || !json.record) {
      throw new Error(json.error || "Activation failed.");
    }
    setLicense(json.record);
    saveLicense(json.record);
    setLicenseMessage(null);
    setPaywall(null);
  }, []);

  const clearLicense = useCallback(() => {
    setLicense(null);
    saveLicense(null);
    const stillPremium = resolvePremiumFromAccount(account, null).premium;
    if (!stillPremium) {
      setCoachEnabledState(false);
      setModeState("compare");
    }
  }, [account]);

  const value = useMemo<ArenaContextValue>(
    () => ({
      ready,
      events,
      activeEvent,
      keys,
      vaultEncrypted,
      vaultUnlocked,
      license,
      account,
      premiumStatus,
      premium,
      coachEnabled,
      mode,
      selectedAthleteId,
      compareAthleteIds,
      podiumAthleteIds,
      podiumLaneCount,
      recommendation,
      paywall,
      lockerOpen,
      lockerTab,
      railOpen,
      sending,
      licenseMessage,
      authMessage,
      trialModalOpen,
      setSelectedAthleteId,
      setPodiumAthlete: (index, id) => {
        setPodiumAthleteIds((current) => {
          const next = [...current];
          next[index] = id;
          return next.slice(0, PRO_PODIUM_MAX_LANES);
        });
      },
      setCompareAthlete: (index, id) => {
        setCompareAthleteIds((current) => {
          const next = [...current] as [string, string];
          next[index] = id;
          return next;
        });
      },
      setPodiumLaneCount: (count) => {
        setPodiumLaneCount(Math.min(PRO_PODIUM_MAX_LANES, Math.max(DEFAULT_PODIUM_LANES, count)));
      },
      setCoachEnabled,
      setMode,
      setPaywall,
      setLockerOpen,
      setRailOpen,
      setTrialModalOpen,
      newEvent,
      selectEvent,
      removeEvent,
      requestCoach,
      applyCoachRecommendation,
      sendPrompt,
      retryLane,
      retryAllFailedLanes,
      closeLane,
      saveKeys,
      unlock,
      lock,
      activate,
      clearLicense,
      requestSignIn,
      signOut,
      linkLicenseToAccount,
      refreshAccount,
    }),
    [
      account,
      activate,
      activeEvent,
      authMessage,
      clearLicense,
      coachEnabled,
      events,
      keys,
      license,
      licenseMessage,
      linkLicenseToAccount,
      lock,
      lockerOpen,
      lockerTab,
      mode,
      newEvent,
      paywall,
      compareAthleteIds,
      podiumAthleteIds,
      podiumLaneCount,
      premium,
      premiumStatus,
      railOpen,
      ready,
      recommendation,
      refreshAccount,
      removeEvent,
      requestCoach,
      applyCoachRecommendation,
      saveKeys,
      requestSignIn,
      linkLicenseToAccount,
      selectedAthleteId,
      selectEvent,
      sending,
      sendPrompt,
      retryAllFailedLanes,
      retryLane,
      closeLane,
      setCoachEnabled,
      setLockerOpen,
      setMode,
      signOut,
      trialModalOpen,
      unlock,
      vaultEncrypted,
      vaultUnlocked,
    ],
  );

  return <ArenaContext.Provider value={value}>{children}</ArenaContext.Provider>;
}

export function useArena(): ArenaContextValue {
  const value = useContext(ArenaContext);
  if (!value) throw new Error("useArena must be used within ArenaProvider");
  return value;
}

function applyRanking(
  contenders: ContenderResult[],
  ranking: { athleteId: string; place: 1 | 2 | 3; reason?: string }[],
  citation?: string,
): ContenderResult[] {
  return contenders.map((contender) => {
    const row = ranking.find((entry) => entry.athleteId === contender.athleteId);
    if (!row) return contender;
    return {
      ...contender,
      place: row.place,
      citation: row.place === 1 ? citation || row.reason : row.reason,
    };
  });
}

