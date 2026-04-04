"use client";

import { useState } from "react";

interface MonitorSettingsProps {
  monitor: {
    useCase: string | null;
    watchKeywords: string | null;
    cssSelector: string | null;
    ignoreSelectors: string | null;
    tags: string | null;
    description: string | null;
  };
  monitorId: string;
  onSaved: () => void;
}

const USE_CASES = [
  { value: "", label: "None" },
  { value: "competitor", label: "Competitor" },
  { value: "regulatory", label: "Regulatory" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "jobs", label: "Jobs" },
  { value: "content", label: "Content" },
  { value: "custom", label: "Custom" },
];

export function MonitorSettings({ monitor, monitorId, onSaved }: MonitorSettingsProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [useCase, setUseCase] = useState(monitor.useCase || "");
  const [keywords, setKeywords] = useState(monitor.watchKeywords || "");
  const [cssSelector, setCssSelector] = useState(monitor.cssSelector || "");
  const [ignoreSelectors, setIgnoreSelectors] = useState(monitor.ignoreSelectors || "");
  const [tags, setTags] = useState(monitor.tags || "");
  const [description, setDescription] = useState(monitor.description || "");

  const hasAnyValue = monitor.useCase || monitor.watchKeywords || monitor.cssSelector || monitor.ignoreSelectors || monitor.tags || monitor.description;

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/monitors/${monitorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          useCase: useCase || undefined,
          watchKeywords: keywords || undefined,
          cssSelector: cssSelector || undefined,
          ignoreSelectors: ignoreSelectors || undefined,
          tags: tags || undefined,
          description: description || undefined,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setEditing(false);
        onSaved();
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {} finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-[var(--text-cream)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-jade)] placeholder:text-[var(--text-muted)]/40";
  const labelClass = "text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium";

  // View mode
  if (!editing) {
    return (
      <div className="card-glass rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[var(--text-cream)]">Monitor settings</h3>
          <button onClick={() => setEditing(true)} className="text-xs text-[var(--accent-jade)] hover:underline">
            Edit
          </button>
        </div>
        {hasAnyValue ? (
          <div className="space-y-3">
            {monitor.useCase && (
              <div className="flex items-start gap-3">
                <span className={`${labelClass} w-24 flex-shrink-0 pt-0.5`}>Use case</span>
                <span className="text-sm text-[var(--text-sage)] capitalize">{monitor.useCase}</span>
              </div>
            )}
            {monitor.watchKeywords && (
              <div className="flex items-start gap-3">
                <span className={`${labelClass} w-24 flex-shrink-0 pt-0.5`}>Keywords</span>
                <div className="flex flex-wrap gap-1.5">
                  {monitor.watchKeywords.split(",").map((kw) => (
                    <span key={kw.trim()} className="text-xs bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] px-2 py-0.5 rounded-full">{kw.trim()}</span>
                  ))}
                </div>
              </div>
            )}
            {monitor.cssSelector && (
              <div className="flex items-start gap-3">
                <span className={`${labelClass} w-24 flex-shrink-0 pt-0.5`}>CSS selector</span>
                <code className="text-xs text-[var(--accent-jade)] bg-black/20 px-2 py-0.5 rounded font-mono">{monitor.cssSelector}</code>
              </div>
            )}
            {monitor.ignoreSelectors && (
              <div className="flex items-start gap-3">
                <span className={`${labelClass} w-24 flex-shrink-0 pt-0.5`}>Ignore</span>
                <code className="text-xs text-[var(--text-muted)] bg-black/20 px-2 py-0.5 rounded font-mono">{monitor.ignoreSelectors}</code>
              </div>
            )}
            {monitor.tags && (
              <div className="flex items-start gap-3">
                <span className={`${labelClass} w-24 flex-shrink-0 pt-0.5`}>Tags</span>
                <div className="flex flex-wrap gap-1.5">
                  {monitor.tags.split(",").map((tag) => (
                    <span key={tag.trim()} className="text-xs bg-white/5 text-[var(--text-muted)] px-2 py-0.5 rounded-full border border-white/10">{tag.trim()}</span>
                  ))}
                </div>
              </div>
            )}
            {monitor.description && (
              <div className="flex items-start gap-3">
                <span className={`${labelClass} w-24 flex-shrink-0 pt-0.5`}>Notes</span>
                <p className="text-sm text-[var(--text-sage)]">{monitor.description}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-[var(--text-muted)]">No advanced settings configured. Click Edit to add keywords, CSS selectors, and more.</p>
        )}
        {saved && <p className="text-xs text-[var(--accent-jade)] mt-2">Settings saved</p>}
      </div>
    );
  }

  // Edit mode
  return (
    <div className="card-glass rounded-xl p-5 mb-6 border border-[var(--accent-jade)]/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--text-cream)]">Edit settings</h3>
        <button onClick={() => setEditing(false)} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-cream)]">
          Cancel
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Use case</label>
          <select value={useCase} onChange={(e) => setUseCase(e.target.value)} className={`${inputClass} mt-1`}>
            {USE_CASES.map((uc) => (
              <option key={uc.value} value={uc.value}>{uc.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Keywords</label>
          <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="price, sale, discount" className={`${inputClass} mt-1`} />
          <p className="text-[10px] text-[var(--text-muted)] mt-1">Comma-separated. Alert when these appear or disappear.</p>
        </div>
        <div>
          <label className={labelClass}>CSS Selector</label>
          <input type="text" value={cssSelector} onChange={(e) => setCssSelector(e.target.value)} placeholder="#pricing-table, .main-content" className={`${inputClass} mt-1 font-mono text-xs`} />
        </div>
        <div>
          <label className={labelClass}>Ignore selectors</label>
          <input type="text" value={ignoreSelectors} onChange={(e) => setIgnoreSelectors(e.target.value)} placeholder=".ads, .timestamp, .cookie-banner" className={`${inputClass} mt-1 font-mono text-xs`} />
        </div>
        <div>
          <label className={labelClass}>Tags</label>
          <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="competitor, pricing, q2-review" className={`${inputClass} mt-1`} />
        </div>
        <div>
          <label className={labelClass}>Notes</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Why are you tracking this page?" rows={2} className={`${inputClass} mt-1`} />
        </div>
        <button onClick={handleSave} disabled={saving} className="w-full py-2 text-sm font-medium rounded-lg bg-[var(--accent-jade)] text-[var(--bg-deep)] hover:opacity-90 transition disabled:opacity-50">
          {saving ? "Saving..." : "Save settings"}
        </button>
      </div>
    </div>
  );
}
