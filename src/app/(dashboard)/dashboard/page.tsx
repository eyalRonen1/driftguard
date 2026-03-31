import { createClient } from "@/lib/supabase/server";
import { ensureUserAndOrg } from "@/lib/db/ensure-user";
import { db } from "@/lib/db";
import { monitors, changes } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  let org;
  try {
    const result = await ensureUserAndOrg(user);
    org = result.org;
  } catch (err) {
    console.error("Dashboard error:", err);
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-bold mb-2">Setting up your account...</h1>
        <p className="text-gray-500 mb-4">Please refresh the page.</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
          Refresh
        </button>
      </div>
    );
  }

  let allMonitors: any[] = [];
  let recentChanges: any[] = [];

  try {
    allMonitors = await db
      .select()
      .from(monitors)
      .where(eq(monitors.orgId, org.id))
      .orderBy(desc(monitors.createdAt));

    recentChanges = await db
      .select()
      .from(changes)
      .where(eq(changes.orgId, org.id))
      .orderBy(desc(changes.createdAt))
      .limit(10);
  } catch (err) {
    console.error("Dashboard query error:", err);
  }

  const activeCount = allMonitors.filter((m: any) => m.isActive && !m.isPaused).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome, {user.user_metadata?.full_name || user.email}
        </p>
      </div>

      {allMonitors.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Image
            src="/assets/sloth-sleeping.png"
            alt="Sleeping sloth"
            width={120}
            height={120}
            className="mx-auto mb-4"
          />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Nothing to watch yet</h2>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Add a URL and let our sloth keep an eye on it for you.
          </p>
          <Link
            href="/dashboard/monitors/new"
            className="inline-flex items-center px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
          >
            Add your first monitor
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-1">Active monitors</p>
              <p className="text-3xl font-bold text-gray-900">{activeCount}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-1">Changes detected</p>
              <p className="text-3xl font-bold text-indigo-600">{recentChanges.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-1">Plan</p>
              <p className="text-3xl font-bold text-gray-900 capitalize">{org.plan}</p>
            </div>
          </div>

          {recentChanges.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Recent changes</h2>
              <div className="space-y-3">
                {recentChanges.map((change: any) => (
                  <div key={change.id} className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm font-medium text-gray-900">{change.summary}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        change.importanceScore >= 7 ? "bg-red-100 text-red-700" :
                        change.importanceScore >= 4 ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {change.importanceScore}/10
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(change.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Monitors</h2>
              <Link href="/dashboard/monitors/new" className="text-sm text-indigo-600 hover:underline">
                + Add monitor
              </Link>
            </div>
            <div className="space-y-3">
              {allMonitors.map((monitor: any) => (
                <Link
                  key={monitor.id}
                  href={`/dashboard/monitors/${monitor.id}`}
                  className="bg-white rounded-xl border border-gray-200 p-4 hover:border-indigo-300 transition flex items-center justify-between block"
                >
                  <div className="min-w-0">
                    <h3 className="font-medium text-gray-900">{monitor.name}</h3>
                    <p className="text-sm text-gray-400 truncate max-w-md">{monitor.url}</p>
                  </div>
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    monitor.healthStatus === "error" ? "bg-red-500" :
                    monitor.healthStatus === "unstable" ? "bg-yellow-500" :
                    monitor.isActive ? "bg-green-500" : "bg-gray-300"
                  }`} />
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
