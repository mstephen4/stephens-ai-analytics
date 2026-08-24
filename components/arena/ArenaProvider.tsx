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
import { featureLocked, visiblePodiumLanes } from "@/lib/gating";
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
import { ACCOUNT_CHANGED_EVENT, fetchAccount, requestSignInLink, signOutAccount } from "@/lib/auth/client";
import {
  resolvePremiumFromAccount,
  type AccountInfo,
  type PremiumStatus,
} from "@/lib/premium";
import {
  deleteEvent,
  listEvents,
  loadSettings,
  loadVaultState,
  putEvent,
  saveEncryptedKeys,
  savePlainKeys,
  saveSettings,
  unlockVault,
} from "@/lib/storage";
import type {
  ArenaEvent,
  ArenaMessage,
  CoachRecommendation,
  ContenderResult,
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

type Paywall = "coach" | "subscribe" | null;
type LockerTab = "vault" | "pass" | "account" | "about";

interface ArenaContextValue {
  ready: boolean;
  events: ArenaEvent[];
  activeEvent: ArenaEvent | null;
  keys: ProviderKeys;
  vaultEncrypted: boolean;
  vaultUnlocked: boolean;
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
  requestSignIn: (email: string) => Promise<{ message?: string; devLink?: string }>;
  signOut: () => Promise<void>;
  openBillingPortal: () => Promise<void>;
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

  const premiumStatus = useMemo(() => resolvePremiumFromAccount(account), [account]);
  const premium = premiumStatus.premium;
  const featureAccess = useMemo(
    () => ({ tier: premiumStatus.tier, pro: premiumStatus.premium }),
    [premiumStatus.tier, premiumStatus.premium],
  );
  const podiumLaneLimit = useMemo(
    () => visiblePodiumLanes(featureAccess, podiumLaneCount),
    [featureAccess, podiumLaneCount],
  );
  const activeEvent = events.find((event) => event.id === activeEventId) ?? events[0] ?? null;

  const refreshAccount = useCallback(async () => {
    try {
      setAccount(await fetchAccount());
    } catch {
      // keep cached account state
    }
  }, []);

  useEffect(() => {
    const onChange = () => {
      void refreshAccount();
    };
    window.addEventListener(ACCOUNT_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(ACCOUNT_CHANGED_EVENT, onChange);
  }, [refreshAccount]);

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
      const settings = loadSettings();
      const storedEvents = await listEvents();
      let accountInfo: AccountInfo | null = null;
      try {
        accountInfo = await fetchAccount();
      } catch {
        accountInfo = null;
      }
      if (cancelled) return;

      if (accountInfo) setAccount(accountInfo);

      const premiumNow = resolvePremiumFromAccount(accountInfo);
      let loadedKeys = emptyKeys();
      if (vault?.encrypted) {
        setVaultEncrypted(true);
        setVaultUnlocked(false);
        if (premiumNow.subscribed) {
          setLockerOpenState(true);
          setLockerTab("vault");
        }
      } else if (vault && !vault.encrypted) {
        loadedKeys = vault.keys;
        setKeys(vault.keys);
        setVaultUnlocked(true);
      }

      if (settings.selectedAthleteId) setSelectedAthleteId(settings.selectedAthleteId);
      if (settings.compareAthleteIds) setCompareAthleteIds(settings.compareAthleteIds);
      const initialPodium = settings.podiumAthleteIds?.length
        ? [...settings.podiumAthleteIds, ...DEFAULT_PODIUM].slice(0, PRO_PODIUM_MAX_LANES)
        : DEFAULT_PODIUM;
      setPodiumAthleteIds(reconcilePodiumLanes(initialPodium, loadedKeys, PRO_PODIUM_MAX_LANES));
      setCoachEnabledState(Boolean(settings.coachEnabled && premiumNow.premium));
      const savedMode = settings.mode ?? "single";
      if (savedMode === "podium" || savedMode === "compare" || savedMode === "single") {
        setModeState(savedMode);
      } else {
        setModeState("single");
      }

      const params = new URLSearchParams(window.location.search);
      const q = params.get("q");
      const launchMode = params.get("mode");
      if (launchMode === "podium" || launchMode === "compare" || launchMode === "single") {
        setModeState(launchMode);
      }
      if (params.get("coach") === "1" && premiumNow.premium) setCoachEnabledState(true);
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

      const accessNow = {
        tier: premiumNow.tier,
        pro: premiumNow.premium,
      };
      if (params.get("subscribe") === "1") {
        setPaywall("subscribe");
        params.delete("subscribe");
        const remaining = params.toString();
        window.history.replaceState(
          {},
          "",
          `${window.location.pathname}${remaining ? `?${remaining}` : ""}`,
        );
      } else if (
        launchMode === "single" ||
        launchMode === "compare" ||
        launchMode === "podium"
      ) {
        if (featureLocked(launchMode, accessNow)) {
          setPaywall("subscribe");
        }
      } else if (params.get("coach") === "1" && featureLocked("coach", accessNow)) {
        setPaywall("coach");
      }

      const checkout = params.get("checkout");
      if (checkout === "success") {
        setAuthMessage("Payment received — sign in with your checkout email to unlock your plan.");
        params.delete("checkout");
        const remaining = params.toString();
        window.history.replaceState(
          {},
          "",
          `${window.location.pathname}${remaining ? `?${remaining}` : ""}`,
        );
        try {
          const response = await fetch("/api/me", { cache: "no-store" });
          accountInfo = (await response.json()) as AccountInfo;
          if (accountInfo) setAccount(accountInfo);
        } catch {
          // user may still need to sign in
        }
      } else if (checkout === "cancel") {
        setAuthMessage("Checkout canceled.");
        params.delete("checkout");
        window.history.replaceState({}, "", window.location.pathname);
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
    if (!ready || premiumStatus.subscribed || account?.signedIn) return;
    if (sessionStorage.getItem("olympiad.trialDismissed")) return;
    if (sessionStorage.getItem("olympiad.plansDismissed")) return;
    const timer = window.setTimeout(() => setPaywall("subscribe"), 1500);
    return () => window.clearTimeout(timer);
  }, [ready, premiumStatus.subscribed, account?.signedIn]);

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

  const setCoachEnabled = useCallback(
    (on: boolean) => {
      if (on && featureLocked("coach", featureAccess)) {
        setPaywall("coach");
        return;
      }
      setCoachEnabledState(on);
    },
    [featureAccess],
  );

  const setMode = useCallback(
    (next: "single" | "compare" | "podium") => {
      if (featureLocked(next, featureAccess)) {
        setPaywall("subscribe");
        return;
      }
      setModeState(next);
    },
    [featureAccess],
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
          : podiumAthleteIds.slice(0, podiumLaneLimit);
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
    [compareAthleteIds, mode, podiumAthleteIds, podiumLaneLimit],
  );

  const sendPrompt = useCallback(
    async (prompt: string) => {
      const trimmed = prompt.trim();
      if (!trimmed || sending) return false;
      if (featureLocked(mode, featureAccess)) {
        setPaywall("subscribe");
        return false;
      }
      if (!hasAnyKey(keysRef.current)) {
        setLockerOpen(true, "vault");
        return false;
      }

      const lanes = activeLaneIds(
        mode === "compare"
          ? compareAthleteIds
          : mode === "podium"
            ? podiumAthleteIds.slice(0, podiumLaneLimit)
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
    [activeEvent, compareAthleteIds, featureAccess, mode, patchEvent, podiumAthleteIds, podiumLaneLimit, selectedAthleteId, sending, setLockerOpen],
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
    return requestSignInLink(email);
  }, []);

  const signOut = useCallback(async () => {
    await signOutAccount();
    const signedOut: AccountInfo = {
      signedIn: false,
      email: null,
      premium: false,
      subscribed: false,
      source: null,
      tier: "free",
      trialEndsAt: null,
    };
    setAccount(signedOut);
    setAuthMessage(null);
    setTrialModalOpen(false);
    const access = resolvePremiumFromAccount(signedOut);
    if (!access.premium) setCoachEnabledState(false);
    if (!access.subscribed) setPaywall("subscribe");
  }, []);

  const openBillingPortal = useCallback(async () => {
    const response = await fetch("/api/billing/portal", { method: "POST" });
    const json = (await response.json()) as { ok?: boolean; url?: string; error?: string };
    if (json.url) {
      window.location.href = json.url;
      return;
    }
    throw new Error(json.error || "Could not open billing portal.");
  }, []);

  const value = useMemo<ArenaContextValue>(
    () => ({
      ready,
      events,
      activeEvent,
      keys,
      vaultEncrypted,
      vaultUnlocked,
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
      requestSignIn,
      signOut,
      openBillingPortal,
      refreshAccount,
    }),
    [
      account,
      activeEvent,
      authMessage,
      coachEnabled,
      events,
      keys,
      lock,
      lockerOpen,
      lockerTab,
      mode,
      newEvent,
      openBillingPortal,
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

