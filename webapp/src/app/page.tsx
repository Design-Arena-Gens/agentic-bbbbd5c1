'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { aiVideoTools, AIVideoTool } from "@/data/tools";

const onboardingLabels: Record<AIVideoTool["onboardingTime"], string> = {
  instant: "Instant (< 1 min)",
  fast: "Fast (≈2 mins)",
  moderate: "Moderate (≈5 mins)",
};

type AccountStatus = "Not started" | "Signed up" | "Logged in";

type AccountState = Record<
  string,
  {
    email: string;
    status: AccountStatus;
    notes: string;
  }
>;

const STATUSES: AccountStatus[] = ["Not started", "Signed up", "Logged in"];

const STORAGE_KEY = "ai-video-tool-tracker";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFocus, setSelectedFocus] = useState<string>("All");
  const [selectedOnboarding, setSelectedOnboarding] =
    useState<AIVideoTool["onboardingTime"] | "All">("All");
  const [accountInfo, setAccountInfo] = useState<AccountState>({});

  useEffect(() => {
    const persisted =
      typeof window !== "undefined"
        ? window.localStorage.getItem(STORAGE_KEY)
        : null;
    if (persisted) {
      try {
        const parsed = JSON.parse(persisted) as AccountState;
        setAccountInfo(parsed);
      } catch {
        // ignore malformed payloads
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(accountInfo));
  }, [accountInfo]);

  const focusAreas = useMemo(() => {
    const all = new Set<string>();
    aiVideoTools.forEach((tool) => tool.bestFor.forEach((tag) => all.add(tag)));
    return ["All", ...Array.from(all)];
  }, []);

  const filteredTools = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    return aiVideoTools.filter((tool) => {
      const matchFocus =
        selectedFocus === "All" || tool.bestFor.includes(selectedFocus);
      const matchOnboarding =
        selectedOnboarding === "All" ||
        tool.onboardingTime === selectedOnboarding;
      const matchTerm =
        normalizedTerm.length === 0 ||
        [tool.name, tool.tagline, tool.freePlan, tool.notes]
          .concat(tool.bestFor)
          .concat(tool.features)
          .some((value) =>
            value.toLowerCase().includes(normalizedTerm.toLowerCase())
          );
      return matchFocus && matchOnboarding && matchTerm;
    });
  }, [searchTerm, selectedFocus, selectedOnboarding]);

  const handleStatusChange = (
    toolId: string,
    field: keyof AccountState[string],
    value: string
  ) => {
    setAccountInfo((prev) => ({
      ...prev,
      [toolId]: {
        email: prev[toolId]?.email ?? "",
        status: prev[toolId]?.status ?? "Not started",
        notes: prev[toolId]?.notes ?? "",
        [field]: value,
      },
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-24 text-slate-100">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Launchpad
            </p>
            <h1 className="mt-2 text-3xl font-semibold md:text-4xl">
              Free AI Video Studio Finder
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-slate-300 md:text-base">
              Discover AI video generators with generous free tiers. Track the
              email you used, login status, and onboarding notes so you can jump
              back into each platform without guesswork.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="#tool-grid"
              className="rounded-full border border-white/10 px-5 py-2 text-sm font-medium text-slate-200 transition hover:border-white/30 hover:text-white"
            >
              Browse tools
            </Link>
            <a
              href="mailto:?subject=Free%20AI%20Video%20Toolkit&body=Check%20out%20this%20tracker%20for%20free%20AI%20video%20tools:%20https://agentic-bbbbd5c1.vercel.app"
              className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Share snapshot
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-10 w-full max-w-6xl px-6">
        <section className="grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/40 backdrop-blur">
          <div className="grid gap-4 md:grid-cols-[2fr,1fr] md:items-center">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
              Search tools
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Try “avatar”, “watermark free”, “daily credit”…"
                className="h-12 rounded-2xl border border-white/10 bg-slate-900 px-4 text-base font-normal text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
              />
            </label>
            <div className="grid gap-2 text-sm">
              <span className="font-medium text-slate-200">Onboarding time</span>
              <div className="flex gap-2">
                {(["All", "instant", "fast", "moderate"] as const).map(
                  (option) => (
                    <button
                      key={option}
                      onClick={() =>
                        setSelectedOnboarding(
                          option === "All" ? "All" : option
                        )
                      }
                      className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                        selectedOnboarding === option
                          ? "border-emerald-400 bg-emerald-400/10 text-emerald-200"
                          : "border-white/10 text-slate-300 hover:border-white/30 hover:text-white"
                      }`}
                    >
                      {option === "All"
                        ? "All"
                        : onboardingLabels[
                            option as AIVideoTool["onboardingTime"]
                          ] ?? option}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-2 text-sm">
            <span className="font-medium text-slate-200">Best suited for</span>
            <div className="flex flex-wrap gap-2">
              {focusAreas.map((focus) => (
                <button
                  key={focus}
                  onClick={() => setSelectedFocus(focus)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                    selectedFocus === focus
                      ? "border-sky-400 bg-sky-400/10 text-sky-200"
                      : "border-white/10 text-slate-300 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {focus}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="tool-grid" className="mt-12 grid gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white md:text-xl">
              {filteredTools.length} platform
              {filteredTools.length === 1 ? "" : "s"} match your filters
            </h2>
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-slate-400">
              Updated weekly
            </span>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {filteredTools.map((tool) => {
              const state = accountInfo[tool.id] ?? {
                email: "",
                status: "Not started" as AccountStatus,
                notes: "",
              };
              return (
                <article
                  key={tool.id}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 p-6 shadow-xl shadow-black/40 transition duration-300 hover:-translate-y-1 hover:border-emerald-400/40 hover:shadow-emerald-500/20"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent opacity-0 transition group-hover:opacity-100" />
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                        {onboardingLabels[tool.onboardingTime]}
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold text-white">
                        {tool.name}
                      </h3>
                      <p className="mt-2 text-sm text-slate-300">
                        {tool.tagline}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={state.status} />
                    </div>
                  </div>

                  <dl className="mt-6 grid gap-4 text-sm text-slate-300">
                    <div>
                      <dt className="font-semibold text-slate-200">
                        Free tier
                      </dt>
                      <dd className="mt-1 leading-relaxed">{tool.freePlan}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-200">
                        Best for
                      </dt>
                      <dd className="mt-1 flex flex-wrap gap-2">
                        {tool.bestFor.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-slate-100"
                          >
                            {tag}
                          </span>
                        ))}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-200">
                        Standout features
                      </dt>
                      <dd className="mt-1 flex flex-wrap gap-2">
                        {tool.features.map((feature) => (
                          <span
                            key={feature}
                            className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200"
                          >
                            {feature}
                          </span>
                        ))}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-200">
                        Notes
                      </dt>
                      <dd className="mt-1 leading-relaxed text-slate-300">
                        {tool.notes}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-6 grid gap-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
                      Login checklist
                    </p>
                    <div className="grid gap-3 text-sm text-slate-300">
                      {tool.signupTips.map((tip) => (
                        <div
                          key={`${tool.id}-${tip.step}`}
                          className="rounded-xl border border-white/5 bg-white/5 p-3"
                        >
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                            {tip.step}
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-slate-200">
                            {tip.detail}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-medium text-slate-200">
                      Email used
                      <input
                        value={state.email}
                        onChange={(event) =>
                          handleStatusChange(tool.id, "email", event.target.value)
                        }
                        placeholder="name@mail.com"
                        className="h-11 rounded-xl border border-white/10 bg-slate-900 px-3 text-sm text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-medium text-slate-200">
                      Status
                      <select
                        value={state.status}
                        onChange={(event) =>
                          handleStatusChange(
                            tool.id,
                            "status",
                            event.target.value
                          )
                        }
                        className="h-11 rounded-xl border border-white/10 bg-slate-900 px-3 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="mt-4 grid gap-2 text-sm font-medium text-slate-200">
                    Private notes
                    <textarea
                      value={state.notes}
                      onChange={(event) =>
                        handleStatusChange(tool.id, "notes", event.target.value)
                      }
                      placeholder="Track OTP steps, login URLs, or team members here."
                      rows={3}
                      className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30"
                    />
                  </label>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href={tool.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                    >
                      Open {tool.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        const hints = [
                          "Copy the login email before you switch tabs.",
                          "Check spam or promotions folders for verification emails.",
                          "Save new credentials in your password manager right after sign-up.",
                        ];
                        alert(hints[Math.floor(Math.random() * hints.length)]);
                      }}
                      className="rounded-full border border-white/10 px-5 py-2 text-sm font-medium text-slate-200 transition hover:border-white/30 hover:text-white"
                    >
                      Quick reminder
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <footer className="mt-16 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <h3 className="text-lg font-semibold text-white">
                How to use this board
              </h3>
              <p>
                Save the email address and status for each platform as you sign
                up. We store this locally in your browser so nothing leaves your
                device. Update notes with verification instructions, OTP codes,
                or teammates who also have access.
              </p>
            </div>
            <div className="grid gap-2">
              <h3 className="text-lg font-semibold text-white">
                Shortlist criteria
              </h3>
              <ul className="list-disc space-y-2 pl-4">
                <li>Free plan available without a credit card.</li>
                <li>Email + password login supported (not SSO-only).</li>
                <li>Recent updates (checked within the last 30 days).</li>
                <li>Exports for marketing, tutorials, or concept art workflows.</li>
              </ul>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: AccountStatus }) {
  const styles: Record<AccountStatus, string> = {
    "Not started":
      "border-white/10 text-slate-300 bg-white/5 shadow-none",
    "Signed up":
      "border-sky-400/60 bg-sky-400/15 text-sky-100 shadow-[0_0_25px_-12px rgba(56,189,248,0.6)]",
    "Logged in":
      "border-emerald-400/60 bg-emerald-400/15 text-emerald-100 shadow-[0_0_25px_-12px rgba(74,222,128,0.6)]",
  };
  return (
    <span
      className={`rounded-full border px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${styles[status]}`}
    >
      {status}
    </span>
  );
}
