"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const DISMISS_KEY = "olympiad.howItWorksDismissed";

export function useHowItWorksModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(DISMISS_KEY)) return;
    setOpen(true);
  }, []);

  const openModal = () => setOpen(true);
  const closeModal = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setOpen(false);
  };

  return { open, openModal, closeModal };
}

export function HowItWorksModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="modal-root how-it-works-modal-root">
      <button className="modal-backdrop" aria-label="Close How It Works" onClick={onClose} />
      <div className="paywall-card how-it-works-card" role="dialog" aria-modal="true" aria-labelledby="how-title">
        <button className="icon-btn close" type="button" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>
        <p className="brand-kicker">HOW IT WORKS</p>
        <h2 id="how-title">How AI Olympiad works</h2>
        <p className="how-it-works-lede">
          AI Olympiad goes beyond standard side-by-side model comparison. It is a local-first, Bring Your Own Key (BYOK)
          platform that lets you compare top AI models, route prompts intelligently, and objectively judge the best
          outputs. With AI Olympiad, your keys, your data, and your costs remain entirely in your control.
        </p>

        <div className="how-it-works-columns">
          <section className="how-it-works-section">
            <h3>The Olympic Metaphor</h3>
            <p>We use a sports metaphor to make managing multiple AI models intuitive and fun:</p>
            <ul className="how-it-works-list">
              <li>
                <strong>Event:</strong> A chat session.
              </li>
              <li>
                <strong>Athlete:</strong> An AI model.
              </li>
              <li>
                <strong>Lanes:</strong> Side-by-side model generations.
              </li>
              <li>
                <strong>Podium + Judge&apos;s Citation:</strong> The final ranking and evaluation of the models&apos;
                answers.
              </li>
              <li>
                <strong>Coach:</strong> The intelligent model picker.
              </li>
              <li>
                <strong>Vault:</strong> Where your API keys are stored safely.
              </li>
            </ul>
          </section>

          <section className="how-it-works-section">
            <h3>Get Started in Five Minutes</h3>
            <p>Follow these steps to set up your Vault and run your first Event.</p>
            <ol className="how-it-works-steps how-it-works-steps-grid">
            <li>
              <strong>Sign In and Choose a Plan</strong>
              <span>
                Free trial available. Log in using your email address to activate your free Pro trial, or select the
                Single, Compare, or Pro subscription plan that fits your needs.
              </span>
            </li>
            <li>
              <strong>Enter the Locker Room</strong>
              <span>
                Navigate to the Locker Room on the Events screen. This is where you manage your local API Vault.
              </span>
            </li>
            <li>
              <strong>Add Your First Provider</strong>
              <span>
                Only one key is required to start. Choose a starter provider (such as Google, Groq, or OpenAI). Paste
                your API key into the designated field.
              </span>
            </li>
            <li>
              <strong>Test and Save</strong>
              <span>
                Tap Test key to ensure the connection works, then save it to your Vault. You can enable AES-GCM
                encryption for added security.
              </span>
            </li>
            <li>
              <strong>Enter the Arena</strong>
              <span>
                Start a new Event. If you are on the Pro plan, type your prompt and watch The Coach recommend the best
                model. Tap &quot;Use model&quot; to apply it, or switch to Podium mode to race multiple models
                side-by-side.
              </span>
            </li>
          </ol>
          </section>
        </div>

        <div className="how-it-works-actions">
          <Link href="/pricing" className="gold-btn" onClick={onClose}>
            View plans
          </Link>
          <Link href="/events" className="ghost-btn" onClick={onClose}>
            Enter Events
          </Link>
        </div>
      </div>
    </div>
  );
}
