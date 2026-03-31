"use client";

import { useState } from "react";

const USE_CASES = [
  {
    id: "competitor",
    label: "Competitor Tracking",
    icon: "🎯",
    title: "Track competitor pricing & features",
    description: "Know the moment a competitor changes their pricing, launches a new feature, or updates their messaging.",
    example: {
      url: "competitor.com/pricing",
      alert: "Pro plan price dropped from $49/mo → $39/mo. New 'Enterprise' tier added with SSO and audit logs.",
    },
    personas: ["Marketing teams", "Product managers", "Founders"],
  },
  {
    id: "legal",
    label: "Legal & Compliance",
    icon: "⚖️",
    title: "Monitor regulatory changes",
    description: "Track government sites, regulatory pages, and legal notices. Never miss a compliance update.",
    example: {
      url: "regulator.gov/guidelines",
      alert: "Section 4.2 updated: New reporting requirement for companies with 50+ employees. Effective August 1, 2026.",
    },
    personas: ["Legal teams", "Compliance officers", "Attorneys"],
  },
  {
    id: "ecommerce",
    label: "E-commerce",
    icon: "🛒",
    title: "Watch supplier prices & stock",
    description: "Monitor supplier product pages for price changes, stock status, and new product launches.",
    example: {
      url: "supplier.com/widgets",
      alert: "Widget X price increased 12% from $8.50 → $9.52. Widget Y now marked 'Out of Stock'.",
    },
    personas: ["E-commerce managers", "Procurement", "Dropshippers"],
  },
  {
    id: "jobs",
    label: "Job Monitoring",
    icon: "💼",
    title: "Track career pages & job postings",
    description: "Monitor competitor career pages. Know when they're hiring for roles that signal strategic moves.",
    example: {
      url: "techcorp.com/careers",
      alert: "3 new AI Engineering positions posted in Tel Aviv office. Senior VP of AI role added.",
    },
    personas: ["Recruiters", "HR teams", "Competitive intelligence"],
  },
  {
    id: "content",
    label: "Content & SEO",
    icon: "📝",
    title: "Watch for content changes",
    description: "Monitor blog posts, documentation, and key pages. Catch content drift and broken information.",
    example: {
      url: "partner.com/docs/api",
      alert: "API endpoint /v2/users deprecated notice added. New /v3/users endpoint documented with breaking changes.",
    },
    personas: ["Content teams", "Technical writers", "SEO professionals"],
  },
];

export function UseCases() {
  const [active, setActive] = useState("competitor");
  const activeCase = USE_CASES.find((u) => u.id === active)!;

  return (
    <div>
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {USE_CASES.map((uc) => (
          <button
            key={uc.id}
            onClick={() => setActive(uc.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              active === uc.id
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span className="mr-1.5">{uc.icon}</span>
            {uc.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden max-w-3xl mx-auto shadow-sm">
        <div className="p-6 sm:p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{activeCase.title}</h3>
          <p className="text-gray-500 mb-6">{activeCase.description}</p>

          {/* Simulated alert */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
              <span className="text-xs text-gray-400 font-mono">{activeCase.example.url}</span>
            </div>
            <p className="text-sm text-gray-900 leading-relaxed">{activeCase.example.alert}</p>
          </div>

          {/* Personas */}
          <div className="flex flex-wrap gap-2 mt-4">
            {activeCase.personas.map((p) => (
              <span key={p} className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
