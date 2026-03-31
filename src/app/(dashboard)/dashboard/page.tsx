import { createClient } from "@/lib/supabase/server";
import { ensureUserAndOrg } from "@/lib/db/ensure-user";
import { db } from "@/lib/db";
import { monitors, changes } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { org } = await ensureUserAndOrg(user);

  const allMonitors = await db
    .select()
    .from(monitors)
    .where(eq(monitors.orgId, org.id))
    .orderBy(desc(monitors.createdAt));

  const recentChanges = await db
    .select()
    .from(changes)
    .where(eq(changes.orgId, org.id))
    .orderBy(desc(changes.createdAt))
    .limit(10);

  const activeCount = allMonitors.filter((m) => m.isActive && !m.isPaused).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back, {user.user_metadata?.full_name || user.email}
        </p>
      </div>

      {allMonitors.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Start monitoring</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Add a URL to monitor. We&apos;ll check it regularly and alert you when something changes — with an AI-powered summary of what&apos;s different.
          </p>
          <Link
            href="/dashboard/monitors"
            className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Add your first monitor
          </Link>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-1">Active Monitors</p>
              <p className="text-3xl font-bold text-gray-900">{activeCount}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-1">Changes Detected</p>
              <p className="text-3xl font-bold text-blue-600">{recentChanges.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-1">Plan</p>
              <p className="text-3xl font-bold text-gray-900 capitalize">{org.plan}</p>
            </div>
          </div>

          {/* Recent changes */}
          {recentChanges.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Recent Changes</h2>
              <div className="space-y-3">
                {recentChanges.map((change) => (
                  <div key={change.id} className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{change.summary}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span className={`px-2 py-0.5 rounded-full font-medium ${
                            change.importanceScore >= 7 ? "bg-red-100 text-red-700" :
                            change.importanceScore >= 4 ? "bg-yellow-100 text-yellow-700" :
                            "bg-gray-100 text-gray-600"
                          }`}>
                            {change.importanceScore >= 7 ? "Important" : change.importanceScore >= 4 ? "Notable" : "Minor"}
                          </span>
                          <span>{change.changeType}</span>
                          <span>{new Date(change.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monitors list */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Your Monitors</h2>
              <Link href="/dashboard/monitors" className="text-sm text-blue-600 hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {allMonitors.slice(0, 5).map((monitor) => (
                <Link
                  key={monitor.id}
                  href={`/dashboard/monitors/${monitor.id}`}
                  className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 transition flex items-center justify-between block"
                >
                  <div className="min-w-0">
                    <h3 className="font-medium text-gray-900">{monitor.name}</h3>
                    <p className="text-sm text-gray-400 truncate max-w-md">{monitor.url}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{monitor.checkFrequency}</span>
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      monitor.consecutiveErrors > 0 ? "bg-red-500" :
                      monitor.isActive && !monitor.isPaused ? "bg-green-500" : "bg-gray-300"
                    }`} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
