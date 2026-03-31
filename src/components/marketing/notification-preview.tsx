"use client";

import { useState } from "react";

const CHANNELS = [
  {
    id: "email",
    label: "Email",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    id: "slack",
    label: "Slack",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
      </svg>
    ),
  },
];

export function NotificationPreview() {
  const [channel, setChannel] = useState("email");

  return (
    <div className="max-w-xl mx-auto">
      {/* Channel toggle */}
      <div className="flex justify-center gap-2 mb-6">
        {CHANNELS.map((ch) => (
          <button
            key={ch.id}
            onClick={() => setChannel(ch.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              channel === ch.id
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {ch.icon}
            {ch.label}
          </button>
        ))}
      </div>

      {/* Email preview */}
      {channel === "email" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden animate-in fade-in duration-300">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <span className="text-xs text-gray-400 ml-2">Inbox</span>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">PL</div>
              <div>
                <p className="text-sm font-medium text-gray-900">PageLifeguard</p>
                <p className="text-xs text-gray-400">alerts@pagelifeguard.com</p>
              </div>
              <span className="text-xs text-gray-400 ml-auto">Just now</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-3">🔔 Change detected on competitor.com/pricing</h3>
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-3 mb-4">
              <p className="text-sm text-gray-800 font-medium">AI Summary:</p>
              <p className="text-sm text-gray-700 mt-1">
                Pro plan price dropped from $49/mo to $39/mo. New annual discount of 20% added. Enterprise plan removed from public pricing page.
              </p>
            </div>
            <div className="flex gap-3 mb-3">
              <div className="flex-1 bg-red-50 rounded-lg p-2.5">
                <p className="text-xs text-red-600 font-medium mb-1">Before</p>
                <p className="text-xs text-gray-600">Pro: $49/mo, Enterprise: $99/mo</p>
              </div>
              <div className="flex-1 bg-green-50 rounded-lg p-2.5">
                <p className="text-xs text-green-600 font-medium mb-1">After</p>
                <p className="text-xs text-gray-600">Pro: $39/mo (20% annual), Enterprise: hidden</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium">Importance: 8/10</span>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Price change</span>
            </div>
          </div>
        </div>
      )}

      {/* Slack preview */}
      {channel === "slack" && (
        <div className="bg-[#1a1d21] rounded-2xl border border-gray-700 shadow-lg overflow-hidden animate-in fade-in duration-300">
          <div className="px-4 py-2 border-b border-gray-700 flex items-center gap-2">
            <span className="text-gray-400 text-xs">#</span>
            <span className="text-white text-sm font-medium">monitoring-alerts</span>
          </div>
          <div className="p-4">
            <div className="flex gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">PL</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white text-sm font-bold">PageLifeguard</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-gray-700 text-gray-300 rounded">APP</span>
                  <span className="text-gray-500 text-xs">2:34 PM</span>
                </div>
                <div className="bg-[#222529] rounded-lg border-l-4 border-orange-500 p-3 mt-2">
                  <p className="text-white text-sm font-semibold mb-2">⚠️ Change detected on competitor.com/pricing</p>
                  <div className="space-y-2">
                    <div className="flex gap-4">
                      <div>
                        <p className="text-gray-400 text-xs">Importance</p>
                        <p className="text-orange-400 text-sm font-bold">8/10</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Type</p>
                        <p className="text-blue-400 text-sm">Price change</p>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm">
                      Pro plan price dropped from $49/mo to $39/mo. New annual discount of 20% added.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <button className="px-3 py-1.5 bg-[#007a5a] text-white text-xs rounded font-medium">View Details</button>
                  <button className="px-3 py-1.5 bg-[#222529] text-gray-300 text-xs rounded border border-gray-600">Dismiss</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
