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
  } catch {
    return (
      <div className="p-8 text-center">
        <Image src="/assets/sloth-sleeping.png" alt="" width={100} height={100} className="mx-auto mb-4" />
        <p className="text-gray-500">Setting up... refresh in a moment.</p>
      </div>
    );
  }

  let allMonitors: any[] = [];
  let recentChanges: any[] = [];

  try {
    allMonitors = await db.select().from(monitors).where(eq(monitors.orgId, org.id)).orderBy(desc(monitors.createdAt));
    recentChanges = await db.select().from(changes).where(eq(changes.orgId, org.id)).orderBy(desc(changes.createdAt)).limit(10);
  } catch {}

  const activeCount = allMonitors.filter((m: any) => m.isActive && !m.isPaused).length;
  const firstName = (user.user_metadata?.full_name || user.email || "").split(/[\s@]/)[0];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Welcome banner */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-2xl p-6 sm:p-8 mb-6 overflow-hidden">
        <div className="absolute right-4 bottom-0 opacity-20 hidden sm:block">
          <Image src="/assets/sloth-mascot.png" alt="" width={140} height={140} />
        </div>
        <div className="relative z-10">
          <h1 className="text-xl sm:text-2xl font-bold text-white">Hey {firstName}!</h1>
          <p className="text-indigo-200 mt-1 text-sm">Your sloth is keeping watch. Relax.</p>
        </div>
      </div>

      {allMonitors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
          <Image src="/assets/sloth-sleeping.png" alt="Sleeping sloth" width={150} height={150} className="mx-auto mb-5" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your sloth is bored!</h2>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">Give it a page to watch. It&apos;ll alert you when something changes.</p>
          <Link href="/dashboard/monitors/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-200 transition-all font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add first monitor
          </Link>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
              <p className="text-xs text-indigo-600 font-medium mb-1">Watching</p>
              <p className="text-2xl font-bold text-indigo-700">{activeCount}</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
              <p className="text-xs text-amber-600 font-medium mb-1">Changes</p>
              <p className="text-2xl font-bold text-amber-700">{recentChanges.length}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100">
              <p className="text-xs text-emerald-600 font-medium mb-1">Plan</p>
              <p className="text-2xl font-bold text-emerald-700 capitalize">{org.plan}</p>
            </div>
          </div>

          {/* Recent changes */}
          {recentChanges.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Image src="/assets/sloth-alert.png" alt="" width={24} height={24} />
                Recent changes
              </h2>
              <div className="space-y-2">
                {recentChanges.map((change: any) => (
                  <div key={change.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition">
                    <p className="text-sm font-medium text-gray-900">{change.summary}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        change.importanceScore >= 7 ? "bg-red-100 text-red-700" :
                        change.importanceScore >= 4 ? "bg-amber-100 text-amber-700" :
                        "bg-gray-100 text-gray-500"
                      }`}>{change.importanceScore}/10</span>
                      <span className="text-[10px] text-gray-400">{new Date(change.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monitors */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">Monitors</h2>
              <Link href="/dashboard/monitors/new" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">+ Add</Link>
            </div>
            <div className="space-y-2">
              {allMonitors.map((m: any) => (
                <Link key={m.id} href={`/dashboard/monitors/${m.id}`}
                  className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition block">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-gray-900 text-sm">{m.name}</h3>
                    <p className="text-xs text-gray-400 truncate">{m.url}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <span className="text-[10px] text-gray-400">{m.checkFrequency}</span>
                    <span className="relative flex h-2.5 w-2.5">
                      {m.healthStatus === "healthy" && m.isActive && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      )}
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                        m.healthStatus === "error" ? "bg-red-500" :
                        m.healthStatus === "unstable" ? "bg-amber-500" :
                        m.isActive ? "bg-green-500" : "bg-gray-300"
                      }`} />
                    </span>
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
