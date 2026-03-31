"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const USE_CASE_PRESETS = [
  {
    id: "competitor",
    icon: "🎯",
    title: "Track competitor",
    description: "Monitor pricing, features, or messaging changes",
    placeholder: "https://competitor.com/pricing",
    frequency: "daily",
  },
  {
    id: "regulatory",
    icon: "⚖️",
    title: "Monitor regulations",
    description: "Track legal pages, compliance docs, government updates",
    placeholder: "https://regulator.gov/guidelines",
    frequency: "daily",
  },
  {
    id: "ecommerce",
    icon: "🛒",
    title: "Watch supplier prices",
    description: "Track product pages for price and stock changes",
    placeholder: "https://supplier.com/products",
    frequency: "every_6h",
  },
  {
    id: "jobs",
    icon: "💼",
    title: "Track job postings",
    description: "Monitor career pages for new positions",
    placeholder: "https://company.com/careers",
    frequency: "daily",
  },
  {
    id: "content",
    icon: "📝",
    title: "Watch content changes",
    description: "Monitor docs, blogs, or any content page",
    placeholder: "https://docs.example.com/api",
    frequency: "daily",
  },
  {
    id: "custom",
    icon: "🔧",
    title: "Custom monitor",
    description: "Monitor any web page for any reason",
    placeholder: "https://example.com",
    frequency: "daily",
  },
];

export default function NewMonitorPage() {
  const router = useRouter();
  const [step, setStep] = useState<"usecase" | "url" | "creating">("usecase");
  const [selectedUseCase, setSelectedUseCase] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  const preset = USE_CASE_PRESETS.find((p) => p.id === selectedUseCase);

  function handleSelectUseCase(id: string) {
    setSelectedUseCase(id);
    setStep("url");
    const p = USE_CASE_PRESETS.find((u) => u.id === id);
    if (p) setUrl("");
  }

  async function handlePreview() {
    if (!url) return;
    setLoading(true);
    setError("");
    setPreview(null);

    try {
      const res = await fetch("/api/preview-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not reach this URL");
        setLoading(false);
        return;
      }

      setPreview(data.preview?.slice(0, 300) || "Content detected");
      if (!name) setName(data.title || new URL(url).hostname);
    } catch {
      setError("Could not check URL");
    }
    setLoading(false);
  }

  async function handleCreate() {
    setLoading(true);
    setError("");

    const res = await fetch("/api/v1/monitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name || new URL(url).hostname,
        url,
        checkFrequency: preset?.frequency || "daily",
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create monitor");
      setLoading(false);
      return;
    }

    const data = await res.json();
    router.push(`/dashboard/monitors/${data.monitor.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Add a monitor</h1>
      <p className="text-gray-500 mb-8">What do you want to keep an eye on?</p>

      {/* Step 1: Choose use case */}
      {step === "usecase" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {USE_CASE_PRESETS.map((uc) => (
            <button
              key={uc.id}
              onClick={() => handleSelectUseCase(uc.id)}
              className="text-left bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-400 hover:shadow-md transition group"
            >
              <span className="text-2xl mb-2 block">{uc.icon}</span>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">{uc.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{uc.description}</p>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Enter URL */}
      {step === "url" && preset && (
        <div className="space-y-6">
          <button
            onClick={() => { setStep("usecase"); setPreview(null); setError(""); }}
            className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Change use case
          </button>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{preset.icon}</span>
            <div>
              <h2 className="font-semibold text-lg">{preset.title}</h2>
              <p className="text-sm text-gray-500">{preset.description}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL to monitor</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setPreview(null); }}
                  required
                  placeholder={preset.placeholder}
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handlePreview}
                  disabled={!url || loading}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 text-sm"
                >
                  {loading ? "Checking..." : "Preview"}
                </button>
              </div>
            </div>

            {/* Preview result */}
            {preview && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span className="text-sm text-green-700 font-medium">Page is monitorable!</span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-3">{preview}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {preview && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monitor name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Competitor pricing page"
                  />
                </div>

                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
                >
                  {loading ? "Creating..." : "Start monitoring"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
