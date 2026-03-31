"use client";

import { useState, useEffect } from "react";

const DEMO_STEPS = [
  {
    url: "https://competitor.com/pricing",
    status: "checking",
    label: "Checking competitor pricing page...",
  },
  {
    url: "https://competitor.com/pricing",
    status: "change_detected",
    label: "Change detected!",
    summary: "Pro plan price dropped from $49/mo to $39/mo. New annual discount of 20% added. Enterprise plan removed from public pricing.",
    importance: 8,
    changeType: "price",
    before: "$49/month for Pro plan, $99/month for Enterprise",
    after: "$39/month for Pro plan (20% annual discount available). Enterprise: Contact sales.",
  },
];

export function LiveDemo() {
  const [step, setStep] = useState(0);
  const [typing, setTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [inputUrl, setInputUrl] = useState("");
  const [started, setStarted] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const demoUrl = "https://competitor.com/pricing";
  const demoSummary = DEMO_STEPS[0].summary || "";

  function handleStart() {
    if (!inputUrl && !started) {
      // Auto-fill demo URL with typing animation
      setStarted(true);
      let i = 0;
      const interval = setInterval(() => {
        if (i <= demoUrl.length) {
          setInputUrl(demoUrl.slice(0, i));
          i++;
        } else {
          clearInterval(interval);
          setTimeout(() => startScan(), 500);
        }
      }, 40);
    } else {
      startScan();
    }
  }

  function startScan() {
    setStep(1);
    // Simulate checking
    setTimeout(() => {
      setStep(2);
      setShowResult(true);
      // Type out the summary
      setTyping(true);
      let i = 0;
      const interval = setInterval(() => {
        if (i <= demoSummary.length) {
          setDisplayedText(demoSummary.slice(0, i));
          i++;
        } else {
          clearInterval(interval);
          setTyping(false);
        }
      }, 20);
    }, 2000);
  }

  function reset() {
    setStep(0);
    setStarted(false);
    setInputUrl("");
    setDisplayedText("");
    setShowResult(false);
    setTyping(false);
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto shadow-2xl border border-gray-800">
      {/* Window chrome */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <div className="flex-1 bg-gray-800 rounded-lg px-3 py-1 ml-2">
          <span className="text-xs text-gray-400">pagelifeguard.com/dashboard</span>
        </div>
      </div>

      {/* Input area */}
      <div className="mb-6">
        <label className="text-xs text-gray-400 mb-2 block">Monitor a URL</label>
        <div className="flex gap-2">
          <div className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white font-mono text-sm">
            {inputUrl || (
              <span className="text-gray-500">https://competitor.com/pricing</span>
            )}
            {step === 0 && started && <span className="animate-pulse text-blue-400">|</span>}
          </div>
          <button
            onClick={step === 0 ? handleStart : reset}
            className={`px-4 py-3 rounded-lg font-medium text-sm transition whitespace-nowrap ${
              step === 0
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {step === 0 ? "Monitor" : "Reset"}
          </button>
        </div>
      </div>

      {/* Scanning animation */}
      {step === 1 && (
        <div className="flex items-center gap-3 py-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400" />
          <span className="text-blue-400 text-sm">Checking page for changes...</span>
        </div>
      )}

      {/* Result */}
      {showResult && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Change detected badge */}
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
            </span>
            <span className="text-orange-400 text-sm font-medium">Change detected</span>
            <span className="text-xs text-gray-500 ml-auto">Just now</span>
          </div>

          {/* AI Summary card */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full font-medium">
                Importance: 8/10
              </span>
              <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">
                price change
              </span>
            </div>
            <p className="text-white text-sm leading-relaxed">
              {displayedText}
              {typing && <span className="animate-pulse text-blue-400">|</span>}
            </p>
          </div>

          {/* Before/After */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-xs text-red-400 mb-1 font-medium">Before</p>
              <p className="text-xs text-gray-300">$49/month for Pro plan, $99/month for Enterprise</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <p className="text-xs text-green-400 mb-1 font-medium">After</p>
              <p className="text-xs text-gray-300">$39/month for Pro plan (20% annual discount). Enterprise: Contact sales.</p>
            </div>
          </div>

          {/* Alert notification */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-400">Alert sent to you@company.com</p>
              <p className="text-xs text-white mt-0.5">🔔 competitor.com/pricing changed — Pro plan dropped to $39/mo</p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom hint */}
      {step === 0 && !started && (
        <p className="text-center text-xs text-gray-500 mt-4">
          Click &quot;Monitor&quot; to see a live demo
        </p>
      )}
    </div>
  );
}
